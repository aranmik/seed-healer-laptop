// Seed Healer — core/battle.js (Battle Core Headless 01)
// P1-A 원본(reference/seed_healer_p1_raid_frame_priest.html)의 class Sim을
// 클래스명 Battle로 충실 이식한 헤드리스 전투 코어.
// 근거 문서: docs/migration_prep/P1A_03(루프·상태) · P1A_04(골렘 패턴) · P1A_06(수치)
//           reports/P1A_SOURCE_MAP_IMPLEMENTATION_READINESS_01.md (이식 지도)
//
// 규율(깨지면 실패):
//   난수 0 · DOM/타이머/이미지 접근 0 · 시간은 외부가 주입하는 dt(step)로만 진행.
//   마나는 시전 "완료" 시 소비 — 취소·무산은 시간 손실만(이중 페널티 금지).
//   아군 딜(승리 판정)은 위험 판정보다 뒤. 사제 사망 = 즉시 패배.
//   이벤트 큐(events[])로만 UI와 통신 — 이벤트명은 P1A_03 §10 계약 그대로.
//
// 원본 대비 의도적 차이 (BATTLE_CORE_HEADLESS_01.md에 보고):
//   ① 클래스명 Sim → Battle (참조 원본 이름은 Sim)
//   ② partyIds/loadoutIds 생략 시 P1-A 기본 편성/로드아웃 사용 (tuning.js의 것을 존중)
//   ③ use() 거부 시 'reject' 이벤트 추가 발행 (HUD 슬롯 배지/토스트용 — 로직 영향 0)
//   그 외 로직·순서·수치·이벤트명·문구는 원본과 동일.

import { TUNING, DEFAULT_PARTY, DEFAULT_LOADOUT } from '../data/tuning.js';

export function fmtTime(t) {
  const s = Math.max(0, Math.floor(t));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

// 인스턴스별 튜닝 변형(봇/데브용) 병합 — 원본과 동일. TUNING 원본은 절대 변경되지 않는다.
function deepMerge(dst, src) {
  for (const k in src) {
    if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k])) {
      if (!dst[k]) dst[k] = {};
      deepMerge(dst[k], src[k]);
    } else dst[k] = src[k];
  }
}

export class Battle {
  constructor(partyIds = DEFAULT_PARTY, loadoutIds = DEFAULT_LOADOUT, opts = {}) {
    const T = this.T = JSON.parse(JSON.stringify(TUNING));
    if (opts.tuning) deepMerge(T, opts.tuning);
    this.t = 0;
    this.events = [];
    this.result = null;
    this.loadout = loadoutIds.slice(0, 6);
    this.breath = this.loadout.includes('breath');

    const P = T.priest;
    this.units = [{ id: 'you', name: '사제', emoji: '✨', hp: P.hp, max: P.hp, isPriest: true, alive: true, dps: 0 }];
    partyIds.slice(0, 3).forEach(id => {
      const a = T.allies[id];
      this.units.push({ id, name: a.name, emoji: a.emoji, hp: a.hp, max: a.hp, dps: a.dps,
        tank: !!a.tank, alive: true, totemHps: a.totemHps || 0, trapInt: a.trapInt || 0 });
    });
    this.sel = this.units.length > 1 ? 1 : 0; // 기본 선택 = 첫 동료

    this.mana = P.mana; this.manaMax = P.mana;
    this.gcd = 0; this.cast = null; this.cd = {};
    this.shield = {}; this.hot = {}; this.root = {};
    this.vow = {}; this.seed = {};   // Battle Core Skill Extension 01 — 신규 2종 상태(미장착 시 빈 채로 무해·기존 전투 불변)
    this.grace = null;               // Final Battle Readability 01 — 은총의 순간 토큰(제품 grace skill 사용 시에만 set·미장착/미사용 시 null=무해·기존 경로 byte-identical)

    const B = T.boss;
    this.boss = { hp: B.hp, max: B.hp, push: false,
      nextAuto: B.autoFirst, nextSmash: B.smashFirst, nextTremor: B.tremorFirst, nextRoot: B.rootFirst,
      autoInt: B.autoInt, tremorInt: B.tremorInt };
    this.tele = { smash: null, tremor: null, root: null };
    this.rootRota = 0;
    const hunter = this.units.find(u => u.trapInt);
    this.trapNext = hunter ? hunter.trapInt : Infinity;
    this._totemPulse = 1;

    this.m = { healed: 0, overheal: 0, absorbed: 0, totemHealed: 0, dmgTaken: 0, priestTaken: 0,
      smashTotal: 0, smashShielded: 0,
      rootApplied: 0, rootCleansed: 0, rootCleanseSum: 0, rootExpired: 0, rootTicks: 0,
      manaEmptyAt: null, lowMana: 0, deaths: [], minHp: {}, clutch: false,
      castCount: {}, cancels: 0, lastFatal: null };
    this.units.forEach((u, i) => { this.m.minHp[i] = { pct: 1, t: 0 }; });
  }

