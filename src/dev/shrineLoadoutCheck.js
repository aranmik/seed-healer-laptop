// Seed Healer — dev/shrineLoadoutCheck.js (Shrine Skill Loadout Runtime 01)
// 성소 세션 loadout 계약 검증: node src/dev/shrineLoadoutCheck.js
// 대상: src/data/skillPool.js 순수 helper(+ swapLoadout) · tuning.DEFAULT_LOADOUT(제품 전투 정본 대조).
// ★index.html의 세션 로직(currentLoadout/swapPick/swap/reset/facility 이동)을 SessionModel로 미러링 —
//   순수 로직·지속 불변식을 헤드리스 검증. 실제 DOM/화면 유지는 브라우저 검증에서 확인.

import {
  DEFAULT_LOADOUT_IDS, DORMANT_SKILL_IDS,
  createDefaultLoadout, getUnequippedSkills, swapLoadout, validateLoadout, getSkillById
} from '../data/skillPool.js';
import { DEFAULT_LOADOUT } from '../data/tuning.js';

let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}
const EXISTING6 = ['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'ring'];

// ── index.html 세션 상태 미러 (같은 로직) ──
function makeSession() {
  let currentLoadout = createDefaultLoadout();
  let swapPick = null;
  return {
    get loadout() { return currentLoadout.slice(); },
    get pick() { return swapPick; },
    pickSkill(id) { swapPick = (swapPick === id) ? null : id; },     // 미장착 탭 = 선택/취소 토글
    tapEquipped() { swapPick = null; },                             // 장착 카드 탭 = 제거 안 함·선택 해제
    chooseSlot(i) { if (!swapPick) return false; const r = swapLoadout(currentLoadout, swapPick, i); if (r.ok) currentLoadout = r.loadout; swapPick = null; return r.ok; },
    reset() { currentLoadout = createDefaultLoadout(); swapPick = null; },
    enterFacility(name) { if (name !== 'chapel') swapPick = null; }  // 마을/보스/시설 이동 = currentLoadout 절대 불변
  };
}

// ── 초기 상태 ──
const s0 = makeSession();
check('초기 currentLoadout = DEFAULT_LOADOUT_IDS', JSON.stringify(s0.loadout) === JSON.stringify(DEFAULT_LOADOUT_IDS));
check('초기 = 정확히 6개', s0.loadout.length === 6);
check('초기 중복 없음', new Set(s0.loadout).size === 6);
check('초기 breath 없음', !s0.loadout.includes('breath'));
check('초기 유효(validateLoadout ok)', validateLoadout(s0.loadout).ok === true);
check('미장착 3종 = vow/seed/grace (Final Readability 01 — 은총 추가)', JSON.stringify(getUnequippedSkills(s0.loadout).map(x => x.id)) === JSON.stringify(['vow', 'seed', 'grace']));

// ── vow 교체 (슬롯 5 = ring 자리) ──
const s1 = makeSession(); s1.pickSkill('vow');
check('vow 선택 대기 진입', s1.pick === 'vow');
const okV = s1.chooseSlot(5);
check('vow를 슬롯과 교체 가능', okV === true && s1.loadout.includes('vow'));
check('교체 후 정확히 6개', s1.loadout.length === 6 && new Set(s1.loadout).size === 6);
check('빠진 스킬(ring)이 미장착 풀로 복귀', getUnequippedSkills(s1.loadout).some(x => x.id === 'ring') && !s1.loadout.includes('ring'));
check('교체 후 선택 대기 해제', s1.pick === null);

// ── seed 교체 ──
const s2 = makeSession(); s2.pickSkill('seed'); const okS = s2.chooseSlot(0);
check('seed를 슬롯과 교체 가능', okS === true && s2.loadout.includes('seed') && s2.loadout.length === 6);

// ── 방어: 중복/빈슬롯/unknown/breath/범위 ──
const base = createDefaultLoadout();
check('중복 장착 불가(이미 장착된 skill swap 거부)', swapLoadout(base, 'shield', 0).ok === false);
check('빈 슬롯 발생 불가(swap은 길이 6 유지)', swapLoadout(base, 'vow', 3).loadout.length === 6);
check('unknown skill 불가', swapLoadout(base, 'nova', 2).ok === false);
check('breath 장착 불가', swapLoadout(base, 'breath', 2).ok === false && DORMANT_SKILL_IDS.includes('breath'));
check('슬롯 범위 밖 거부', swapLoadout(base, 'vow', 6).ok === false && swapLoadout(base, 'vow', -1).ok === false);
check('swapLoadout 입력 불변(원본 비변형)',
  (() => { const b = createDefaultLoadout(); const snap = JSON.stringify(b); swapLoadout(b, 'vow', 0); return JSON.stringify(b) === snap; })());

// ── reset ──
const s3 = makeSession(); s3.pickSkill('vow'); s3.chooseSlot(2); s3.reset();
check('reset 시 기본 6종 복원', JSON.stringify(s3.loadout) === JSON.stringify(DEFAULT_LOADOUT_IDS) && s3.pick === null);

// ── 선택 취소 ──
const s4 = makeSession(); s4.pickSkill('vow'); s4.pickSkill('vow');
check('선택 취소(같은 스킬 재탭) 정상', s4.pick === null && JSON.stringify(s4.loadout) === JSON.stringify(DEFAULT_LOADOUT_IDS));
const s4b = makeSession(); s4b.pickSkill('seed'); s4b.tapEquipped();
check('장착 카드 탭 = 제거 없음·선택 해제', s4b.pick === null && s4b.loadout.length === 6);

// ── 지속: 시설/보스 이동에도 currentLoadout 유지(불변식) ──
const s5 = makeSession(); s5.pickSkill('vow'); s5.chooseSlot(1); const after = s5.loadout;
s5.enterFacility('village'); s5.enterFacility('board'); s5.enterFacility('chapel');
check('시설/보스 이동 후 loadout 유지', JSON.stringify(s5.loadout) === JSON.stringify(after));
check('시설 이탈 시 선택 대기만 해제(loadout 무변)',
  (() => { const s = makeSession(); s.pickSkill('vow'); s.enterFacility('village'); return s.pick === null && JSON.stringify(s.loadout) === JSON.stringify(DEFAULT_LOADOUT_IDS); })());
check('성소 재진입 시 세션 loadout 유지', (() => { const s = makeSession(); s.pickSkill('seed'); s.chooseSlot(4); const l = s.loadout; s.enterFacility('chapel'); return JSON.stringify(s.loadout) === JSON.stringify(l); })());

// ── 새로고침 = 기본 복귀 (새 세션) ──
check('새로고침 시 기본 구성 복귀', JSON.stringify(makeSession().loadout) === JSON.stringify(DEFAULT_LOADOUT_IDS));

// ── Battle Loadout Link 01: currentLoadout이 전투 정본으로 승격 · DEFAULT_LOADOUT은 invalid 시 안전 fallback ──
check('전투 fallback 정본(tuning.DEFAULT_LOADOUT) = 기존 6종',
  JSON.stringify(DEFAULT_LOADOUT) === JSON.stringify(EXISTING6));
check('snapshot 복사 계약: createDefaultLoadout = 별개 배열 인스턴스(원본 비공유)',
  createDefaultLoadout() !== DEFAULT_LOADOUT && JSON.stringify(createDefaultLoadout()) === JSON.stringify(DEFAULT_LOADOUT));

// ── 아이콘 폴백 계약(성소·향후 스킬바 공용): 기존6=iconAssetKey 존재 · vow/seed=iconChar ──
check('기존 6종 iconAssetKey 존재(연결 PNG)', EXISTING6.every(id => !!getSkillById(id).iconAssetKey));
check('vow/seed iconAssetKey null + iconChar 폴백(🕊️/🌱)',
  getSkillById('vow').iconAssetKey === null && getSkillById('vow').iconChar === '🕊️' &&
  getSkillById('seed').iconAssetKey === null && getSkillById('seed').iconChar === '🌱');

console.log(`\n=== shrine loadout: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
