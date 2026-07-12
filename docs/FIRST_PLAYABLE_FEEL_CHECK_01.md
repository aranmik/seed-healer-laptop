# First Playable Feel Check 01

작업일: 2026-07-08 · 담당: 렌(Dev) · 판정: PASS(수정 0) · 유키PD 확인 대기

## 성격
체크 카드(수정 카드 아님). 첫 playable 한 벌을 실기 기준으로 순회 점검하고
blocker급 어색함만 최소 수정. **blocker 없음 → index.html 수정 0.**

## 실기 순회 결과 (preview 5181 · 390×844)
전 구간 무오버플로 · 콘솔 warn/error 0 · 이미지 broken 0.

| 화면 | 확인 | 결과 |
|---|---|---|
| 타이틀 | 로고 "Seed Healer" · motto · 시작하기 | PASS |
| 마을 | sub "마을은 다음 전투의 답을 준비하는 곳." · 시설 5 | PASS |
| 게시판 | "다음에 나설 토벌을 고른다." · 골렘 이미지 · 위험3/권장3 태그 · 도전하기 · 🔒"다음 계약 아직 안붙음" | PASS |
| 여관 | "…동료를 확인한다." · "현재 파티(3명)·확인용" · wip "동료 교체·편성은 준비 중" · PORTRAIT v002 | PASS |
| 기도소 | "…사제의 기도를 확인한다." · "가져갈 기도(6개)·확인용" · wip "기도 장착·변경은 준비 중" | PASS |
| 기록실 | "지난 전투를 비추는 거울." · 화면 "아직 기록이 없다 / 이후 이곳에 쌓일 예정" | PASS |
| 전투 준비 | "출정 전 마지막 확인 — 이 답안으로 나간다." · THUMB v002 3 · 전투 시작 | PASS |
| 전투 | boss 9,600/9,600 · act0 ARIA_FIELD(170px)/act1 ELI/act2 THORNE/act3 LUMINA FIELD · golem idle01 · showcase OFF · 파티카드 4 THUMB · 스킬 6 · 마나 100 | PASS |
| 결과(승리 replica) | 승리 · "끝까지 모두를 붙잡아냈다." · "대지뿌리 골렘을 넘겼다." · pill 5(시간/마나/동료0/강타5·5/흡수3,480) · 칩 3 · fit(≤844) | PASS |
| 결과(패배 replica) | 패배(청색) · "붙잡지 못했다." · "전투가 무너졌다." · 쓰러진 동료 정확 · "무너진 원인 —…" · 칩 0 | PASS |

## 루프 배선 실측
- end-village → 마을 ✓ / 재진입 → 전투 ✓ / end-retry → newBattle(HP 9,600 리셋·overlay off) ✓ / end-village → 마을 ✓
- 타이틀→마을→5시설→복귀 / 마을→준비·게시판→전투 / 전투→결과→마을·다시도전 전부 정상

## Seed Healer 정체성 확인
- "나는 공격하지 않는다…" — 전투 화면에 ARIA(사제 anchor 170px)+동료 FIELD+골렘 구도로 사제가 붙잡는 관계 성립.
- "죽기 직전까지 붙잡는 게임" — 결과 화면 요약 pill(강타 막음·보호막 흡수·쓰러진 동료)이 "얼마나 붙잡았는지"를 읽게 함.
- "마을은 다음 전투의 답을 준비하는 곳" — 마을 sub + 5시설 역할/placeholder 문구로 읽힘.

## 보호 확인
- battle.js/botSim.js/tuning.js/assets.js 무변경(node --check OK·mtime 무변동·botSim 7/7·coreChecks 9/9)
- actor bind·ARIA 170px·showcase OFF·여관 PORTRAIT·준비 THUMB·파티카드 THUMB·5시설 readability·결과 polish 전부 유지

## WATCH (전부 non-blocker · 기존 유효)
- 라이브 승패 도달 후 실제 report 값의 톤/pill 최종 미감은 나라님 포그라운드 1회 권장(headless 탭은 rAF 정지로 tick 자동재현 불가·botSim가 데이터 유효성 보증).
- 전투 화면 우상단 🦸 SHOWCASE 토글이 플레이어에게 노출(default OFF·dev 확인용·기존 카드 승인 사항). 정식 출시 단계에서 숨김 여부 유키 판단 가치.
- 기록실 sub "지난 전투를 비추는 거울."이 타 시설보다 시적(오해는 없음·화면 본문이 placeholder 명시). 통일 원하면 문구 조정 후보.
- 전투 중 이탈 버튼 의도적 부재 · 마을→타이틀 복귀 경로 없음 · RORIN/CAEL 기본 파티 밖.
- preview_screenshot 상시 rAF 타임아웃(스냅샷/DOM eval로 대체·페이지 오류 아님).

## 결론
첫 playable 한 벌이 타이틀→마을→시설→전투→결과→복귀→재전투로 끊김 없이 이어지고,
각 화면 역할이 읽히며, visual link·result polish·손맛·baseline 전부 무손상. blocker 없음 → 수정 0 PASS.
