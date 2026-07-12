// Seed Healer — bossProbes.js (Post-Demo Boss Handfeel Probe 전용 config)
// Boss Probe Entry Runtime 01. Demo v0(Earthroot Golem)와 완전 분리된 probe 보스 정의.
// ★기본 URL에서는 이 파일이 로드만 되고 어디에도 쓰이지 않는다(?boss=water|naga 일 때만 활성).
// ★battle.js/tuning.js 무수정 — Battle(party, loadout, { tuning:{ boss } })의 deepMerge로만 주입.
//   TUNING 원본은 절대 변경되지 않는다(Battle이 사본에 병합).
// boss 수치는 BOSS_HANDFEEL_PROBE_RUNTIME_PLAN_01 §10 초안 — 깊은 튜닝은 Card C(Boss Probe Sim Baseline 01)에서.
// idle 경로/dispH/offsetX는 BOSS_IDLE_RESOURCE_INTAKE_02 FINAL PASS 실측값.
//   (offsetX = 본체 우측 치우침 보정. img margin-left로 적용 — transform은 breathBoss keyframe이 대체하므로 금지)

// Guild Board 3 Boss Selection Runtime 01 — 게시판 카드 순서(제품 흐름).
export const BOSS_ORDER = ['golem', 'water', 'naga'];

// ── Three Boss Loadout Pressure Balance 01 — 제품 Demo v1 override (canonical tuning.js/botSim 동결·완전 분리) ──
// ★제품 Battle 생성 시 opts.tuning(deepMerge)으로만 주입(index.html newBattle). tuning.js 원본은 절대 변경되지 않는다.
//   canonical botSim(tuning.js golem·seed cost 12)은 override 없이 생성 → baseline 그대로 보존.
export const DEMO_V1_SKILL_TUNING = {
  seed: { cost: 9 },                                          // Checkpoint A — 씨앗 마나 9 (canonical TUNING.skills.seed.cost=12 동결)
  // ── Final Battle Readability & Finish Polish 01 — 신규 전략 스킬 "은총의 순간"(grace) 제품 override ──
  //   ★canonical tuning.js 무접촉: 제품 Battle 생성 시 deepMerge로만 T.skills.grace 주입(botSim/probeSim은 이 skill을 loadout에 넣지 않아 무영향).
  //   cost 0 · 긴 쿨(90s) · 8초 창 안 "다음 성공한 마나 소모 스킬 1회"를 무료로. battle.js grace runtime이 소비.
  grace: { name: '은총의 순간', type: 'instant', cost: 0, cd: 90, dur: 8 }
};
export const DEMO_V1_BOSS_OVERRIDE = {                        // 보스별 제품 boss override(부분·deepMerge). water/naga 압박은 BOSS_PROBES[key].boss가 담당.
  golem: { tremorFirst: 19, tremorInt: 24 }                  // Checkpoint C — 골렘 진동 위상(canonical 25/28 동결). ★19/24 과하면 21/26 완화, 그래도면 롤백.
};
// (Checkpoint 진행 시 golem override 활성은 index.html newBattle이 DEMO_V1_BOSS_OVERRIDE[selectedBoss]로 읽어 적용)

