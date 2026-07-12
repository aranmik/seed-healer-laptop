# Combat Call-and-Response FX Polish 01

작업일: 2026-07-12 · 담당: 렌(Dev) · 판정: **★유키PD FINAL PASS (2026-07-12)**
기준: COMBAT_CALL_RESPONSE_FX_PLAN_01(유키 확정) · 나라님 문답 문법("보스가 질문→읽는다→ARIA가 답한다→FX로 충돌→HP/마나 결과")

## ★FINAL PASS 확정 기록 (유키PD · 2026-07-12)
- 실제 전투 계산/state/event 순서 불변 · 보스 공격 FX 0ms · block/vow완화/seed bloom 답변 FX 90ms · 질문→답 시각 박자 분리.
- 완전 흡수 시 공격 사실 유지하되 착탄 완화(soft)·block flash 주연 · timer/FX 정리 경로 확보.
- combatCallResponseFxCheck 22/0 · 기존 전체 회귀 ALL PASS · battle.js/tuning.js/bossProbes/봇 무변경.
- ★비차단 WATCH: RESP_DELAY 90ms 체감은 나라님 반복 실기에서 확인 · Balance 카드에서 이 값 변경 금지(유지).
범위: **index.html visual-only** — 질문 FX(보스 착탄/sweep)와 답변 FX(block/vow완화/seed개화)가 같은 순간 뭉개지지 않게 **transient CSS class 시작만 ~90ms 시차**. ★게임 계산/state/이벤트 순서 무변경 · 신규 FX 0.

## 1. 기존 event/consume 순서 조사
- **코어 발행 순서(battle.js dealDamage·무변경 확인)**: (tank 감쇄→vow 감쇄→) `absorb`(흡수>0) → `dmg`(HP피해>0) → `death` → seed 훅 `seedProc`+`heal`. 보스 `smash`/`tremor`는 dealDamage **호출 前** 발행.
- 따라서 한 tick의 events[] = `[smash, absorb?, dmg?, seedProc?, heal?]`(순서 고정) — consume()이 이 순서로 처리.
- **문제**: consume이 같은 프레임에 `smash`(bossBurst=질문)와 `absorb`(react-block=답변)/`dmg`(sk-vow-mit)/`seedProc`(sk-bloom)를 동시 재생 → 질문/답 FX가 겹쳐 뭉개짐.

## 2. visual-only 시차 적용 방식
- 신규 `RESP_DELAY = 90`(ms·70~120 범위) + `afterFx(fn)`=`fxTimers.push(setTimeout(fn, RESP_DELAY))` + `clearFxTimers()`.
- **지연 대상(답변 반응 FX만)**: `absorb`→react-block · `dmg`+vow활성→sk-vow-mit · `seedProc`→sk-bloom. → 질문 착탄(0ms) 뒤 ~90ms에 답변이 이어져 "질문→충돌→답변" 박자.
- **즉시 유지(질문/충돌/결과)**: bossBurst·stageSweep(질문) · hero-hit(피격 recoil=충돌 순간) · floatText 수치(결과) · 실제 HP감소/shield흡수/heal적용(코어·즉시).
- ★코어(battle.js) **무변경**(md5 동일) — 계산/숫자/이벤트/state 전부 즉시. 오직 index.html의 CSS class 부여 시점만 지연.

## 3. 골렘 문답 개선
- 강타 착탄: amber burst(질문·0ms) → block flash 또는 ivory vow-mit(답변·90ms). burst가 block을 덮지 않음.
- vow-mit는 이미 약함(.26s·저opacity) → block flash가 주연·서약 완화는 약하게(계약 유지).
- 진동: stage sweep(질문) → 씨앗 있으면 bloom(답변·90ms). 고리는 플레이어 입력이라 자동 연결/지연 없음(그대로).

## 4. 물정령 문답 개선
- 잔파도: cyan sweep(질문) 지나간 뒤 → green seed bloom(답변·90ms)이 "짧게 뒤따르는" 느낌. cyan/green 색 분리 + 90ms 시차로 한 덩어리 방지.
- 씨앗 없는 대상엔 bloom 없음(seedProc event가 없음·코어 보장) · 보호막 전량 흡수 시 bloom 없음(seedProc은 실 HP피해 hpDmg≥1에만 발행).
- 침식 적용(bpose-root cyan)과 정화(sk-cleanse white sweep)는 서로 다른 event·색·형태 — 기존 유지(정화는 회복 아님).

## 5. 나가 문답 개선
- 처형: crimson slash(질문·0ms) → block/vow-mit(답변·90ms). slash가 먼저 읽히고 방어가 뒤따름.
- 해일: 좁고 빠른 teal sweep(질문) → bloom/후속 대응. 물정령 잔파도보다 빠른 리듬 유지(sweep .42s).
- 구원(selfOnly)은 플레이어가 이후 직접 사용 — 자동 연결 없음.

