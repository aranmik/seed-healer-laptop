# Seed Healer — Demo v1 Implementation Roadmap 01

작성일: 2026-07-11 · 담당: 렌(Dev) · 판정: **★유키PD/나라님 FINAL PASS (2026-07-11)**
확정: 11카드 로드맵 채택. HOLD 3건 확정(battle.js 해금=Card 4 전용 승인·breath dormant·tip 태그 제거)으로
Card 2(Guild Board)·Card 3(Skill Pool 8) 착수 조건 충족. Card 7(Pose Audit)은 독립 트랙 병행 가능.
기준: DEMO_V1_SCOPE_LOCK_01 · BOSS_SKILL_ANSWER_MATRIX_01 · 리소스/코드 읽기 조사 실측

---

## A. Battle Pose / FX Grammar

### A-1. 리소스 실태 (실측)
| 구분 | 리소스 | 상태 |
|---|---|---|
| **READY(즉시 사용)** | 골렘 12포즈(01/04/05/06/08/09/10 연결됨 · **03 평타·07 피격·11 분노·12 회복 미사용**) | 추출·검증 완료 |
| READY | 기존 CSS FX(wind glow·bImpact/bTremor/bRoot·위험 링·hero-hit/lunge·react-heal/shield/block·cast-pulse/ring·support-spark) | 이미지 무관·전 보스 재사용 가능 |
| READY(구 아트) | 구 priest 자산: cast_heal / cast_shield / cast_cleanse | ★ARIA v002와 **화풍 불일치** — 사용 비권장 |
| **EXTRACTABLE(추출 카드 필요)** | `visual_assets/characters/pose_sheets/` **6영웅 8포즈 시트**(SH_CHR_001 ARIA~501 LUMINA·마젠타·라벨 컷 제외 필요·Assembly 02에서 Attack/Guard/Cast 계열 추출 실적 있음) | 라벨/셀 실측 필요 |
| EXTRACTABLE | 히어로 BASE CLEAN 2×2의 나머지 3도형(변형 포즈 후보) | 정체 육안 미확정 |
| **WIP(v1 범위 밖)** | 물정령/나가 POSESHEET(2047×1535 비표준) | 이벤트 포즈 없음 — CSS FX로 대체 |

### A-2. 캐릭터별 핵심 pose 최소 세트 (제안)
| 캐릭터 | Idle | Action | Hit | Down | Cast |
|---|---|---|---|---|---|
| 동료 3(전/도/마) | FIELD v002(현행) | 8포즈 시트 Attack 컷(추출) | 8포즈 Hit 컷 or **CSS recoil 유지** | 8포즈 Down 컷 or **CSS 그레이스케일 유지** | — |
| ARIA | FIELD v002(현행) | — | CSS recoil(현행) | CSS(현행) | **8포즈 시트 Cast 컷(추출·v1 하이라이트)** |
| 골렘 | 단일+breath(FINAL PASS·불변) | 04/05/09/10(현행)+**11 분노(push 이벤트 — 미연결 SAFE 후보)** | **07 HIT_STAGGER**(hp감소 스로틀 필요·기존 CAUTION) | 08(현행) | 06(현행) |
| 물정령/나가 | 단일+breath(현행) | CSS(wind glow+bImpact — 현행) | CSS | CSS dead(현행) | CSS |

### A-3. 이벤트 → pose 연결표 (전부 실제 이벤트 기반·fake 주기 재생 금지)
| 실제 이벤트(기존재) | 현행 표현 | v1 승격(pose) | 없을 때 대체 |
|---|---|---|---|
| 보스HP 실감소(outgoing) | hero-lunge CSS | 동료 Attack 컷 1회 스왑+복귀(~200ms) | CSS 유지 |
| dmg(아군 피격) | hero-hit CSS | 동료 Hit 컷(있으면) | CSS 유지 |
| 사망(alive=false) | dead 그레이스케일 | Down 컷(있으면) | CSS 유지 |
| castStart/스킬 사용 | cast-pulse/castRing | **ARIA Cast 컷**(cast형은 시전 동안·instant는 ~300ms) | CSS 유지 |
| push(골렘 분노) | #app 붉은 가장자리 | **골렘 11 ENRAGE 포즈**(hold 후 idle 복귀) | — |
| 보스 피격 | (없음) | 골렘 07(hp감소+스로틀·CAUTION) | 생략 가능 |
- 원칙: 정보 전달(예고 bar·위험 링·카드) 우선 — pose가 가리면 뺀다. 잘 나온 4~5컷만 채택해도 됨. 골렘 idle 불변.