  ev(type, data) { const e = Object.assign({ type, t: this.t }, data || {}); this.events.push(e); }
  log(text, cls) { this.ev('log', { text, cls: cls || '' }); }

  aggro() {
    const ti = this.units.findIndex(u => u.tank && u.alive);
    if (ti > 0) return ti;
    let best = -1, bd = -1;
    this.units.forEach((u, i) => { if (!u.isPriest && u.alive && u.dps > bd) { bd = u.dps; best = i; } });
    return best;
  }
  aliveAllies() { return this.units.filter(u => !u.isPriest && u.alive); }

  dealDamage(i, amt, src) {
    const u = this.units[i];
    if (!u || !u.alive || this.result) return;
    let a = amt;
    if (u.tank) a = Math.round(a * (1 - this.T.tankMit));
    // vow(수호의 서약) 비율 감소 — 보호막 흡수 前 · 미장착 시 this.vow[i] undefined → no-op (Battle Core Skill Extension 01)
    const vw = this.vow[i];
    if (vw && a > 0) a = Math.round(a * vw.mul);   // mul = dmgMul(0.6) · tank 감쇄와 동일 Math.round 문법
    const sh = this.shield[i];
    let absorbed = 0;
    if (sh && sh.absorb > 0) {
      absorbed = Math.min(sh.absorb, a);
      sh.absorb -= absorbed; a -= absorbed;
      this.m.absorbed += absorbed;
      if (sh.absorb <= 0) { delete this.shield[i]; this.ev('shieldBreak', { unit: i }); }
    }
    if (absorbed > 0) this.ev('absorb', { unit: i, amt: absorbed, src });
    let hpDmg = 0;
    if (a > 0) {
      u.hp -= a; hpDmg = a; this.m.dmgTaken += a;
      if (u.isPriest) this.m.priestTaken += a;
      this.ev('dmg', { unit: i, amt: a, src });
    }
    const pct = Math.max(0, u.hp) / u.max;
    if (pct < this.m.minHp[i].pct) this.m.minHp[i] = { pct, t: this.t };
    if (u.hp <= 0) {
      u.hp = 0; u.alive = false;
      delete this.hot[i]; delete this.root[i]; delete this.shield[i]; delete this.vow[i]; delete this.seed[i];
      this.m.deaths.push({ unit: i, name: u.name, t: this.t, src });
      this.m.lastFatal = { unit: i, name: u.name, src, t: this.t };
      this.ev('death', { unit: i, src });
      this.log(u.name + ' 쓰러짐!', 'bad');
      if (u.isPriest) { this.finish('defeat'); return; }
      if (this.aliveAllies().length === 0) { this.finish('defeat'); return; }
      if (u.tank || src === 'auto') {
        const n = this.aggro();
        if (n > 0) { this.ev('aggroShift', { unit: n }); this.log('표적 변경: ' + this.units[n].name + '!', 'warn'); }
      }
    }
    // seed(기도 씨앗) 피격 반응 — HP 피해 ≥1 & 생존 시 사건당 1회 (Battle Core Skill Extension 01)
    //   부활 없음(사망 시 위 블록에서 return 또는 alive=false로 미발동) · 재귀 없음(heal은 dealDamage 미호출).
    if (hpDmg >= 1 && u.alive) {
      const sd = this.seed[i];
      if (sd && sd.charges > 0) {
        sd.charges--;
        this.ev('seedProc', { unit: i, amt: this.T.skills.seed.healPerHit });
        this.heal(i, this.T.skills.seed.healPerHit, 'seed');
        if (sd.charges <= 0) { delete this.seed[i]; this.ev('seedFade', { unit: i }); }
      }
    }
  }

