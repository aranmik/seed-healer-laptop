# Demo Finish Pass 01

작업일: 2026-07-08 · 담당: 렌(Dev) · 판정: PASS(렌 자체) · 유키PD 확인 대기
기준 문서: docs/DEMO_SCOPE_LOCK_01.md (데모 v0 스코프 준수)

## 목적
콘텐츠·시스템을 늘리지 않고, 현재 1보스 1루프 화면을 "임시 테스트" 느낌에서
"작지만 예쁜 이미지 에셋 활용 첫 완성작" 느낌으로 닦는 마감 pass.

## 변경 (index.html 1파일만)
### 1. dev 검수 도구 dev-only 강등 (핵심 마감)
전투 화면에 플레이어에게 노출되던 **dev 도구 2종**을 `?dev=1` URL 플래그 뒤로 숨김.
- `const DEV = new URLSearchParams(location.search).get('dev') === '1';` (모듈 상단)
- 🐞 **DEV POSE 셀렉터**(보스 포즈 수동 스왑): `initDevPose()`에 `if(!DEV) return;` — 데모 미노출.
- 🦸 **SHOWCASE 토글**(allyRow+ARIA 겹침 표시): 버튼 생성/핸들러를 `if(DEV){…}`로 감쌈 — 데모 미노출.
- ★**로직/기능 무변경**: 두 도구 모두 `?dev=1`에서 완전히 동일하게 복원됨(렌/나라 검수용).
  auto pose runtime(windup/impact/idle loop 등 `bossPose` 컨트롤러·`consume()` 구동)은
  initDevPose와 **독립** → 데모에서도 그대로 작동(실측: 보스 idle-01 loop 정상).
  showcase 레이어(`#hero-vis`, default off/display:none)는 DOM에 남겨 두되 토글만 숨김(무해).

### 2. 기록실 문구 톤 통일
- sub `지난 전투를 비추는 거울.` → **`지난 전투의 결과를 돌아본다.`**
  (여관 "…확인한다" / 기도소 "…확인한다" / 게시판 "…고른다" 와 같은 평이한 역할-동사 톤으로 통일.
   시적 은유 제거·오해 없음. 화면 본문 "아직 기록이 없다 / 이후 이곳에 쌓일 예정" placeholder는 유지.)

### 3. 여관 초상(inn PORTRAIT) 눈맛 보정
- `.mem-face` / `.mem-face-fb` 박스 `46×40`(가로형) → **`48×52`(세로형)**·fb 이모지 20→22px.
  정사각 PORTRAIT v002 crop을 세로형 박스에 담아 머리+어깨가 자연스러운 인물 카드로 읽히게 함
  (object-fit:cover·object-position:center top 유지·소스/링크 무변경·PORTRAIT v002 그대로).

## WATCH 처리 결과 (Demo Scope Lock §10 / First Playable Feel Check)
| WATCH | 처리 |
|---|---|
| 🦸 SHOWCASE 토글 노출 | **처리**: dev-only(?dev=1) |
| 🐞 DEV POSE 셀렉터 노출(추가 발견) | **처리**: dev-only(?dev=1) — SHOWCASE와 같은 성격이라 함께 정리 |
| 기록실 문구 톤 | **처리**: 평이한 역할-동사 톤으로 통일 |
| inn PORTRAIT 46×40 눈맛 | **처리**: 48×52 세로형 박스로 보정(PORTRAIT 유지) |
| 결과 화면 실제 승패 미감 | **유지(WATCH)**: 나라님 포그라운드 실기 확인 필요(headless rAF 정지) |
| 전투 중 이탈 버튼 없음 | **유지**: 현재 유지(스코프 결정) |
| 마을→타이틀 복귀 경로 없음 | **유지**: 현재 유지 |
| RORIN/CAEL 기본 파티 밖 미표시 | **유지**: 현재 유지 |
| dev-pill "CORE LIVE"(HUD 소형 상태칩) | **유지(WATCH)**: LOAD ERR 안전표시 겸용이라 보존·데모 미감 영향 경미. 마감 후반 재판단 후보 |

## 검증 (preview 5181 · 390×844)
- **데모 기본(?없음)**: 전투 화면 dev-pose hidden+비가시 · SHOWCASE 버튼 없음 · actor bind
  ARIA/ELI/THORNE/LUMINA FIELD v002 · ARIA 170px · 보스 idle-01(auto loop 작동) · broken 0 · 무오버플로
- **?dev=1**: dev-pose 가시(12 포즈 버튼) · SHOWCASE 버튼 "🦸 SHOWCASE · OFF" 복원 · bind/170px 유지
- 기록실 sub "지난 전투의 결과를 돌아본다." · inn .mem-face 48×52 PORTRAIT v002
- 루프 전구간(타이틀→마을→5시설 enter/back→준비·게시판→전투→end-village→마을→end-retry newBattle HP9,600 리셋·overlay off) 정상
- 콘솔 warn/error 0 · 이미지 missing 0 · 390 가로 오버플로 0
- 보호파일(battle/botSim/tuning/assets) 무변경(node --check OK·mtime 무변동·botSim 16 PASS[7봇+9 core]·0 FAIL)

## 보호 확인
- battlefield FIELD actor bind·ARIA 170px·여관 PORTRAIT(48×52)·전투준비 THUMB·파티카드 THUMB·5시설 readability·결과 polish 전부 유지
- render.js/styles.css 분리·전투 렌더 리팩터·CSS 재작성·DOM 전면교체·이미지 수정 **없음**

## 남은 WATCH / 다음 카드
- [나라 실기] 실제 승/패 결과 화면 미감 확정(Result Live Feel Confirm 후보).
- [유키 판단] dev-pill "CORE LIVE" 데모 표기 정리 여부.
- 다음: 나라님 데모 기본 URL 실기(dev 도구 사라진 깨끗한 화면 확인) → 필요 시 Mobile Frame Polish / 결과 미감 카드.