### A-4. 구현 우선순위
P1: **ARIA Cast 컷**(사제 손맛의 얼굴·이벤트 이미 존재) + **골렘 11 ENRAGE**(push 이벤트 SAFE·미사용 자산 활용)
P2: 동료 Attack/Hit 컷(6영웅 시트 중 전/도/마 3장만 추출) · P3: Down 컷·골렘 07 · 물/나가 pose는 v1 범위 밖(CSS).

---

## B. 길드 게시판 3토벌 선택 설계
- **정보 구조(카드 3장 세로 스택)**: 보스 이미지(각 idle 추출본)·이름·한 줄 계약(hint)·**위험(risk) 태그만**(tip 제거 권장 — 정답 비공개 원칙·유키 확정)·선택 상태(테두리 강조)·[이 토벌 준비] 버튼.
- **상태**: `let selectedBoss='golem'`(세션 변수·저장 없음). 선택 → prep 화면 "상대"/보스명 갱신 → 전투 시작 시 해당 boss config로 `new Battle(..., {tuning:{boss}})`(probe와 동일 메커니즘을 상태 기반으로 승격).
- **흐름**: 결과 "다시 도전"=같은 보스 즉시 재전투 / "마을로"=게시판서 다른 토벌 선택 가능. 3보스 전부 처음부터 선택 가능(해금/보상 없음).
- **데이터**: 현행 `bossProbes.js`를 `bosses.js`급으로 승격(골렘 항목 추가=이름/이미지/태그만·수치는 TUNING 기본 사용) — 보호 파일 무접촉 유지.
- **URL ?boss=**: dev fallback으로 존치(진입 시 selectedBoss 초기 시드) — probe 검증 경로 보존.
- 마을 5시설 문법 유지: 게시판 카드가 늘어날 뿐 화면 구조/이동 문법 불변. 390px 세로 스택으로 오버플로 없음.

## C. 성소(기도소) 8→6 교체 설계
- **UI(390px)**: 상단 "장착 중 (6/6)" 그리드 2×3 + 하단 "보유 스킬" 그리드(비장착 2 포함 8종·장착된 것은 체크 표시)·각 셀=아이콘+이름(+한 줄 역할).
- **교체 방식(유키 권장 채택)**: **tap-to-swap** — 비장착 스킬 탭 → "어느 슬롯과 교체?" 모드(슬롯 6 하이라이트) → 슬롯 탭 → 스왑. 취소=바깥 탭. 드래그 금지.
- **규칙**: 정확히 6개(스왑만 가능하므로 **빈 슬롯 상태가 구조적으로 발생 불가** — 미완성 상태 이슈 제거)·중복 불가(풀↔슬롯 이동이라 구조적 불가)·전부 처음부터 해금.
- **유지**: `let LOADOUT`(현행 const→let)·세션에서만 유지(저장 없음)·재도전 유지·보스 변경에도 유지·마을에서만 변경(전투 중 불가).
- **초기 기본**: 현행 DEFAULT_LOADOUT(빠른치유/보호막/정화/구원/지속/고리).
- **전파**: 교체 시 성소 그리드·prep "기도" 아이콘·전투 스킬바 재렌더(스킬바 빌드를 함수화 — battle.js 무접촉: Battle은 이미 loadout 파라미터 수용).

---

## D. 구현 카드 로드맵 (11카드)

