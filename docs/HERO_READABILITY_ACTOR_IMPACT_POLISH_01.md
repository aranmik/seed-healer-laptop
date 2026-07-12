# Hero Readability & Actor Impact Polish 01

작업일: 2026-07-09 · 담당: 렌(Dev) · 판정: PASS(렌 자체) · 실기 눈확인 나라님 대기
기준: DEMO_SCOPE_LOCK_01 · BATTLE_LOOK_POLISH_01 · BATTLE_MOMENT_FEEDBACK_POLISH_01 · GOLEM_IDLE_ANCHOR_HOTFIX_01(FINAL PASS)

## 목적 (데모 look polish 2종)
1) ELI/THORNE/LUMINA THUMB 얼굴 가시성을 ARIA 수준으로.
2) 전장 아군이 실제 전투 이벤트에 짧게 반응(살아있는 느낌). 가짜 주기 공격 금지.

## Part A — THUMB 얼굴 가시성 (visual-only·asset 무변경)
### 원인 (픽셀 실측)
- THUMB는 정사각(ARIA 381²/ELI 255²/THORNE 270²/LUMINA 274²)인데, 카드/프렙 박스가 cover로 **top 66%만** 표시.
- 얼굴(skin) 세로 centroid 실측: ARIA 0.584 · THORNE 0.593(가시 안) / **ELI 0.647 · LUMINA 0.689(0.66 컷라인 아래 → 얼굴 하단 잘림)**.
### 처리
- per-hero `object-position` Y로 얼굴을 ARIA 프레이밍(카드 ~0.88 지점)에 맞춤. **ARIA는 무변경(기준)**.
  - ARIA `50% 0%`(유지) · ELI `50% 26%` · THORNE `50% 12%` · LUMINA `50% 34%` (rorin/cael 예비 20%).
  - 계산: posY=(faceCy-0.583)/0.337. 결과 3명 얼굴이 카드 0.83~0.88 지점에 안착(ARIA 0.88과 일관·컷 해소).
- 적용처: 하단 파티카드 `.pimg` + 전투준비 `#prep-party img`(일관성). asset/PORTRAIT/FIELD/registry/원본 **무변경**, 표시 CSS만.

## Part B — Hero Actor Impact (전장 아군 반응)
### 원칙
- 주기적 idle 공격 모션 **금지**. 실제 전투 이벤트에 연결된 짧은 반응만. 전투 로직/수치/타이밍 무변경.
- ARIA는 battlefield 비노출 유지(반응 대상 아님).
### ★breath 충돌 회피
- idle breath는 `.bf-actor img.spr`(자식). 반응은 **`.bf-actor` 컨테이너 transform 애니**로 → breath와 독립(실측: hero-hit 중 img breath=breathAllyFlip 불변).
- 각 슬롯 base transform 보존(bf-ally-c만 translateX(-50%)) → keyframe에 포함(heroHitC/heroLungeC 별도)·flip은 img라 무영향.
### 반응 2종
1. **hit react (피격·확실한 discrete 이벤트)**: consume `dmg`(아군 강타/돌진동/속박 피해) → 해당 아군 짧은 recoil(translateY 3px+scale .955·.18s). 사제(unit 0=hidden) 제외.
2. **outgoing lunge (보조·절제)**: renderState에서 **보스 HP가 실제 감소한 순간에만** 생존 아군 1명(rotation) 짧은 전진(translateY -5px·.16s).
   - ★fake 주기 loop 아님: 실제 딜 들어갈 때만·**긴 랜덤 throttle(1.3~2.0s)**·보스 alive 시만. 예고/시전으로 딜 멈추면 자동 정지.
   - newBattle 시 prevBossHp 리셋.

## 유지된 전투 문법 / 골렘 FINAL PASS
- battlefield visible actors = 골렘 + 동료 3명(실측 [boss,act-1,act-2,act-3]) · ARIA visibility:hidden 유지.
- 골렘 idle FINAL PASS 상태 유지(실측: breathBoss·boss-idleloop false·transition 0s·단일 프레임·drift 없음). **골렘 idle 코드 무변경.**
- 전투 계산/스킬/타겟팅/보스 패턴/타이밍/승패 판정 무변경.

## 검증 (preview 5181 · 390×844)
- THUMB object-position: 카드+프렙 per-hero 적용(ARIA 0%/ELI 26%/THORNE 12%/LUMINA 34%). 픽셀 계산상 3명 얼굴이 가시 window 안(0.83~0.88)으로 이동해 컷 해소.
- Hero impact: 컨테이너 애니 engage(heroHit/heroHitC/heroLunge/heroLungeC)·img breath 불변·base transform 보존·idle 잔류 클래스 0(lingering=[]).
- 골렘 idle FINAL PASS 유지·battle grammar 유지·루프 전구간(5시설·board→battle·end-village→마을·end-retry HP9,600) 정상.
- 콘솔 warn/error 0 · 이미지 broken 0 · 390 무오버플로.
- 기본 URL CORE LIVE/flow skeleton 숨김 유지 · ?dev=1 dev 복원 유지 · ARIA 비노출 유지(관련 코드 무변경).
- 보호파일(battle/botSim/tuning/assets) 무변경(node --check OK·mtime 무변동·botSim 16 PASS·0 FAIL).

## 남은 WATCH
- ★[나라 실기] THUMB 얼굴 최종 프레이밍은 나라님 포그라운드 눈확인 필요(preview_screenshot 상시 타임아웃으로 얼굴 컷 정도는 픽셀 계산으로만 확인).
  "좋아 / ◯◯ 얼굴 더 위·아래" 한 마디로 THUMB_POS 값 즉시 조정.
- ★[나라 실기] outgoing lunge가 규칙적/산만하게 느껴지면 제거 또는 throttle↑ 가능(hit react만 남겨도 됨). 라이브 이벤트는 headless rAF 정지로 자동 눈확인 불가 → 코드 경로+정적 실측만.
- hit react/lunge와 heal/shield glow가 정확히 같은 순간 겹치면 CSS animation 특성상 하나만 재생(hero-* 우선). 매우 드묾·수용.
