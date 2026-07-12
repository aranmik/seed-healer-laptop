# Priest Skill Pool 8 & Loadout 6 Data Contract 01

작업일: 2026-07-11 · 담당: 렌(Dev) · 판정: **★유키PD FINAL PASS (2026-07-11)**
기준: DEMO_V1_SCOPE_LOCK_01(FINAL PASS) · BOSS_SKILL_ANSWER_MATRIX_01(FINAL PASS) ·
DEMO_V1_IMPLEMENTATION_ROADMAP_01 Card 3 · tuning.js/battle.js/index.html **읽기 조사**(수정 0)

## ★FINAL PASS 확정 기록 (유키PD · 2026-07-11)
- src/data/skillPool.js에 Demo v1 스킬 8종 catalog 생성 · 기본 loadout 기존 6종 유지 · 정확히 6/중복/unknown/breath 불가 계약.
- 기존 6종 implemented:true · 신규 2종은 계약 시점 implemented:false(→ Card 4에서 true 전환·§9 참조).
- breath는 Demo v1 풀 밖 dormant 보존 · 제품 Runtime import 0 · Demo v0 영향 없음.
- skillPoolContractCheck ALL PASS · botSim 16/0 · probeSim ALL PASS · 보호 파일/제품 Runtime 무변경.
- ★문서 정합 WATCH(유키 지시): probeSim 체크 수는 과거 숫자를 복사하지 말고 **현재 스크립트 실제 출력**을 정본 기록.
  현재 실측 = **26 checks ALL PASS**(과거 보고 27은 오기).

이번 카드 = **데이터 계약만**. 신규 스킬 전투 로직·성소 UI·스킬바 연결·밸런싱·FX·제품 화면 변경은 전부 범위 밖.
skillPool.js는 이 시점에 **어떤 제품 Runtime도 소비하지 않는다**(미연결 계약 단계 · Card 5/6에서 연결).

## 1. Demo v1 사제 스킬 8종 (풀 잠금)

| # | id | 이름 | UI 짧은 이름 | type | 대상 | 상태 |
|---|---|---|---|---|---|---|
| 1 | quickheal | 빠른 치유 | 빠른치유 | active·cast 1.2s | ally | 구현됨 |
| 2 | shield | 보호막 | 보호막 | active·instant | ally | 구현됨 |
| 3 | cleanse | 정화 | 정화 | active·instant | conditional(디버프 필요) | 구현됨 |
| 4 | salvation | 구원의 기도 | 구원 | active·instant | self(사제 전용) | 구현됨 |
| 5 | hot | 지속 회복 | 지속 | active·instant | ally | 구현됨 |
| 6 | ring | 빛의 고리 | 고리 | active·instant | party | 구현됨 |
| 7 | **vow** | **수호의 서약** | 서약 | active·instant(예정) | ally | **미구현(pending·Card 4)** |
| 8 | **seed** | **기도 씨앗** | 씨앗 | active·instant(예정) | ally | **미구현(pending·Card 4)** |

- 정확히 8종 = 기존 6 + 수호의 서약 + 기도 씨앗. breath는 풀 밖(§4).
- 8종 전부 `demoV1Enabled:true` · 처음부터 사용 가능 · 해금/강화 없음(Scope Lock).
- uiOrder 1~6 = 현행 전투 스킬바 슬롯 순서와 동일 · 7~8 = 신규(성소 목록 말미).

## 2. 기존 6스킬 실제 Runtime 연결 (실측 · 2026-07-11)

수치의 **정본은 TUNING.skills**(tuning.js) — skillPool.js의 수치는 사본 스냅샷이며
`skillPoolContractCheck.js`가 매 실행 시 정본과 대조한다(어긋나면 FAIL).

