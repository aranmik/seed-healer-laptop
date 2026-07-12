// Seed Healer — dev/skillPoolContractCheck.js (Priest Skill Pool 8 & Loadout 6 Data Contract 01)
// 순수 데이터 계약 검증: node src/dev/skillPoolContractCheck.js
// 대상: src/data/skillPool.js (+ tuning.js 대조 — 기존 6종 스냅샷이 정본과 어긋나면 FAIL)
// DOM/타이머 접근 0 · 제품 Runtime 무접촉.

import {
  SKILL_POOL, DEFAULT_LOADOUT_IDS, LOADOUT_SIZE, DORMANT_SKILL_IDS,
  getSkillById, isDemoV1Skill, getEquippableSkills, getUnequippedSkills,
  createDefaultLoadout, validateLoadout
} from '../data/skillPool.js';
import { TUNING, DEFAULT_LOADOUT, ALL_SKILLS } from '../data/tuning.js';
import { DEMO_V1_SKILL_TUNING } from '../data/bossProbes.js';   // Final Battle Readability 01 — grace(제품 override) 대조용

let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}

const ids = SKILL_POOL.map(s => s.id);
const EXISTING6 = ['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'ring'];
const NEW2 = ['vow', 'seed'];

// ── catalog 구조 (Final Battle Readability 01 — grace 추가로 8→9종) ────────
check('catalog 총 9종(grace 추가)', SKILL_POOL.length === 9, String(SKILL_POOL.length));
check('catalog ID 중복 없음', new Set(ids).size === ids.length, ids.join(','));
check('demoV1Enabled 9종 전부', SKILL_POOL.every(s => s.demoV1Enabled === true));
check('uiOrder = 1~9 중복/누락 없음',
  JSON.stringify(SKILL_POOL.map(s => s.uiOrder).slice().sort((a, b) => a - b)) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9]));
check('필수 필드 전원 보유', SKILL_POOL.every(s =>
  ['id', 'name', 'shortName', 'iconChar', 'type', 'castType', 'targetType', 'description', 'shortDescription',
   'tuningKey', 'implementationNote'].every(k => typeof s[k] === 'string' && s[k].length > 0) &&
  Array.isArray(s.roleTags) && s.roleTags.length > 0 &&
  typeof s.mana === 'number' && typeof s.cooldown === 'number' && typeof s.castTime === 'number' &&
  typeof s.duration === 'number' && typeof s.implemented === 'boolean' &&
  typeof s.demoV1Enabled === 'boolean' && typeof s.defaultEquipped === 'boolean' &&
  typeof s.uiOrder === 'number' && s.effect && typeof s.effect === 'object'));

// ── 구현 상태 구분 ────────────────────────────────────────────
check('기존 6종 implemented:true + currentRuntimeId=id',
  EXISTING6.every(id => { const s = getSkillById(id); return s && s.implemented === true && s.currentRuntimeId === id; }));
check('신규 2종(vow/seed) implemented:true + currentRuntimeId=id (Battle Core Skill Extension 01 반영)',
  NEW2.every(id => { const s = getSkillById(id); return s && s.implemented === true && s.currentRuntimeId === id; }));
check('신규 2종 effect.draft 표기(수치 초안 — 구현됐어도 밸런스는 draft)', NEW2.every(id => getSkillById(id).effect.draft === true));
check('신규 2종 iconAssetKey:null(이미지 리소스 없음)', NEW2.every(id => getSkillById(id).iconAssetKey === null));

// ── breath dormant ────────────────────────────────────────────
check('breath는 catalog에 없음', !getSkillById('breath'));
check('breath는 dormant 목록에 있음', DORMANT_SKILL_IDS.includes('breath'));
check('breath 구현은 tuning.js에 보존됨(무접촉 확인)',
  TUNING.skills.breath && TUNING.skills.breath.type === 'passive' && ALL_SKILLS.includes('breath'));

// ── 기존 6종 ↔ tuning.js 정본 대조 (스냅샷 어긋나면 FAIL) ──────
const tuneMatch = EXISTING6.every(id => {
  const s = getSkillById(id), t = TUNING.skills[id];
  if (!s || !t) return false;
  const manaOk = s.mana === t.cost;
  const cdOk = s.cooldown === (t.cd || 0);
  const castOk = s.castTime === (t.type === 'cast' ? t.cast : 0);
  const castTypeOk = s.castType === t.type;
  return manaOk && cdOk && castOk && castTypeOk;
});
check('기존 6종 mana/cd/castTime/castType = TUNING.skills 일치', tuneMatch);
check('신규 vow mana/cd/castTime/castType = TUNING.skills 일치',
  (() => { const s = getSkillById('vow'), t = TUNING.skills.vow;
    return s.mana === t.cost && s.cooldown === (t.cd || 0) && s.castTime === 0 && s.castType === t.type; })());
// ★Balance 01: 씨앗 마나는 제품 override(9)로 조정 — skillPool(제품 메타)=9, canonical TUNING.cost=12는 동결(botSim/coreExtension baseline 보존).
check('신규 seed: skillPool 제품 마나 9 · canonical TUNING.skills.seed.cost 12 동결 · cd/castType TUNING 일치',
  getSkillById('seed').mana === 9 && TUNING.skills.seed.cost === 12
    && getSkillById('seed').cooldown === (TUNING.skills.seed.cd || 0) && getSkillById('seed').castTime === 0 && getSkillById('seed').castType === TUNING.skills.seed.type);
