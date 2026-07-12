# Demo v1 Final Micro Polish 01

작업일: 2026-07-12 · 담당: 렌(Dev) · 판정: **PASS(렌 자체)** · 유키PD 판정 대기 · 나라님 실기 대기
기준: FINAL_BATTLE_READABILITY_FINISH_POLISH_01(구현 PASS·나라 실기 방향 매우 좋음) · Demo v1 마감 직전 0.5% 초미세 폴리시
범위: A 위협 대기열 재구성(최중요) · B 전장-UI 검은 띠 정리 · C 은총 아이콘 로컬 자산 치환 · D 예고/응답/결과 FX 초미세. **★canonical(tuning.js/botSim/probeSim) 무접촉·6슬롯·3보스·selectedBoss 보호.**

## 1. 변경/신규 파일
| 파일 | 성격 | 내용 |
|---|---|---|
| `index.html` | 변경(주력) | A 위협 대기열(HTML+CSS+renderTele 재작성) · B 검은 띠 해소 CSS · C skillIcon(iconImg 경로만) · D 큐 FX |
| `src/data/skillPool.js` | 변경(1줄) | grace `iconImg` = 기존 추출 아이콘 경로 참조(신규 파일 0) |
| `src/dev/demoV1FinalMicroPolishCheck.js` | **신규** | 20체크(A 코어 데이터 4 · B 큐 배선 9 · C 레이아웃 2 · D 아이콘/FX 5) |
| **동결(무접촉)** | — | `tuning.js`(md5 `d1420e6f…`) · `botSim.js`(`798afb6a…`) · `probeSim.js`(`ce1cc507…`) · `battle.js` · `bossProbes.js` · `assets.js` |

## 2. A. 위협 대기열 재구성 (최중요)
**핵심**: 코어 `B.tele = { smash, tremor, root }`는 이미 **각 타입 최대 1개씩 = 최대 3개의 동시 telegraph**를 들고 있다. 이게 fake 없는 "독립 대기열"의 실제 데이터 소스. renderTele를 "가장 임박한 1줄"에서 **"동시에 존재하는 모든 telegraph를 독립 행으로"** 재작성.
- **구조**: `#threat-queue`(min-height 47px·border-box) → `.tq-row` 최대 3(smash/tremor/root). 각 행 = 행동명(아이콘+이름) + 대상(전사/전원 등) + 진행 게이지(1−rem/wind) + 남은 시간. 임박 순(위=가장 곧) 정렬.
- **독립 존재/진행/해결**: 각 행은 type별 persistent DOM(`threatRows[k]`). 매프레임 활성 telegraph만 upsert. **활성이던 telegraph가 사라진 행만 `tqResolve(k)`** → 그 행만 "해결 표시(🛡 막아냄 / ⚔ 직격 / 💥 발동 / 🩸 물림) 후 550ms 자연 퇴장" · **나머지 행은 그대로 유지**.
- **차단/무효화 개별 표시**: 대상에 보호막이 있는 smash 행은 즉시 `safe`(초록 테두리·"대비 완료") → resolve 시 "🛡 막아냄"으로 퇴장. 다른 위협 행은 독립적으로 카운트 유지.
- **fake 예고 0**: 오직 `B.tele`(코어가 실제로 예약한 telegraph)만 소스. push 상태(`B.boss.push`)일 때만 idle에 보스별 push 문구.
- **역할 분리 유지**: 위협 대기열 = 앞으로 올 것 / `#combat-feed` = 방금 해결된 것(Final Readability 01 그대로).
- **A3 보스명**: `threatLabels()`가 selectedBoss별 어휘(골렘 대지 강타/돌진동/뿌리 속박 · 물 강타/잔파도/침식 · 나가 처형 베기/해일/출혈). 골렘 어휘 잔류 0.
- **전장 들썩임 방지**: min-height 47px(=2행 border-box)로 **0/1/2행 전장 높이 불변(413px·jitter 0)**. 3행 동시(희귀 peak)만 +25px 확장(WATCH).
- **기존 보스 FX 부수효과 보존**: `sfx-gather=!!B.tele.tremor` · `dangerRing hot` add/remove · `danger-tgt`/`safe-tgt`/카드 `tgt`/`tgt-safe` 전부 유지(bossTelegraph/clarity 체크 통과).

