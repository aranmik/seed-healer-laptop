# Boss Handfeel Probe Runtime Plan 01

작업일: 2026-07-10 · 담당: 렌(Dev) · 성격: **런타임 구현 계획 문서**(코드/리소스 수정 0) · 유키PD/나라님 판단 대기
기준: DEMO_SCOPE_LOCK_01 · PRIEST_PRESENCE_SKILL_BAR_STABILITY_HOTFIX_01(FINAL PASS) · GOLEM_IDLE_ANCHOR_HOTFIX_01(FINAL PASS)

---

## 1. Demo v0 기준점 (잠금)

Demo v0 = Earthroot Golem 기준으로 나라님 "[Demo] 확보" 선언(2026-07-10). 아래는 **기준점으로 잠그고, probe가 절대 덮어쓰지 않는다**:
- 골렘 = "예고를 읽고 보호막으로 막는 손맛" (수치/패턴/연출 무변경)
- 전장: 보스 + 전사/도적/법사 + 후방 ARIA(버스트·스킬 impulse 원점)
- 카드 순서: 전사/도적/법사/ARIA(YOU) · 골렘 idle = 단일 프레임+미세 breath(FINAL PASS)
- 스킬 버튼 안정화 · cast-bar 고정 슬롯 · 390px 완성감
- **기본 URL = 무조건 Earthroot Golem Demo v0** (probe는 URL 파라미터로만 진입)

## 2. 확정 리소스 2종 경로

- A. 나가 워리어: `assets/bosses/_intake/SeedHealer_BossResource_Pack_01/SH_BOSS_006_NAGA_WARRIOR/`
- B. 물정령: `assets/bosses/_intake/SeedHealer_BossResource_Pack_01/SH_BOSS_003_WATER_SPIRIT/`

## 3. 리소스 폴더 조사 결과 (실측)

| 항목 | NAGA_WARRIOR | WATER_SPIRIT |
|---|---|---|
| 파일 | README + CONCEPT_BOARD + IDLE4_MAGENTA + POSESHEET_MAGENTA_WIP | 동일 구성 |
| **IDLE4 시트** | **있음 · 1448×1086 · 24bpp · 2×2 그리드(셀 724×543)** | **동일 규격** |
| 12pose 시트 | **없음.** POSESHEET는 2047×1535 32bpp **WIP**(비표준 그리드·매니페스트가 "pose-direction source"로 명시) | 동일 |
| IDLE4 구성 | [1,1]A중립 / [1,2]B들숨 / [2,1]C날숨 / [2,2]D복귀 (매니페스트 공통 그리드) | 동일 |
| 마젠타 | #FF00FF 계열(코너 실측 ~(245,3,246)) — 골렘과 동일 chroma-key 방식 | ~(242,3,245) |
| **그리드 클린** | 경계선 x=724·y=543 **비마젠타 픽셀 0/1086·0/1448** — 셀 bleed 없음 | **동일(0/0)** |
| 컨셉보드 | 참조 전용·런타임 미사용(README 명시) | 동일 |

★핵심: **IDLE4가 골렘 idle 4프레임 시트와 캔버스·셀 규격까지 완전 동일(1448×1086·724×543)** →
기존 `tools/chroma_extract.ps1 -NoTrim -CropW 724 -CropH 543` 파이프라인 그대로 적용 가능. 추출 리스크 최소.

## 4. 표시 가능성 판단

- **골렘과 같은 방식으로 표시 가능: YES.** 골렘 idle FINAL PASS 문법 = "단일 idle 프레임 + breathBoss(발 고정 미세 숨쉬기)" →
  probe 보스도 **IDLE4의 [1,1] 중립 셀 1장**을 단일 idle로 쓰면 그대로 성립(프레임 loop/anchor 수학 불필요 = 골렘서 겪은 drift/틱틱 이슈 원천 회피).
- 표시 크기: 724×543 셀을 기존 `.bf-boss img.spr{height:322px}`로 표시(=과거 골렘 idle-4 표시와 동일 배율·폭 429px).
  Naga는 매니페스트 WATCH("hero처럼 안 보이게 scale 강조 필요") → per-boss CSS 클래스로 height 350px± 상향 여지. 발 정렬은 정적 단일 프레임이라 CSS 미세조정으로 충분.
