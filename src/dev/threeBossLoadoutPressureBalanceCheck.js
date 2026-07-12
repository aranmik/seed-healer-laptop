// Seed Healer — dev/threeBossLoadoutPressureBalanceCheck.js (Three Boss Loadout Pressure Balance 01)
// 검증: node src/dev/threeBossLoadoutPressureBalanceCheck.js
// ★canonical(tuning.js/botSim) 동결 + 제품 Demo v1 override(bossProbes DEMO_V1_*·index.html newBattle 주입) 정합.
//   승인 변경만: 씨앗 cost 9(제품) · water tremorDmg 132 · golem 진동 19/24(제품). tuning.js/naga 전수치 동결.

import { Battle } from '../core/battle.js';
import { TUNING, DEFAULT_PARTY } from '../data/tuning.js';
import { BOSS_PROBES, DEMO_V1_SKILL_TUNING, DEMO_V1_BOSS_OVERRIDE } from '../data/bossProbes.js';
import { getSkillById, validateLoadout } from '../data/skillPool.js';

let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}
const slotOf = (b, sid) => b.loadout.indexOf(sid);

// ══ A. 씨앗 마나(제품 9 / canonical 12 동결) ══
check('A1 canonical TUNING.skills.seed.cost = 12 동결', TUNING.skills.seed.cost === 12);
check('A2 제품 override DEMO_V1_SKILL_TUNING.seed.cost = 9', DEMO_V1_SKILL_TUNING && DEMO_V1_SKILL_TUNING.seed.cost === 9);
check('A3 skillPool 제품 메타 seed.mana = 9', getSkillById('seed').mana === 9);
check('A4 씨앗 나머지 수치 불변(heal90/charges3/dur15/cd6·proc는 코어)',
  TUNING.skills.seed.healPerHit === 90 && TUNING.skills.seed.charges === 3 && TUNING.skills.seed.dur === 15 && TUNING.skills.seed.cd === 6);
// 런타임: 제품 Battle(override) seed 9 소모 · canonical Battle seed 12 소모
(() => {
  const lo = ['quickheal', 'shield', 'seed', 'salvation', 'hot', 'ring'];
  const prod = new Battle(DEFAULT_PARTY, lo, { tuning: { skills: DEMO_V1_SKILL_TUNING } });
  prod.gcd = 0; prod.select(2); const m0 = prod.mana; prod.use(slotOf(prod, 'seed'));
  check('A5 제품 Battle 실제 seed 소모 9', (m0 - prod.mana) === 9, `${m0 - prod.mana}`);
  const can = new Battle(DEFAULT_PARTY, lo, {});
  can.gcd = 0; can.select(2); const c0 = can.mana; can.use(slotOf(can, 'seed'));
  check('A6 canonical Battle(override 없음) seed 소모 12(baseline 보존)', (c0 - can.mana) === 12, `${c0 - can.mana}`);
})();

// ══ B. Water 압박(tremorDmg 132 또는 롤백 126) ══
const w = BOSS_PROBES.water.boss;
check('B1 water tremorDmg = 132 (또는 롤백 126)', w.tremorDmg === 132 || w.tremorDmg === 126, String(w.tremorDmg));
check('B2 water 나머지 불변(hp8800·tremorInt11.5·smash 비활성·rootDps52)',
  w.hp === 8800 && w.tremorInt === 11.5 && w.smashInt >= 9999 && w.rootDps === 52);

// ══ C. Golem 제품 override(19/24) + canonical(25/28) 동결 ══
check('C1 canonical TUNING.boss(golem) tremorFirst25/tremorInt28 동결', TUNING.boss.tremorFirst === 25 && TUNING.boss.tremorInt === 28);
check('C2 canonical TUNING.boss hp 9600 동결', TUNING.boss.hp === 9600);
check('C3 제품 override DEMO_V1_BOSS_OVERRIDE.golem = 19/24 (또는 완화 21/26)',
  DEMO_V1_BOSS_OVERRIDE.golem && ((DEMO_V1_BOSS_OVERRIDE.golem.tremorFirst === 19 && DEMO_V1_BOSS_OVERRIDE.golem.tremorInt === 24) ||
    (DEMO_V1_BOSS_OVERRIDE.golem.tremorFirst === 21 && DEMO_V1_BOSS_OVERRIDE.golem.tremorInt === 26)));
