// Seed Healer — dev/battleCoreSkillExtensionCheck.js (Battle Core Skill Extension 01)
// 신규 2종(vow 수호의 서약 / seed 기도 씨앗) 전투 코어 동작 검증: node src/dev/battleCoreSkillExtensionCheck.js
// 대상: src/core/battle.js + src/data/tuning.js (canonical — 제품/botSim/probeSim 공용 정본).
// 난수 0 · DOM 0 · dealDamage/step 직접 구동으로 결정론 검증.
//
// 테스트 유닛 인덱스: 0=사제(ARIA) · 1=방패 전사(tank) · 2=차단 도적 · 3=화염 마법사(non-tank).

import { Battle } from '../core/battle.js';
import { TUNING, DEFAULT_LOADOUT, DEFAULT_PARTY } from '../data/tuning.js';
import { validateLoadout } from '../data/skillPool.js';

let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}

const TEST_LOADOUT = ['vow', 'seed', 'quickheal', 'shield', 'cleanse', 'hot'];
const SLOT = { vow: 0, seed: 1, quickheal: 2, shield: 3, cleanse: 4, hot: 5 };

function fresh(loadout) { return new Battle(DEFAULT_PARTY, loadout || TEST_LOADOUT); }
// gcd를 비워 테스트에서 스킬을 연속 구동(gcd는 전역 쿨·cd[sid]는 per-skill — 쿨 테스트는 cd로 격리).
function cast(B, sid, targetIdx) {
  B.gcd = 0;
  if (targetIdx !== undefined) B.select(targetIdx);
  return B.use(SLOT[sid]);
}
function evCount(B, type) { return B.events.filter(e => e.type === type).length; }
function quietBoss(B) { B.boss.nextAuto = B.boss.nextSmash = B.boss.nextTremor = B.boss.nextRoot = Infinity; }