| # | 카드 | 목표 | 예상 변경 | 보호 기준 | 난이도 | 선행 | 회귀 위험 |
|---|---|---|---|---|---|---|---|
| 1 | ✅ 본 카드(Scope Lock & Matrix) | 범위/매트릭스/로드맵 잠금 | docs 3종 | 전부 | 低 | — | 0 |
| 2 | ✅ **Guild Board 3 Boss Selection Runtime 01** (**유키PD FINAL PASS 2026-07-11**) | 게시판 3카드+selectedBoss 상태+prep/전투 연동(?boss= dev fallback화) | index.html·bossProbes.js(승격) | 기본 골렘 흐름=기본 선택과 동일 결과·v0 문구 | 中 | 1 | 中(전투 진입 경로) |
| 3 | ✅ **Priest Skill Pool 8 & Loadout 6 Data Contract 01** (**구현 완료 2026-07-11·렌 PASS·유키PD 판정 대기** — skillPool.js+contractCheck 32/0+계약 문서) | 신규 `src/data/skillPool.js`(8종 데이터·서약/씨앗 수치 초안·breath 처지 반영)+계약 문서. 로직 없음 | 신규 파일+docs | 보호 파일 전부 | 低 | 1 | 0(미소비) |
| 4 | ✅ ★**Battle Core Skill Extension 01** (**구현 완료 2026-07-11·렌 PASS·유키PD 판정 대기**) | **battle.js 해금(유키 승인)**: vow/seed additive 구현(_resolve 분기·dealDamage 훅·step 만료·use 가드) | src/core/battle.js·tuning.js·skillPool.js·skillPoolContractCheck.js·신규 battleCoreSkillExtensionCheck.js | ★기존 로드아웃 경로 결정론 불변 증명(D1~D4)·**botSim 16/0**·probeSim ALL PASS(26)·extension 42/0·contract 34/0 | **高** | 3 | **高(전투 코어)** — 신규 상태는 신규 스킬 장착 시에만 생성되는 구조로 격리 |
| 5 | ✅ **Shrine Skill Loadout Runtime 01** (**구현 완료 2026-07-11·렌 PASS·유키PD 판정 대기**) | 성소 tap-to-swap UI+`let currentLoadout`(전투용 const LOADOUT과 분리)+swapLoadout(skillPool additive) | index.html·skillPool.js(additive)·신규 shrineLoadoutCheck.js | ★전투 skill-bar=기본 6종(격리 실증)·390px overflow 0·기본 loadout=v0 · prep 옵션A 미변경 | 中 | 3(4와 병행 가능) | 中(스킬바 재빌드) |
| 6 | ✅ **Battle Runtime Loadout Link 01** (**구현 완료 2026-07-11·렌 PASS·유키PD 판정+나라 실기 대기**) | currentLoadout→준비/스킬바/Battle snapshot 연결·구 const LOADOUT 제거·vow/seed 라이브 시전+chip | index.html·shrineLoadoutCheck.js(갱신)·신규 battleLoadoutLinkCheck.js | 재도전/보스변경 유지·기본=Demo v0 동일·전투코어 무접촉 | 低 | 5 | 低 |
| 7 | **Hero/Boss Pose Resource Audit 01** | 8포즈 시트 6종 라벨/셀 실측·Attack/Hit/Down/Cast 컷 좌표 확정(코드 0) | docs·(읽기 조사) | 원본 무수정 | 低 | — | 0 |
| 8 | **Hero Pose Extract & Battle Pose Event Link 01/02** | (a)추출 카드: ARIA Cast+전/도/마 Attack(+Hit) 컷 (b)연결 카드: A-3 표 이벤트 배선+골렘 11 ENRAGE | assets 신규·index.html | fake 재생 금지·골렘 idle 불변·정보 전달 우선 | 中 | 7 | 中(액터 src 스왑 — probe 가드 방식 재사용) |
| 9 | **Skill FX Readability Polish 01** | 정화/지속/서약/씨앗 식별 연출(미약 2종+신규 2종) | index.html CSS/JS | 산만 금지·기존 FX 문법 | 中 | 4·8 | 低 |
| 10 | **Three Boss Balance Pass 01** | probeSim 확장(신규 스킬 봇 반영 여부 판단)+3보스 게이트 재정의+수치 확정 | probeSim.js·skillPool/bossProbes 수치 | botSim 16/0·golem v0 수치 불변 | 中 | 4·6 | 中(수치) |
| 11 | **나라님 3보스 반복 실기** → **Demo v1 Completion Checklist 01** | 실기 판정 반복→완성 체크리스트 | docs | 전부 | — | 10 | — |

- 순서 근거: 데이터 계약(3) 후 엔진 해금(4)이 가장 위험하므로 격리·선행. 성소(5·6)는 4와 독립 병행 가능(기존 6종만으로도 스왑 검증 가능). pose(7·8)는 완전 독립 트랙.
- **매 카드 공통 회귀**: 기본 URL 골렘 v0 실측 + botSim 16/0 + (4 이후) probeSim ALL PASS.

