# Battle Moment Feedback Polish 01

작업일: 2026-07-08 · 담당: 렌(Dev) · 판정: PASS(렌 자체) · 유키PD 확인 대기
기준: DEMO_SCOPE_LOCK_01 · DEMO_FINISH_PASS_01 · DEMO_VISUAL_HOTFIX_01 · BATTLE_LOOK_POLISH_01 · HERO_PLACEMENT_POLICY_01

## 목적
이미 재미있는 전투의 순간순간(힐/보호막/강타 전조)을 더 잘 보이게 하는 moment feedback.
전투 수치·로직·타이밍 무변경. 기존 이벤트/상태(read-only)에 짧은 시각 반응만 붙임.
"평소 차분, 순간에만 짧게 살아난다."

## ★핵심 설계 — breath 충돌 회피
- idle breath 애니는 **`.bf-actor img.spr`(자식)** 에 걸려 있음.
- 순간 반응은 **`.bf-actor`(컨테이너) 의 `filter` 애니**로 → 자식 img의 breath와 **완전히 독립**.
  실측: 컨테이너에 react-heal 추가 후에도 img.spr animationName = breathAllyFlip 그대로(불변) 확인.
- Battle Look Polish 01에서 "breath 충돌로 보류"했던 항목을 이 방식으로 해결.

## 변경 (index.html · CSS + 렌더 보조 helper/토글만 · battle.js 무관)
### 우선순위 1 — 골렘 강타 전조 대상 읽힘
- `renderTele()`: 강타(smash) 예고 동안 **대상 동료 실루엣**에 hint.
  - 보호막 없음 → `.danger-tgt`(빨강 drop-shadow glow) / 보호막 있음 → `.safe-tgt`(초록).
  - 매 프레임 초기화(`actorEls.forEach(remove)`) 후 예고 중에만 부여 → 예고 끝나면 사라짐(idle 잔류 0 실측).
  - 기존 카드 tgt/tgt-safe(빨강/초록 테두리)와 짝 → "누가 맞을지"가 카드+전장 양쪽에서 읽힘.
- 정적 filter(애니 아님)라 매 프레임 재부여해도 깜빡임 없음.

### 우선순위 2 — 보호막 순간
- **적용 순간**: `renderState()`에서 shielded false→true 전환 감지 → `react-shield` pop(파랑+금 glow 0.56s).
- **막은 순간**: consume `absorb` 이벤트(보호막이 강타 흡수) → `react-block` 짧은 파랑 flash(0.34s).
- 기존 지속 shielded glow(Look Polish 01)와 구분: 지속=은은한 상시, 순간=짧은 pop/flash.
- 수치/지속/판정 무변경(이벤트만 읽음).

### 우선순위 3 — 힐 순간
- consume `heal`: 기존 "+N" float 유지 + **직접 힐만** `react-heal` 온기 pulse(초록 glow 0.5s).
  - 임계 `HEAL_PULSE_MIN=80`: quickheal(400)/ring(160)/salvation(100+)는 반응, HoT(40/초) 잔틱은 float만 → 과한 번쩍 방지.
  - ring(160 전원 힐)은 동료 3명 동시 pulse = "다 같이 붙잡았다" 순간.
  - salvation은 사제(unit 0=ARIA hidden) 대상이라 actor pulse 안 보이나 "기도" float로 이미 표시.

### 우선순위 4 — 선택/위험 대상
- selactor(선택)·shielded glow는 Battle Look Polish 01 그대로 유지. 위험 대상은 위 danger-tgt로 강화.

### helper
- `pulseActor(idx, cls, ms)`: 컨테이너에 class remove→reflow→add로 애니 1회 재시작 + ms 후 자동 제거(클래스 잔류/충돌 방지).

## 유지된 전투 문법
- battlefield visible actors = 골렘 + 동료 3명(실측 [boss,act-1,act-2,act-3]) · ARIA visibility:hidden 유지.
- 골렘 alive visual 유지 · Battle Look Polish 01 접지 그림자(::before) 유지(실측).

## 검증 (preview 5181 · 390×844)
- ★breath-safe 실측: 컨테이너 react-heal 추가 전/후 img.spr animationName=breathAllyFlip 불변.
- 반응 클래스 애니 engage: react-heal→reactHeal / react-shield→reactShield / react-block→reactBlock /
  danger-tgt·safe-tgt drop-shadow filter 적용.
- idle 전투서 순간 반응 클래스 **잔류 0**(lingeringHints=[]) — 이벤트/예고 때만 켜지고 곧 꺼짐.
- 루프 전구간(5시설·board→battle·end-village→마을·end-retry newBattle HP9,600)·visibleActors 4·broken 0·무오버플로.
- 콘솔 warn/error 0.
- 보호파일(battle/botSim/tuning/assets) 무변경(node --check OK·mtime 무변동·botSim 16 PASS·0 FAIL).

## polish 강도
- 전부 0.34~0.56s 단발·정적 hint는 예고 동안만. 상시 번쩍임 없음·스킬 버튼/입력/타이밍 무영향.

## WATCH / 다음
- ★[나라 실기] 라이브 이벤트(힐/보호막 적용·강타 예고·보호막 막음)는 headless rAF 정지로 자동 눈확인 불가.
  → 코드 경로 + 정적 실측(애니·filter·breath 독립)으로 검증. **실제 전투 중 반응 세기/타이밍 만족도는 나라님 포그라운드 필요.**
  "좋아 / 힐 반응 세다·약하다 / 강타 빨강 과하다·약하다 / 보호막 pop 좋다" 한 마디로 상수 튜닝(HEAL_PULSE_MIN·glow px·ms) 가능.
- [non-blocker] 골렘 impact 순간(smash) 화면 강조는 기존 bpose-impact punch + crit float로 충분히 읽혀 추가 안 함(과함 방지). 필요 시 후보.
