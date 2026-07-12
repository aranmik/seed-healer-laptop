// Seed Healer — data/skillPool.js (Priest Skill Pool 8 & Loadout 6 Data Contract 01)
// Demo v1 사제 스킬 8종의 단일 catalog + 기본 loadout 6 + 순수 helper.
// 근거 문서: docs/PRIEST_SKILL_POOL_8_LOADOUT_6_DATA_CONTRACT_01.md
//           docs/BOSS_SKILL_ANSWER_MATRIX_01.md (FINAL PASS · 신규 2종 수치 초안 출처)
//           docs/DEMO_V1_SCOPE_LOCK_01.md (8종 풀·6슬롯·해금/강화 없음)
//
// 규율(깨지면 실패):
//   순수 데이터 + 순수 함수만. DOM/타이머/이미지/전투 상태 접근 0 · import 부작용 0.
//   이 카드에서는 어떤 제품 Runtime도 이 파일을 소비하지 않는다(미연결 계약 단계).
//   기존 6스킬의 수치/ID는 tuning.js(단일 진실 원천)의 "사본 스냅샷" —
//   숫자의 정본은 여전히 TUNING.skills. 대조는 src/dev/skillPoolContractCheck.js가 수행.
//   신규 2종(vow/seed) 수치는 Matrix §2 초안 — Balance Pass(Card 10) 게이트 전까지 draft.
//
// breath(깊은 호흡) 처지(유키PD 확정):
//   삭제 금지 · 기존 구현 보존(battle.js/tuning.js 무접촉) · Demo v1 풀 8종에서 제외 ·
//   UI/성소/장착 목록 비노출 · dormant 확장 씨앗. → catalog에 없고 loadout에서 명시 거부.

