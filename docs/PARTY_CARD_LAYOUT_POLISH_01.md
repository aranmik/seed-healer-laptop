# Party Card Layout Polish 01

작업일: 2026-07-09 · 담당: 렌(Dev) · 판정: PASS(렌 자체) · 실기 눈확인 나라님 대기
기준: DEMO_SCOPE_LOCK_01 · HERO_READABILITY_ACTOR_IMPACT_POLISH_01 · GOLEM_IDLE_ANCHOR_HOTFIX_01(FINAL PASS)

## 목적
Demo Completion Checklist 전, 하단 파티 카드의 시인성/안정감 정리:
① ARIA vs 타 영웅 THUMB 문법 일관 ② 카드/썸네일 세로 소폭 확장(덜 답답) ③ 행별 고정 슬롯(reflow 방지).

## 실측으로 확인한 사실 (선분석)
- 카드는 이미 reflow-안정적이었음: chips(🛡🌿⛓️) 추가/제거 시 카드 높이 변화 **0px**(pchips 고정), cast-bar 열림 시 party-ui 이동 **0px**(battlefield flex:1이 흡수).
- 즉 "스킬 사용 시 들썩임"은 **파티 카드가 아니라 battlefield 영역**(cast-bar 열리며 battlefield ~22px 축소 → 아군이 bottom% 기준이라 ~7px 아래로 잠깐 이동)에서 발생. 이는 골렘 FINAL PASS 전장 구성이라 이번 카드에서 건드리지 않음(WATCH).

## 변경 (index.html · CSS + THUMB_POS 상수만 · battle.js 무관)
### 1. 카드/썸네일 세로 확장 (덜 답답)
- `.pcard .pimg` / `.pfb` height 57→**64px**(썸네일 소폭 확대·과도 아님). 이모지 폴백 폰트 26→28.
- 카드 총 높이 110→**121px**(실측). battlefield(flex:1)가 +11px 흡수(498px)·party-ui 11px 상승·아군 clearance ~144px(여유).

### 2. 행별 고정 슬롯 (reflow 방지·나라 5·6·8)
- `.prow`(이름/YOU) min-height 16px · `.phtxt`(HP숫자) line-height 11+min-height 11 · `.php`(HP바) 8px+margin · `.pchips`(버프) height 14 고정.
- → 각 행이 고정 슬롯. 실측: **chips 3개 추가 reflow 0px · HP숫자 "12345 / 12345"로 변경 reflow 0px**. 어떤 상태 변화에도 카드 높이 불변.
- 반응(선택/타겟/사망)은 border-color/box-shadow/opacity/filter만(layout 무변경·나라 7 준수). 힐/보호막/피격 반응은 전장 actor 컨테이너 transform(카드 무관).

### 3. THUMB 문법 일관 + 프레이밍 재계산
- 4명 전부 동일 THUMB(정사각) 계열. 박스 64px(top 74% 표시)에 맞춰 얼굴 centroid를 ARIA(기준) 프레이밍(카드 ~0.78)으로 통일:
  `THUMB_POS`{aria 50% 0%(기준·무변경)·ELI 50% 22%·THORNE 50% 8%·LUMINA 50% 38%·rorin/cael 16%}. 계산상 4명 얼굴 모두 카드 0.77~0.80 안착(일관·컷 없음).
- ARIA 주인공성은 THUMB 통일 안에서 **YOU 배지 + 골드 테두리(.pcard.you)**로만 유지(복붙 아님·나라 2).
- 적용처: 하단 파티카드 + 전투준비 THUMB 공유(일관성).

## 유지 (전투 문법 / 골렘 FINAL PASS)
- battlefield visible actors = 골렘 + 동료 3명(실측 [boss,act-1,act-2,act-3]) · ARIA visibility:hidden 유지.
- 골렘 idle FINAL PASS 유지(실측 breathBoss·무변경) · 전투 계산/수치/패턴/승패 무변경.

## 검증 (preview 5181 · 390×844)
- 카드 총 121px·썸네일 64px·행 고정(pimg64/prow16/php8/phtxt14/pchips14).
- reflow: chips 0px · 긴 HP숫자 0px(고정 슬롯 확인).
- THUMB object-position 카드+프렙 per-hero 적용(ARIA 0%/ELI22/THORNE8/LUMINA38)·얼굴 가시 window 안(0.77~0.80).
- 골렘 FINAL PASS 유지·battle grammar 유지·루프 전구간(5시설·board→battle·end-village→마을·end-retry HP9,600)·콘솔0·broken0·**무오버플로**(app 844·battlefield 흡수).
- 보호파일(battle/botSim/tuning/assets) 무변경(node --check OK·mtime 무변동·botSim 16 PASS·0 FAIL).
- 기본 URL CORE LIVE/flow skeleton 숨김 유지·?dev=1 dev 복원 유지·ARIA 비노출 유지(관련 코드 무변경).

## 남은 WATCH
- ★[나라 실기] 카드 높이/얼굴 프레이밍 최종 눈확인(preview_screenshot 상시 타임아웃으로 얼굴 위치는 픽셀 계산으로만). "좋아/카드 더 크게·작게/◯◯ 얼굴 위·아래" 한 마디로 pimg height·THUMB_POS 즉시 조정.
- ★[별도 카드 후보] cast-bar(시전바)가 열릴 때 battlefield ~22px 축소→아군 ~7px 잠깐 이동(카드는 무이동). 이번엔 골렘 FINAL PASS 전장 구성 보존 위해 미변경. 원하면 cast-bar를 overlay/reserved로 바꿔 전장 축소 자체를 없애는 별도 카드(전장 구성 재확인 필요).
