# Demo Visual Hotfix 01

> **★2026-07-09 갱신**: 본 문서의 "ARIA 전장 비노출" 규칙(§Fix1)은 나라님 재판단으로
> **BATTLEFIELD_COMPOSITION_PRIEST_PRESENCE_POLISH_01에서 폐기**됨(사제=후방 지원자로 전장 노출).
> Fix2(골렘 안전장치)·Fix3(CORE LIVE 숨김)은 계속 유효.

작업일: 2026-07-08 · 담당: 렌(Dev) · 판정: PASS(렌 자체) · 유키PD 확인 대기
기준: docs/DEMO_SCOPE_LOCK_01.md · docs/DEMO_FINISH_PASS_01.md · docs/HERO_PLACEMENT_POLICY_01.md

## 목적
실기에서 확인된 전투 시각 문법 오해 포인트 3개를 나라님 원래 의도대로 바로잡는 핫픽스.
콘텐츠·시스템·전투 로직 무변경. index.html visual layer만 최소 보정.

## 전투 시각 문법 잠금 (유키PD 결정 반영)
```
battlefield visible actors = 동료 3명(ELI/THORNE/LUMINA)만.
ARIA(사제)는 전투에 참여하지만 battlefield world layer에는 서 있지 않는다.
ARIA의 존재는 하단 파티 카드(YOU)·스킬바·마나바·결과 화면·마을/여관/준비 초상으로만 느끼게 한다.
보스 HP > 0 인 동안 Earthroot Golem world visual은 절대 사라지지 않는다.
기본 데모 URL에서는 개발 흔적을 최소화한다.
```

## 문제 → 처리 (index.html 1파일)

### 1. ARIA battlefield 중복/과다 노출 제거
- **원인(실측)**: `act-0`(bf-aria)가 ARIA FIELD 170px로 battlefield 하단 중앙에 렌더 →
  top≈31px까지 치솟아 동료 사이 world actor처럼 읽힘("아리아가 둘?"). ariaCount 실측 2
  (act-0 가시 + showcase 레이어 ARIA[off/dev]).
- **처리**: CSS `.bf-aria{visibility:hidden}` 1줄 추가.
  - ★`display:none`이 아니라 `visibility:hidden` — **layout 유지**가 핵심.
    heal float(`floatText`)은 `actorEls[0].getBoundingClientRect()`로 사제 위치를 읽어 스폰됨.
    visibility:hidden이면 rect가 유효(실측 58×170 ok)하여 **사제 heal 숫자(기도/✦고리/자가치유)는 그대로 하단 중앙에 뜬다.**
    → 사제 body는 전장에서 사라지되, 치유의 존재감은 남는다(6-2 의도 정확 구현).
  - act-0 DOM 유지 → renderState의 dead/selactor/shielded 토글, 파티카드 index 매핑 전부 무변경.
  - **설계 잠금이라 ?dev=1 에서도 ARIA 전장 body는 숨김**(dev는 SHOWCASE 레이어로만 확인).
- **실측(데모 default)**: visible bf-actor = boss/ELI/THORNE/LUMINA 4개(ARIA 없음). act-0 visibility hidden·rect ok.

### 2. 골렘 alive visual 사라짐 방지
- **원인 추정**: 12 이벤트 포즈가 전투 중 **첫 표시되는 순간** 브라우저가 파일을 새로 디코드 →
  캐시 전이면 img가 잠깐 빈 프레임(HP 남았는데 골렘 깜빡 사라짐). boss img에 onerror fallback도 없었음.
- **처리(visual safety만·수치/패턴/로직 무변경)**:
  - ① **프리로드**: 12포즈 + idle 4프레임 + bossIdle 을 `new Image()`로 미리 로드 → 포즈 스왑 즉시(빈 프레임 없음).
  - ② **onerror fallback**: bossImg 로드 실패 시 idle-01 프레임으로 즉시 복귀(무한루프 가드: 이미 안전 프레임이면 재시도 안 함).
  - `fileOf()`가 미존재 포즈를 bossIdle로 이미 fallback하므로 src는 원래 비지 않음 → 남은 리스크(디코드 지연·로드 실패)를 위 2重으로 차단.
- **실측**: 보스 visible·src 유효·broken 0.

### 3. CORE LIVE 기본 데모 노출 정리
- **처리**: 로드 정상 + 데모(`!DEV`)일 때 개발 상태칩 숨김.
  - 전투 HUD 우상단 `#dev-pill`(CORE LIVE/CORE PENDING) → `pill.hidden=true`.
  - 타이틀 푸터 `.t-ver`("flow skeleton v0.1 · CORE LIVE") → `hidden` 속성(첫인상서 개발 흔적 제거).
  - **오류 시(LOAD ERR)·?dev=1 에서는 그대로 노출**(안전표시/dev 확인 기능 보존).
- **실측**: 데모=pill.hidden true·타이틀 푸터 hidden true / ?dev=1=pill "CORE LIVE" 표시·푸터 표시.

## 검증 (preview 5181 · 390×844)
- **데모 default**: 전장 가시 액터 boss+ELI+THORNE+LUMINA(ARIA 없음) · ARIA act-0 visibility:hidden(rect ok) ·
  보스 visible/src 유효 · dev-pill hidden · 타이틀 푸터 hidden · broken 0 · 무오버플로
- **?dev=1**: dev-pill "CORE LIVE"·타이틀 푸터·DEV POSE·SHOWCASE 복원 / **ARIA 전장 body는 여전히 hidden(설계 잠금)**
- 루프 전구간(타이틀→마을→5시설 enter/back→게시판·준비→전투→end-village→마을→end-retry newBattle HP9,600)·
  파티카드 THUMB(ARIA/ELI/THORNE/LUMINA)·inn PORTRAIT(48×52) 유지 · 콘솔 warn/error 0
- 보호파일(battle/botSim/tuning/assets) 무변경(node --check OK·mtime 무변동·botSim 16 PASS[7봇+9core]·0 FAIL)

## 보호 확인
- 전투 손맛/수치/패턴/승패판정 무변경 · actor 데이터/파티 구조 무변경 · Hero v002 registry 무변경
- 파티카드/스킬/마나/결과/마을 초상의 ARIA 존재 유지(6-2) · village readability · result polish 유지
- render.js/styles.css 분리·전투 렌더 리팩터·CSS 재작성·DOM 전면교체·이미지 수정 **없음**

## WATCH / 다음
- [non-blocker] 하단 heal-ring 미세 glow는 유지(사제 치유 채널 암시). 나라님이 빈 느낌이라 하면 제거 후보.
- [나라 실기] 데모 default 실기로 ①전장 동료 3명만 ②골렘 안 사라짐 ③깨끗한 첫화면 눈 확인.
- [나라 실기] 실제 승/패 결과 화면 미감(Result Live Feel Confirm 후보).
- 라이브 tick(승패·이벤트 포즈)은 headless rAF 정지로 자동재현 불가 → 프리로드/onerror는 코드+정적 실측으로 검증, 눈확인은 나라 포그라운드.
