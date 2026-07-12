# Golem Idle Anchor Hotfix 01

작업일: 2026-07-09 · 담당: 렌(Dev) · 판정: **★나라님 실기 FINAL PASS (2026-07-09)**
기준: DEMO_SCOPE_LOCK_01 · GOLEM_PRESENCE_STABILITY_HOTFIX_01 · HERO_PLACEMENT_POLICY_01

## ★ FINAL PASS 판정 (나라님 실기 · 2026-07-09)
나라님 실기 확인 결과 이 방향이 데모 최종 방향으로 확정됨. **골렘 idle은 이후 다시 조정하지 않는다(잠금).**
확정된 기준:
- 골렘 idle은 "많이 움직이는 것"보다 **접지감/무게감이 우선**.
- 프레임 loop로 풍부하게 움직이기보다 **발바닥 고정**이 더 중요.
- 골렘은 "움직이는 캐릭터"가 아니라 **"제자리에 버티고 있는 재앙"**처럼 보여야 함.
- 골렘의 생동감은 평상시 idle이 아니라 **스킬/강타/피격 같은 의미 있는 순간의 impact**로 보여준다.
- 현재 구현(단일 12포즈 01_IDLE + 미세 breathBoss · 발바닥 anchor · drift 없음 · transition 없음)이 최종.
- 이전의 multi-frame idle loop는 데모 기준으로 오히려 접지감/무게감을 해쳐 폐기 확정.
→ 이후 카드에서 골렘 idle 구현은 건드리지 않는다. presence(alive 유지·강타/예고/피격 시 유지)만 보존.

## 목적
직전 Presence Stability Hotfix에서 넣은 transform transition이, 프레임별 anchor 위치차(최대 ~75px)를
"미끄러지며" 이동시켜 → 골렘 몸 전체가 좌우/상하로 왕복 슬라이드하는 drift가 생김.
나라님 요구: "발바닥/무게중심 거의 고정, 몸만 아주 미세하게 숨쉬는 골렘."

## 근본 원인
- idle sprite loop는 4프레임(724×543)을 anchor transform으로 정렬해 재생 → 프레임마다 tx/ty가 크게 다름.
- transition(.28s)이 이 큰 차이를 부드럽게 이어붙이면서 **몸 전체가 슬라이드 왕복**(drift).
- 즉 jump는 없앴지만 slide를 만들었음. 근본은 "프레임 간 위치차가 큰 multi-frame idle 자체".

## 해결 — 단일 idle frame + 미세 breathing 회귀 (나라님 권장 6)
idle sprite loop를 폐기하고 **12포즈 01_IDLE(bossIdle) 단일 프레임 + 기존 CSS `breathBoss`**로.
- 12포즈 01_IDLE는 **이벤트 포즈와 동일한 362 규격** → idle↔event 크기/발위치 점프 없음(anchor 불필요).
- 프레임이 안 바뀌고 inline transform도 없음 → **좌우/상하 슬라이드 원천 제거**.
- `breathBoss`: `transform-origin:50% 100%`(발바닥) + `translateY(-1.5px) scaleY(1.012)` → 발 고정, 몸만 미세 숨쉬기, 좌우 이동 0.

## 변경 (index.html · JS/CSS만 · battle.js 무관)
- `startIdle()` 재작성: setInterval idle loop 제거 → `bossImg.src=bossIdle`(12포즈 01) + `transform=''` +
  `boss-idleloop` 미부여(→ breathBoss 작동). 프레임 스왑/anchor inline transform 없음.
- CSS: `.bf-boss.boss-idleloop img.spr{transition:transform .28s}` **제거**(drift 유발원 제거) +
  breath-off 규칙에서 `.boss-idleloop` 셀렉터 제거(idle 중 breathBoss 확실히 작동).
- 잔존: IDLE_FRAMES는 프리로드/onerror fallback용으로만 보존(표시엔 미사용). dev pat/fps 버튼은 무효화(무해).
- bposeIn 하한 .8(직전 hotfix)·프리로드·onerror·이벤트 포즈 시스템·우선순위 전부 유지.

## 발바닥/무게중심 anchor 유지 방식
- 표시 img `transform-origin:50% 100%`(bottom center) = 발바닥/하단 접지점 고정점.
- breathBoss의 scaleY는 이 origin 기준 위로만 늘어남 → 발은 고정, 어깨/몸통/머리만 미세하게 상하 호흡.
- 실측: idle 중 img 좌측 x 변동 0.0px / 박스 하단 변동 0.0px(발 고정). 이벤트 포즈도 같은 362 규격이라 전환 점프 없음.

## 전투 로직/수치 무변경
- 전투 계산/스킬/타겟팅/보스 패턴/타이밍/승패 판정 무변경. pose 우선순위 무변경.
- 바뀐 건 idle 표시 방식(loop→단일+breath)뿐. botSim 16 PASS · 0 FAIL.

## 검증 (preview 5181 · 390×844)
- idle: animationName=breathBoss · transition 0s · inline transform none · src=12포즈 01_IDLE · boss-idleloop 미부여.
- **좌우 이동폭 0.0px · 발(박스 하단) 변동 0.0px** → drift/sliding 제거·발바닥 고정 확인.
- 이벤트(wind) 시 animation none·transition 0s(즉시 표시, 슬라이드 없음).
- 골렘 alive 중 visible·opacity 1(전투 진입/재전투 모두 12포즈 01_IDLE) · battle grammar(가시 4·ARIA hidden) 유지.
- 루프 전구간(5시설·board→battle·end-village→마을·end-retry HP9,600) 정상.
- 콘솔 warn/error 0 · 이미지 broken 0 · 390 무오버플로.
- 기본 URL CORE LIVE/flow skeleton 숨김 유지 · ?dev=1 dev 도구(dev-pose·CORE LIVE) 복원 유지 · ARIA 비노출 유지.
- 보호파일(battle/botSim/tuning/assets) 무변경(node --check OK·mtime 무변동).

## 남은 WATCH
- ★[나라 실기] breath의 "숨쉬는 정도" 최종 체감은 나라님 포그라운드 필요(headless는 CSS 애니 pause + preview_screenshot 타임아웃으로 모션 눈확인 불가).
  "좋아 / 숨쉬기 더 크게·작게 / 더 느리게·빠르게" 한 마디로 breathBoss 값(translateY·scaleY·3.4s) 즉시 튜닝.
- idle sprite loop(724×543 4프레임)는 이번에 표시 미사용으로 정리(리소스/프리로드는 보존). 다시 쓰려면 프레임 재측정 필요(WATCH).