## 6. 완전 흡수 처리 (§9 구현)
- 감지: `smash` event의 `e.shielded`(예고 시 방어막 존재) && **같은 프레임에 `dmg{동일 unit}` event 없음** = 전량 흡수. (evs 배열 look-ahead — 확실히 구분 가능하므로 구현.)
- 처리: `actorEls[unit].classList.toggle('atk-soft', 전량흡수)` → CSS `.atk-burst.atk-soft::before{filter:opacity(.42)}`로 착탄 burst 약화(제거 아님·실제 공격 사실은 유지) → block flash가 주연.
- bossBurst 원형(`bossBurst(idx)`) 유지 — atk-soft는 smash 케이스에서 분리 관리(기존 bossTelegraph 체크 보존).

## 7. 게임 state/계산 불변 확인
- src/core/battle.js **md5 동일**(대조 OK) · setTimeout/rAF 0(계산 지연 없음) · absorb→dmg 발행 순서 불변 · HP감소/shield흡수/heal 즉시.
- afterFx는 index.html에서 **visual 함수(pulseActor/skillMark)만** 래핑 — use()/heal/dealDamage/숫자/로그/chip 지연 0.

## 8. timer/FX 잔류 방지
- `clearFxTimers()`(지연 setTimeout 전부 clear) + `clearBossFx()`(atk-burst·atk-soft) + `clearSkillFx()`(.skfx)를 **newBattle·exit-village·end-village**에서 함께 호출.
- afterFx의 skillMark/pulseActor는 자체적으로 `cur==='battle'` 가드 + ms 후 자동 제거 → 지연 중 이탈해도 노드 미생성/누적 0.
- 브라우저 실측: atk-burst+atk-soft 세팅 후 포기→마을 = 둘 다 제거·village 활성.

## 9. 검증 결과 (2026-07-12 실측)
| 검증 | 결과 |
|---|---|
| node --check | OK |
| **combatCallResponseFxCheck (신규)** | **22/0 ALL PASS** (A 코어 불변3·B 시차7·C soft4·D bloom조건2·E 정리3·F 회귀3) |
| skillFxReadabilityCheck | **28/0**(회귀 복원) · bossTelegraphAttackFxCheck **29/0**(회귀 복원) |
| battlefieldSpacing 16/0 · combatClarityExit 26/0 · skillPoolContract 34/0 · coreExtension 42/0 · shrineLoadout 29/0 · loadoutLink 26/0 |
| botSim 16/0 · probeSim 26 ALL PASS |
| 보호 8파일 md5 대조 | index.html만 변경(허용)·나머지 7종(battle/tuning/skillPool/bossProbes/botSim/probeSim/assets) 무변동 |
| 브라우저(5182·375·computed style) | 콘솔 error 0 · atk-soft ::before filter opacity(0.42)·burst gradient/ring 유지 · react-block 정의 유지 · 포기 시 atk-burst/atk-soft 제거 · overflow 0(375=375)·broken 0 |
- ★frozen-tab: 라이브 smash→block 시차(rAF consume)는 캡처 불가 → **afterFx 배선(체크)+atk-soft computed style+정리 경로+코어 md5 불변**으로 증빙(실제 90ms 순서는 core/실기 보장).

## 10. HOLD / WATCH
- ★**착탄 시차 90ms 실기 미검증**(frozen-tab): 나라님 포그라운드 실기에서 "질문→답 박자"가 자연스러운지·너무 늦지 않은지 최종 확인. 필요 시 70~120 범위 내 조정(1값).
- 보호막+서약 동시 부분흡수 시 block(90ms)+vow-mit(90ms) 동시각 가능 — vow-mit이 이미 약해(.26s) 경쟁 안 함(과겹침 시 vow-mit만 소폭 추가 지연 후보·이번 미적용).
- 완전 흡수 감지는 evs look-ahead(같은 프레임 dmg 부재) — 코어 이벤트로 확실히 구분됨(구현·WATCH 아님).

## 11. 나라님 실기 확인 포인트
- 골렘 강타: amber 착탄 → 파란 block(또는 아이보리 vow 완화)이 **뒤 박자**로 또렷한지 · burst가 block 안 덮는지.
- 물 잔파도: cyan sweep **먼저** 지나가고 green bloom이 **짧게 뒤따르는지** · 한 덩어리로 안 뭉치는지.
- 나가 처형: crimson slash → block/vow가 뒤따르는지 · 해일 bloom도 sweep 뒤인지.
- 완전 흡수 시 착탄이 과장 없이 "막았다"로 읽히는지 · 90ms가 답답하지 않은지.

## 다음
- 유키PD 판정 + 나라님 실기 → **Three Boss Loadout Pressure Balance 01**(Plan §8-A: 골렘 진동 위상 bossProbes override·물 tremorDmg 132·씨앗 cost 9). 상세 = DEMO_V1_FINAL_MILE_ROADMAP_01.
