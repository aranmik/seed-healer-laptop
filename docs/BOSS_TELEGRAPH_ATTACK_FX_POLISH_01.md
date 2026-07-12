# Boss Telegraph & Attack FX Polish 01

작업일: 2026-07-11 · 담당: 렌(Dev) · 판정: **★유키PD FINAL PASS (2026-07-11)** · 나라님 눈맛 실기 확인
기준: BATTLEFIELD_SPACING_POLISH_01(FINAL PASS) · COMBAT_CLARITY_EXIT_POLISH_01(FINAL PASS)

## ★FINAL PASS 확정 기록 (유키PD · 2026-07-11)
- 세 보스 평상시 조용 · 실제 telegraph/attack event에서만 FX · 가짜 타이머/fake periodic 0.
- 골렘=amber/earth/무거운 충격 · 물정령=cyan/deep blue/넓고 부드러운 누수 · 나가=crimson/dark teal/좁고 빠른 처형.
- 단일/파티/상태 위협 시각 구분 · 포기/재도전/결과/보스 전환 시 FX 잔류 0.
- bossTelegraphAttackFxCheck 29/0 · 기존 전체 회귀 ALL PASS · 전투 코어/tuning/bossProbes 무변경.
- ★root/침식/출혈은 전용 사전 예고 event 없음 → resolve 중심 표시 허용(이번/이후 카드에서 root telegraph 코어 event 추가 금지).
범위: **CSS/DOM/event FX only** — 골렘/물정령/나가의 실제 telegraph·공격 순간을 보스별 색/형태로 분리. 코어/tuning/bossProbes 무변경.

## 1. 기존 telegraph/event/render 구조 (조사)
- **이벤트(battle.js·core·무변경)**: `teleSmash{unit,wind}`(단일 예고)·`smash{unit,shielded}`(단일 resolve)·`teleTremor{wind}`(파티 예고)·`tremor`(파티 resolve)·`rootOn{unit}`(상태 적용)·`auto{unit}`(평타)·`push`(분노). root 예고는 전용 event 없음(`B.tele.root` 상태를 renderTele가 표시).
- **소비**: `consume()`가 events[] splice 후 switch. `renderTele()`는 매프레임 `B.tele.{smash,tremor,root}` 상태로 예고 바/글로우 표시.
- **기존 FX**: `.bf-danger.hot`(위험 원·Combat Clarity에서 예고 때만)·`.danger-tgt`(단일 대상 glow)·`.bf-boss.wind`(예고 오오라)·`bpose-impact/tremor/root`(보스 몸 반응)·`bh-tele` 예고 바. **전부 보스-무관(색/형태 공통)**이었음 → 이번 카드가 보스별 분리.
- **보스별 이벤트 매핑(bossProbes.js 실측)**:

| 이벤트 | 골렘 | 물정령 | 나가 | 범위 |
|---|---|---|---|---|
| smash | 대지 강타(720) | ❌ 비활성(9999) | 처형 베기(850) | 단일 대상 |
| tremor | 돌진동(130) | 잔파도(120) | 해일(215) | 파티 전체 |
| root | 뿌리 속박(36) | 침식(52) | 출혈(32) | 단일 상태 |

## 2. 실제 사용 이벤트 → visual mapping
| 이벤트(실제) | 추가 FX | 단일/파티 |
|---|---|---|
| teleSmash | (renderTele) danger-tgt 보스색 glow + wind 보스색 + 위험 원 보스색 | 단일 |
| smash | `bossBurst(unit)` — 대상 actor 보스색 burst(golem amber ring·naga slash) | 단일 |
| teleTremor / (B.tele.tremor) | (renderTele) `stageFx.sfx-gather` — 파티 라인 보스색 charging | 파티 |
| tremor | `stageSweep()` — 파티 라인 1회 sweep(보스색·형태 분리) | 파티 |
| rootOn | `bpose-root` 보스색(golem green·water cyan·naga crimson) → 이후 chip이 지속 | 단일 상태 |
- ★가짜 타이머·텍스트 파싱·독립 공격 생성 없음. **전부 실제 event/tele 상태만 소비.**

## 3. 공통 FX 상태/정리 구조
- **보스 색/형태 스위치**: `selectBoss(key)`가 `battlefield`에 `bf-water`/`bf-naga` 클래스(golem=클래스 없음=기본). 모든 보스 FX 색/형태는 이 클래스 CSS로 파생 → 단일 스위치.
- **레이어**: 신규 `#stage-fx`(battlefield 내 파티 라인 sweep 레이어) + 기존 danger-ring/actor/boss 재사용.
- **helper**: `stageSweep()`(sfx-sweep 1회·900ms 자동 제거)·`bossBurst(idx)`(atk-burst 1회·460ms 자동 제거)·`clearBossFx()`(gather/sweep/burst 전부 제거).
- **정리**: `clearBossFx()`를 **newBattle(새 전투 조용 시작)·exit-village(포기)·end-village(결과→마을)**에서 호출. gather는 renderTele가 tele 상태로 매프레임 토글(예고 끝나면 자동 제거). sweep/burst는 자체 setTimeout. → DOM/class/timer 누적 0.

