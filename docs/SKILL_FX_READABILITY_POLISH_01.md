# Skill FX Readability Polish 01

작업일: 2026-07-11 · 담당: 렌(Dev) · 판정: **★유키PD FINAL PASS + 나라님 실기 확정 (2026-07-12)**
기준: BOSS_TELEGRAPH_ATTACK_FX_POLISH_01(FINAL PASS) · Demo v1 사제 8종 시각 문법 완성

## ★FINAL PASS 확정 기록 (유키PD + 나라님 실기 · 2026-07-12)
- 나라님 실기: **전투가 실제로 매우 재미있음** · 2분 30초 이내 전투 호흡 좋음 · 마나 관리+동료 구조 판단이 쫄깃함 ·
  스킬 연출이 전투 재미의 핵심으로 확인 · **해일이 전원을 쓸고 간 뒤 고리 치유로 답하는 문답이 매우 직관적** ·
  정화/지속/서약/씨앗 연출 방향 만족 · **"재미의 씨앗은 발아했다"**.
- ★확정 연출 문법: **보스가 전장에 질문한다 → 플레이어가 전장을 읽는다 → ARIA가 스킬로 답한다 →
  질문과 답이 FX로 충돌한다 → HP와 마나 결과가 화면에 남는다.**
- skillFxReadabilityCheck 28/0 · 전체 회귀 ALL PASS · 코어/tuning/skillPool/bossProbes 무변경.
범위: **CSS/DOM/event consume only** — 약한 4종(정화/지속/서약/씨앗)에 고유 형태·색 부여. 기존 4종(빠른치유/보호막/구원/고리) 보호. 코어/tuning/skillPool/bossProbes 무변경.

## 1. 기존 스킬 event/consume/render 구조 (조사)
- `consume()`가 매프레임(rAF) `B.events` splice 후 switch. 스킬 성공은 battle.js `_resolve`가 event 발행:
  - **quickheal** → `heal{src:'quickheal',amt:400}` → float + react-heal + ARIA supportSpark/cast-pulse (기존·강함).
  - **shield** → renderState nowSh 블록에서 react-shield + supportSpark (기존·강함).
  - **salvation** → `salvation` + `heal{src:'salvation'}`(ARIA 자가) (기존·강함).
  - **ring** → `ring` + cast-ring (기존·강함).
  - **cleanse** → `cleansed{unit}` — **consume 케이스 없음 = FX 0(약)**. (성공 시에만 발행: use()가 root 없으면 거부.)
  - **hot** → `hotOn{unit}` — **apply FX 없음(약)**. tick=`heal{src:'hot',amt:40}` → float만(HEAL_PULSE_MIN 80 미만).
  - **vow/seed** → `vowOn`/`seedOn`/`seedProc` — float+spark 최소만(약).
- 전부 **실제 성공 event**(use 통과 → _resolve). 거부(마나/쿨/대상/디버프)는 `reject` → showReject(성공 FX 아님).
- ARIA 원점 재사용 자산: `supportSpark(targetIdx)`(동적 target 추적)·`pulseActor(0,'cast-pulse')`.

## 2. 여덟 스킬 최종 시각 문법 (색·형태·리듬)
| 스킬 | 색 | 형태 | 원점 |
|---|---|---|---|
| 빠른치유(유지) | 밝은 초록 | 즉각 단일 heal pulse | ARIA→대상 |
| 보호막(유지) | 파랑/금 | 둥근 방어막 pop·block flash | ARIA→대상 |
| 구원(유지) | 강한 금빛 | ARIA 자가 구조 | ARIA 자신 |
| 고리(유지) | 따뜻한 초록/금 | 파티 전체 확산(cast-ring) | ARIA 중심 |
| **정화(신규)** | 흰/청백 | 대상 훑는 sweep·dissolve | ARIA→대상 |
| **지속(신규)** | 녹금 | 부드럽게 피어 정착(걸어둠) | ARIA→대상 |
| **서약(신규)** | 아이보리 | 세로 가호 veil(+피격 완화) | ARIA→대상 |
| **씨앗(신규)** | 녹금+흰 | 심기 점 → 피격 반응 개화 bloom | ARIA→대상(개화는 대상 중심) |
- 공통 helper: `skillMark(idx, cls, ms)` = 대상 actor에 `.skfx` 자식 overlay 1개 생성·`ms` 후 자동 제거(누적 0·`cur==='battle'` 가드).

## 3. 정화(cleanse) 구현
- consume `cleansed` 케이스 신규: float '✦ 정화'(buff) + ARIA supportSpark + cast-pulse + `skillMark(unit,'sk-cleanse',440)`.
- `sk-cleanse`: 흰/청백 gradient band가 대상을 왼→오 한 번 훑고 dissolve(mix-blend screen). **초록 heal pulse/파란 bubble 아님** → "무언가를 제거했다"로 읽힘.
- 성공(root 실제 제거)에만 발행 → 실패(디버프 없음)=use 거부·FX 0(브라우저 실측: 거부 시 skfx 0).

