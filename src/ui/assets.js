// Seed Healer Laptop Starter — assets.js
// Responsibility: 이미지 슬롯 매니페스트 + 폴백 헬퍼. 이미지가 없어도 완전히 동작한다.
// 값 출처/규칙: docs/P1A_09_ASSET_SLOT_MANIFEST.md
// 규율: base64 대량 인라인 금지. 외부 파일 경로만. 폴백(이모지/CSS)을 절대 제거하지 말 것.

// ── Earthroot Golem 12포즈 registry (Ingame Sprite Preview 01 · additive) ──
// 출처: Resource Intake 01 / Pose Viewer 01 → assets/sprites/boss/earthroot_golem/ (전부 362×362 RGBA)
// 순수 시각 리소스. 전투 수치/패턴/타이밍과 무관. 라이브 보스는 idle(01)만 사용, 나머지는 DEV pose selector 확인용.
const EG_BASE = 'assets/sprites/boss/earthroot_golem/';
export const EARTHROOT_GOLEM_POSES = [
  { no:'01', name:'IDLE',                  file: EG_BASE+'SH_BOSS_001_EARTHROOT_GOLEM_01_IDLE_v001.png' },
  { no:'02', name:'ADVANCE',               file: EG_BASE+'SH_BOSS_001_EARTHROOT_GOLEM_02_ADVANCE_v001.png' },
  { no:'03', name:'BASIC_ATTACK',          file: EG_BASE+'SH_BOSS_001_EARTHROOT_GOLEM_03_BASIC_ATTACK_v001.png' },
  { no:'04', name:'HEAVY_SLAM_WINDUP',     file: EG_BASE+'SH_BOSS_001_EARTHROOT_GOLEM_04_HEAVY_SLAM_WINDUP_v001.png' },
  { no:'05', name:'HEAVY_SLAM_IMPACT',     file: EG_BASE+'SH_BOSS_001_EARTHROOT_GOLEM_05_HEAVY_SLAM_IMPACT_v001.png' },
  { no:'06', name:'ROOT_BIND_CAST',        file: EG_BASE+'SH_BOSS_001_EARTHROOT_GOLEM_06_ROOT_BIND_CAST_v001.png' },
  { no:'07', name:'HIT_STAGGER',           file: EG_BASE+'SH_BOSS_001_EARTHROOT_GOLEM_07_HIT_STAGGER_v001.png' },
  { no:'08', name:'DOWN_DEFEAT',           file: EG_BASE+'SH_BOSS_001_EARTHROOT_GOLEM_08_DOWN_DEFEAT_v001.png' },
  { no:'09', name:'TREMOR_CAST',           file: EG_BASE+'SH_BOSS_001_EARTHROOT_GOLEM_09_TREMOR_CAST_v001.png' },
  { no:'10', name:'TREMOR_RELEASE',        file: EG_BASE+'SH_BOSS_001_EARTHROOT_GOLEM_10_TREMOR_RELEASE_v001.png' },
  { no:'11', name:'FINAL_PRESSURE_ENRAGE', file: EG_BASE+'SH_BOSS_001_EARTHROOT_GOLEM_11_FINAL_PRESSURE_ENRAGE_v001.png' },
  { no:'12', name:'RECOVERY_RESET',        file: EG_BASE+'SH_BOSS_001_EARTHROOT_GOLEM_12_RECOVERY_RESET_v001.png' }
];