// ── Demo v1 사제 스킬 catalog (정확히 8종) ─────────────────────────
// 필드 계약:
//   id               catalog ID (기존 6종 = 현행 Runtime sid와 동일 · 신규 2종 = Card 4에서 쓸 예약 sid)
//   name/shortName   전체 이름 / UI 짧은 이름(index.html skName 사전과 동일)
//   iconChar         현재 표시 문자(이모지 폴백 — assets.js EMOJI.skills와 동일 · 신규 2종은 placeholder)
//   iconAssetKey     assets.js ASSETS.icons 키(신규 2종 = null → 이미지 리소스 없음·이모지 폴백 예정)
//   type             'active' | 'passive' (현행 풀 8종은 전부 active)
//   castType         현행 Runtime의 type 표기: 'cast' | 'instant' (신규 2종 = 'instant' 예정)
//   targetType       'ally' | 'self' | 'party' | 'conditional'
//   roleTags         역할 태그(성소 UI 분류/설명용)
//   description/shortDescription  설명(긴/짧은)
//   mana/cooldown/castTime        마나 / 재사용(초·0=없음) / 시전(초·0=즉시)
//   duration         지속 효과 시간(초·0=즉발)
//   effect           효과 수치 스냅샷(정본: 기존 6종=TUNING.skills · 신규 2종=본 계약 draft)
//   implemented      battle.js에 실제 전투 로직 존재 여부 (신규 2종 = false·Card 4 전까지)
//   demoV1Enabled    Demo v1 풀 포함 여부(8종 전부 true · breath는 catalog 밖)
//   defaultEquipped  기본 loadout 6 포함 여부
//   uiOrder          성소/목록 표시 순서(1~8 · 기존 6종 = 현행 스킬바 슬롯 순서와 동일)
//   currentRuntimeId 현행 battle.js/tuning.js에서 실제로 쓰는 sid (신규 2종 = null = 미구현)
//   tuningKey        수치 정본 위치(기존) / 예상 위치(신규 · Card 4에서 추가 예정)
//   implementationNote  구현 상태/주의
export const SKILL_POOL = [
  {
    id: 'quickheal', name: '빠른 치유', shortName: '빠른치유',
    iconChar: '✚', iconAssetKey: 'quickHeal',
    type: 'active', castType: 'cast', targetType: 'ally',
    roleTags: ['direct-heal', 'single-target', 'core'],
    description: '1.2초 시전 후 대상 아군의 HP를 400 회복한다. 회복 처리량의 기준 스킬.',
    shortDescription: '빠른 단일 회복',
    mana: 10, cooldown: 0, castTime: 1.2, duration: 0,
    effect: { heal: 400 },
    implemented: true, demoV1Enabled: true, defaultEquipped: true, uiOrder: 1,
    currentRuntimeId: 'quickheal', tuningKey: 'TUNING.skills.quickheal',
    implementationNote: 'battle.js use()→cast 대기→_resolve quickheal 분기. 마나는 시전 완료 시 소비(취소=시간 손실만).'
  },
  {
    id: 'shield', name: '보호막', shortName: '보호막',
    iconChar: '🛡', iconAssetKey: 'shield',
    type: 'active', castType: 'instant', targetType: 'ally',
    roleTags: ['shield', 'preventive', 'single-target'],
    description: '대상 아군에게 20초 동안 피해 360을 흡수하는 보호막을 씌운다. 유지 중인 대상에는 재적용 불가.',
    shortDescription: '선제 피해 흡수',
    mana: 12, cooldown: 0, castTime: 0, duration: 20,
    effect: { absorb: 360, reapplyLock: true },
    implemented: true, demoV1Enabled: true, defaultEquipped: true, uiOrder: 2,
    currentRuntimeId: 'shield', tuningKey: 'TUNING.skills.shield',
    implementationNote: 'battle.js _resolve shield 분기 + use() 동일 대상 재적용 잠금(lock) 가드 + dealDamage 흡수 처리 + step 시간 만료.'
  },
  {
    id: 'cleanse', name: '정화', shortName: '정화',
    iconChar: '💧', iconAssetKey: 'cleanse',
    type: 'active', castType: 'instant', targetType: 'conditional',
    roleTags: ['cleanse', 'single-target'],
    description: '대상 아군의 치명 디버프(속박 등)를 즉시 제거한다. 제거할 디버프가 있을 때만 시전 가능.',
    shortDescription: '치명 디버프 제거',
    mana: 7, cooldown: 2, castTime: 0, duration: 0,
    effect: { removesDebuff: true },
    implemented: true, demoV1Enabled: true, defaultEquipped: true, uiOrder: 3,
    currentRuntimeId: 'cleanse', tuningKey: 'TUNING.skills.cleanse',
    implementationNote: 'battle.js _resolve cleanse 분기 + use() "제거할 디버프가 없습니다" 조건 가드(root 상태 필요). ★FX 식별력 약함 — 후속 FX Polish 대상.'
  },
  {
    id: 'salvation', name: '구원의 기도', shortName: '구원',
    iconChar: '🕯️', iconAssetKey: 'salvation',
    type: 'active', castType: 'instant', targetType: 'self',
    roleTags: ['direct-heal', 'emergency', 'self-only'],
    description: '사제 자신을 즉시 회복한다(결손 HP의 75% + 100). 사제 전용 — Demo v1에서 아군 대상 확장 없음.',
    shortDescription: '사제 자신 긴급 회복',
    mana: 16, cooldown: 18, castTime: 0, duration: 0,
    effect: { healPctMissing: 0.75, healFlat: 100, selfOnly: true },
    implemented: true, demoV1Enabled: true, defaultEquipped: true, uiOrder: 4,
    currentRuntimeId: 'salvation', tuningKey: 'TUNING.skills.salvation',
    implementationNote: 'battle.js _resolve salvation 분기 + use() selfOnly→대상 강제 0(사제). selfOnly 유지는 Demo v1 확정.'
  },
  {
    id: 'hot', name: '지속 회복', shortName: '지속',
    iconChar: '🌿', iconAssetKey: 'renew',
    type: 'active', castType: 'instant', targetType: 'ally',
    roleTags: ['hot', 'single-target'],
    description: '대상 아군을 12초 동안 초당 40씩 회복시킨다. 시간 기반 일정 회복(맞든 안 맞든).',
    shortDescription: '시간에 걸친 회복',
    mana: 11, cooldown: 0, castTime: 0, duration: 12,
    effect: { hps: 40 },
    implemented: true, demoV1Enabled: true, defaultEquipped: true, uiOrder: 5,
    currentRuntimeId: 'hot', tuningKey: 'TUNING.skills.hot',
    implementationNote: 'battle.js _resolve hot 분기 + step (3) HoT 틱 처리. 아이콘 키는 renew(명칭 차이·assets.js skillIconKey가 흡수). ★FX 식별력 약함 — 후속 FX Polish 대상.'
  },
  {
    id: 'ring', name: '빛의 고리', shortName: '고리',
    iconChar: '◎', iconAssetKey: 'ring',
    type: 'active', castType: 'instant', targetType: 'party',
    roleTags: ['aoe-heal', 'party'],
    description: '파티 전체(사제 포함)를 즉시 160 회복한다.',
    shortDescription: '즉시 소형 광역 회복',
    mana: 15, cooldown: 6, castTime: 0, duration: 0,
    effect: { healAll: 160 },
    implemented: true, demoV1Enabled: true, defaultEquipped: true, uiOrder: 6,
    currentRuntimeId: 'ring', tuningKey: 'TUNING.skills.ring',
    implementationNote: 'battle.js _resolve ring 분기(생존 전원 heal). FX = 사제 중심 cast-ring outward pulse.'
  },
  {
    id: 'vow', name: '수호의 서약', shortName: '서약',
    iconChar: '🕊️', iconAssetKey: null, iconImg: 'assets/icons/icon_vow.png', // 날개 달린 하트(가호/축복) — Combat Clarity & Exit Polish 01 · iconChar는 폴백
    type: 'active', castType: 'instant', targetType: 'ally',
    roleTags: ['damage-reduction', 'preventive', 'single-target'],
    description: '대상 아군이 8초 동안 받는 피해를 40% 감소시킨다. 보호막(총량 흡수)과 달리 비율 감소 — 큰 한 방일수록 이득.',
    shortDescription: '받는 피해 -40% (8초)',
    mana: 13, cooldown: 12, castTime: 0, duration: 8, // 수치는 draft — Balance Pass(Card 10)에서 조정
    effect: { damageTakenMul: 0.6, draft: true },
    implemented: true, demoV1Enabled: true, defaultEquipped: false, uiOrder: 7,
    currentRuntimeId: 'vow', tuningKey: 'TUNING.skills.vow',
    implementationNote: '★구현됨 — Battle Core Skill Extension 01(Card 4). dealDamage 감소 곱(보호막 흡수 前)+_resolve vow 분기+step 만료+use 재적용 가드. 이벤트 vowOn/vowFade. 제품 UI(성소/스킬바) 미연결 — Card 5/6 예정.'
  },
  {
    id: 'seed', name: '기도 씨앗', shortName: '씨앗',
    iconChar: '🌱', iconAssetKey: null, iconImg: 'assets/icons/icon_seed.png', // 새싹 돋는 씨앗(회복/생명) — Combat Clarity & Exit Polish 01 · iconChar는 폴백
    type: 'active', castType: 'instant', targetType: 'ally',
    roleTags: ['reactive-heal', 'triggered-heal', 'single-target'],
    description: '대상 아군에게 15초 동안 씨앗을 심는다. 피해를 받을 때마다 90 회복(충전 3회·소진 시 제거). 지속(시간 기반)과 달리 실제 피격 시에만 반응.',
    shortDescription: '피격 시 90 회복 ×3 (15초)',
    mana: 9, cooldown: 6, castTime: 0, duration: 15, // Balance 01: 제품 마나 9(canonical TUNING.skills.seed.cost=12는 동결·제품 override로 주입)
    effect: { healPerHit: 90, charges: 3, draft: true },
    implemented: true, demoV1Enabled: true, defaultEquipped: false, uiOrder: 8,
    currentRuntimeId: 'seed', tuningKey: 'TUNING.skills.seed',
    implementationNote: '★구현됨 — Battle Core Skill Extension 01(Card 4). dealDamage 말미 반응 치유(HP 피해 ≥1 사건당 1회·charge 소모·재귀 없음)+_resolve seed 분기+step 15초 만료+use 재적용 가드. 이벤트 seedOn/seedProc/seedFade. 제품 UI 미연결 — Card 5/6 예정.'
  },
  {
    // ── Final Battle Readability & Finish Polish 01 — 신규 전략 스킬(풀 8→9·6슬롯 구조 유지) ──
    //   마나 운영의 전략 손맛: cost 0·긴 쿨(90s)·사용 후 8초 안 "다음 성공한 마나 소모 스킬 1회"를 무료로.
    //   ★수치 정본은 canonical tuning.js가 아니라 제품 override(bossProbes DEMO_V1_SKILL_TUNING.grace) — botSim baseline 무영향.
    id: 'grace', name: '은총의 순간', shortName: '은총',
    // Micro Polish 01 (C) — 🙏 이모지 폴백 → 기존 로컬 아이콘 자산 치환(신규 파일 생성 0·기존 추출본 참조).
    //   icon_breath_candidate(금빛 신성 고리·SET_A 프레임=기존 8종과 결 일치·breath는 dormant라 미사용=충돌 없음). iconChar는 최후 폴백 유지.
    iconChar: '🙏', iconAssetKey: null, iconImg: 'visual_assets/icons/extracted/icon_breath_candidate_v001.png',
    type: 'active', castType: 'instant', targetType: 'self',
    roleTags: ['mana', 'utility', 'preventive'],
    description: '자신에게 은총을 두른다(마나 0·긴 재사용). 이후 8초 안에 쓰는 다음 성공한 기도 1회의 마나 소모가 0이 된다. 마나가 원래 0인 기도와 은총 자신에는 적용되지 않는다.',
    shortDescription: '다음 기도 1회 무료 (8초)',
    mana: 0, cooldown: 90, castTime: 0, duration: 8,
    effect: { nextSkillFree: true, draft: true },
    implemented: true, demoV1Enabled: true, defaultEquipped: false, uiOrder: 9,
    currentRuntimeId: 'grace', tuningKey: 'DEMO_V1_SKILL_TUNING.grace (제품 override — canonical tuning.js 미포함)',
    implementationNote: '★구현됨 — Final Battle Readability & Finish Polish 01. battle.js grace runtime(this.grace 토큰 · use() 유효비용 0 · _resolve grace · step 8초 만료/시전 중 동결). 이벤트 graceOn/graceProc/graceFade. 수치=제품 override(DEMO_V1_SKILL_TUNING.grace)로만 주입(canonical 무접촉).'
  }
];