  heal(i, amt, src) {
    const u = this.units[i];
    if (!u || !u.alive) return 0;
    const need = u.max - u.hp;
    const ap = Math.min(need, amt);
    u.hp += ap;
    if (src === 'totem') { this.m.totemHealed += ap; }
    else {
      this.m.healed += ap; this.m.overheal += (amt - ap);
      if (ap > 0 && (u.hp - ap) / u.max < 0.15) this.m.clutch = true;
    }
    if (ap > 0.5) this.ev('heal', { unit: i, amt: ap, src });
    return ap;
  }

  select(i) {
    if (this.units[i]) { this.sel = i; this.ev('select', { unit: i }); }
  }

  use(slotIdx) {
    const sid = this.loadout[slotIdx];
    // 거부 헬퍼: 원본과 동일하게 {ok:false, reason} 반환 + (이식 추가) reject 이벤트 발행
    const deny = (reason) => { this.ev('reject', { slot: slotIdx, sid: sid || null, reason }); return { ok: false, reason }; };
    if (this.result) return deny('전투 종료');
    const S = sid && this.T.skills[sid];
    if (!S) return deny('빈 슬롯');
    if (S.type === 'passive') return deny('패시브 — 장착만으로 효과가 적용됩니다');
    if (this.cast) return deny('casting');
    if (this.gcd > 0) return deny('gcd');
    if ((this.cd[sid] || 0) > 0) return deny('재사용 대기 ' + Math.ceil(this.cd[sid]) + '초');
    if (sid === 'grace' && this.grace) return deny('이미 은총이 깃들어 있습니다');
    // Final Battle Readability 01 — 은총 활성 시 다음 "마나 소모(cost>0) 스킬"의 유효 비용 0(은총 자신 제외).
    //   this.grace가 null이면 graceHit=false → eff=S.cost로 기존 경로와 완전히 동일(canonical 무영향).
    const graceHit = !!(this.grace && S.cost > 0 && sid !== 'grace');
    const eff = graceHit ? 0 : S.cost;
    if (this.mana < eff) return deny('마나가 부족합니다');
    let ti = this.sel;
    if (S.selfOnly) ti = 0;
    if (S.target === 'ally' || S.selfOnly) {
      const u = this.units[ti];
      if (!u || !u.alive) return deny('대상이 쓰러져 있습니다');
    }
    if (sid === 'shield') {
      const sh = this.shield[ti];
      if (sh && sh.absorb > 0) return deny('이미 보호막이 유지 중입니다');
    }
    if (sid === 'cleanse' && !this.root[ti]) return deny('제거할 디버프가 없습니다');
    if (sid === 'vow' && this.vow[ti]) return deny('이미 수호의 서약이 유지 중입니다');
    if (sid === 'seed' && this.seed[ti]) return deny('이미 기도 씨앗이 심겨 있습니다');

    this.gcd = this.T.gcd;
    this.m.castCount[sid] = (this.m.castCount[sid] || 0) + 1;
    if (S.type === 'cast') {
      // 은총 claim: 시전 시작 시 토큰을 이 시전에 예약(취소/무산 시 미소모·완료 시 소비). 시전 중 은총 만료 동결(step).
      this.cast = { sid, ti, left: S.cast, total: S.cast, graceClaim: graceHit };
      this.ev('castStart', { sid, unit: ti });
      return { ok: true };
    }
    this.mana -= eff;
    if (graceHit) { this.grace = null; this.ev('graceProc', { sid }); }   // 무료 시전 발동(성공한 마나 소모 스킬 1회)
    this._resolve(sid, ti);
    return { ok: true };
  }