check('C4 golem override는 부분(진동만)·smash/hp/root 미포함(TUNING 상속)',
  !('hp' in DEMO_V1_BOSS_OVERRIDE.golem) && !('smashDmg' in DEMO_V1_BOSS_OVERRIDE.golem) && !('rootDps' in DEMO_V1_BOSS_OVERRIDE.golem));
// 런타임: canonical golem Battle(botSim 경로) = 25/28·9600 · 제품 golem Battle(override) = 19/24
(() => {
  const D6 = ['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'ring'];
  const can = new Battle(DEFAULT_PARTY, D6, {});   // botSim/canonical 경로
  check('C5 canonical golem Battle = 25/28·hp9600 (botSim baseline)', can.T.boss.tremorFirst === 25 && can.T.boss.tremorInt === 28 && can.boss.max === 9600);
  const prod = new Battle(DEFAULT_PARTY, D6, { tuning: { skills: DEMO_V1_SKILL_TUNING, boss: DEMO_V1_BOSS_OVERRIDE.golem } });
  check('C6 제품 golem Battle = 19/24 · hp9600(상속·강타720 불변)', prod.T.boss.tremorFirst === 19 && prod.T.boss.tremorInt === 24 && prod.boss.max === 9600 && prod.T.boss.smashDmg === 720);
})();

// ══ D. Naga 전수치 동결 ══
const n = BOSS_PROBES.naga.boss;
check('D1 naga 전수치 동결(hp8400·smash850/17·tremor215/28·root32·auto235/5.5)',
  n.hp === 8400 && n.smashDmg === 850 && n.smashInt === 17 && n.tremorDmg === 215 && n.tremorInt === 28 && n.rootDps === 32 && n.autoDmg === 235 && n.autoInt === 5.5);
check('D2 golem override가 water/naga config에 잔류 없음', !('tremorFirst' in n) || (n.tremorFirst !== 19));

// ══ E. Loadout 3구성 유효(default/matched/low-fit) ══
const SETS = {
  golem: [['quickheal','shield','cleanse','salvation','hot','ring'], ['quickheal','shield','vow','cleanse','salvation','hot'], ['quickheal','cleanse','salvation','hot','ring','seed']],
  water: [['quickheal','shield','cleanse','salvation','hot','ring'], ['quickheal','hot','ring','cleanse','seed','salvation'], ['quickheal','shield','vow','cleanse','salvation','hot']],
  naga:  [['quickheal','shield','cleanse','salvation','hot','ring'], ['quickheal','shield','vow','salvation','seed','hot'], ['quickheal','cleanse','hot','ring','salvation','seed']]
};
let allValid = true, noBreath = true;
for (const b of ['golem','water','naga']) for (const lo of SETS[b]) {
  if (!validateLoadout(lo).ok) allValid = false;
  if (lo.includes('breath')) noBreath = false;
  if (new Set(lo).size !== 6) allValid = false;
}
check('E1 3보스 default/matched/low-fit 전부 유효(6·중복0·unknown0)', allValid);
check('E2 어떤 구성도 breath 미포함', noBreath);

// ══ F. Guardian Vow 동결(이번 카드 상향/하향 금지) ══
check('F1 vow 동결(mana13·dur8·dmgMul0.6·cd12)',
  TUNING.skills.vow.cost === 13 && TUNING.skills.vow.dur === 8 && TUNING.skills.vow.dmgMul === 0.6 && TUNING.skills.vow.cd === 12
    && getSkillById('vow').mana === 13);

console.log(`\n=== three boss loadout pressure balance: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
