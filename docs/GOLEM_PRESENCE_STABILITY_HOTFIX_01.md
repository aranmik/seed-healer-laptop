# Golem Presence Stability Hotfix 01

작업일: 2026-07-09 · 담당: 렌(Dev) · 판정: PASS(렌 자체) · 실기 눈확인 나라님 대기
기준: DEMO_SCOPE_LOCK_01 · DEMO_VISUAL_HOTFIX_01 · BATTLE_LOOK_POLISH_01 · BATTLE_MOMENT_FEEDBACK_POLISH_01

## 목적
Earthroot Golem이 전투 중 "살아있는 보스"로 안정적으로 보이게. 나라님 실기에서
idle이 틱틱 튀어 순간이동처럼 보이고 순간마다 깜빡이는 느낌 → 데모 완성 전 hotfix.
전투 수치/타이밍/패턴/승패 무변경. index.html 표시 계층만.

## 근본 원인 (코드 실측)
- idle loop는 `idleApply()`가 `setInterval`로 `bossImg.style.transform`을 **즉시 점프**시킴(transition 0).
- idle 4프레임(724×543)은 원본에서 몸이 크게 흔들려(RAW ~127px), 각 프레임을 화면 중심에 맞추는
  anchor transform이 프레임 간 최대 ~75px(가로)/~23px(세로)씩 **순간 점프** → 이 점프가 "순간이동".
- idle loop 중 CSS breath는 꺼져 있어(=animation:none) 점프가 유일한 움직임이라 더 튀어 보임.
- 예고 포즈 materialize(bposeIn)가 opacity .45에서 시작 → 순간 어두워짐이 "깜빡임"으로 읽힐 수 있음.

## 변경 (index.html · CSS/JS 상수만 · battle.js 무관)
### 1. idle 위치 전환을 "점프→미끄러짐"으로 (순간이동 완화·핵심)
- `.bf-boss.boss-idleloop img.spr{transition:transform .28s ease-in-out}` 추가.
  프레임 바뀔 때 transform이 0.28s에 걸쳐 부드럽게 미끄러짐 → 틱틱 순간이동이 "묵직하게 스르륵".
- ★이벤트 즉시성 보장: 예고/강타 발생 시 `stopIdle()`이 `boss-idleloop` 클래스를 제거 →
  transition이 함께 사라져 이벤트 포즈는 **즉시 표시**(정보 지연 0). 실측 transitionAfterEventClass=0s.

### 2. hold 패턴 기본화 (나라님 권장: 1,1,1,2,2,2,3,3,3,2,2,1,1 식)
- `SEQS.steady = [0,0,0,1,1,1,2,2,2,3,3,3,2,2,2,1,1,1]` 신설·기본값(`idlePattern='steady'`).
  각 포즈를 3틱(≈1s) 유지 → 포즈 변화 빈도 1/3로. transition(.28s)과 합쳐 "숨쉬듯 천천히 흔들리는 골렘".
- fps는 3 유지(hold가 실질 속도를 늦춤). 인접 프레임 왕복(pingpong)이라 04→01 큰 점프 없음.
- 기존 linear/pingpong/hold_pingpong은 dev 비교용으로 보존, dev 토글(PAT_ORDER)에 STEADY 추가.

### 3. 깜빡임 완화
- `@keyframes bposeIn` 하한 `.45 → .8` → 예고 포즈가 어두워지는 정도를 크게 줄여 "깜빡" 최소화(골렘 항상 또렷).

### 4. alive 사라짐 방지 (기존 유지 + 확인)
- Demo Visual Hotfix 01의 12포즈+idle 프리로드 + onerror→idle fallback 그대로 유지(디코드 지연/로드 실패 시 빈 프레임 0).
- 코드상 골렘 img를 alive 중 opacity 0/display none/visibility hidden으로 만드는 경로 없음(dead=hp≤0에서만 .4).
  실측: 전투 진입/재전투 boss visible·opacity 1.

## 유지된 전투 문법
- battlefield visible actors = 골렘 + 동료 3명(실측 [boss,act-1,act-2,act-3]) · ARIA visibility:hidden 유지.
- 전투 로직/수치/패턴/승패 판정 무변경 · pose 우선순위(Down>Impact>...>Idle) 무변경.

## 검증 (preview 5181 · 390×844)
- idle transition = transform 0.28s(적용) · 이벤트 클래스 제거 시 0s(즉시) 실측.
- idle 샘플링: transform이 시간에 따라 변하며 같은 값을 여러 틱 유지(steady hold 동작 확인·frozen 아님).
- ?dev=1: dp-pat 버튼 "STEADY"(기본 패턴 반영 확인)·dev 도구 복원.
- 골렘 alive 중 visible·opacity 1 · battle grammar(가시 4·ARIA hidden) 유지.
- 루프 전구간(5시설·board→battle·end-village→마을·end-retry newBattle HP9,600) 정상.
- 콘솔 warn/error 0 · 이미지 broken 0 · 390 무오버플로.
- 보호파일(battle/botSim/tuning/assets) 무변경(node --check OK·mtime 무변동·botSim 16 PASS·0 FAIL).

## WATCH / 다음
- ★[나라 실기] idle 움직임의 "묵직함/부드러움" 최종 체감은 나라님 포그라운드 필요
  (headless는 setInterval throttle + preview_screenshot 상시 타임아웃으로 실제 모션 눈확인 불가·transition/패턴/즉시성은 정적 실측).
  "좋아 / 아직 튄다 / 너무 느리다·빠르다 / 흔들림 크다·작다" 한 마디로 transition ms·hold 틱수·fps 즉시 튜닝.
- [비상옵션] 그래도 순간이동감이 남으면: (a)transition ms↑ (b)hold 틱↑/fps↓ (c)idle 진폭(cx/foot anchor) 재측정
  또는 (d)idle sprite loop 대신 단일 01프레임+CSS breath 회귀(나라 판단). 이번엔 나라 권장(hold) 우선 적용.
- 라이브 이벤트(강타/impact) 순간 골렘 존재감은 즉시성(transition 0s)·bposeIn .8·프리로드로 확보, 실전 눈확인은 나라.