  _resolve(sid, ti) {
    const S = this.T.skills[sid];
    if (S.cd) this.cd[sid] = S.cd;
    if (sid === 'quickheal') {
      this.heal(ti, S.heal, 'quickheal');
      this.log('빠른 치유 → ' + this.units[ti].name, 'heal');
    } else if (sid === 'shield') {
      this.shield[ti] = { absorb: S.absorb, max: S.absorb, left: S.dur };
      this.ev('shieldOn', { unit: ti });
      this.log('보호막 → ' + this.units[ti].name, 'buff');
    } else if (sid === 'cleanse') {
      const r = this.root[ti];
      if (r) {
        this.m.rootCleansed++; this.m.rootCleanseSum += (this.t - r.appliedAt);
        delete this.root[ti];
        this.ev('cleansed', { unit: ti });
        this.log('정화! ' + this.units[ti].name + '의 속박 해제', 'heal');
      }
    } else if (sid === 'salvation') {
      const u = this.units[0];
      const amt = Math.round((u.max - u.hp) * S.healPctMissing + S.healFlat);
      this.heal(0, amt, 'salvation');
      this.ev('salvation', {});
      this.log('구원의 기도 — 사제 긴급 회복', 'heal');
    } else if (sid === 'hot') {
      this.hot[ti] = { hps: S.hps, left: S.dur, pulse: 1 };
      this.ev('hotOn', { unit: ti });
      this.log('지속 회복 → ' + this.units[ti].name, 'buff');
    } else if (sid === 'ring') {
      this.units.forEach((u, i) => { if (u.alive) this.heal(i, S.healAll, 'ring'); });
      this.ev('ring', {});
      this.log('빛의 고리 — 파티 전체 회복', 'heal');
    } else if (sid === 'vow') {
      this.vow[ti] = { mul: S.dmgMul, left: S.dur };   // Battle Core Skill Extension 01
      this.ev('vowOn', { unit: ti });
      this.log('수호의 서약 → ' + this.units[ti].name, 'buff');
    } else if (sid === 'seed') {
      this.seed[ti] = { charges: S.charges, left: S.dur };
      this.ev('seedOn', { unit: ti });
      this.log('기도 씨앗 → ' + this.units[ti].name, 'buff');
    } else if (sid === 'grace') {
      // Final Battle Readability 01 — 은총 토큰 부여(8초 창). 다음 마나 소모 스킬 use()/시전 완료에서 소비.
      this.grace = { left: S.dur };
      this.ev('graceOn', {});
      this.log('은총의 순간 — 다음 기도가 무료가 된다', 'buff');
    }
  }

  cancelCast() {
    if (this.cast) {
      this.cast = null; this.m.cancels++;
      this.ev('castCancel', {});
      this.log('시전 취소 (마나 소모 없음)', 'dim');
    }
  }