// 모든 슬롯은 null(placeholder). 루미 이미지를 받으면 경로 문자열만 넣으면 <img>로 스왑된다.
// 예) priest.idle: 'assets/priest/priest_idle.png'
export const ASSETS = {
  priest: {
    idle: 'assets/priest/priest_idle.png', // 연결됨(Connect 02) · 폴백 ✨ 유지
    castHeal: 'assets/priest/priest_cast_heal.png', // 연결됨(Assembly 02 · 포즈시트 Heal Cast 컷) · 폴백 유지
    castShield: null,  // assets/priest/priest_cast_shield.png
    castCleanse: null, // assets/priest/priest_cast_cleanse.png
    portrait: 'assets/priest/priest_portrait.png' // additive(Assembly 02) · 얼굴 타겟 UI용 · 없으면 idle/이모지 폴백
  },
  allies: {
    // portrait/field는 additive 선택 슬롯(Assembly 02): portrait=얼굴 타겟 UI · field=전장 액션 컷.
    // 없으면(null) idle → 이모지 순 폴백. 기존 idle 키 의미 불변.
    warrior: { idle: 'assets/allies/warrior/warrior_idle.png', hurt: null, down: null,
               portrait: 'assets/allies/warrior/warrior_portrait.png',
               field: 'assets/allies/warrior/warrior_field_guard.png' },     // 연결됨(Connect A 02/Assembly 02) · 폴백 🛡️
    rogue:   { idle: 'assets/allies/rogue/rogue_idle.png',
               portrait: 'assets/allies/rogue/rogue_portrait.png',
               field: 'assets/allies/rogue/rogue_field_attack.png' },        // 연결됨 · 폴백 🗡️
    mage:    { idle: 'assets/allies/mage/mage_idle.png',
               portrait: 'assets/allies/mage/mage_portrait.png',
               field: 'assets/allies/mage/mage_field_magic_cast.png' },      // 연결됨 · 폴백 🔥 · mage=Lumina
    shaman:  { idle: 'assets/allies/shaman/shaman_idle.png',
               portrait: 'assets/allies/shaman/shaman_portrait.png', field: null }, // 연결됨 · field 컷 미추출
    hunter:  { idle: 'assets/allies/hunter/hunter_idle.png',
               portrait: 'assets/allies/hunter/hunter_portrait.png', field: null }  // 연결됨 · field 컷 미추출
  },
  boss: {
    golem: {
      idle: 'assets/bosses/earthroot_golem/golem_idle.png', // 기존 8포즈 세트(Connect 02) · 폴백 CSS 골렘 유지
      attack: null,    // golem_attack.png
      slamCast: null,  // golem_slam_cast.png (강타 예고, 폴백 CSS windup)
      slamHit: null,   // golem_slam_hit.png
      rootCast: null,  // golem_root_cast.png
      enrage: null     // golem_enrage.png (압박, 폴백 CSS push)
    },
    // 신규 12포즈 세트(Ingame Sprite Preview 01) — 라이브 보스는 idle(01)만 사용. poses는 DEV pose selector용.
    earthrootGolem: { idle: EARTHROOT_GOLEM_POSES[0].file, poses: EARTHROOT_GOLEM_POSES }
  },
  icons: {
    quickHeal: 'assets/icons/icon_quick_heal.png', // 연결됨(Connect 02) · 폴백 ✚
    shield: 'assets/icons/icon_shield.png',        // 연결됨(Connect 02) · 폴백 🛡
    cleanse: 'assets/icons/icon_cleanse.png',      // 연결됨(Connect 02) · 폴백 💧
    salvation: 'assets/icons/icon_salvation.png',  // 연결됨(Connect 02) · 폴백 🕯️
    renew: 'assets/icons/icon_renew.png',          // 연결됨(Connect 02) · 폴백 🌿
    ring: 'assets/icons/icon_ring.png',            // 연결됨(Connect 02) · 폴백 ◎
    breath: null       // 폴백 🌬️ · WATCH — Connect 02에서 연결 보류 (유키PD)
  },
  status: {
    shield: null,      // 폴백 🛡 칩
    rootBind: null,    // 폴백 ⛓️ 칩(확대·맥박)
    renew: null,       // 폴백 🌿 칩
    slamWarning: null  // 폴백 🎯 + 앰버 강조
  },
  ui: {
    battleBg: 'assets/ui/battle_background.png', // 폴백 CSS 그라데이션(#241b12→#171009)
    townBg:   'assets/ui/town_bg.png',
    innBg:    'assets/ui/inn_bg.png',
    chapelBg: 'assets/ui/chapel_bg.png',
    boardBg:  'assets/ui/board_bg.png',
    archiveBg:'assets/ui/archive_bg.png',
    resultWin: null, resultLose: null
    // market_workshop_bg.png는 assets/ui/에 복사만 됨 — 대응 슬롯 없음(슬롯 추가는 유키PD 판단)
  }
};

