# Village Screen Portrait Link 01

작성: 렌(Dev) · 2026-07-08 · 판정: 유키PD
성격: 마을/준비/파티카드 초상을 v002 PORTRAIT/THUMB로 연결하는 visual-only 문서. index.html만 수정. 전투 로직/보호 파일 무변경.

## 목표
전투 battlefield FIELD actor bind는 유지하고, 마을/여관/전투준비/하단 파티카드의 초상만 `HERO_CROP_ASSETS_V002`의 PORTRAIT/THUMB로 얇게 교체.

## 매핑 (ally id → hero key)
`warrior→eli · rogue→thorne · mage→lumina · shaman→rorin · hunter→cael`, priest/aria→aria.
현재 기본 파티 = warrior/rogue/mage(+priest). RORIN/CAEL은 기본 파티 밖이라 이번 화면에 미표시(registry 등록만 유지·억지 추가 안 함).

## 화면별 연결 (실측 확인 · 2026-07-08)
| 화면 | 요소 | 사용 crop | 결과 |
|---|---|---|---|
| 여관(inn-list) | mem-face(46×40 소개 카드) | **PORTRAIT** | ELI/THORNE/LUMINA PORTRAIT ✓ 로드 |
| 전투 준비(prep-party) | prep-faces(작은 요약 얼굴) | **THUMB** | ELI/THORNE/LUMINA THUMB ✓ 로드 |
| 하단 파티 카드(party-ui .pimg) | pcard 이미지(57px 작은 카드) | **THUMB** | ARIA/ELI/THORNE/LUMINA THUMB ✓ 로드 |
| 마을(village) | 파티/대표 초상 | 해당 없음 | 시설 버튼만 있고 초상 없음 |
| 결과(end-ov) | 파티/초상 | 해당 없음 | 제목/원인/칩/버튼만·초상 없음 |
| 기도소/기록실 | 초상 | 해당 없음 | 스킬 아이콘/placeholder |

## 구현 방식 (read-only helper)
index.html 셋업부에 helper 3개 추가(read-only):
- `HERO_KEY_BY_ALLY` 맵, `heroCropPath(allyId,type)`, `ariaCropPath(type)`, `heroImgFb(oldSrc)`(onerror fallback).
- 각 렌더 지점에서 v002 crop 우선, 없거나 **로드 실패 시 기존 초상으로 fallback**(onerror). 최종 폴백은 이모지/숨김.
- 기존 카드 DOM/클래스/선택 핸들러/HP/칩 로직 무변경 — img src만 교체.

## 보호 (유지 확인)
- battlefield FIELD actor bind: act0=ARIA_FIELD·act1=ELI_FIELD·act2=THORNE_FIELD·act3=LUMINA_FIELD 유지 · ARIA 170px · showcase OFF · golem idle loop.
- 파티 카드 선택(selactor)·스킬 사용(보호막→마나/칩)·스킬버튼 클릭 전부 정상(초상 교체가 조작 무간섭).
- playable loop(타이틀→마을→시설→전투→결과→마을 복귀→재전투) 유지.
- botSim 7/7·coreChecks 9/9 · battle/botSim/tuning/assets.js 무변경.

## WATCH
- inn PORTRAIT는 46×40으로 작아 얼굴 위주로 크롭됨(object-fit cover). 어색하면 THUMB로 낮출 여지(현재는 소개 카드 기준 PORTRAIT 채택).
- RORIN/CAEL은 기본 파티 밖이라 미표시 — 파티 편성 시스템은 별도 카드.
- 스크린샷은 앱 상시 rAF로 preview_screenshot 타임아웃 → DOM 실측으로 검증, 최종 눈맛은 나라님 포그라운드.