- **이벤트 포즈(windup/impact 등): 이번 probe 범위 밖.** POSESHEET가 WIP 비표준이라 12포즈급 추출 불가.
  대신 기존 FX(예고 wind glow·bImpact punch·bTremor·위험 링·전조 bar)는 **img src와 무관한 CSS 클래스**라 probe 보스에도 그대로 작동 →
  손맛 검증(예고 읽기/타이밍)에는 충분. 정식 포즈는 리소스 확정 후 별도 카드.
- preload/fallback: 골렘과 동일하게 probe idle 프레임 `new Image()` 프리로드 + onerror→해당 보스 idle 복귀 필요(기존 패턴 재사용).

## 5. 각 보스 목표 손맛 / 6. 빛나야 할 스킬

| | 물결 성소의 정령 (WATER_SPIRIT) | 나가 워리어 (NAGA_WARRIOR) |
|---|---|---|
| 역할 | 지속 압박형 | 처형/구원 압박형 |
| 손맛 | 파티 전체 HP가 계속 샌다. 보호막 한 번으로 안 끝난다. 무너지는 파티를 계속 정리 | 특정 아군이 죽기 직전까지 몰린다. 죽기 직전에 붙잡는 타이밍 판단 |
| 빛날 스킬 | **지속·고리·빠른치유·정화** | **구원·보호막·빠른치유·정화** |
| 골렘과 차별 | 골렘=한 방 예측/차단 ↔ 물정령=누수 관리 | 골렘=탱커 보호 ↔ 나가=처형 타이밍 절박함 |

## 7. 현재 코드 구조 조사 결과

- **`src/data/tuning.js`**: `TUNING.boss` 단일 객체 = 골렘 패턴 상수 전부(name/hp/auto/smash/tremor/root/push). 보호 파일.
- **`src/core/battle.js`**: ★**결정적 발견 — `Battle(party, loadout, opts)`가 이미 `opts.tuning`을 deepMerge**(봇 변형용으로 설계됨·TUNING 원본 불변).
  → **battle.js·tuning.js 무수정으로 보스별 패턴/수치 분기 가능.** 패턴 엔진 어휘는 4종+엔레이지(평타/강타[단일 예고 큰피해·보호막 경감]/돌진동[전원+사제 예고]/속박[도트+정화]/압박) 고정.
  각 패턴은 `*First: 9999`로 비활성 가능(안전 타임아웃 360s 밖).
- 강타 타겟팅(`aggro()`): **탱커 우선 고정**(battle.js) — "HP 낮은 대상 추적"은 무수정으론 불가(§13 참고).
- **`src/ui/assets.js`**: `ASSETS.boss.earthrootGolem{idle,poses}` — 보호 파일. probe 보스 경로는 **신규 파일에 두면 무수정 가능**.
- **`index.html`**: `bossIdle` const(골렘)·`bossPose` 컨트롤러(이벤트→골렘 12포즈 스왑+idle 단일 유지)·보스명 하드코딩 5곳
  (마을 fac-desc L375 / 게시판 q-name L432 / 준비 상대 L477 / **전투 HUD bh-name L492 / 결과 end-sub L1064**)·`?dev=1` URL 파라미터 패턴 기존재.
- **`src/dev/botSim.js`**: 골렘 baseline 16 PASS. 보호 파일 — TUNING/battle.js를 안 건드리므로 **probe를 붙여도 자동으로 baseline 보존**.

## 8. 구현에 필요한 파일 변경 (분류)