// 기본 장착 6슬롯 — Demo v0의 현행 스킬바와 동일(tuning.js DEFAULT_LOADOUT과 같은 순서).
export const DEFAULT_LOADOUT_IDS = ['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'ring'];

export const LOADOUT_SIZE = 6;

// dormant 스킬(catalog 밖·장착 금지·구현 보존) — breath 깊은 호흡.
export const DORMANT_SKILL_IDS = ['breath'];

// ── 순수 helper (DOM/전투 상태 접근 0) ─────────────────────────────
export function getSkillById(id) {
  return SKILL_POOL.find(s => s.id === id) || null;
}

export function isDemoV1Skill(id) {
  const s = getSkillById(id);
  return !!(s && s.demoV1Enabled);
}

// 장착 후보 = Demo v1 풀 8종 전부(uiOrder 순).
// ★미구현 2종(vow/seed)도 catalog상 후보에는 포함되지만, 제품 UI/Runtime에는 아직 미연결.
export function getEquippableSkills() {
  return SKILL_POOL.filter(s => s.demoV1Enabled).slice().sort((a, b) => a.uiOrder - b.uiOrder);
}

export function getUnequippedSkills(loadout) {
  const ids = Array.isArray(loadout) ? loadout : [];
  return getEquippableSkills().filter(s => !ids.includes(s.id));
}

export function createDefaultLoadout() {
  return DEFAULT_LOADOUT_IDS.slice();
}

// loadout 검증 — { ok, errors[] } 반환. 순서 보존(정렬/변형 없음)·입력 불변.
// 규칙: 배열 · 정확히 6개 · 중복 없음 · 전원 Demo v1 enabled · breath(dormant) 불가 · unknown ID 불가.
export function validateLoadout(ids) {
  const errors = [];
  if (!Array.isArray(ids)) return { ok: false, errors: ['loadout은 배열이어야 합니다'] };
  if (ids.length !== LOADOUT_SIZE) errors.push('loadout은 정확히 ' + LOADOUT_SIZE + '개여야 합니다 (현재 ' + ids.length + '개)');
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) { errors.push('중복 장착 불가: ' + id); continue; }
    seen.add(id);
    if (DORMANT_SKILL_IDS.includes(id)) { errors.push('dormant 스킬은 장착 불가: ' + id); continue; }
    const s = getSkillById(id);
    if (!s) { errors.push('알 수 없는 스킬 ID: ' + id); continue; }
    if (!s.demoV1Enabled) errors.push('Demo v1 풀 밖의 스킬: ' + id);
  }
  return { ok: errors.length === 0, errors };
}