### D-1. Card 6 이후 진행(실기 대만족 → Demo 완성 polish 트랙)
- ✅ **나라님 3보스+신규 스킬 실기 = 대만족**(2026-07-11·"바로 이거다·Demo 완성 후보") → Core Fun + 신규 스킬 VALIDATED.
- ✅ **Combat Clarity & Exit Polish 01** (**★유키PD FINAL PASS 2026-07-11**): vow/seed 실제 아이콘(icon_vow/seed.png) · 상시 위험 원(danger-ring) 조건화(예고 때만) · 전투 중 포기→마을 복귀 버튼/팝업. combatClarityExitCheck 26/0.
- ✅ **Battlefield Spacing Polish 01** (**유키PD FINAL PASS 2026-07-11**): 아군 3명(전사/도적/마법사) 공통 -4.5%p(+20px) 하향 → 보스와 시각 분리·나가↔도적 겹침 -20px. ARIA/보스/코어 무변경·bottom만 조정(transform 반응 충돌 0)·3보스 공통. battlefieldSpacingCheck 16/0 · docs/BATTLEFIELD_SPACING_POLISH_01.md.
- ✅ **Boss Telegraph & Attack FX Polish 01** (**유키PD FINAL PASS 2026-07-11**): 보스별 색/형태 분리(golem amber·water cyan·naga crimson+teal)·단일(danger-tgt/burst) vs 파티(stage sweep) vs 상태(bpose-root색) 구분·평소 조용·실제 event만 소비·재도전/포기/보스전환 정리. bossTelegraphAttackFxCheck 29/0.
- ✅ **Skill FX Readability Polish 01** (**구현 완료 2026-07-11·렌 PASS·유키PD 판정+나라 실기 대기**): 약한 4종 고유 형태·색(정화=흰 sweep·지속=녹금 apply·서약=아이보리 세로 veil·씨앗=심기/개화 bloom)·기존 4종 보호·ARIA 원점·보스 crimson/amber 미사용·실제 event만·정리 잔류0. skillFxReadabilityCheck 28/0 · docs/SKILL_FX_READABILITY_POLISH_01.md.
- ✅ **Skill FX Readability Polish 01 = 유키PD FINAL PASS + 나라님 실기 확정(2026-07-12·"재미의 씨앗 발아"·문답 문법 확정)**.
- ✅ **Three Boss Counterplay & Loadout Pressure Plan 01** (**분석/설계 완료 2026-07-12·렌 PASS·유키PD 판정 대기·코드 무변경**): 재미 기준선 잠금(2:07~2:25)·기본6 강세 원인 정량화(HPM 열세: 신규 22.5/15~21 vs 기존 40+)·보스별 질문/압박 후보/금지선·씨앗 cost 9 등 draft 후보. read-only `loadoutPressureProbe.js` 실측. → **최종 마감 트랙 = docs/DEMO_V1_FINAL_MILE_ROADMAP_01.md**(5카드: Plan✅→Call-Response FX Polish✅→Loadout Pressure Balance→나라 반복 실기→Completion Checklist).
- ✅ **Combat Call-and-Response FX Polish 01** (**구현 완료 2026-07-12·렌 PASS·유키/나라 대기**): 답변 FX(block/vow완화/seed bloom) ~90ms visual-only 시차(질문→충돌→답변 박자)·완전흡수 시 착탄 burst soft·코어/이벤트/state 무변경. combatCallResponseFxCheck 22/0.
- ✅ **Three Boss Loadout Pressure Balance 01** (**구현 완료 2026-07-12·렌 PASS·유키/나라 대기**): 씨앗 마나 9·water tremorDmg 132·golem 진동 19/24를 **제품 Demo v1 override**(bossProbes DEMO_V1_*·index.html newBattle)로만 적용·**tuning.js/botSim canonical 동결(md5 불변)**. 골렘 vow 마나+9/물 seed 마나+6 실측·나가 동결. balance check 19/0.
- ⏭ 다음: **나라님 3보스 × loadout 반복 실기**(추천 구성) → 필요 시 미세 롤백(물 126/골렘 21·26/씨앗 10) → **Demo v1 Completion Checklist 01**.

## E. 리스크 / HOLD 종합
1. ★battle.js 해금(Card 4) — 유키 승인 필요. 실패 시 대안: Matrix §2 대안 1(신규 1종+breath)로 축소.
2. ★breath 처지(Matrix §5-2) — Card 3 계약에 반영해야 하므로 **Card 3 전 확정 필요**.
3. 게시판 tip 태그 제거 여부 — Card 2 전 확정.
4. 신규 스킬 수치는 초안 — Card 10에서 sim 게이트로 확정.
5. probe 봇의 신규 스킬 미인지 — Card 10에서 봇 최소 확장 vs 실기 의존 판단.
6. ARIA Cast 컷 추출 품질(시트 라벨/마젠타) — Card 7 실측에서 판정.