| 파일 | 변경 | 내용 |
|---|---|---|
| **신규** `src/data/bossProbes.js` | 생성 | 보스 2종 config: `{ name, boss:{tuning override}, idle:'경로', dispH }` — probe 전용 tuning/config(허용 항목) |
| **신규** `src/dev/probeSim.js` | 생성 | probe 전용 sim(§11) |
| **신규** `assets/sprites/boss/water_spirit/`·`naga_warrior/` | 생성 | IDLE4 추출 산출물(셀 4장씩·표시엔 [1,1]만 사용) |
| `index.html` | 수정 | ?boss= 진입·B 생성 시 opts.tuning·보스 idle src 분기·bossPose 포즈스왑 가드·HUD/결과/게시판/준비 보스명 동적화·probe 시 dev-pose 셀렉터 미노출 |
| `docs/*` | 생성 | 각 카드 문서 |
| **battle.js / tuning.js / botSim.js / assets.js** | **무수정** | opts.tuning 활용 + 경로를 bossProbes.js에 두므로 불필요 |

**보호 파일 수정 필요 여부: 없음(0).** ← 이 계획의 최대 장점.

## 9. Demo v0 / probe 분리 방식 (제안)

**`?boss=water` / `?boss=naga` URL 파라미터** (기존 `?dev=1` 패턴과 동일 방식) — 추천.
- 기본 URL(파라미터 없음) = **코드 경로상 골렘 Demo v0 그대로**(probe 분기는 파라미터 있을 때만 활성 → 회귀 위험 최소).
- probe 진입 시: `new Battle(PARTY, LOADOUT, {tuning:{boss: BOSS_PROBES[key].boss}})` + 보스 idle src/이름/표시높이 교체 +
  bossPose는 "포즈 없음" 가드(src 스왑 생략·FX 클래스만 pulse·down 시 dead 그레이스케일로 대체).
- 마을/게시판/준비 화면 보스명·아이콘도 probe 시 텍스트 치환(3곳·불일치 방지). 루프(마을↔전투)는 동일하게 작동.
- HUD에 probe 표식(기존 dev-pill 재활용해 "PROBE" 표시) 제안 — 데모와 시각 구분.
- `?probe=1` dev 셀렉터 방식은 UI 추가 작업이 커서 차후(2종 이상 늘어나면) 검토.

## 10. 각 보스 tuning override 초안 (Probe Sim에서 검증/조정할 첫 숫자)

```js
// src/data/bossProbes.js (초안 — Card C에서 sim으로 튜닝)
water: { name:'물결 성소의 정령', idle:'assets/sprites/boss/water_spirit/..._IDLE_01_v001.png', dispH:322,
  boss:{ name:'물결 성소의 정령', hp:8800,
    autoFirst:3, autoInt:4.2, autoDmg:240,                     // 잔피해 잦게·약하게
    smashFirst:9999, smashInt:9999, smashDmg:0,                // ★처형기 없음(한 방 보스 아님)
    tremorFirst:12, tremorInt:13, tremorWind:2.0, tremorDmg:95, // ★약한 전체피해 반복(사제 포함) → 고리/지속
    rootFirst:10, rootInt:16, rootWind:1.0, rootDps:46, rootDur:10, // ★침식 디버프 잦게 → 정화 압박(도트 누적)
    pushTime:110, pushHpPct:0.25, pushAutoInt:3.2, pushTremorInt:9, pushDmgMul:1.10 } },
naga: { name:'나가 워리어', idle:'assets/sprites/boss/naga_warrior/..._IDLE_01_v001.png', dispH:352,  // 매니페스트 scale 강조
  boss:{ name:'나가 워리어', hp:9000,
    autoFirst:3, autoInt:5.5, autoDmg:260,
    smashFirst:12, smashInt:17, smashWind:1.8, smashDmg:880,   // ★집중 처형: 잦고 아프게(탱커 616→보호막 시 256)
    tremorFirst:30, tremorInt:26, tremorWind:2.5, tremorDmg:190, // ★사제도 크게 압박 → 구원 활용
    rootFirst:22, rootInt:30, rootWind:1.0, rootDps:32, rootDur:8, // 가벼운 출혈성 속박(정화 순간 유지)
    pushTime:115, pushHpPct:0.30, pushAutoInt:4.2, pushTremorInt:16, pushDmgMul:1.15 } }
```
- 검증 질문 매핑: 물정령=지속 우선순위/고리 타이밍/정화 압박/보호막 무의미화 ↔ 나가=구원 절박/보호막 선제 고민/빠른치유 vs 구원 판단.

