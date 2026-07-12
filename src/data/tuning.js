// Seed Healer Laptop Starter — tuning.js
// Responsibility: 손맛을 만드는 모든 숫자. 단일 진실 원천(Single Source of Truth).
// 코드 어디에도 숫자를 하드코딩하지 말고, 전부 여기서 참조한다.
// 값 출처: docs/P1A_06_TUNING_CONSTANTS.md (현재 P1-A 실물에서 추출 — 변경 금지, 먼저 그대로 이식)
// 튜닝 실험은 "봇 baseline(docs/P1A_10) 회귀 확인 후"에만.

export const TUNING = {
  tick: 0.05, // 시뮬 스텝(초). 초당 20틱. 결정론의 기준 단위.

  // ── 보스: 대지뿌리 골렘 ──────────────────────────────
  boss: {
    name: '대지뿌리 골렘',
    hp: 9600,            // 전투 전체 길이 다이얼 (표준 파티 DPS 66 → 약 145초) · RISK: MID
    autoFirst: 3.0,
    autoInt: 5.0,        // 평타 주기 (압박 시 pushAutoInt) · RISK: MID
    autoDmg: 300,        // 평타 피해 · RISK: MID
    smashFirst: 15,
    smashInt: 24,        // 강타 주기 · RISK: MID
    smashWind: 1.5,      // 강타 예고 시간 (1.2~1.8) · RISK: HIGH
    smashDmg: 720,       // 강타 피해 — 난이도 중심축 · RISK: HIGH (올리면 강요, 내리면 무의미)
    tremorFirst: 25,
    tremorInt: 28,       // 돌진동 주기 = 사제 피격 빈도 (압박 시 pushTremorInt) · RISK: HIGH
    tremorWind: 2.5,
    tremorDmg: 130,      // 돌진동 피해(전원·사제 포함) = 사제 피격 강도 · RISK: HIGH
    rootFirst: 20,
    rootInt: 32,         // 속박 주기 · RISK: MID
    rootWind: 1.0,
    rootDps: 36,         // 속박 도트(초당) · RISK: MID
    rootDur: 8,          // 속박 지속(정화 안 하면) · RISK: MID
    pushTime: 120,       // 마지막 압박 시작(초) · RISK: HIGH
    pushHpPct: 0.25,     //   또는 HP 25% 이하 (먼저 오는 쪽, 1회 래치)
    pushAutoInt: 3.8,    // 압박 평타 주기
    pushTremorInt: 18,   // 압박 돌진동 주기
    pushDmgMul: 1.12     // 압박 전 피해 배수 — 소프트/하드 경계 · RISK: HIGH (즉사 금지)
  },

  tankMit: 0.30,         // 방패 전사 피해 감쇄(전역) · RISK: HIGH

  // ── 동료 5종 (표준 파티 = warrior+rogue+mage, 총 DPS 66) ──
  allies: {
    warrior: { name: '방패 전사',       emoji: '🛡️', hp: 1400, dps: 14, tank: true,
               role: '강타 대응 안정 탱커' },                       // RISK: HIGH (HP/탱커성)
    rogue:   { name: '차단 도적',       emoji: '🗡️', hp: 950,  dps: 22,
               role: '차단 담당. 정화가 차단을 만든다.' },          // RISK: LOW
    mage:    { name: '화염 마법사',     emoji: '🔥', hp: 800,  dps: 30,
               role: '강한 딜러. 어그로/광역에 취약.' },            // RISK: MID (전투 길이 연쇄)
    shaman:  { name: '치유 토템 주술사', emoji: '🪶', hp: 1000, dps: 9,  totemHps: 6,
               role: '잔피해 안정화. 큰 한 방은 사제가 직접 대응.' }, // RISK: MID
    hunter:  { name: '덫 사냥꾼',       emoji: '🪤', hp: 900,  dps: 17, trapInt: 30, trapDelay: 3,
               role: '쫄/돌진 제어. 시간을 벌어준다.' }             // RISK: LOW
  },

  // ── 사제 ─────────────────────────────────────────────
  priest: {
    hp: 900,             // 사제 생존(돌진동 피격) · RISK: HIGH
    mana: 100,           // 마나 최대치 · RISK: HIGH
    regen: 1.8,          // 마나 자연 회복(초당) · RISK: HIGH
    breathBonus: 0.8     // 깊은 호흡: 비시전 시간 추가 회복(초당) · RISK: MID
  },

  gcd: 1.0,              // 글로벌 쿨다운(전 스킬 공용) · RISK: HIGH

  // ── 스킬 7종 (로드아웃 6/7) ──────────────────────────
  skills: {
    quickheal: { name: '빠른 치유',   emoji: '✚',  type: 'cast',    cast: 1.2, heal: 400, cost: 10, target: 'ally',
                 desc: '빠른 단일 회복' },                          // RISK: HIGH (회복 처리량 기준)
    shield:    { name: '보호막',     emoji: '🛡',  type: 'instant', absorb: 360, dur: 20, cost: 12, target: 'ally', lock: true,
                 desc: '선제 피해 흡수' },                          // RISK: HIGH (강타 경감폭) · lock=동일 대상 재적용 잠금
    cleanse:   { name: '정화',       emoji: '💧',  type: 'instant', cost: 7, cd: 2, target: 'ally',
                 desc: '치명 디버프 제거' },                        // RISK: MID
    salvation: { name: '구원의 기도', emoji: '🕯️', type: 'instant', selfOnly: true, healPctMissing: 0.75, healFlat: 100, cost: 16, cd: 18,
                 desc: '사제 자신 긴급 회복' },                     // RISK: MID · 사제 전용(파티 회복 아님)
    hot:       { name: '지속 회복',   emoji: '🌿',  type: 'instant', hps: 40, dur: 12, cost: 11, target: 'ally',
                 desc: '시간에 걸친 회복' },                        // RISK: MID
    ring:      { name: '빛의 고리',   emoji: '◎',  type: 'instant', healAll: 160, cost: 15, cd: 6,
                 desc: '즉시 소형 광역 회복' },                     // RISK: MID · cd 6 (나라님 "캔슬" 오인지의 원인 = 이 쿨/마나)
    breath:    { name: '깊은 호흡',   emoji: '🌬️', type: 'passive',
                 desc: '패시브 · 마나 회복 보조' },                 // RISK: MID (priest.breathBonus 참조)

    // ── 신규 2종 (Battle Core Skill Extension 01) · ★draft 수치 — Three Boss Balance Pass(Card 10)에서 조정 ──
    vow:       { name: '수호의 서약', emoji: '🕊️', type: 'instant', dmgMul: 0.60, dur: 8,  cost: 13, cd: 12, target: 'ally',
                 desc: '받는 피해 40% 감소 (8초)' },                // dmgMul=0.6(=−40%) · 보호막 흡수 前 비율감소 · draft
    seed:      { name: '기도 씨앗',   emoji: '🌱', type: 'instant', healPerHit: 90, charges: 3, dur: 15, cost: 12, cd: 6, target: 'ally',
                 desc: '피격 반응 치유 90 (충전 3 · 15초)' }        // HP 피해 ≥1 사건당 1회 발동·충전 소모 · draft
  },

  ui: { dangerPct: 0.30 } // 프레임 위험 펄스 기준 HP%
};

// 시작 기본 편성/로드아웃 (docs/P1A_05)
export const DEFAULT_PARTY = ['warrior', 'rogue', 'mage'];
export const DEFAULT_LOADOUT = ['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'ring']; // breath 미포함 = 7중6 선택 긴장
export const ALL_ALLIES = ['warrior', 'rogue', 'mage', 'shaman', 'hunter'];
export const ALL_SKILLS = ['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'ring', 'breath'];

// 파생 관계(상수 아님, 계산으로 유지 — docs/P1A_06 §5):
//   전투 길이 ≈ boss.hp / 파티DPS  (+압박·사망 변동)
//   마나 예산 ≈ 100 + regen×길이   (+깊은 호흡)
//   강타 경감 = smashDmg − shield.absorb (탱커면 감쇄 후)  → 실측 720→(탱커504)→(보호144)