| id | Runtime sid | 스킬바 슬롯 | battle.js 분기 | tuning 키 | 대상 규칙(실제) | 수치 | 마나/쿨/시전 | FX 연결(index.html) |
|---|---|---|---|---|---|---|---|---|
| quickheal | `quickheal` (동일) | 1 | use()→cast 예약→`_resolve` quickheal | `TUNING.skills.quickheal` | sel 대상 ally·생존 필요 | heal 400 | 10 / — / 1.2s | heal 이벤트→float+react-heal+supportSpark(사제 기점)+cast-pulse |
| shield | `shield` | 2 | `_resolve` shield + use() lock 가드 + dealDamage 흡수 + step 만료 | `TUNING.skills.shield` | sel 대상 ally·**유지 중 재적용 거부** | absorb 360·20s | 12 / — / 즉시 | shieldOn→shielded 클래스·react-shield / absorb→react-block / shieldBreak·Fade |
| cleanse | `cleanse` | 3 | `_resolve` cleanse + use() 디버프 조건 가드 | `TUNING.skills.cleanse` | sel 대상 ally·**root 상태 필요**("제거할 디버프가 없습니다") | 속박 제거 | 7 / 2s / 즉시 | cleansed 이벤트 — **전용 FX 케이스 없음(로그/칩 갱신만) ★식별력 약함** |
| salvation | `salvation` | 4 | `_resolve` salvation + use() selfOnly→ti=0 강제 | `TUNING.skills.salvation` | **사제 자신만**(selfOnly) | 결손 75%+100 | 16 / 18s / 즉시 | salvation 이벤트→float "기도"(+heal 이벤트 공통) |
| hot | `hot` | 5 | `_resolve` hot + step (3) HoT 1s 틱 | `TUNING.skills.hot` | sel 대상 ally | 40/s·12s | 11 / — / 즉시 | hotOn 이벤트 — **전용 FX 케이스 없음** · 틱 heal 40은 float만(PULSE_MIN 미만) ★식별력 약함 |
| ring | `ring` | 6 | `_resolve` ring(생존 전원 heal) | `TUNING.skills.ring` | 파티 전체(사제 포함) | 160 전체 | 15 / 6s / 즉시 | ring 이벤트→float "✦ 고리"+cast-ring(사제 outward pulse)·대상 glow는 react-heal |

- 아이콘: 6종 전부 PNG 연결됨(`ASSETS.icons` · hot→`renew` 키 — assets.js `skillIconKey`가 명칭 차이 흡수).
- 공통 시전 규칙(battle.js use): 전투 종료/빈 슬롯/패시브/시전 중/GCD 1.0s/쿨/마나/대상 사망 거부 → reject 이벤트.
  cast형은 **완료 시 마나 소비**(취소·무산=시간 손실만).
- ★기존 Runtime ID·순서·수치 일절 변경 없음 — catalog가 기존 Runtime을 **설명/참조**만 한다.

## 3. 신규 2스킬 데이터 계약 (구현 전 · Card 4 대상)

### A. 수호의 서약 (id: `vow`)
- **정의**: 단일 아군 대상 · 받는 피해 **-40%** · 지속 **8초**. 마나 13 / 쿨 12s / 즉시(초안 — Matrix §2).
- **보호막과 차이**: 보호막=총량 흡수(작은 피해에도 소모·1회성 벽) vs 서약=**비율 감소**(큰 한 방일수록 이득·시간 창).
  골렘 강타 720·나가 처형 850에서 최대 가치, 물정령 잔파도류에는 이득 작음 → 역할 분리 성립. 중복 장착(이중 방벽) 허용 방향.
- **필요한 battle.js hook**(Card 4): `_resolve` 분기(vow 상태 부여) + `dealDamage`에 감소 곱 1곳(기존 경로 no-op 보장) + `step` 시간 만료.
- **상태 지속 방식**: `this.vow = { [unitIdx]: { mul: 0.6, left: 8 } }`류 — shield/hot과 같은 유닛 인덱스 맵. 사망 시 제거.
- **UI/FX 식별 방향**: 보호막(파랑 계열 glow)과 구별되는 색/형태 필요 — Card 9(Skill FX Readability Polish)에서 확정.
- **예상 tuning key**: `TUNING.skills.vow` `{ type:'instant', dmgTakenMul:0.6, dur:8, cost:13, cd:12, target:'ally' }` (Card 4에서 추가).
- roleTags: damage-reduction · preventive · single-target. `implemented:false` · `demoV1Enabled:true` · 기본 미장착.

### B. 기도 씨앗 (id: `seed`)
- **정의**: 단일 아군 대상 · 지속 **15초** · **피격 시마다 90 치유** · **충전 3회**(소진 시 제거). 마나 12 / 쿨 6s / 즉시(초안 — Matrix §2).
- **지속(hot)과 차이**: hot=시간 기반 일정 회복(맞든 안 맞든) vs 씨앗=**실제 피격 시에만** 반응(충전제) —
  "언제 맞을지"를 읽고 붙이는 예측 스킬. 물정령 잔파도(주기 전원 피격)·나가 처형 대비 선부착에서 가치.