## 4. 지속(hot) 구현
- consume `hotOn` 케이스 신규: float '🌿 지속' + ARIA impulse + `skillMark(unit,'sk-hot',520)`.
- `sk-hot`: 녹금 radial glow가 아래서 피어올라 잔잔히 정착(scale/translateY) → "즉시 큰 회복"이 아니라 "걸어둠". 지속 중=기존 🌿 chip(renderState가 B.hot 읽음).
- tick(heal src='hot' amt40): 기존 float만 유지 — **가짜 주기 pulse 새로 만들지 않음**(HEAL_PULSE_MIN 게이트·40틱은 float=잔잔한 흐름). 씨앗의 반응형 pop과 리듬 분리.

## 5. 수호의 서약(vow) 구현
- consume `vowOn`: float '🕊️ 서약' + ARIA impulse + `skillMark(unit,'sk-vow',540)`.
- `sk-vow`: **아이보리 세로 veil**이 대상 앞에 솟음(scaleY) → 보호막의 둥근 파란 pop과 **형태 완전 분리**. 색=ivory(255,248,225)로 골렘 amber와도 구분(§5).
- 지속 중=기존 🕊️{남은시간} chip(renderState가 B.vow 읽음).
- **피격 완화**: `dmg` 이벤트 시 `B.vow[unit]` 활성이면 `skillMark(unit,'sk-vow-mit',260)` — 아주 짧은 아이보리 압축(.26s). block flash(react-block .34s)보다 약함. 실제 감소량 가짜 숫자 없음·보호막 전량 흡수 과장 없음(dmg는 실제 HP 피해 event).

## 6. 기도 씨앗(seed) 구현
- consume `seedOn`: float '🌱 씨앗' + ARIA impulse + `skillMark(unit,'sk-seed',400)` — 대상 하단 작은 녹금 씨앗 점 pop(심기).
- consume `seedProc`: float '🌱' + `skillMark(unit,'sk-bloom',400)` — 녹금+흰 새싹 **빠른 확산 bloom**(hot의 잔잔한 정착과 리듬 분리). charge ×3→×2→×1은 renderState가 B.seed 읽어 chip 갱신.
- **개화는 대상 중심**: seed proc의 `heal{src:'seed'}`를 ARIA spark 조건에서 **제외**(`e.src!=='ring' && e.src!=='seed'`) → ARIA 재시전이 아니라 심어둔 씨앗이 대상에서 피어남으로 읽힘.
- 보호막 전량 흡수 시 bloom 없음 · 지속형 자동 pulse 없음: seedProc은 battle core가 **실제 HP 피해 발동 사건에만** 발행(battleCoreSkillExtensionCheck C8 보장).

## 7. 기존 4스킬 보호
- quickheal/shield/salvation/ring consume 배선·react-heal/react-shield/react-block/cast-ring **무변경**. 신규 skfx는 별도 자식 overlay/색으로만 추가.
- shield(둥근 파란 pop) vs vow(아이보리 세로 veil) 형태 절대 분리(§14 D).

## 8. ARIA 원점 유지
- 정화/지속/서약/씨앗(심기) 전부 ARIA `supportSpark`(동적 target 추적)+`cast-pulse`로 시작 → "사제가 파티를 지원한다" 방향성.
- 씨앗 개화·vow 완화는 대상 반응(ARIA 재시전 아님)이라 spark 없이 대상 중심. ARIA/아군 위치·spacing 무변경.

## 9. 보스 FX와의 색/우선순위 분리
- skfx CSS에 **crimson(226,72,64)·골렘 amber(224,86,52) 미사용**(브라우저 실측 skfxHasCrimson=false). 정화=흰/청백(물정령 cyan과는 짧고 대상 중심으로 구분)·서약=ivory(골렘 amber와 구분).
- skfx는 대상 actor 국소 overlay(짧게 .26~.54s·화면 전체 오버레이 없음) → 보스 telegraph/danger-tgt를 가리거나 압도하지 않음. z-index:7(actor 위·float 15 아래).

## 10. 이벤트/상태 정본
- cleanse=`cleansed` · hot apply=`hotOn`(tick=`heal src=hot`) · vow apply=`vowOn`/완화=`dmg`+B.vow · vow 종료=`vowFade`+renderState chip 제거 · seed 심기=`seedOn`/개화=`seedProc`/종료=`seedFade`+chip 제거. **전부 실제 Battle event/state**·UI 독립 타이머 0.

