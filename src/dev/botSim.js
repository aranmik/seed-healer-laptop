// Seed Healer — dev/botSim.js (botSim Baseline 01)
// P1-A 원본(reference/seed_healer_p1_raid_frame_priest.html)의 Bots/runBot/runAllBots/coreChecks를
// 현재 src/core/battle.js의 Battle 클래스 기준으로 이식한 headless 검증 하니스.
// 근거 문서: docs/migration_prep/P1A_03(루프) · P1A_06(수치) · P1A_10(봇 baseline)
//
// 규율: 난수 0 · DOM 접근 0 · 시간은 battle.step(dt) 반복으로만 진행 ·
//       입력은 select/use/cancelCast만 사용 · battle.js/tuning.js는 참조만(변경 없음).
//
// 원본 대비 의도적 차이: Sim → Battle 클래스명만 (Battle Core Headless 01과 동일 원칙).
// 그 외 봇 결정 로직·타이밍·순서는 원본과 동일.

import { Battle, fmtTime } from '../core/battle.js';

const STANDARD_PARTY = ['warrior', 'rogue', 'mage'];
const STANDARD_LOADOUT = ['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'ring'];

// ---------------- 봇 보조 함수 (원본 그대로) ----------------
function lowestUnit(sim, includePriest) {
  let bi = -1, bp = 2;
  sim.units.forEach((u, i) => {
    if (!u.alive) return;
    if (!includePriest && u.isPriest) return;
    const p = u.hp / u.max;
    if (p < bp) { bp = p; bi = i; }
  });
  return bi;
}
const slotOf = (sim, sid) => sim.loadout.indexOf(sid);

// ---------------- 봇 4형제 (원본 그대로, sim 파라미터 = Battle 인스턴스) ----------------
export const Bots = {
  idle: () => ({ name: 'P0 방치', decide() {} }),

  spam: () => ({
    name: 'P1 스팸',
    decide(sim) {
      if (sim.cast || sim.gcd > 0) return;
      const ti = lowestUnit(sim, true);
      if (ti >= 0) sim.select(ti);
      for (let s = 0; s < 6; s++) { if (sim.use(s).ok) return; }
    }
  }),

  basic: () => {
    let nt = 0;
    return {
      name: 'P1.5 기본기',
      decide(sim) {
        if (sim.t < nt) return;
        nt = sim.t + 0.35;
        if (sim.cast) return;
        const tel = sim.tele.smash;
        if (tel && sim.t >= tel.at - sim.T.boss.smashWind + 0.4) {
          const ti = tel.ti;
          if (!(sim.shield[ti] && sim.shield[ti].absorb > 0)) {
            sim.select(ti);
            if (sim.use(slotOf(sim, 'shield')).ok) return;
          }
        }
        for (const k in sim.root) {
          if (sim.t - sim.root[k].appliedAt >= 0.6) {
            sim.select(+k);
            if (sim.use(slotOf(sim, 'cleanse')).ok) return;
          }
        }
        const you = sim.units[0];
        if (you.hp / you.max < 0.4 && sim.use(slotOf(sim, 'salvation')).ok) return;
        const ti = lowestUnit(sim, false);
        if (ti > 0 && sim.units[ti].hp / sim.units[ti].max < 0.7) {
          sim.select(ti);
          sim.use(slotOf(sim, 'quickheal'));
        }
      }
    };
  },

  smart: () => {
    let nt = 0, lastRing = -99;
    return {
      name: 'P2 스마트',
      decide(sim) {
        if (sim.t < nt) return;
        nt = sim.t + 0.2;
        if (sim.cast) return;
        const T = sim.T, you = sim.units[0];
        const tel = sim.tele.smash;
        if (tel && sim.t >= tel.at - T.boss.smashWind + 0.2) {
          const ti = tel.ti;
          if (!(sim.shield[ti] && sim.shield[ti].absorb > 0)) {
            sim.select(ti);
            if (sim.use(slotOf(sim, 'shield')).ok) return;
          }
        }
        for (const k in sim.root) {
          if (sim.t - sim.root[k].appliedAt >= 0.3) {
            sim.select(+k);
            if (sim.use(slotOf(sim, 'cleanse')).ok) return;
          }
        }
        if (you.hp / you.max < 0.45 && sim.use(slotOf(sim, 'salvation')).ok) return;
        // 빛의 고리: 3인 이상 부상 + 총 결핍 충분 + 스로틀 (낭비 컷)
        const hurtUnits = sim.units.filter(u => u.alive && u.hp / u.max < 0.8);
        const deficitSum = hurtUnits.reduce((s, u) => s + (u.max - u.hp), 0);
        if (hurtUnits.length >= 3 && deficitSum >= 560 && sim.t - lastRing > 12) {
          if (sim.use(slotOf(sim, 'ring')).ok) { lastRing = sim.t; return; }
        }
        // 지속 회복: 탱커가 실제로 깎였을 때만 (선배포 남발 금지)
        const tki = sim.units.findIndex(u => u.tank && u.alive);
        if (tki > 0) {
          const h = sim.hot[tki], tank = sim.units[tki];
          if (!h && tank.hp / tank.max < 0.8) {
            sim.select(tki);
            if (sim.use(slotOf(sim, 'hot')).ok) return;
          }
        }
        const danger = sim.units.some(u => u.alive && u.hp / u.max < 0.4);
        if (sim.mana < 20 && !danger) return; // 마나 절제 = 깊은 호흡 창
        // 손을 쉬는 것도 기술: 전원 안전 + 마나 여유 없음 → 회복을 은행에
        let worst = 1;
        sim.units.forEach(u => { if (u.alive) worst = Math.min(worst, u.hp / u.max); });
        if (sim.mana < 42 && worst > 0.55 && !tel && !sim.tele.tremor) return;
        if (tel && tel.at - sim.t < 1.2) return; // 강타 직전엔 시전 시작 금지
        const li = lowestUnit(sim, true);
        if (li >= 0) {
          const u = sim.units[li];
          const deficit = u.max - u.hp;
          if (u.hp / u.max < 0.66 && deficit >= T.skills.quickheal.heal * 0.75) {
            sim.select(li);
            sim.use(slotOf(sim, 'quickheal'));
          }
        }
      }
    };
  }
};

// ---------------- runBot / runAllBots (원본 그대로, Sim → Battle) ----------------
export function runBot(botKey, partyIds, loadoutIds, opts) {
  const sim = new Battle(partyIds || STANDARD_PARTY, loadoutIds || STANDARD_LOADOUT, opts || {});
  const bot = Bots[botKey]();
  const dt = sim.T.tick;
  let guard = 0;
  while (!sim.result && guard++ < 400 / dt) {
    bot.decide(sim);
    sim.step(dt);
  }
  const r = sim.result ? sim.result.report : null;
  const minAll = Math.min.apply(null, Object.keys(sim.m.minHp).map(k => sim.m.minHp[k].pct));
  return {
    bot: bot.name,
    outcome: r ? r.outcome : 'timeout',
    duration: r ? r.duration : sim.t,
    durationText: r ? r.durationText : fmtTime(sim.t),
    manaEnd: Math.round(sim.mana),
    manaEmptyAt: sim.m.manaEmptyAt === null ? null : Math.round(sim.m.manaEmptyAt),
    deaths: sim.m.deaths.map(d => d.name + '@' + Math.round(d.t) + 's'),
    minHp: Math.round(minAll * 100),
    smashTotal: sim.m.smashTotal, smashShielded: sim.m.smashShielded,
    rootApplied: sim.m.rootApplied, rootCleansed: sim.m.rootCleansed, rootExpired: sim.m.rootExpired,
    healed: Math.round(sim.m.healed),
    overhealPct: r ? r.overhealPct : 0,
    dmgTaken: Math.round(sim.m.dmgTaken),
    priestTaken: Math.round(sim.m.priestTaken),
    chips: r ? r.chips : [],
    report: r
  };
}

export function runAllBots(partyIds, loadoutIds) {
  return ['idle', 'spam', 'basic', 'smart'].map(k => runBot(k, partyIds, loadoutIds));
}

// ---------------- coreChecks (원본 그대로, Sim → Battle) ----------------
export function coreChecks() {
  const out = [];
  const ok = (name, pass, note) => out.push({ name, pass: !!pass, note: note || '' });

  // 1. 프레임 4칸 + 1번 칸 = 사제
  const s1 = new Battle(STANDARD_PARTY, STANDARD_LOADOUT);
  ok('프레임 4칸 · 1번=사제(YOU)', s1.units.length === 4 && s1.units[0].isPriest, s1.units.map(u => u.name).join('/'));

  // 방치 = 전멸
  const bIdle = runBot('idle');
  ok('방치 봇 → 전멸(패배)', bIdle.outcome === 'defeat', 't=' + bIdle.duration + 's');

  // 골렘전 승리 도달 (스마트)
  const bSmart = runBot('smart');
  ok('골렘전 승리 도달(스마트 봇)', bSmart.outcome === 'victory', bSmart.durationText + ' · 마나 ' + bSmart.manaEnd);

  // 스팸 = 마나 고갈
  const bSpam = runBot('spam');
  ok('스팸 봇 → 마나 고갈 발생', bSpam.manaEmptyAt !== null, '고갈 t=' + bSpam.manaEmptyAt + 's · ' + bSpam.outcome);

  // 보호막이 강타 피해를 줄임
  const a = new Battle(STANDARD_PARTY, STANDARD_LOADOUT);
  const b = new Battle(STANDARD_PARTY, STANDARD_LOADOUT);
  b.shield[1] = { absorb: b.T.skills.shield.absorb, max: 360, left: 20 };
  a.dealDamage(1, a.T.boss.smashDmg, 'smash');
  b.dealDamage(1, b.T.boss.smashDmg, 'smash');
  const lossA = a.units[1].max - a.units[1].hp;
  const lossB = b.units[1].max - b.units[1].hp;
  ok('보호막 = 강타 피해 경감', lossB < lossA, '무보호 ' + lossA + ' vs 보호 ' + lossB);

  // 정화 = 디버프 제거
  const c = new Battle(STANDARD_PARTY, STANDARD_LOADOUT);
  c.root[2] = { left: 8, pulse: 1, appliedAt: 0, ticks: 0 };
  c.select(2);
  const rc = c.use(c.loadout.indexOf('cleanse'));
  ok('정화 = 속박 제거', rc.ok && !c.root[2], rc.ok ? '제거됨' : rc.reason);

  // 사제도 광역 피해
  const d = new Battle(STANDARD_PARTY, STANDARD_LOADOUT);
  const hp0 = d.units[0].hp;
  d.dealDamage(0, d.T.boss.tremorDmg, 'tremor');
  ok('사제도 돌진동 피해', d.units[0].hp < hp0, hp0 + ' → ' + d.units[0].hp);

  // 리포트 생성
  ok('전투 후 리포트 생성', !!(bSmart.report && bSmart.report.cause !== undefined && bSmart.report.advice), bSmart.report ? '필드 OK' : '없음');

  // 시전 취소 = 마나 손실 없음
  const e = new Battle(STANDARD_PARTY, STANDARD_LOADOUT);
  e.select(1); e.use(e.loadout.indexOf('quickheal'));
  const m0 = e.mana; e.cancelCast();
  ok('시전 취소 = 마나 소모 없음', e.mana === m0 && !e.cast, '마나 ' + Math.round(e.mana));

  return out;
}

// ---------------- baseline 대조 (P1A_10 기준) ----------------
// 허용 오차: duration ±1s · manaEnd ±1 · manaEmptyAt ±1s · minHp ±2%p (부동소수/스텝 처리 차)
const TOL = { duration: 1, mana: 1, minHp: 2 };

const BASELINES = {
  idle:  { key: 'P0 방치', outcome: 'defeat', durationText: '0:39', manaEnd: 100, manaEmptyAt: null, minHp: 0,
           passRule: '60s 내 전멸', watchRule: '90s+ 생존', failRule: '승리' },
  spam:  { key: 'P1 스팸', outcome: 'defeat', durationText: '1:51', manaEnd: 7, manaEmptyAt: 14, minHp: 0,
           passRule: '고갈 발생 & 패배', watchRule: '고갈 없이 승리', failRule: '여유 승리' },
  basic: { key: 'P1.5 기본기', outcome: 'victory', durationText: '2:25', manaEnd: 6, manaEmptyAt: 139, minHp: 26,
           passRule: '승리하되 빠듯(마나<15 or 최저HP<30%)', watchRule: '너무 여유', failRule: '패배' },
  smart: { key: 'P2 스마트', outcome: 'victory', durationText: '2:25', manaEnd: 17, manaEmptyAt: 137, minHp: 52,
           passRule: '승리 & 마나 10~25', watchRule: '마나<5 or 사망', failRule: '패배' }
};

function parseDur(txt) { const [m, s] = txt.split(':').map(Number); return m * 60 + s; }

// 결과 하나를 baseline과 대조해 PASS/WATCH/FAIL + notes 부여
export function compareBaseline(botKey, result) {
  const base = BASELINES[botKey];
  if (!base) return { passStatus: 'WATCH', notes: 'baseline 미정의(변형 시나리오)' };
  const notes = [];
  if (result.outcome !== base.outcome) {
    return { passStatus: 'FAIL', notes: `outcome 불일치: 기대 ${base.outcome} vs 실제 ${result.outcome} (${base.failRule})` };
  }
  const dActual = parseDur(result.durationText), dBase = parseDur(base.durationText);
  const dDiff = Math.abs(dActual - dBase);
  if (dDiff > TOL.duration) notes.push(`시간 차 ${dDiff}s(기대 ${base.durationText} vs 실제 ${result.durationText})`);
  if (base.manaEnd !== null && Math.abs(result.manaEnd - base.manaEnd) > TOL.mana) notes.push(`마나끝 차(기대 ${base.manaEnd} vs 실제 ${result.manaEnd})`);
  const be = base.manaEmptyAt, re = result.manaEmptyAt;
  if (be === null && re !== null) notes.push(`고갈 없어야 하나 발생(t=${re}s)`);
  if (be !== null && re === null) notes.push(`고갈 발생해야 하나 없음`);
  if (be !== null && re !== null && Math.abs(be - re) > TOL.duration) notes.push(`고갈 시점 차(기대 ${be}s vs 실제 ${re}s)`);
  if (Math.abs(result.minHp - base.minHp) > TOL.minHp) notes.push(`최저HP 차(기대 ${base.minHp}% vs 실제 ${result.minHp}%)`);

  const exact = dDiff === 0 && (base.manaEnd === null || result.manaEnd === base.manaEnd) &&
                be === re && result.minHp === base.minHp;
  if (exact) return { passStatus: 'PASS', notes: '기대값과 완전 일치' };
  if (notes.length === 0) return { passStatus: 'PASS', notes: '허용 오차 이내 일치' };
  return { passStatus: 'WATCH', notes: notes.join(' · ') };
}

// 결과 객체를 요청 필드 스키마로 정리
export function summarize(result, botKey) {
  const cmp = botKey ? compareBaseline(botKey, result) : { passStatus: 'WATCH', notes: 'baseline 비교 없음' };
  return {
    bot: result.bot, outcome: result.outcome, duration: result.duration, durationText: result.durationText,
    manaEnd: result.manaEnd, manaEmptyAt: result.manaEmptyAt, deaths: result.deaths, minHp: result.minHp,
    smashTotal: result.smashTotal, smashShielded: result.smashShielded,
    rootApplied: result.rootApplied, rootCleansed: result.rootCleansed, rootExpired: result.rootExpired,
    healed: result.healed, overhealPct: result.overhealPct, dmgTaken: result.dmgTaken, priestTaken: result.priestTaken,
    chips: result.chips, passStatus: cmp.passStatus, notes: cmp.notes
  };
}

// 표준 4봇 + 변형 3종 전체 baseline 리포트
export function runBaselineReport() {
  const standard = ['idle', 'spam', 'basic', 'smart'].map(k => summarize(runBot(k, STANDARD_PARTY, STANDARD_LOADOUT), k));

  const variants = [];
  // 변형 1: 깊은 호흡 채용, 빛의 고리 제외
  {
    const loadout = ['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'breath'];
    const r = runBot('smart', STANDARD_PARTY, loadout);
    const exp = { outcome: 'victory', manaEnd: 77, manaEmptyAt: null };
    const notes = [];
    if (r.outcome !== exp.outcome) notes.push(`outcome 기대 ${exp.outcome} vs 실제 ${r.outcome}`);
    if (Math.abs(r.manaEnd - exp.manaEnd) > TOL.mana) notes.push(`마나끝 기대 ${exp.manaEnd} vs 실제 ${r.manaEnd}`);
    if (r.manaEmptyAt !== null) notes.push(`고갈 없어야 하나 발생(t=${r.manaEmptyAt}s)`);
    variants.push({ ...summarize(r), bot: '변형: 깊은 호흡(고리 제외)', passStatus: notes.length ? 'WATCH' : 'PASS', notes: notes.join(' · ') || '기대(호흡의 가치 성립) 충족' });
  }
  // 변형 2: 노탱커
  {
    const party = ['rogue', 'mage', 'hunter'];
    const r = runBot('smart', party, STANDARD_LOADOUT);
    const exp = { outcome: 'defeat', durationText: '2:00' };
    const dDiff = Math.abs(parseDur(r.durationText) - parseDur(exp.durationText));
    const notes = [];
    if (r.outcome !== exp.outcome) notes.push(`outcome 기대 ${exp.outcome} vs 실제 ${r.outcome} — "방패가 버티면 모두가 버틴다" 경계 붕괴 위험`);
    else if (dDiff > TOL.duration) notes.push(`시간 차 ${dDiff}s(기대 ${exp.durationText} vs 실제 ${r.durationText})`);
    variants.push({ ...summarize(r), bot: '변형: 노탱커(도/마/사냥)', passStatus: notes.length ? (r.outcome !== exp.outcome ? 'FAIL' : 'WATCH') : 'PASS', notes: notes.join(' · ') || '경계 유지(탱커 없으면 패배)' });
  }
  // 변형 3: 저DPS
  {
    const party = ['warrior', 'shaman', 'hunter'];
    const r = runBot('smart', party, STANDARD_LOADOUT);
    const exp = { outcome: 'victory', durationText: '4:00', manaEnd: 8 };
    const dDiff = Math.abs(parseDur(r.durationText) - parseDur(exp.durationText));
    const notes = [];
    if (r.outcome !== exp.outcome) notes.push(`outcome 기대 ${exp.outcome} vs 실제 ${r.outcome}`);
    if (dDiff > TOL.duration) notes.push(`시간 차 ${dDiff}s(기대 ${exp.durationText} vs 실제 ${r.durationText})`);
    if (Math.abs(r.manaEnd - exp.manaEnd) > TOL.mana) notes.push(`마나끝 기대 ${exp.manaEnd} vs 실제 ${r.manaEnd}`);
    variants.push({ ...summarize(r), bot: '변형: 저DPS(전/주/사냥)', passStatus: notes.length ? 'WATCH' : 'PASS', notes: notes.join(' · ') || '느리지만 승리 — 기대 충족' });
  }

  return { standard, variants };
}

// ---------------- node 직접 실행 시 콘솔 출력 (선택, 브라우저에선 무해) ----------------
if (typeof process !== 'undefined' && process.argv && process.argv[1] && /botSim\.(m?js)$/.test(process.argv[1])) {
  const { standard, variants } = runBaselineReport();
  console.log('=== Seed Healer botSim Baseline 01 ===');
  [...standard, ...variants].forEach(r => {
    console.log(`[${r.passStatus}] ${r.bot} — ${r.outcome} ${r.durationText} · 마나끝 ${r.manaEnd} · 고갈@${r.manaEmptyAt} · 최저HP ${r.minHp}% · ${r.notes}`);
  });
  console.log('\n=== coreChecks ===');
  coreChecks().forEach(c => console.log(`[${c.pass ? 'PASS' : 'FAIL'}] ${c.name} — ${c.note}`));
}