- **필요한 damage hook**(Card 4): `dealDamage` 말미(HP 감소 확정 후) 반응 치유 1곳 — 치유는 피해를 유발하지 않으므로 무한루프 없음.
- **charge 소모 방식**: 피해 적용(a>0) 1회당 charge 1 소모·90 heal → charge 0 또는 15s 경과 시 제거.
  흡수로 피해 0이 된 경우(보호막 선흡수) charge 소모 여부는 Card 4에서 확정(초안: **실피해 있을 때만** 소모).
- **UI/FX 식별 방향**: 피격 순간 반응이 보여야 함(대상 위 씨앗 칩+반응 팝) — Card 9에서 확정.
- **예상 tuning key**: `TUNING.skills.seed` `{ type:'instant', healPerHit:90, charges:3, dur:15, cost:12, cd:6, target:'ally' }` (Card 4에서 추가).
- roleTags: reactive-heal · triggered-heal · single-target. `implemented:false` · `demoV1Enabled:true` · 기본 미장착.

공통: 두 스킬 모두 `currentRuntimeId:null` · `effect.draft:true`(수치는 Balance Pass Card 10 게이트 전까지 초안) ·
`iconAssetKey:null`(이미지 리소스 없음 — 신규 생성 금지 · 이모지 placeholder 🕊️/🌱 · 실제 표기는 성소 UI 카드에서 판단).
**실제 구현된 것처럼 표시하지 않는다** — implemented:false가 계약 검증으로 강제됨.

## 4. breath(깊은 호흡) dormant 결정 (유키PD 확정)
- 삭제 금지 · 기존 구현 보존: `TUNING.skills.breath`(passive) · `priest.breathBonus 0.8` · battle.js `this.breath` 경로 **무접촉**.
- Demo v1 풀 8종에서 제외 — catalog에 **없음**. UI/성소/장착 목록 비노출.
- `DORMANT_SKILL_IDS = ['breath']` — validateLoadout이 장착을 **명시 거부**.
- 후속 확장 씨앗으로 dormant 유지(Matrix §5-2 (a)안).

## 5. 기본 loadout 6종 (Demo v0 동일)
- `DEFAULT_LOADOUT_IDS = ['quickheal','shield','cleanse','salvation','hot','ring']` — tuning.js `DEFAULT_LOADOUT`과 동일(검증으로 강제).
- 기본 미장착 = vow·seed. `defaultEquipped` 플래그가 목록과 일치(검증).
- 원칙: 정확히 6 · 중복 불가 · 빈 슬롯 불가 · 8중6 · 순서 보존 · 세션 중 변경 예정(성소·Card 5) ·
  저장 없음 · 재도전 시 유지 예정 · **보스 변경 시 자동 교체 금지**.

## 6. loadout 검증 규칙 (validateLoadout)
`validateLoadout(ids) → { ok, errors[] }` — 순수 함수 · 입력 불변 · 순서 보존 · DOM/전투 상태 접근 0.
1. 배열이어야 함 2. 길이 정확히 6 3. 중복 없음 4. dormant(breath) 불가 5. unknown ID 불가 6. 전원 demoV1Enabled.
- 미구현 2종(vow/seed)은 **catalog상 장착 후보로 통과**(성소 설계상 후보) — 단 제품 UI/Runtime 미연결이므로
  실제 장착 노출은 Card 4(로직)+Card 5(성소 UI) 이후.

helper 6종(전부 순수): `getSkillById` · `validateLoadout` · `createDefaultLoadout`(사본 반환) ·
`isDemoV1Skill` · `getEquippableSkills`(8종 uiOrder 순) · `getUnequippedSkills(loadout)`.

## 7. 성소 Runtime 예상 API (Card 5 — 본 카드 미구현)
- `let LOADOUT = createDefaultLoadout()` (index.html 현행 const→let 승격).
- 성소 화면: `getEquippableSkills()`로 8종 목록 → 장착 2×3 그리드 + 보유 목록(tap-to-swap · Roadmap §C).
- 스왑 시 `validateLoadout(next)` 통과분만 반영 → 성소 그리드/prep 아이콘/스킬바 재렌더(재렌더 함수화).
- 스왑만 허용하므로 빈 슬롯/중복이 구조적으로 발생 불가 — validateLoadout은 최후 방어선.

## 8. Battle Loadout Link 예상 API (Card 6 — 본 카드 미구현)
- `new Battle(PARTY, LOADOUT, …)` — Battle은 이미 loadoutIds 파라미터 수용(battle.js 무접촉 가능).
- 재도전 = 같은 LOADOUT 유지 · 보스 변경 = LOADOUT 유지(자동 교체 금지) · 세션에서만 유지(저장 없음).
- 스킬바 빌드가 LOADOUT을 읽도록 함수화(현행 DEFAULT_LOADOUT 고정 참조 해제).