// 미장착 스킬을 장착 슬롯(slotIndex)과 교체 — 순수 함수(입력 불변·새 배열 반환). (Shrine Skill Loadout Runtime 01)
// tap-to-swap 정본: 슬롯 하나를 새 스킬로 대체 → 항상 정확히 6개 유지(add/remove 아님) · 빈 슬롯 구조적 불가.
// 거부(중복·미장착 불가·범위 밖·검증 실패) 시 원본 loadout 그대로 반환 + { ok:false, error }.
export function swapLoadout(loadout, newSkillId, slotIndex) {
  if (!Array.isArray(loadout)) return { ok: false, loadout, error: 'loadout은 배열이어야 합니다' };
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= loadout.length)
    return { ok: false, loadout, error: '슬롯 범위 밖: ' + slotIndex };
  const s = getSkillById(newSkillId);
  if (!s || !s.demoV1Enabled || DORMANT_SKILL_IDS.includes(newSkillId))
    return { ok: false, loadout, error: '장착할 수 없는 스킬: ' + newSkillId };
  if (loadout.includes(newSkillId)) return { ok: false, loadout, error: '이미 장착 중: ' + newSkillId };
  const next = loadout.slice();
  next[slotIndex] = newSkillId;                 // 대체 — 길이 불변(6) · 빈 슬롯 없음
  const v = validateLoadout(next);
  if (!v.ok) return { ok: false, loadout, error: v.errors.join(', ') };
  return { ok: true, loadout: next };
}