  step(dt) {
    if (this.result) return;
    this.t += dt;
    if (this.gcd > 0) this.gcd = Math.max(0, this.gcd - dt);
    for (const k in this.cd) { this.cd[k] -= dt; if (this.cd[k] <= 0) delete this.cd[k]; }

    // (1) 마나 회복 (깊은 호흡: 비시전 시간 보너스)
    let rg = this.T.priest.regen;
    if (this.breath && !this.cast) rg += this.T.priest.breathBonus;
    this.mana = Math.min(this.manaMax, this.mana + rg * dt);
    if (this.mana < 10) this.m.lowMana += dt;
    if (this.m.manaEmptyAt === null && this.mana < 7) this.m.manaEmptyAt = this.t;

    // (2) 시전 진행 — 완료 시 마나 소비 (무산 = 시간 손실만)
    if (this.cast) {
      this.cast.left -= dt;
      if (this.cast.left <= 0) {
        const c = this.cast; this.cast = null;
        const S = this.T.skills[c.sid];
        const u = this.units[c.ti];
        const eff = c.graceClaim ? 0 : S.cost;   // 은총 claim 시 무료 완료(취소/무산이면 아래 fizzle 경로라 토큰 미소모)
        if (!u || !u.alive) { this.ev('castFizzle', {}); this.log('시전 무산 — 대상이 쓰러짐', 'dim'); }
        else if (this.mana < eff) { this.ev('castFizzle', {}); this.log('시전 무산 — 마나 부족', 'dim'); }
        else { this.mana -= eff; if (c.graceClaim && this.grace) { this.grace = null; this.ev('graceProc', { sid: c.sid }); } this._resolve(c.sid, c.ti); this.ev('castDone', { sid: c.sid }); }
      }
    }

    // (3) HoT
    for (const k in this.hot) {
      const h = this.hot[k];
      h.left -= dt; h.pulse -= dt;
      if (h.pulse <= 0) { h.pulse += 1; this.heal(+k, h.hps, 'hot'); }
      if (h.left <= 0) delete this.hot[k];
    }
    // (4) 보호막 시간 만료
    for (const k in this.shield) {
      const s = this.shield[k];
      s.left -= dt;
      if (s.left <= 0) { delete this.shield[k]; this.ev('shieldFade', { unit: +k }); }
    }
    // (4b) vow(수호의 서약) 만료 · 미장착 시 빈 루프 (Battle Core Skill Extension 01)
    for (const k in this.vow) {
      const v = this.vow[k]; v.left -= dt;
      if (v.left <= 0) { delete this.vow[k]; this.ev('vowFade', { unit: +k }); }
    }
    // (4c) seed(기도 씨앗) 만료 — 충전 남아도 15초 후 제거
    for (const k in this.seed) {
      const s = this.seed[k]; s.left -= dt;
      if (s.left <= 0) { delete this.seed[k]; this.ev('seedFade', { unit: +k }); }
    }
    // (4d) grace(은총) 만료 — 8초 창. 시전 중 claim된 은총은 동결(완료/취소 후 재개). null이면 no-op(canonical 무영향).
    if (this.grace && !(this.cast && this.cast.graceClaim)) {
      this.grace.left -= dt;
      if (this.grace.left <= 0) { this.grace = null; this.ev('graceFade', {}); }
    }
    // (5) 속박 도트
    for (const k in this.root) {
      const r = this.root[k];
      r.left -= dt; r.pulse -= dt;
      if (r.pulse <= 0) { r.pulse += 1; r.ticks++; this.m.rootTicks++; this.dealDamage(+k, this.T.boss.rootDps, 'root'); if (this.result) return; }
      if (this.root[k] && r.left <= 0) { this.m.rootExpired++; delete this.root[k]; this.ev('rootFade', { unit: +k }); }
    }
    // (6) 치유 토템
    const sh = this.units.find(u => u.alive && u.totemHps);
    if (sh) {
      this._totemPulse -= dt;
      if (this._totemPulse <= 0) {
        this._totemPulse += 1;
        this.units.forEach((u, i) => { if (u.alive) this.heal(i, sh.totemHps, 'totem'); });
      }
    }
    // (7) 덫: 다음 강타/돌진동 중 가까운 것을 지연
    const hunter = this.units.find(u => u.alive && u.trapInt);
    if (hunter && this.t >= this.trapNext) {
      this.trapNext += hunter.trapInt;
      const d = this.T.allies.hunter.trapDelay;
      const cands = [];
      if (!this.tele.smash) cands.push('nextSmash');
      if (!this.tele.tremor) cands.push('nextTremor');
      if (cands.length) {
        cands.sort((a, b) => this.boss[a] - this.boss[b]);
        this.boss[cands[0]] += d;
        this.ev('trap', {});
        this.log('덫 발동! 골렘의 다음 행동이 ' + d + '초 늦춰진다', 'buff');
      }
    }
    // (8) 마지막 압박 (소프트)
    const B = this.T.boss;
    if (!this.boss.push && (this.t >= B.pushTime || this.boss.hp / this.boss.max <= B.pushHpPct)) {
      this.boss.push = true;
      this.boss.autoInt = B.pushAutoInt;
      this.boss.tremorInt = B.pushTremorInt;
      this.ev('push', {});
      this.log('골렘이 마지막 힘을 쥐어짠다!', 'warn');
    }
    const mul = this.boss.push ? B.pushDmgMul : 1;

    // (9) 전조 생성
    if (!this.tele.smash && this.t >= this.boss.nextSmash - B.smashWind) {
      const ti = this.aggro();
      if (ti > 0) {
        this.tele.smash = { ti, at: this.boss.nextSmash };
        this.ev('teleSmash', { unit: ti, wind: B.smashWind });
        this.log('대지 강타 예고 → ' + this.units[ti].name, 'warn');
      } else this.boss.nextSmash += B.smashInt;
    }
    if (!this.tele.tremor && this.t >= this.boss.nextTremor - B.tremorWind) {
      this.tele.tremor = { at: this.boss.nextTremor };
      this.ev('teleTremor', { wind: B.tremorWind });
      this.log('돌진동 — 전원 피해 예고!', 'warn');
    }
    if (!this.tele.root && this.t >= this.boss.nextRoot - B.rootWind) {
      const ti = this._rootTarget();
      if (ti > 0) this.tele.root = { ti, at: this.boss.nextRoot };
      else this.boss.nextRoot += B.rootInt;
    }
    // (9) 전조 적중
    if (this.tele.smash && this.t >= this.tele.smash.at) {
      const ti = this.tele.smash.ti;
      this.tele.smash = null;
      this.boss.nextSmash += B.smashInt;
      if (this.units[ti].alive) {
        this.m.smashTotal++;
        const shd = !!(this.shield[ti] && this.shield[ti].absorb > 0);
        if (shd) this.m.smashShielded++;
        this.ev('smash', { unit: ti, shielded: shd });
        this.log(shd ? '대지 강타 — 보호막이 받아냈다!' : '대지 강타 직격!', 'bad');
        this.dealDamage(ti, Math.round(B.smashDmg * mul), 'smash');
        if (this.result) return;
      }
    }
    if (this.tele.tremor && this.t >= this.tele.tremor.at) {
      this.tele.tremor = null;
      this.boss.nextTremor += this.boss.tremorInt;
      this.ev('tremor', {});
      this.log('돌진동! 전원이 흔들린다 (사제 포함)', 'bad');
      for (let i = 0; i < this.units.length; i++) {
        if (this.units[i].alive) { this.dealDamage(i, Math.round(B.tremorDmg * mul), 'tremor'); if (this.result) return; }
      }
    }
    if (this.tele.root && this.t >= this.tele.root.at) {
      const ti = this.tele.root.ti;
      this.tele.root = null;
      this.boss.nextRoot += B.rootInt;
      if (this.units[ti].alive) {
        this.root[ti] = { left: B.rootDur, pulse: 1, appliedAt: this.t, ticks: 0 };
        this.m.rootApplied++;
        this.ev('rootOn', { unit: ti });
        this.log('뿌리 속박 → ' + this.units[ti].name + ' — 정화로 해제!', 'warn');
      }
    }
    // (10) 평타
    if (this.t >= this.boss.nextAuto) {
      this.boss.nextAuto += this.boss.autoInt;
      const ti = this.aggro();
      if (ti > 0) {
        this.ev('auto', { unit: ti });
        this.dealDamage(ti, Math.round(B.autoDmg * mul), 'auto');
        if (this.result) return;
      }
    }
    // (11) 아군 자동 전투 → 보스 HP
    const dps = this.aliveAllies().reduce((s, u) => s + u.dps, 0);
    this.boss.hp -= dps * dt;
    if (this.boss.hp <= 0) { this.boss.hp = 0; this.finish('victory'); return; }
    // (12) 안전장치
    if (this.t > 360) this.finish('defeat');
  }