## 3. B. 전장-UI 검은 띠 정리
- **원인 실측**: 전장(#241b12)과 하단 command 사이 cast-bar 예약 슬롯(22px·평소 opacity:0)이 **#app 바탕(#171009=near-black)을 드러내** 검은 띠로 읽힘.
- **해소(구조/배우 위치 무변경)**: ① `#scr-battle{background:var(--night)}` → 예약 슬롯이 전장 톤(#241b12)으로 이어짐(검은 띠 → 전장 연장). ② `.battlefield::after` 하단 apron gradient(70px·transparent→rgba(16,10,4,.62))로 배우 발밑을 바닥 그림자처럼 눌러 command 패널로 자연 연결.
- **보호**: 배우 bottom% 무변경(spacing contract 유지·"다시 크게 내림" 없음) · UI 터치 영역·party 카드·390 overflow 0 유지. apron z-index:2(배우 발 ~97px보다 낮은 70px대·미가림·stage-fx z3 sweep 위).
- 상단 정보영역은 위협 대기열 min-height 예약으로 **정돈된 여백** 확보(idle 시 큐 47px·중앙 정렬).

## 4. C. 은총 아이콘 로컬 자산 치환
- **선택**: `visual_assets/icons/extracted/icon_breath_candidate_v001.png`(금빛 신성 고리+회전 십자가·422×437). 이유: ①이미 추출된 로컬 자산(신규 파일 생성 0) ②SET_A 프레임=기존 8종과 결 일치 ③금빛 신성=은총 골드 FX와 조화·"축복/은혜/신성 보조" 부합 ④breath는 dormant(Demo v1 풀 밖)라 아이콘 재사용 충돌 0.
- **적용**: skillPool grace `iconImg` 추가(iconChar '🙏'는 최후 폴백 유지). skillIcon()이 iconImg→`<img>` 렌더(vow/seed와 동일 경로) → 성소·전투 스킬바·UI 전 구간 일관.
- **후보 비교**: 天使 기도손(HOLY_SUPPORT sheet cell3)이 개념상 최적이나 미추출(마젠타)+파란 프레임(8종과 결 불일치)+추출=신규 파일 → "새 파일 생성 금지"로 제외. icon_extra(잎+씨앗)는 seed와 충돌 → 제외.

## 5. D. 예고/응답/결과 FX 초미세 강조 (한 단계만)
- C6(Final Readability 01)에서 전장 FX를 이미 크게 과장 → 이번엔 **전장 FX 미증폭**(과다 뒤덮기 금지). 강조는 **위협 대기열 안에서만**:
  - 예고감: 위험 행(비-safe·비-resolved)에 은은한 붉은 맥동(`tqPulse`·box-shadow 7px·1.15s) — 다가오는 질문. **행은 telegraph 중에만 존재 → 평소 조용 보장**. safe 행은 초록 정적 glow.
  - 결과감: 해결 행 결과 문구(막아냄/직격/발동)에 pop(`tqResPop`·scale .82→1.1→1).
- 은총 무료 발동·씨앗 개화·보호막 block 등 답변/결과 강조는 Final Readability 01 값 유지(추가 증폭 없음).

## 6. 검증 결과 (2026-07-12)
| 검증 | 결과 |
|---|---|
| **demoV1FinalMicroPolishCheck (신규)** | **20/0 ALL PASS** (A 코어 데이터 4[★최대 3 telegraph 동시·개별 해결·fake 0] · B 큐 배선 9 · C 레이아웃 2 · D 아이콘/FX 5) |
| botSim | **16/0** · probeSim **ALL PASS** |
| finalBattleReadabilityCheck 42/0 · bossTelegraphAttackFxCheck 29/0 · combatClarityExitCheck 26/0 | 전부 유지(renderTele 재작성 후에도 부수효과 보존) |
| skillPoolContractCheck 39/0 · battleCoreSkillExtensionCheck 42/0 · combatCallResponseFxCheck 22/0 · skillFxReadabilityCheck 28/0 · battlefieldSpacingCheck 16/0 · shrineLoadoutCheck 29/0 · battleLoadoutLinkCheck 26/0 · threeBossLoadoutPressureBalanceCheck 19/0 |
| ★동결 md5 | tuning.js `d1420e6f…` · botSim.js `798afb6a…` · probeSim.js `ce1cc507…` 전부 불변 |
| 브라우저(5181·390px·DOM/computed) | 콘솔 warn/error **0** · overflow **0**(3보스) · broken img **0** · **큐 들썩임 0(0/1/2행 전장 413px 불변)·3행만 +25(희귀)** · 큐 3행 stacked/게이지/safe(초록)·danger(맥동) 구분 · 검은 띠 해소(슬롯 bg #241b12=전장 톤) · **은총 아이콘 img 로드**(성소·전투 스킬바·"무료" pill) · 3보스 골렘 문구 0 · idle "다음 위협 대기" |
- ★frozen-tab(프리뷰 rAF 정지·tickLive=false): 라이브 telegraph 발생/큐 행 등장·퇴장은 캡처 불가 → **코어 step 직접 구동(최대 3 telegraph 동시·개별 해결 4체크) + 큐 로직/부수효과 정적 배선(9) + 주입 행 DOM/geometry 실측(stacked·jitter 0·overflow 0) + 아이콘 img 실로드**로 증빙. 실제 발화 손맛은 나라님 실기가 정본.

## 7. 보호/정본 유지
- canonical tuning.js/botSim.js/probeSim.js md5 불변 · battle.js/bossProbes.js/assets.js 무접촉.
- 3보스 수치·seed 제품9/canonical12 분리 · 6슬롯 구조 · 고정 파티 · selectedBoss/displayName 매핑 · shrine loadout · 전투 포기 UX · boss 진입 흐름 · 기존 FX 문법 전부 유지.
- 배우 spacing contract 무변경(B는 색/그림자만) · 기존 완료 카드 회귀 0.

## 8. WATCH (2)
- ★**3개 telegraph 동시(희귀 peak)**: 큐가 47→72px로 확장되어 전장 −25px 순간 축소(배우 ~11px 상향). 0/1/2행은 들썩임 0. 3-동시는 골렘/나가에서만 가끔·고긴장 순간이라 허용. 나라 실기서 거슬리면 3행째 압축(row height flex) 후속.
- ★**은총 아이콘 경로**: 런타임이 `visual_assets/`(마스터/스테이징 영역)를 직접 참조(기존 8종은 `assets/icons/`). 로드 정상·신규 파일 0이지만, 유키PD가 런타임 자산은 `assets/icons/`에 두길 원하면 복사 이동 1회(후속 미세). breath 아이콘 ↔ ring(고리) 금빛 원형 계열이라 둘 다 장착 시 근접 — 실기서 혼동 재확인.

## 9. 나라님 실기 확인 포인트
- **위협 대기열**: 물/골렘/나가에서 앞으로 올 위협이 **1~3줄로 줄 서서** 보이는지 · 각 줄이 독립 게이지로 차오르는지 · 한 위협을 보호막으로 막으면 **그 줄만 "막아냄"으로 빠지고 나머지 줄은 유지**되는지 · "질문이 줄 서 있다"는 감각이 드는지.
- **검은 띠**: 전장과 하단 스킬 사이 검은 단절이 줄고, 전장이 command 쪽으로 자연스럽게 이어지는지.
- **은총 아이콘**: 성소/스킬바에서 은총이 이모지 대신 그림 아이콘으로 다른 스킬들과 자연스럽게 녹는지.
- **FX**: 위협 줄의 다가오는 맥동/막았을 때 pop이 "예고→결과"를 더 또렷하게 하는지 · 전장이 과하게 시끄럽지 않은지.

## 10. Demo v1 Completion Checklist 진입 의견
- **진입 가능**. A(최중요) 완결·B/C/D 마감·전체 회귀 ALL PASS·canonical 동결. 남은 것 = 나라님 실기(위협 대기열 줄서는 감각·검은 띠·은총 아이콘 조화) 확인 → 미세 조정(WATCH 2건) 판단 → **Demo v1 Completion Checklist 01**.

## 다음
- 유키PD 판정 → 나라님 3보스 실기 → 필요 시 WATCH 2건 미세 → Demo v1 Completion Checklist 01.
