# Guild Board 3 Boss Selection Runtime 01

작업일: 2026-07-11 · 담당: 렌(Dev) · 판정: **★유키PD FINAL PASS (2026-07-11)**
기준: DEMO_V1_SCOPE_LOCK_01(FINAL PASS) · BOSS_PROBE_ENTRY_RUNTIME_01(FINAL PASS) · 골렘 Demo v0 잠금

## ★FINAL PASS 확정 기록 (유키PD · 2026-07-11)
- 길드 게시판 3토벌 선택 Runtime **완료** — 타이틀→마을→게시판→골렘/물정령/나가 선택→준비→전투→결과→재도전/마을 복귀.
- selectedBoss가 준비/전투/결과/재도전 전 구간 유지 · 마을 복귀 후에도 선택 상태 유지 · 새로고침 기본값 golem.
- 플레이어 화면은 **위험 태그만** 노출(HOLD③) · 추천 스킬/정답 loadout 비노출 · `?dev=1`에서만 answer hint 허용.
- 골렘 Demo v0 **완전 보존**(기본 URL — 보스 간 이미지/수치/전조/결과 잔류 0).
- 회귀: botSim **16 PASS / 0 FAIL** · probeSim **ALL PASS**.
- dev-pose 글리치(?dev=1 보스 전환 후 골렘 전용 pose selector 수동 사용 시 이미지 혼입 가능)는 **dev-only non-blocker WATCH** — 제품 화면 무관 · 다음 카드(Card 3)에서 수정하지 않음.

## 목적
URL probe(?boss=)로만 가능하던 3보스를, Demo v1 제품 흐름인 **길드 게시판 3토벌 선택**으로 연결.
흐름: 타이틀→마을→게시판→3선택→준비→전투→결과→(재도전 or 마을)→다른 토벌.

## 변경 파일
- `src/data/bossProbes.js`: **golem 카탈로그 항목 추가**(메타 전용·idle/boss/tele=null → index 골렘 원문 사용) + `BOSS_ORDER=['golem','water','naga']` +
  water/naga **태그를 risk-only로 교체(HOLD③)** + 각 보스 `answerHint`(?dev=1 전용).
- `index.html`: 게시판 HTML→`#board-list`(JS 렌더) · `let selectedBoss/PROBE`(런타임 변경) · `selectBoss(key)` · 3카드 렌더/이벤트 · pill 데모 숨김 정리 · btn-board-go 핸들러 제거(게시판=prep 이동).
- docs 3종(v1) FINAL PASS 기록 + 본 문서.
- ★보호 파일(battle/botSim/tuning/assets/probeSim) 무변경.

## 3보스 catalog 구조 (bossProbes.js)
- `BOSS_ORDER = ['golem','water','naga']` (게시판 순서).
- 각 항목: `key/name/emoji/idle/dispH/offsetX/hint/clearText/tags[risk]/answerHint/tele/boss`.
- **golem**: idle=null(→ index `bossIdle`)·boss=null(→ TUNING 기본)·tele=null(→ index 골렘 문구) = **assets.js/tuning.js 무접촉으로 Demo v0 원문 유지**.
- water/naga: 기존 probe config(수치/이미지/offsetX) 그대로 + 태그 risk-only.

## selectedBoss 상태/유지
- `let selectedBoss` 세션 변수(저장 없음)·초기값 = ?boss=water|naga면 시드, 그 외/미지원 = **golem**.
- `selectBoss(key)`: PROBE 재계산(golem→null) → bossShowIdle/bossEmoji/TELE_TXT 갱신 → **bf 보스 img src/height/margin 교체**(★transform 금지·breathBoss 대체) →
  HUD 보스명·prep "상대"·마을 게시판 카드 문구·게시판 선택 강조(.sel) 갱신.
- 게시판 카드 **탭 = 선택 강조(미리보기)**, **"이 토벌 준비" 버튼 = selectBoss + prep 이동**.
- 재도전=같은 보스 유지(PROBE 불변·newBattle이 현 PROBE 사용) · 마을 복귀 후에도 selectedBoss/강조 유지 · 다른 카드 선택 시 교체.
- ★골렘 복귀 시 height/margin 인라인 리셋('')로 CSS 322px/0 복귀 = **probe 규격 잔류 0**.

## HOLD③ (추천 스킬 tip 비노출)
- 게시판 태그 = **위험 태그만**(golem: 강타·탱커집중·예고 / water: 전체피해·침식·지속압박 / naga: 처형베기·탱커집중·사제압박).
- 추천 스킬/정답 loadout은 플레이어 화면 **미노출** · `?dev=1`에서만 `.q-dev` answer hint 표시.

## 검증 (preview 5181 · 390×844 · DOM 실측)
| 검증 | 결과 |
|---|---|
| 게시판 3카드(이미지 로드/이름/태그) | golem/water/naga 3장·imgOk·태그 전부 risk·**tip 태그 0(HOLD③)** |
| 3보스 선택→준비→전투 | golem 9,600/322px/0 · water 8,800/322px/-21 · naga 8,400/352px/-16 · prep "상대" 각각 정확 |
| 교차오염 | 나가(352/-16) 후 골렘 복귀 → 322/0·9,600 리셋(잔류 0) |
| 재도전/마을복귀 | water retry=water 8,800 유지 · 마을 복귀 후 게시판 water 강조 유지 · 탭=강조만(prep 안 감) |
| ?boss= fallback | ?boss=naga→naga 시드 · ?dev=1&boss=water→water+answer hint 3개 · **?boss=dragon(미지원)→golem** |
| 골렘 Demo v0 | HUD/HP 9,600/breathBoss/idleloop false/transition 0s/전조 원문/visibleActors 5/pill 숨김 — 전부 유지 |
| 공통 | 5시설 진입·복귀 · broken 0 · 콘솔 warn/error 0 · 390 무오버플로 · botSim 16/0 · probeSim ALL PASS |

## 리스크 / WATCH
- ★[나라 실기] 게시판 3카드 세로 스택 눈맛(카드 높이/이미지 크기)·보스 이미지 카드 내 crop(현재 q-img 50×44 object-fit) — 상수 조정 가능.
- dev-pose(🐞) 셀렉터는 초기 보스 기준 1회 빌드 — ?dev=1에서 보스 전환 후 골렘 포즈를 다른 보스 img에 수동 스왑 가능(dev 전용 글리치·데모 무관). WATCH.
- 게시판 background 원화 위 3카드라 카드가 배경을 많이 가림 — 필요 시 Demo Finish류 폴리시 후보.
- ?boss= 는 dev fallback으로 존치(제품 흐름은 게시판) — 문서화 완료.

## 다음
- Card 3(Priest Skill Pool 8 & Loadout 6 Data Contract) 또는 Card 7(Pose Audit·독립 트랙) — 유키 발주.
- ★Card 4(Battle Core Skill Extension·battle.js 해금)는 Card 3 후.