  _rootTarget() {
    const pool = [];
    this.units.forEach((u, i) => { if (!u.isPriest && !u.tank && u.alive) pool.push({ u, i }); });
    pool.sort((a, b) => b.u.dps - a.u.dps || a.i - b.i);
    if (!pool.length) {
      const any = this.aliveAllies();
      return any.length ? this.units.indexOf(any[0]) : -1;
    }
    const pick = pool[this.rootRota % pool.length];
    this.rootRota++;
    return pick.i;
  }

  finish(outcome) {
    if (this.result) return;
    const m = this.m;
    const crisis = [];
    this.units.forEach((u, i) => {
      const mh = m.minHp[i];
      if (mh.pct < 0.35) crisis.push({ t: mh.t, name: u.name, pct: Math.round(mh.pct * 100) });
    });
    crisis.sort((a, b) => a.pct - b.pct);
    const ohPct = (m.healed + m.overheal) > 0 ? Math.round(100 * m.overheal / (m.healed + m.overheal)) : 0;
    const cleanseAvg = m.rootCleansed ? (m.rootCleanseSum / m.rootCleansed) : null;

    let cause = null, advice;
    if (outcome === 'defeat') {
      const lf = m.lastFatal;
      if (lf && lf.unit === 0) {
        cause = '돌진동 피해를 사제가 회복 없이 받아 쓰러졌습니다.';
        if (m.manaEmptyAt !== null && m.manaEmptyAt < lf.t) cause += ' (마나 고갈 t=' + Math.round(m.manaEmptyAt) + 's)';
      } else if (lf && lf.src === 'smash') {
        cause = Math.round(lf.t) + '초 대지 강타를 보호막 없이 받았습니다.';
        if (m.manaEmptyAt !== null && m.manaEmptyAt < lf.t) cause += ' 마나 고갈(t=' + Math.round(m.manaEmptyAt) + 's)로 대응이 끊긴 상태였습니다.';
      } else if (m.manaEmptyAt !== null && lf && lf.t > m.manaEmptyAt) {
        cause = '후반 마나가 바닥나 치유가 끊겼습니다. (고갈 t=' + Math.round(m.manaEmptyAt) + 's)';
      } else if (lf && lf.src === 'root') {
        cause = '속박 정화가 늦어 ' + lf.name + '이(가) 추가 피해를 받았습니다.';
      } else {
        cause = '회복량이 받은 피해를 따라가지 못했습니다.';
      }
      advice = m.smashTotal && m.smashShielded < m.smashTotal
        ? '강타 예고 ' + this.T.boss.smashWind + '초를 노려 보호막을 먼저 걸어보세요.'
        : (m.manaEmptyAt !== null ? '오버힐을 줄이고, 손을 쉬는 구간을 만들어 보세요.' : '지속 회복을 미리 발라 낙폭을 줄여보세요.');
    } else {
      if (m.smashTotal && m.smashShielded < m.smashTotal) advice = '다음 목표: 강타 대응 ' + m.smashShielded + '/' + m.smashTotal + ' → 전부 보호막으로.';
      else if (ohPct > 25) advice = '오버힐 ' + ohPct + '% — 필요한 만큼만 기도하면 마나가 남습니다.';
      else if (Math.round(this.mana) < 25) advice = '마나가 아슬아슬했습니다. 깊은 호흡 장착을 시험해 보세요.';
      else advice = '완벽에 가깝습니다. 기록 단축에 도전해 보세요.';
    }

    const chips = [];
    if (outcome === 'victory') {
      const allyDeaths = m.deaths.filter(d => d.unit !== 0).length;
      const minAll = Math.min.apply(null, Object.keys(m.minHp).map(k => m.minHp[k].pct));
      if (allyDeaths === 0) chips.push('전원 생존');
      if (minAll <= 0.10) chips.push('아슬아슬한 승리');
      if (m.smashTotal >= 3 && m.smashShielded / m.smashTotal >= 0.8) chips.push('보호막 명중');
      if (m.clutch) chips.push('위기의 손');
      if (m.rootApplied > 0 && m.rootExpired === 0 && cleanseAvg !== null && cleanseAvg <= 3) chips.push('정화 성공');
      if (this.mana / this.manaMax >= 0.25) chips.push('마나 장인');
    }

    this.result = {
      outcome,
      report: {
        outcome,
        boss: this.T.boss.name,
        duration: this.t,
        durationText: fmtTime(this.t),
        healed: Math.round(m.healed),
        overhealPct: ohPct,
        totemHealed: Math.round(m.totemHealed),
        absorbed: Math.round(m.absorbed),
        dmgTaken: Math.round(m.dmgTaken),
        priestTaken: Math.round(m.priestTaken),
        manaEnd: Math.round(this.mana),
        manaEmptyAt: m.manaEmptyAt === null ? null : Math.round(m.manaEmptyAt),
        deaths: m.deaths.map(d => d.name),
        smashTotal: m.smashTotal, smashShielded: m.smashShielded,
        rootApplied: m.rootApplied, rootCleansed: m.rootCleansed,
        rootExpired: m.rootExpired,
        cleanseAvg: cleanseAvg === null ? null : Math.round(cleanseAvg * 10) / 10,
        crisis: crisis.slice(0, 3),
        cause, advice,
        chips: chips.slice(0, 3),
        party: this.units.slice(1).map(u => u.name),
        loadout: this.loadout.slice()
      }
    };
    this.ev('end', { outcome });
  }
}
