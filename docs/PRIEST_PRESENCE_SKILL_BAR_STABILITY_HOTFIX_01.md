# Priest Presence & Skill Bar Stability Hotfix 01

작업일: 2026-07-09 · 담당: 렌(Dev) · 판정: **★나라님 실기 FINAL PASS (2026-07-10)**
기준: BATTLEFIELD_COMPOSITION_PRIEST_PRESENCE_POLISH_01(방향 FINAL PASS) · GOLEM_IDLE_ANCHOR_HOTFIX_01(FINAL PASS)

방향은 FINAL PASS(사제 전장 노출·카드 순서·사제 기점 impulse·cast-bar 고정). 이번은 **구현 디테일 hotfix 2건**.

## ★ FINAL PASS 판정 (나라님 실기 · 2026-07-10)
> "바로 이거야. 이제야 만족스러운 Demo를 확보한 기분이야.
> 썸네일의 위치 구성, ingame의 구성, 스킬 사용 시 나(사제)로부터 스킬 이펙트가 출력되고
> 임펄스를 통해 전장이 읽히는 전반이 너무 좋다."

확정(되돌리지 않음):
- 하단 카드 순서 = 전사 / 도적 / 법사 / 아리아(YOU)
- 전장에 아리아가 **후방 사제로 단독 노출**(버스트 규격·동료와 세계감 일치)
- 스킬 사용 시 **ingame 아리아로부터 이펙트/임펄스가 출력**되고, 아리아→동료로 효과가 전달되는 전장 읽힘
- 썸네일 위치 구성(per-hero object-position)
- 전장 구성 ↔ 하단 UI 구성의 자연스러운 연결
- 스킬 버튼 안정성 hotfix(btnNudge·슬롯 이탈 0)

→ **Seed Healer는 Demo Completion Checklist 01로 진입 가능한 상태로 판단됨.**
   이후 카드에서 위 구성은 기준선으로 보존한다(변경 시 유키PD/나라님 재판단 필요).

## 문제 A — 전장 아리아 "2중/분신"처럼 보임
### 원인 (알파 프로파일 실측)
- ARIA FIELD는 **전신 크롭(345×1013, 세로 0.34 비율)**인데, 동료들은 **버스트 크롭(354×458, 0.77)**.
- ARIA를 세로 맞춤(150px)으로 표시하면 폭 51px로 홀쭉해지고, ★**허리가 잘록(49~51% 지점 알파 커버리지 22%로 급감)**해
  상체(위)와 치마/로브(아래)가 **두 덩이로 분리되어 "분신/2중"으로 읽힘**. (동료는 허리 위 버스트라 이 현상 없음)
- 실제 DOM 중복은 아니었음(showcase 레이어는 dev-only·display:none). 순수 크롭 형태 착시.
### 해결
1. **버스트 통일**: `.bf-aria.hv-aria-bound img.spr` = 고정박스 `76×98 object-fit:cover object-position:center top`.
   → FIELD 상단 ~44%(허리 gap 49% 위)만 잘라 **head+torso 버스트**로. 실측 ARIA 76×99 ≈ 동료 ELI 82×106(규격 통일·단독 1명).
2. **showcase ARIA 제거**: ARIA가 실제 액터가 됐으므로 dev showcase 레이어의 ARIA(중복 레이어 잔류) 빌드 제거(동료 5인 오버레이만).
   → 실측 ARIA img **총 1개**(중복 0). 위치(중앙 하단 후방·도적 아래)·breath·접지그림자·사제 기점 impulse 전부 유지.

## 문제 B — 스킬 버튼이 슬롯 벗어나 왼쪽으로 밀림
### 원인
- `showReject()`가 **무텍스트 거부(gcd=글로벌 쿨다운)** 시 버튼에 `rejShake`를 걸었는데,
  rejShake는 `.rej` 배지용(`transform:translateX(-50%)` 중앙정렬 기준) 키프레임 → **버튼이 자기 폭의 50% 왼쪽으로 밀림**.
  GCD 거부는 플레이 중 빈번 → 버튼이 자주 왼쪽으로 튐.
- 실증: rejShake를 버튼에 걸면 transform=translateX(-29px)(58px 버튼의 ~50%). btnNudge는 translateX(0).
### 해결
- 버튼 전용 `@keyframes btnNudge{0%,100%{translateX(0)}22%{-2.5px}62%{2px}}`(제자리 미세 흔들림·슬롯 이탈 0) 신설.
- `showReject` 무텍스트 분기를 `rejShake`→`btnNudge`로 교체. `.rej` 배지의 rejShake는 그대로(배지는 translateX(-50%) 기준 정상).
- 실측: 거부 시 버튼 이동 **0px**, 6버튼 슬롯 균등(gap 63px) 유지.

## 유지 (현재 좋은 상태 / 골렘 FINAL PASS)
- 카드 순서 전사/도적/법사/아리아(YOU)·ARIA 전장 노출·후방 위치·사제 기점 impulse(spark+cast-pulse 실증)·cast-bar 고정·
  골렘 idle FINAL PASS(breathBoss·idleloop false·transition 0s)·전사/도적/법사 구도·카드 레이아웃 polish 전부 유지.
- 전투 계산/수치/판정 무변경·보호파일 무변경(mtime)·**botSim 16 PASS·0 FAIL**.

## 검증 (preview 5181 · 390×844)
- A: ARIA img 총 1개(showcase 제거)·버스트 76×99(≈동료)·object-fit cover top·중앙 하단·breath·impulse 유지.
- B: rejShake(구)→버튼 -29px / btnNudge(신)→0px·6버튼 균등 슬롯 유지.
- 카드 순서·golem FINAL PASS·visibleActors 5(골렘+동료3+ARIA)·루프 전구간(5시설·board→battle·end-village→마을·end-retry HP9,600)·
  콘솔0·broken0·무오버플로·기본 URL CORE LIVE/flow skeleton 숨김·?dev=1 복원.

## 남은 WATCH
- ★[나라 실기] 버스트 ARIA 크기(76×98)·크롭 상단 위치(머리 여백/허리 컷)·후방 위치감 최종 눈확인
  (preview_screenshot 상시 타임아웃 → 알파 실측·박스 계산으로만 확인). object-position/박스 상수 1줄 조정 가능.
- 버스트 컷이 허리 gap(49%) 위에서 끝나 상/하 분리 착시 제거됨. 나라가 "더 크게/전신 느낌" 원하면 재논의(현재는 버스트=동료 규격 통일 우선).
