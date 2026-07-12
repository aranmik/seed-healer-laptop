# Battle Look Polish 01

작업일: 2026-07-08 · 담당: 렌(Dev) · 판정: PASS(렌 자체) · 유키PD 확인 대기
기준: docs/DEMO_SCOPE_LOCK_01.md · DEMO_FINISH_PASS_01 · DEMO_VISUAL_HOTFIX_01 · HERO_PLACEMENT_POLICY_01

## 목적
전투 손맛(이미 "쫄깃하고 맛있다" 실기 확정)은 **한 톨도 건드리지 않고**, 그 재미가
더 선명·예쁘게·완성작처럼 보이도록 전투 화면 look만 CSS 전용으로 polish.
"더 많이"가 아니라 "더 정확히" — 적은 수정, 큰 체감.

## 실기 스크린샷으로 잡은 look 약점 (전투 화면 실측)
1. **발밑 접지 그림자 부재** — 선택된 동료(selactor)만 발밑 타원이 있고 나머지 동료·골렘은
   그림자가 없어 흙바닥 위에 **뜬 스티커**처럼 보임.
2. **하단 중앙 빈 링** — ARIA가 사라진 자리에 heal-ring의 **하드 border 외곽선**만 덩그러니 남아
   "빈 선택 원"처럼 어색.
3. 배경/캐릭터/UI 흐름 자체는 이미 좋음(대수술 불필요).

## 변경 (index.html · CSS 전용 · JS 0줄)
### 1. 발밑 접지 그림자 (가장 큰 체감)
- `.bf-actor::before` = 발밑 어두운 타원(radial 0.5→투명·blur 1.2px). img보다 먼저 그려져 발밑에 깔림.
  동료 3명 각각 자기 발밑에 접지 그림자 → 스티커 느낌 제거.
- `.bf-boss::before` = 골렘용 큰 타원(bottom 24px·width 42%·blur 2.5px).
- ★ARIA(`.bf-aria`)는 `visibility:hidden`이라 그 `::before`도 자동 비노출 → 전장엔 여전히 동료 3명만.
- ★보스 idle sway transform은 img에만 적용, `::before`는 컨테이너 기준이라 그림자 고정 → 접지 안정.

### 2. heal-ring "빈 링" 해소 (하단 정리)
- 하드 `border:1px solid` 제거 + 크기 축소(150×44→130×30) + opacity 낮춤(.34→.20).
  → 외곽선 있는 빈 원이 아니라 **사제 자리에 은은하게 감도는 치유 온기**로. (ARIA body 없이 존재감만)

### 3. 선택/보호막 읽힘 (미세)
- selactor 타원: 64%→72%·불투명 .55→.72·안쪽 채움 추가 → 접지 그림자 위에서 선택이 더 또렷.
- shielded glow: 파란 drop-shadow 5px→8px + 안쪽 3px 추가 → 보호막 상태 시인성 강화.

### 고요함/순간 반응 (8-5)
- 이번 pass는 **정적 CSS만**이라 idle 정적 상태의 차분함 유지(모션 추가 0).
  순간 반응(위험 링 hot pulse·강타 예고 bar·heal/absorb float)은 기존 이벤트 연출 그대로 → 대비 유지.
  ★live 이벤트 기반 추가 강조(heal/shield bloom)는 breath 애니메이션 충돌·noise·headless 검증불가
   리스크로 이번 pass에선 보류(WATCH). 지금 손댄 건 전부 검증 가능한 정적 look뿐.

## 유지된 전투 문법 (Hotfix 01 잠금)
- battlefield visible actors = 골렘 + 동료 3명(ELI/THORNE/LUMINA)만 (실측 visibleActors=[boss,act-1,act-2,act-3]).
- ARIA `.bf-aria` visibility:hidden 유지(전장 비노출)·접지 그림자도 미노출.
- 골렘 alive visual 유지(프리로드+onerror fallback 그대로).

## 검증 (preview 5181 · 390×844)
- 스크린샷: 동료 3명 발밑 접지 그림자 생김·하단 빈 링 사라짐·선택 동료 골드 링 또렷 → "뜬 스티커" 해소.
- 실측: ally `::before`(60×12·radial black·blur) / boss `::before`(180×26) / ARIA `::before` visibility hidden /
  heal-ring border 0px·soft gradient / visibleActors 4(ARIA 없음) / broken 0 / 무오버플로.
- 루프 전구간(5시설·board→battle·end-village→마을·end-retry newBattle HP9,600)·파티카드 THUMB(ARIA/ELI/THORNE/LUMINA) 유지.
- 콘솔 warn/error 0.
- 보호파일(battle/botSim/tuning/assets) 무변경(node --check OK·mtime 무변동·botSim 16 PASS·0 FAIL).

## 보호 확인
- 전투 손맛/수치/패턴/승패판정·actor/파티 구조·Hero/Golem registry·result polish·village readability 전부 무변경.
- render.js/styles.css 분리·전투 렌더 리팩터·CSS 재작성·DOM 전면교체·이미지 수정 없음.

## WATCH / 다음
- [나라 실기] 실기로 접지감·선택/보호막 읽힘·전체 완성감 눈 확인(정지 상태는 스크린샷으로 확인됨, 움직임 중 느낌은 포그라운드).
- [보류·후보] heal/shield "순간 반응" bloom은 별도 카드에서 breath 충돌 없는 방식(별도 FX 레이어 등)으로 검토.
- [non-blocker] 골렘 접지 그림자는 골렘 뿌리 베이스와 겹쳐 약하게 보임 — 필요 시 위치 미세 조정.