## 11. botSim baseline 유지 / 분리 방식

- **기존 `src/dev/botSim.js` 완전 무수정** → TUNING·battle.js 불변이므로 16 PASS/0 FAIL **자동 보존**(각 카드마다 회귀 실행으로 확인).
- **신규 `src/dev/probeSim.js` 분리 생성**(확장 아님): botSim의 봇 로직(basic/smart)을 독립 사본으로 가져와
  `new Battle(party, loadout, {tuning:{boss: probe.boss}})`로 두 보스 각각 실행 →
  ①클리어 가능/전멸 경계 sanity ②즉사·무한전투 붕괴 검출 ③probe 자체 baseline 수치 기록.
  (botSim.js를 import하면 스크립트 본문이 실행되므로 의존 걸지 않고 독립 사본 — 보호 파일 무접촉 원칙 유지)

## 12. 다음 Runtime 카드 제안 (A→B→C→D)

1. **Card A — Boss Idle Resource Intake 02**: IDLE4 2종 → 셀 4장씩 추출(마젠타 제거·724×543·-NoTrim·기존 골렘 파이프라인)+픽셀 검수(잔여 0/코너 투명/엣지)+manifest. 코드 무변경.
2. **Card B — Boss Probe Entry Runtime 01**: `bossProbes.js` 신설 + index.html `?boss=` 배선(§8·§9) + **기본 URL 골렘 Demo v0 무변경 회귀 검증**(핵심 판정 기준).
3. **Card C — Boss Probe Sim Baseline 01**: `probeSim.js` 신설 → §10 초안 수치 sanity/튜닝(bossProbes.js만 수정·botSim 16 PASS 회귀 확인).
4. **Card D — 나라님 실기 Handfeel Probe**: 실기 판정 → 수치 반복(bossProbes.js 상수만) → 손맛 확정 시 정식 편입 여부 유키 판단.
- B와 C는 분리 권장(진입 배선의 회귀 검증과 수치 튜닝을 섞지 않기 위해). 급하면 B+C 병합 가능하나 비권장.

## 13. 리스크 / HOLD 항목

1. ★**구원(salvation)은 현재 "사제 전용 자가회복"**(tuning.js `selfOnly:true`) — 나가 목표 "특정 아군을 구원으로 붙잡는다"와 부분 불일치.
   스킬 로직 변경은 금지이므로 probe에서는 **"나가가 사제도 강하게 압박(tremor 190)해 구원이 빛나는" 재해석**으로 진행.
   구원의 대상 확장(아군 지정)은 스킬 로직 변경 = **HOLD·유키PD 판단 필요**.
2. **"HP 낮은 대상 추적" 타겟팅 불가** — battle.js `aggro()`가 탱커 우선 고정. probe에서는 **"탱커 집중 처형"으로 재해석**
   (실질 손맛 동일: 한 명이 반복적으로 죽기 직전까지 몰림). 진짜 최저HP 추적이 필요하면 battle.js 해금 = HOLD·유키 판단.
3. **POSESHEET는 WIP 비표준(2047×1535)** — 이벤트 포즈는 이번 probe 범위 밖(단일 idle+기존 FX로 손맛 검증). 정식 포즈는 리소스 확정 후.
4. 전조/칩 어휘가 골렘 기준(🌐 돌진동·⛓️ 속박 등 renderTele/renderState 텍스트) — probe 보스별 명칭 치환은 Card B에서 소폭 분기(물정령: 💧 침식 등). 미치환 시 어휘만 어색(기능 정상).
5. 나가 스케일(매니페스트 "hero처럼 보임") — dispH 상향으로 대응하되 실기 판단.
6. probe는 저장/보상/성장 없음 유지(Demo Scope Lock OUT 준수) — 손맛 검증 전용.

---
### 결론
보호 파일 0개 수정으로 probe 2종 런타임이 가능하다(opts.tuning + 신규 config/sim 파일 + index.html 분기).
리소스는 IDLE4 기준 즉시 추출 가능(골렘 파이프라인 동일 규격 실측 확인). Card A부터 발주 가능 상태.