check('신규 2종 효과 스냅샷 = TUNING 일치 (vow.dmgMul·seed.healPerHit/charges·dur)',
  getSkillById('vow').effect.damageTakenMul === TUNING.skills.vow.dmgMul &&
  getSkillById('vow').duration === TUNING.skills.vow.dur &&
  getSkillById('seed').effect.healPerHit === TUNING.skills.seed.healPerHit &&
  getSkillById('seed').effect.charges === TUNING.skills.seed.charges &&
  getSkillById('seed').duration === TUNING.skills.seed.dur);
check('효과 수치 스냅샷 = TUNING 일치',
  getSkillById('quickheal').effect.heal === TUNING.skills.quickheal.heal &&
  getSkillById('shield').effect.absorb === TUNING.skills.shield.absorb &&
  getSkillById('shield').duration === TUNING.skills.shield.dur &&
  getSkillById('salvation').effect.healPctMissing === TUNING.skills.salvation.healPctMissing &&
  getSkillById('salvation').effect.healFlat === TUNING.skills.salvation.healFlat &&
  getSkillById('hot').effect.hps === TUNING.skills.hot.hps &&
  getSkillById('hot').duration === TUNING.skills.hot.dur &&
  getSkillById('ring').effect.healAll === TUNING.skills.ring.healAll);

// ── 기본 loadout ──────────────────────────────────────────────
check('default loadout 정확히 6종', DEFAULT_LOADOUT_IDS.length === LOADOUT_SIZE);
check('default loadout = 기존 6종(Demo v0 순서 그대로)',
  JSON.stringify(DEFAULT_LOADOUT_IDS) === JSON.stringify(EXISTING6));
check('default loadout = tuning.js DEFAULT_LOADOUT과 동일',
  JSON.stringify(DEFAULT_LOADOUT_IDS) === JSON.stringify(DEFAULT_LOADOUT));
check('defaultEquipped 플래그 = default loadout과 일치',
  SKILL_POOL.every(s => s.defaultEquipped === DEFAULT_LOADOUT_IDS.includes(s.id)));
check('createDefaultLoadout = 사본 반환(원본 비오염)',
  (() => { const a = createDefaultLoadout(); a.push('x'); return DEFAULT_LOADOUT_IDS.length === 6 && JSON.stringify(createDefaultLoadout()) === JSON.stringify(EXISTING6); })());

// ── validateLoadout ───────────────────────────────────────────
check('기본 6종 loadout 통과', validateLoadout(createDefaultLoadout()).ok === true);
check('신규 2종 포함 loadout도 통과(catalog상 장착 후보)',
  validateLoadout(['quickheal', 'shield', 'vow', 'seed', 'hot', 'ring']).ok === true);
check('중복 loadout 거부', validateLoadout(['quickheal', 'quickheal', 'cleanse', 'salvation', 'hot', 'ring']).ok === false);
check('5개 거부', validateLoadout(['quickheal', 'shield', 'cleanse', 'salvation', 'hot']).ok === false);
check('7개 거부', validateLoadout(['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'ring', 'vow']).ok === false);
check('unknown ID 거부', validateLoadout(['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'nova']).ok === false);
check('breath 거부', validateLoadout(['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'breath']).ok === false);
check('비배열 거부', validateLoadout(null).ok === false && validateLoadout('quickheal').ok === false);

// ── helper ────────────────────────────────────────────────────
check('getSkillById: 존재/부재', getSkillById('vow') !== null && getSkillById('nova') === null);
check('isDemoV1Skill: 8종 true · breath/unknown false',
  ids.every(isDemoV1Skill) && !isDemoV1Skill('breath') && !isDemoV1Skill('nova'));
check('getEquippableSkills = 9종 uiOrder 순',
  (() => { const e = getEquippableSkills(); return e.length === 9 && e.every((s, i) => s.uiOrder === i + 1); })());
check('getUnequippedSkills(기본 loadout) = 미장착 3종(vow/seed/grace)',
  JSON.stringify(getUnequippedSkills(createDefaultLoadout()).map(s => s.id)) === JSON.stringify(['vow', 'seed', 'grace']));

// ── grace(은총의 순간) — 제품 override 스킬(canonical tuning.js 미포함) ──
(() => {
  const g = getSkillById('grace');
  const gt = DEMO_V1_SKILL_TUNING.grace;
  check('grace catalog 존재 · implemented · self · instant · defaultEquipped false',
    !!g && g.implemented === true && g.targetType === 'self' && g.castType === 'instant' && g.defaultEquipped === false);
  check('grace mana 0 · canonical tuning.js 미포함(제품 override 전용)',
    g.mana === 0 && !TUNING.skills.grace);
  check('grace 메타 = 제품 override(DEMO_V1_SKILL_TUNING.grace) 일치',
    !!gt && g.mana === gt.cost && g.cooldown === gt.cd && g.duration === gt.dur && gt.type === 'instant');
  check('grace loadout 장착 가능(6슬롯 중 1)',
    validateLoadout(['quickheal', 'shield', 'grace', 'salvation', 'hot', 'ring']).ok === true);
})();
check('validateLoadout 입력 불변(순서 보존·비변형)',
  (() => { const a = ['ring', 'hot', 'salvation', 'cleanse', 'shield', 'quickheal']; const r = validateLoadout(a);
           return r.ok === true && JSON.stringify(a) === JSON.stringify(['ring', 'hot', 'salvation', 'cleanse', 'shield', 'quickheal']); })());

console.log(`\n=== skillPool contract: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