// 이모지 폴백 사전 (이미지 없을 때 사용)
export const EMOJI = {
  priest: '✨',
  warrior: '🛡️', rogue: '🗡️', mage: '🔥', shaman: '🪶', hunter: '🪤',
  golem: '🪨',
  skills: { quickheal: '✚', shield: '🛡', cleanse: '💧', salvation: '🕯️', hot: '🌿', ring: '◎', breath: '🌬️' }
};

// 폴백 헬퍼: url 있으면 <img>, 없으면 <span>이모지</span>.
// docs/P1A_09 §4 계약. FX(플래시/비네트/플로팅/SFX)는 여기 넣지 않는다(코드로 처리).
export function spr(url, emoji, cls = '') {
  return url
    ? `<img class="spr ${cls}" src="${url}" alt="">`
    : `<span class="${cls}">${emoji}</span>`;
}
export function allySpr(id, cls) { return spr(ASSETS.allies[id]?.idle, EMOJI[id], cls); }
export function priestSpr(cls)   { return spr(ASSETS.priest.idle, EMOJI.priest, cls); }
export function bossSpr(cls)     { return spr(ASSETS.boss.earthrootGolem?.idle || ASSETS.boss.golem.idle, EMOJI.golem, cls); }
export function skillSpr(sid, cls) { return spr(ASSETS.icons[skillIconKey(sid)], EMOJI.skills[sid], cls); }

// 스킬 id → icons 키 매핑 (hot→renew 등 명칭 차이 흡수)
function skillIconKey(sid) {
  return ({ quickheal: 'quickHeal', shield: 'shield', cleanse: 'cleanse',
            salvation: 'salvation', hot: 'renew', ring: 'ring', breath: 'breath' })[sid] || sid;
}

// ── Hero v002 crop asset slots (Hero Asset Slot Link 01 · additive) ──
// 출처: Hero Crop Export 02(도형 선택 모델) → assets/sprites/heroes/{key}/crops/…_v002.png
// 배치 정책: docs/HERO_PLACEMENT_POLICY_01.md — ARIA=priestAnchor(별도·medium·170px), 나머지=allyRow.
// ★additive only: 아직 battle.js/runtime 미연결. 기존 ASSETS/EMOJI/헬퍼/export 무변경.
const HERO_CROP_BASE = 'assets/sprites/heroes/';
function heroCrops(key, num, NAME) {
  const dir = HERO_CROP_BASE + key + '/crops/SH_HERO_' + num + '_' + NAME + '_';
  return { field: dir + 'FIELD_v002.png', portrait: dir + 'PORTRAIT_v002.png', thumb: dir + 'THUMB_v002.png' };
}
export const HERO_CROP_ASSETS_V002 = {
  eli:    { id: 'eli',    displayName: 'ELI',    role: 'Warrior', placement: 'allyRow',      crops: heroCrops('eli', '001', 'ELI') },
  thorne: { id: 'thorne', displayName: 'THORNE', role: 'Rogue',   placement: 'allyRow',      crops: heroCrops('thorne', '002', 'THORNE') },
  lumina: { id: 'lumina', displayName: 'LUMINA', role: 'Mage',    placement: 'allyRow',      crops: heroCrops('lumina', '003', 'LUMINA') },
  rorin:  { id: 'rorin',  displayName: 'RORIN',  role: 'Shaman',  placement: 'allyRow',      crops: heroCrops('rorin', '004', 'RORIN') },
  cael:   { id: 'cael',   displayName: 'CAEL',   role: 'Hunter',  placement: 'allyRow',      crops: heroCrops('cael', '005', 'CAEL') },
  aria:   { id: 'aria',   displayName: 'ARIA',   role: 'Priest',  placement: 'priestAnchor', anchorSize: 'medium', anchorHeightPx: 170, crops: heroCrops('aria', '006', 'ARIA') }
};