## 9. 신규 스킬 구현 전/후 상태 구분
| 구분 | 지금(본 카드) | Card 4 이후 |
|---|---|---|
| implemented | false | true |
| currentRuntimeId | null | 'vow' / 'seed' |
| tuningKey | 예상 위치 표기 | `TUNING.skills.vow/seed` 실존 |
| effect.draft | true | Balance Pass(Card 10) 확정 시 제거 |
| 전투 사용 | 불가(로직 없음) | 가능 |
- 전환 시 contractCheck의 "신규 2종 implemented:false" 검증은 Card 4에서 갱신한다(의도된 계약 변경).
- **★Card 4(Battle Core Skill Extension 01) 완료 — 현재는 "Card 4 이후" 상태**: vow/seed implemented:true·currentRuntimeId='vow'/'seed'·
  TUNING.skills.vow/seed 실존·effect.draft:true 유지(밸런스 초안). 상세 = docs/BATTLE_CORE_SKILL_EXTENSION_01.md.

## 10. 보호해야 할 Demo v0 기준
- 기본 URL = 골렘 Demo v0 원문(HP 9,600·breathBoss·전조 원문·스킬바 6종 순서).
- 기존 6스킬 Runtime ID/순서/수치/대상 규칙/FX 불변 — catalog는 설명·참조만.
- 보호 파일 10종(index.html·battle.js·botSim.js·tuning.js·src/core/battle.js·src/dev/botSim.js·src/data/tuning.js·src/ui/assets.js·src/data/bossProbes.js·src/dev/probeSim.js) 무수정.
- 회귀 게이트: botSim 16/0 · probeSim ALL PASS 유지.

## 11. Battle Core Skill Extension 01 (Card 4) 진입 조건
1. 본 계약 문서 유키PD FINAL PASS.
2. battle.js 해금은 **Card 4 전용 카드에서만**(유키PD 승인 조건 유지) — 허용 목적: vow/seed 구현 한정.
3. 금지 유지: 기존 6스킬 동작/타겟팅 변경·보스 패턴·승패 판정·대규모 리팩터링·unrelated cleanup.
4. 격리 전략: 신규 상태(vow/seed 맵)는 **신규 스킬 장착 시에만 생성** — 기존 로드아웃 경로 byte-동작 불변 증명.
5. 필수 회귀: botSim 16 PASS/0 FAIL · probeSim ALL PASS · skillPoolContractCheck ALL PASS(implemented 갱신 반영판).

## 검증 (2026-07-11 실측)
- `node --check` skillPool.js/skillPoolContractCheck.js 통과.
- `node src/dev/skillPoolContractCheck.js` → **32 PASS / 0 FAIL — ALL PASS**
  (catalog 8종·ID/uiOrder 중복 없음·기존 6 implemented·신규 2 pending·breath dormant·tuning 정본 대조·
   기본 6=Demo v0·중복/5개/7개/unknown/breath/비배열 거부·helper 6종·입력 불변).
- `node src/dev/botSim.js` → 16 PASS / 0 FAIL · `node src/dev/probeSim.js` → ALL PASS(26체크).
- 보호 파일 10종 mtime 무변동 · skillPool.js는 어떤 제품 코드도 import하지 않음(역방향 소비 0 — 기본 URL Demo v0 영향 0).
- skillPool.js 단독 import 부작용 0(순수 데이터·contractCheck가 import만으로 구동됨을 겸증명).

## 리스크 / WATCH
- 신규 2종 수치(서약 -40%/8s/13/12s · 씨앗 90×3/15s/12/6s)는 **초안** — Card 10 sim 게이트로 확정.
- 씨앗의 "보호막 전량 흡수 시 charge 소모 여부"는 Card 4에서 확정 필요(초안: 실피해 시만 소모).
- 신규 2종 아이콘 이미지 없음(신규 생성 금지) — 이모지 placeholder. 성소 UI 카드에서 표기 확정.
- probeSim 체크 수는 실측 26(인수인계 표기 27과 1 차이 — 판정문 "ALL PASS" 동일·기능 차이 없음).

## 다음
- 유키PD 판정 → **Battle Core Skill Extension 01(Card 4·battle.js 해금)** 착수 가능(§11 조건 충족).
- Card 5(Shrine Loadout UI)·Card 7(Pose Audit)은 병행 가능 트랙.