## 11. 전투 전환 시 정리
- `clearSkillFx()`(모든 .skfx 자식 제거)를 **newBattle·exit-village(포기)·end-village(결과→마을)**에서 clearBossFx와 함께 호출. skillMark 자체도 ms 후 자동 제거(누적 0).
- 브라우저 실측: stray skfx 2개 주입 후 포기→마을 = 0 · 재전투 진입 = 0(조용 시작) · 거부된 정화 = skfx 0.

## 12. 검증 결과 (2026-07-11 실측)
| 검증 | 결과 |
|---|---|
| node --check (신규 포함) | OK |
| **skillFxReadabilityCheck (신규)** | **28/0 ALL PASS** (A 공통5·B 정화4·C 지속4·D 서약5·E 씨앗5·F 분리/회귀5) |
| bossTelegraphAttackFxCheck | 29/0 · battlefieldSpacingCheck 16/0 · combatClarityExitCheck 26/0 |
| skillPoolContractCheck 34/0 · battleCoreSkillExtensionCheck 42/0 · shrineLoadoutCheck 29/0 · battleLoadoutLinkCheck 26/0 |
| botSim 16/0 · probeSim 26 ALL PASS | |
| 브라우저(5182·375px·computed style 실측) | 콘솔 error 0 · sk-cleanse(skCleanse·white)·sk-hot(skHot·green)·sk-vow(skVow·ivory)·sk-vow-mit·sk-seed(::before)·sk-bloom(::before skBloom) 6종 전부 render·distinct anim/bg · **skfx에 crimson/amber 0** · 정리(포기/재전투/거부) skfx 0 · react-heal/shield·stage-fx·bh-exit 유지 · broken img 0 · overflow 0(375=375) |
- ★frozen-tab(프리뷰 rAF 정지): consume은 rAF에서 도므로 라이브 스킬 발화 캡처 불가 → **skfx overlay를 직접 적용해 computed style 실측 + event 배선(skillFxReadabilityCheck) + 정리 경로 실측**으로 증빙(발화 타이밍은 core/botSim 보장).

## 13. 구현하지 않은 항목 / HOLD / WATCH
- **hot per-tick pulse 미추가**: 카드가 "허용"(필수 아님). 12틱 동안 pulse는 산만 위험 → tick=green float 유지(잔잔한 흐름). apply(sk-hot)+chip으로 "걸어둠" 충족. WATCH.
- **정화 오염 입자 dissolve**: sk-cleanse는 밴드 sweep으로 표현(입자 파티클은 미추가·산만/성능 절제). 나라 실기에서 "씻어냄" 읽힘 재확인.
- **root/침식/출혈 예고 FX**: 직전 카드 결정대로 root telegraph 코어 event 미추가(resolve 중심). 이번 카드 범위 밖.
- **라이브 발화 눈확인**: frozen-tab 한계(§12). 나라 포그라운드 실기가 최종 손맛 확인.

## 14. 나라님 실기 확인 포인트
- **정화**: 침식/출혈/속박 대상에게 사용 → 흰빛이 훑고 지나가며 "씻어냄"으로 읽히는지, 회복으로 오해 안 되는지.
- **지속**: 적용 순간 녹금이 부드럽게 피어 "걸어둠"으로 읽히는지, 빠른치유의 즉발 pulse와 다른지, 씨앗과 구분되는지.
- **서약**: 아이보리 세로 장막이 보호막(둥근 파랑)과 다른 기술로 읽히는지, 피격 때 짧은 완화가 block보다 약하게 보이는지, 보스 danger 안 가리는지.
- **씨앗**: 심어둔 상태(chip)·피격 순간 bloom·충전 감소가 자연스러운지, 지속과 다른 반응형으로 느껴지는지.
- 공통: 골렘/물정령/나가에서 각각·8스킬이 색·형태·리듬으로 구분되는지·보스 telegraph에 안 묻히는지.

## 15. WATCH
- sk-cleanse mix-blend-mode:screen — 배경/대상에 따라 밝기 편차 가능(실측 렌더 정상). 나라 실기에서 과함/약함 재확인.
- 신규 스킬 chip 상한 4(기존 WATCH 유지) — 이번 카드 개편 없음.
- sk-vow veil 폭 64%/높이=actor full — 작은 actor(도적 99px)에서 비율 재확인.

## 16. 다음 Three Boss Balance Pass 제안
- vow/seed draft 수치(−40%/8s·90×3/15s) 확정 · 봇(botSim/probeSim smart) 신규 스킬 반영 여부 판단 · 3보스 게이트 재정의.
- 이후 Demo v1 Completion Checklist 01(나라님 3보스 반복 실기 → 완성 체크리스트).

## 다음
- 유키PD 판정 + 나라님 8스킬 실기(특히 약했던 4종 읽힘) → Three Boss Balance Pass 01.