## 4. Earthroot Golem FX (amber/earth)
- 강타 예고: danger-tgt(대상 red glow)+wind(주황 오오라)+위험 원(red) — 기존 red-amber 유지(golem 기본).
- 강타 resolve: `bossBurst` = 대상 amber **ring** pop(radial burst) + 기존 bImpact(보스 몸 drop). 보호막 흡수 시 기존 block flash 주연.
- 돌진동(파티): stage gather(예고) → stage sweep(red-amber·width 45%·medium) + bTremor(보스 몸 shadow).
- 속박(상태): bpose-root green glow(뿌리 정체성) → chip.

## 5. Water Spirit FX (cyan/deep blue)
- 강타 **없음**(smash 비활성) → 단일 대상 burst 미발동(물정령=파티/상태 보스·의도적).
- 잔파도(파티): stage gather cyan → stage sweep **넓고 부드러운 cyan(width 62%·느림 .82s)** — 힐 초록과 명확히 구분·전체 위협 읽힘.
- 침식(상태): bpose-root **cyan**(bRootWater) → chip. 잔파도 sweep과 형태(넓은 통과 vs 보스 글로우)로 구분.
- 위험 원/wind/danger-tgt 전부 cyan. 물정령 idle(단일 IDLE_01+breathBoss) 무변경·FX가 보스 transform 안 덮음(FX는 stage 레이어/actor filter).

## 6. Naga Warrior FX (crimson + dark teal)
- 처형 베기 예고: danger-tgt **crimson** glow(대상 명확)+wind crimson+위험 원 crimson.
- 처형 resolve: `bossBurst` = 대상 **crimson slash**(얇은 대각선·8px·rotate -32°) — golem ring과 형태 분리·날카로움.
- 해일(파티): stage gather teal → stage sweep **좁고 빠르고 날카로운 teal+crimson edge(width 26%·빠름 .42s cubic-bezier)** — 물정령 잔파도(넓고 느림)와 명확히 차별.
- 출혈(상태): bpose-root **crimson**(bRootNaga) → chip. 처형 예고(crimson glow)와 출혈(crimson 보스 글로우)은 발생 위치(대상 vs 보스)로 구분.

## 7. 단일/광역/상태 위협 구분
- **단일**(smash/root): 대상 actor에만 danger-tgt glow / bossBurst. 다른 아군엔 표시 없음.
- **파티**(tremor): `#stage-fx` 파티 라인 gather/sweep(전원 대상). 단일 danger-tgt와 형태 완전 분리 → "한 명 vs 전원" 읽힘.
- **상태**(root): 공격 순간은 bpose-root 짧은 보스색 글로우, 이후 지속은 chip(🩸 등)이 담당. attack resolve 큰 FX와 상태 chip 분리.
- 스킬 대상 선택 highlight(`.tgt` 카드·금색)와 보스 위협(danger-tgt·red/cyan/crimson)은 색/위치로 구분.

## 8. 평상시 조용함 보장
- danger-ring 기본 투명(Combat Clarity 01 유지) · `#stage-fx` 기본 opacity:0 · atk-burst/sfx-* 는 실제 event/tele에서만 클래스 부여.
- 브라우저 실측: 전투 시작 시 bf 보스 클래스만 있고 sfx-*/atk-burst/hot 없음 → 조용. idle 반복 공격 FX 0·화면 전체 색 필터 0.

## 9. 기존 feedback 보호
- react-heal/react-shield/react-block(heal/shield/block)·hero-hit/hero-lunge·cast-pulse/cast-ring·support-spark·vow/seed chip·danger-tgt(재색)·selactor·shielded·dead — **전부 유지**(보스 FX는 별도 레이어/색만 추가).
- 보스 FX는 짧게 종료(sweep 900ms·burst 460ms·gather는 예고 동안만) → 아군 hit/block reaction을 가리지 않음(opacity 절제·stage-fx 얇은 밴드).

## 10. 재도전/포기/보스 전환 정리
- newBattle: `clearBossFx()` + `bossPose.reset()` → 새 전투 조용 시작(이전 보스 stage/burst 잔류 0). 브라우저 실측: sfx-gather 세팅 후 재전투 진입 → opacity 0·클래스 정리 확인.
- exit-village(포기)/end-village(결과→마을): `clearBossFx()` + showScreen('village'). 실측: 포기 시 sfx-gather/atk-burst 제거 확인.
- 보스 전환: selectBoss가 bf-water/bf-naga 재설정(golem 복귀 시 제거) → 이전 보스 색/클래스 잔류 0.