// ══════════════════════════════════════════════════════════════
// A. 공통
// ══════════════════════════════════════════════════════════════
(() => {
  const B = fresh();
  check('A1 vow/seed loadout 인식', B.loadout[SLOT.vow] === 'vow' && B.loadout[SLOT.seed] === 'seed');

  const r = cast(B, 'vow', 2);
  check('A2 vow 시전 성공(살아있는 아군)', r.ok === true && !!B.vow[2]);

  const B2 = fresh(['nova', 'vow', 'seed', 'quickheal', 'shield', 'hot']);
  check('A3 unknown ID 거부 유지', B2.use(0).ok === false);

  check('A4 breath Demo v1 loadout 거부(validateLoadout)',
    validateLoadout(['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'breath']).ok === false);
  const Bb = fresh(['breath', 'vow', 'seed', 'quickheal', 'shield', 'hot']);
  check('A4b breath는 use 시 패시브 거부', Bb.use(0).ok === false);

  const B3 = fresh(); B3.mana = 5;
  check('A5 마나 부족 거부', cast(B3, 'vow', 2).ok === false);

  const B4 = fresh();
  cast(B4, 'vow', 2);                 // cd['vow']=12
  const c = cast(B4, 'vow', 3);       // gcd 비웠으나 cd 남음
  check('A6 cooldown 적용(재사용 대기 거부)', c.ok === false && B4.cd['vow'] > 0);

  const B5 = fresh(); B5.units[3].alive = false; B5.units[3].hp = 0;
  check('A7 죽은 대상 시전 거부', cast(B5, 'vow', 3).ok === false);

  const B6 = fresh(); B6.units[3].hp = 400;
  const before = B6.units[3].hp; cast(B6, 'quickheal', 3);
  // quickheal은 cast형(1.2s) — 시전 예약만. step으로 완료시켜 기존 6스킬 정상 확인.
  quietBoss(B6); for (let i = 0; i < 30 && B6.cast; i++) B6.step(0.05);
  check('A8 기존 6스킬 정상(빠른치유 회복)', B6.units[3].hp > before);
})();

// ══════════════════════════════════════════════════════════════
// B. 수호의 서약 (vow)
// ══════════════════════════════════════════════════════════════
(() => {
  const B = fresh(); const mana0 = B.mana;
  const r = cast(B, 'vow', 2);
  check('B1 시전 시 상태 적용(mul/left)', !!B.vow[2] && B.vow[2].mul === TUNING.skills.vow.dmgMul && B.vow[2].left === TUNING.skills.vow.dur);
  check('B2 mana 13 소모', (mana0 - B.mana) === TUNING.skills.vow.cost);
  check('B3 cooldown 12 적용', B.cd['vow'] === TUNING.skills.vow.cd);

  const Be = fresh(); quietBoss(Be); cast(Be, 'vow', 2);
  for (let i = 0; i < 170 && Be.vow[2]; i++) Be.step(0.05);   // 8.0s + 여유
  check('B4 8초 만료 + vowFade', !Be.vow[2] && evCount(Be, 'vowFade') === 1);

  // 40% 감소 — non-tank(mage 3)·shield 없음: 100 → round(100*0.6)=60
  const Bd = fresh(); cast(Bd, 'vow', 3); const hp0 = Bd.units[3].hp;
  Bd.dealDamage(3, 100, 'test');
  check('B5 피해 40% 감소(100→60 HP)', (hp0 - Bd.units[3].hp) === Math.round(100 * TUNING.skills.vow.dmgMul));

  // 같은 대상 재적용 거부(cd 비운 상태에서 vow 가드가 잡음)
  const Br = fresh(); cast(Br, 'vow', 3); Br.cd = {}; Br.gcd = 0; Br.select(3);
  check('B6 같은 대상 활성 중 재시전 거부', Br.use(SLOT.vow).ok === false && !!Br.vow[3]);

  // 다른 대상 동시 적용
  const Bt = fresh(); cast(Bt, 'vow', 2); Bt.cd = {}; cast(Bt, 'vow', 3);
  check('B7 다른 대상 동시 적용', !!Bt.vow[2] && !!Bt.vow[3]);

  // ARIA 자신(0)
  const Ba = fresh(); const ra = cast(Ba, 'vow', 0);
  check('B8 ARIA 자신에게 적용', ra.ok === true && !!Ba.vow[0]);

  // 서약 + 보호막 처리 순서: vow(0.6) 먼저 → shield 흡수 (mage 3)
  const Bo = fresh(); cast(Bo, 'vow', 3); Bo.cd = {}; cast(Bo, 'shield', 3);
  const absB = Bo.m.absorbed, hpB = Bo.units[3].hp;
  Bo.dealDamage(3, 100, 'test');   // 100 → vow 60 → shield 흡수 60 → HP 0
  check('B9 vow→shield 순서(흡수 60·서약 先 증명)', (Bo.m.absorbed - absB) === 60 && Bo.units[3].hp === hpB);
  check('B10 서약+보호막 공존(shield 잔량 300·HP 무피해)', Bo.shield[3] && Bo.shield[3].absorb === (TUNING.skills.shield.absorb - 60));

  // 기존 보호막 총량/재적용 잠금 불변
  const Bl = fresh(); cast(Bl, 'shield', 3);
  check('B11 보호막 총량 불변(360)', Bl.shield[3].absorb === TUNING.skills.shield.absorb);
  Bl.cd = {}; Bl.gcd = 0; Bl.select(3);
  check('B12 보호막 재적용 잠금 불변', Bl.use(SLOT.shield).ok === false);
})();

// ══════════════════════════════════════════════════════════════
// C. 기도 씨앗 (seed)
// ══════════════════════════════════════════════════════════════
(() => {
  const B = fresh(); const mana0 = B.mana; const r = cast(B, 'seed', 3);
  check('C1 시전 시 3 charges/15초 상태',
    !!B.seed[3] && B.seed[3].charges === TUNING.skills.seed.charges && B.seed[3].left === TUNING.skills.seed.dur);
  check('C2 mana 12 소모', (mana0 - B.mana) === TUNING.skills.seed.cost);
  check('C3 cooldown 6 적용', B.cd['seed'] === TUNING.skills.seed.cd);

  const Br = fresh(); cast(Br, 'seed', 3); Br.cd = {}; Br.gcd = 0; Br.select(3);
  check('C4 동일 대상 활성 중 재시전 거부', Br.use(SLOT.seed).ok === false && !!Br.seed[3]);

  const Bt = fresh(); cast(Bt, 'seed', 2); Bt.cd = {}; cast(Bt, 'seed', 3);
  check('C5 다른 대상 동시 적용', !!Bt.seed[2] && !!Bt.seed[3]);

  const Ba = fresh(); const ra = cast(Ba, 'seed', 0);
  check('C6 ARIA 자신에게 적용', ra.ok === true && !!Ba.seed[0]);

  // HP 피해 발생 시 heal 90/charge-1 (mage 800: 100 피해 → 90 치유 → 순 -10)
  const Bh = fresh(); cast(Bh, 'seed', 3); const hp0 = Bh.units[3].hp;
  Bh.dealDamage(3, 100, 'test');
  check('C7 HP 피해 시 heal 90/charge-1',
    Bh.units[3].hp === (hp0 - 100 + TUNING.skills.seed.healPerHit) && Bh.seed[3].charges === 2 && evCount(Bh, 'seedProc') === 1);

  // 보호막 전량 흡수 → 미발동·충전 불소모
  const Bf = fresh(); cast(Bf, 'seed', 3); Bf.shield[3] = { absorb: 360, max: 360, left: 20 };
  const hpf = Bf.units[3].hp; Bf.dealDamage(3, 300, 'test');
  check('C8 보호막 전량 흡수 시 미발동/충전 불소모',
    Bf.units[3].hp === hpf && Bf.seed[3].charges === 3 && evCount(Bf, 'seedProc') === 0);

  // 부분 흡수 후 HP 피해 → 1회 발동
  const Bp = fresh(); cast(Bp, 'seed', 3); Bp.shield[3] = { absorb: 50, max: 50, left: 20 };
  Bp.dealDamage(3, 100, 'test');
  check('C9 부분 흡수 후 HP 피해 시 1회 발동', Bp.seed[3].charges === 2 && evCount(Bp, 'seedProc') === 1);

  // 서약 감소 후 HP 피해 → 1회 발동
  const Bv = fresh(); cast(Bv, 'vow', 3); Bv.cd = {}; cast(Bv, 'seed', 3);
  Bv.dealDamage(3, 100, 'test');
  check('C10 서약 감소 후 HP 피해 시 1회 발동', Bv.seed[3].charges === 2 && evCount(Bv, 'seedProc') === 1);

  // 한 피해 사건에서 중복 발동 없음(= 사건당 charge 정확히 1 · 재귀 없음)
  const Bd = fresh(); cast(Bd, 'seed', 3); Bd.dealDamage(3, 100, 'test');
  check('C11 한 사건 1회만(중복/재귀 없음)', evCount(Bd, 'seedProc') === 1 && Bd.seed[3].charges === 2);

  // 3회 후 제거
  const B3 = fresh(); cast(B3, 'seed', 3);
  B3.dealDamage(3, 100, 'test'); B3.dealDamage(3, 100, 'test'); B3.dealDamage(3, 100, 'test');
  check('C12 3회 후 상태 제거 + seedFade', !B3.seed[3] && evCount(B3, 'seedProc') === 3 && evCount(B3, 'seedFade') === 1);
  const beforeHp = B3.units[3].hp; B3.dealDamage(3, 100, 'test');
  check('C12b 제거 후 추가 발동 없음', (beforeHp - B3.units[3].hp) === 100 && evCount(B3, 'seedProc') === 3);

  // 15초 만료(충전 남아도 제거)
  const Be = fresh(); quietBoss(Be); cast(Be, 'seed', 3);
  for (let i = 0; i < 320 && Be.seed[3]; i++) Be.step(0.05);   // 15.0s + 여유
  check('C13 15초 만료(충전 남아도 제거)', !Be.seed[3] && evCount(Be, 'seedProc') === 0 && evCount(Be, 'seedFade') === 1);

  // 치명 피해 시 부활 없음
  const Bk = fresh(); cast(Bk, 'seed', 3); Bk.dealDamage(3, 900, 'test');
  check('C14 치명 피해 시 부활 안 함(발동 X)',
    Bk.units[3].alive === false && Bk.units[3].hp === 0 && evCount(Bk, 'seedProc') === 0 && !Bk.seed[3]);

  // 기존 HoT와 동시 존재
  const Bho = fresh(); cast(Bho, 'hot', 3); Bho.cd = {}; cast(Bho, 'seed', 3);
  check('C15 기존 HoT와 동시 존재', !!Bho.hot[3] && !!Bho.seed[3]);

  // 과치유 기존 규칙(near-full 대상 seed 발동 → overheal 누적)
  const Boh = fresh(); cast(Boh, 'seed', 3); const oh0 = Boh.m.overheal;
  Boh.dealDamage(3, 5, 'test');   // 5 피해 → seed 90 치유(need 5) → overheal 85
  check('C16 과치유 기존 규칙 재사용', (Boh.m.overheal - oh0) === (TUNING.skills.seed.healPerHit - 5));
})();

// ══════════════════════════════════════════════════════════════
// D. 회귀 / 격리
// ══════════════════════════════════════════════════════════════
(() => {
  function runIdle(loadout) {
    const B = new Battle(DEFAULT_PARTY, loadout);
    while (!B.result && B.t < 400) B.step(0.05);
    return B;
  }
  // 기본 6 loadout 결정론 불변(같은 입력 → 같은 결과)
  const a = runIdle(DEFAULT_LOADOUT), b = runIdle(DEFAULT_LOADOUT);
  check('D1 기본 loadout 결정론 일치', JSON.stringify(a.result.report) === JSON.stringify(b.result.report));

  // 기본 loadout 전투에 신규 상태/이벤트 0 (격리 증명)
  const vowSeedEvents = ['vowOn', 'vowFade', 'seedOn', 'seedProc', 'seedFade'];
  const stray = a.events.filter(e => vowSeedEvents.includes(e.type)).length;
  check('D2 기본 loadout에 vow/seed 이벤트 0', stray === 0);
  check('D3 기본 loadout에 vow/seed 상태 0', Object.keys(a.vow).length === 0 && Object.keys(a.seed).length === 0);

  // 신규 필드가 항상 존재(무해한 빈 기본값)
  const fresh0 = new Battle(DEFAULT_PARTY, DEFAULT_LOADOUT);
  check('D4 신규 상태 필드 기본 = 빈 객체',
    typeof fresh0.vow === 'object' && typeof fresh0.seed === 'object' &&
    Object.keys(fresh0.vow).length === 0 && Object.keys(fresh0.seed).length === 0);
})();

console.log(`\n=== battle core skill extension: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