export const BOSS_PROBES = {

  // ── 예고형(선제 방어): Demo v0 골렘. ★게시판 메타 전용 — 수치/이미지/전조는 index의 기존 골렘 경로를 그대로 씀.
  //   (idle:null → index bossIdle · boss:null → TUNING 기본 · tele:null → index 골렘 기본 문구. assets.js/tuning.js 무접촉.)
  golem: {
    key: 'golem', name: '대지뿌리 골렘', emoji: '🪨',
    idle: null, dispH: 322, offsetX: 0,
    hint: '"뿌리의 거구가 예고된 강타로 전열을 무너뜨립니다."',
    clearText: '대지뿌리 골렘을 넘겼다.',
    tags: ['🔨 강타', '🛡 탱커 집중', '⚠ 예고'],              // HOLD③: 위험 태그만(권장 스킬 노출 금지)
    answerHint: '보호막·서약·빠른치유·정화·구원',              // ?dev=1 에서만 표시(내부 검증용)
    tele: null, boss: null
  },

  // ── 지속 압박형: 파티 전체 HP가 계속 샌다. 지속/고리/빠른치유/정화가 빛나야 한다. ──
  water: {
    key: 'water',
    name: '물결 성소의 정령',
    emoji: '🌊',
    idle: 'assets/sprites/boss/water_spirit/SH_BOSS_003_WATER_SPIRIT_IDLE_01_v001.png',
    dispH: 322,      // Intake 02 §6: 본체 542×423(넓은 파도형)·발 88.4% — 골렘 발 라인 근사
    offsetX: -21,    // 본체 중심 +35px(raw) 우측 → 표시 스케일 .593에서 -21px 보정
    hint: '"스며드는 침식과 잔파도가 파티 전체를 서서히 무너뜨립니다."',
    clearText: '물결 성소의 정령을 잠재웠다.',
    tags: ['🌊 전체 피해', '💧 침식', '⏳ 지속 압박'],          // HOLD③: 위험 태그만
    answerHint: '지속·고리·정화·빠른치유',                      // ?dev=1 전용
    tele: {          // 전조 바 문구(골렘 어휘 → 물정령 어휘)
      smashDanger: '🔨 강타 → ', smashSafe: '🛡 대비 완료 — ',   // 강타 비활성이라 표시될 일 없음(안전 기본값)
      tremor: '🌊 잔파도 — 전원 (사제 포함)', root: '💧 침식 → ',
      push: '⚠ 정령이 파도를 크게 일으킨다'   // A3 보스명 매핑 — 압박 문구(골렘 어휘 제거)
    },
    boss: {          // ★초안(Plan 01 §10) — Card C sim에서 검증/조정
      name: '물결 성소의 정령', hp: 8800,
      autoFirst: 3, autoInt: 4.2, autoDmg: 240,                        // 잔피해 잦게·약하게
      smashFirst: 9999, smashInt: 9999,                                // 처형기 없음(한 방 보스 아님)
      tremorFirst: 12, tremorInt: 11.5, tremorWind: 2.0, tremorDmg: 132, // 잔파도 전체피해 — Balance 01 Checkpoint B: 120→132(+10%·기본6 마나 압박·씨앗 가치)·안전선 깨지면 126 롤백
      rootFirst: 10, rootInt: 16, rootWind: 1.0, rootDps: 52, rootDur: 10, // 침식 디버프 → 정화 압박 — Sim 01: 46→52
      pushTime: 110, pushHpPct: 0.25, pushAutoInt: 3.2, pushTremorInt: 9, pushDmgMul: 1.10
    }
  },

  // ── 처형/구원 압박형: 탱커 집중 처형 + ARIA 압박. 구원(selfOnly)/보호막/빠른치유가 빛나야 한다. ──
  // 유키PD HOLD 판정 반영: 스킬 로직 무변경(구원 selfOnly 유지)·타겟팅 코어 무변경(탱커 집중 처형 재해석).
  naga: {
    key: 'naga',
    name: '나가 워리어',
    emoji: '🐍',
    idle: 'assets/sprites/boss/naga_warrior/SH_BOSS_006_NAGA_WARRIOR_IDLE_01_v001.png',
    dispH: 352,      // Intake 02 §6: 본체 365×472(세로형)·매니페스트 "hero처럼 보임" → scale 강조
    offsetX: -16,    // 본체 중심 +25.5px(raw) 우측 → 표시 스케일 .648에서 -16px 보정
    hint: '"집요한 처형 베기가 한 명을 끝까지 몰아붙입니다."',
    clearText: '나가 워리어를 쓰러뜨렸다.',
    tags: ['🗡 처형 베기', '🛡 탱커 집중', '🕯️ 사제 압박'],     // HOLD③: 위험 태그만
    answerHint: '보호막·서약·빠른치유·구원',                    // ?dev=1 전용
    tele: {
      smashDanger: '🗡 처형 베기 → ', smashSafe: '🛡 처형 대비 완료 — ',
      tremor: '🌊 해일 — 전원 (사제 포함)', root: '🩸 출혈 → ',
      push: '⚠ 나가가 마지막 처형에 나선다'   // A3 보스명 매핑 — 압박 문구(골렘 어휘 제거)
    },
    boss: {          // ★초안(Plan 01 §10) — Card C sim에서 검증/조정
      name: '나가 워리어', hp: 8400,                                   // Sim 01 r6: 9000→8700→8400(위기 정점 직후 결판 — 후반 연쇄붕괴 전에 끝나는 길이)
      autoFirst: 3, autoInt: 5.5, autoDmg: 235,                        // Sim 01: 260→235(해일 상향분 상쇄·처형 정체성 유지)
      smashFirst: 12, smashInt: 17, smashWind: 1.8, smashDmg: 850,     // 집중 처형(탱커): 잦고 아프게 — Sim 01 r5: 880→850(무보호 595=탱커 42%·정체성 유지·힐 부담 완화)
      tremorFirst: 24, tremorInt: 28, tremorWind: 2.5, tremorDmg: 215, // 사제도 크게 압박 → 구원(selfOnly) 활용 — Sim 01 r4: 잦게(24s)가 아니라 "드물게(28s)·깊게(215)" — 사제가 깊이 파이되 총 피해는 r0 수준(마나 경제 유지)
      rootFirst: 22, rootInt: 30, rootWind: 1.0, rootDps: 32, rootDur: 8, // 가벼운 출혈 → 정화 순간 유지
      pushTime: 115, pushHpPct: 0.30, pushAutoInt: 4.2, pushTremorInt: 16, pushDmgMul: 1.15
    }
  }
};