## 11. 검증 결과 (2026-07-11 실측)
| 검증 | 결과 |
|---|---|
| node --check (신규 포함 7 dev 체크) | 전부 OK |
| **bossTelegraphAttackFxCheck (신규)** | **29/0 ALL PASS** (A idle4·B telegraph5·C resolve5·D 보스별8·E cleanup4·F 회귀3) |
| battlefieldSpacingCheck | 16/0 ALL PASS |
| combatClarityExitCheck | 26/0 ALL PASS |
| skillPoolContractCheck | 34/0 · battleCoreSkillExtensionCheck 42/0 · shrineLoadoutCheck 29/0 · battleLoadoutLinkCheck 26/0 |
| botSim | 16/0 · probeSim 26 ALL PASS |
| 브라우저(5182·375px·computed style 실측) | 콘솔 error 0 · golem: bf 클래스 없음·hot red·danger-tgt red·sweep 45%(168px)·burst ring(50%) / water: bf-water·hot cyan·tgt cyan·sweep 62%(232px) / naga: bf-naga·hot crimson·tgt crimson·sweep 26%(97px)·burst slash(8px/4px) · stage-fx 기본 opacity 0 · 포기/재전투 시 FX 정리 확인 · overflow 0(375=375) · broken img 0 |

## 12. 구현하지 않은 이벤트 / 이유 (WATCH/HOLD)
- **물정령 단일 대상 큰 공격 FX 없음**: 물정령은 smash 비활성(9999) — 설계상 파티/상태 보스라 단일 처형 burst 미발동. **정상**(gap 아님).
- **root(속박/침식/출혈) 예고 전용 FX 약함**: 코어에 root telegraph event 없음(`B.tele.root` 상태만). 현재 root 예고 = renderTele의 카드 `.tgt` 하이라이트 + bh-tele 바(기존). 큰 예고 FX는 미추가(억지 가짜 연출 회피). resolve의 보스색 bpose-root + chip으로 상태 구분은 충족.
- **auto(평타) 전용 FX 없음**: 잦은 잔피해라 전용 FX 넣으면 산만 → 기존 hero-hit(피격 recoil)만. 의도적.
- **라이브 telegraph 발화 눈확인**: 프리뷰 rAF 정지(frozen-tab·이 프로젝트 상시)로 실제 telegraph/attack 순간 캡처 불가 → **class 적용 computed style + event 배선(bossTelegraphAttackFxCheck) + 색/형태 실측**으로 증빙. 실제 발화 타이밍은 botSim/core가 보장.

## 13. 나라님 실기 확인 포인트
- **골렘**: 평소 조용 → 강타 예고 때 대상+amber 위협 → 착탄 시 amber ring 무게감 / 보호막 block이 안 묻히는지.
- **물정령**: 평소 조용 → 잔파도가 **넓고 부드러운 cyan sweep**으로 "전원에게 온다" 읽히는지 / 힐 초록과 안 헷갈리는지 / 침식(cyan)과 잔파도 구분.
- **나가**: 평소 조용 → 처형 대상 crimson 명확 → 처형 착탄 **crimson slash** 날카로움 / 해일이 **좁고 빠른 teal sweep**으로 잔파도와 다르게 읽히는지 / 출혈과 처형 예고 구분.
- 공통: 세 보스가 확실히 다른 색/리듬으로 느껴지는지 · 산만하지 않은지 · 아군 반응이 안 묻히는지.

## 14. WATCH
- stage-fx z-index:3(actor 위 얇은 반투명 밴드) — 실측상 짧게(0.4~0.9s) 통과·저opacity라 actor 안 가림. 나라님 실기에서 "가림/산만" 재확인.
- naga slash burst rotate -32° 고정 — 대상 위치 무관 동일 각. 실기에서 방향 위화감 재확인.
- root 예고 FX 약함(§12) — 필요 시 후속 카드에서 core root-telegraph event 추가 검토(이번 범위 밖).

## 15. 다음 Demo v1 마감 후보 카드
- **Skill FX Readability Polish 01**: 정화/지속/vow/seed 식별력(이번엔 보스 공격 FX만).
- **Three Boss Balance Pass 01**: vow/seed draft 수치 확정·봇 신규 스킬 반영.
- **Demo v1 Completion Checklist 01**: 나라님 3보스 반복 실기 → 완성 체크리스트.

## 다음
- 유키PD 판정 + 나라님 3보스 실기(보스별 보는 맛) → 위 마감 후보 중 선택.
