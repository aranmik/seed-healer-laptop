# Hero Placement Policy 01 — ARIA Anchor / Ally Row 분리

작성: 렌(Dev) · 2026-07-05 · 결정: 유키PD
성격: **시각 배치 정책 문서 (기능 시스템 추가 아님).** runtime/assets.js 미연결. 전투 손맛/botSim 무영향.

---

## A. 정책 결정 (Policy)

**EN**
- ARIA is not an ally-row field unit.
- ARIA is the Priest / Player Anchor.
- Ally field row candidates are ELI, THORNE, LUMINA, RORIN, CAEL.
- ARIA FIELD v003 recrop is deferred.

**KR**
- ARIA는 동료 row 공용 FIELD 유닛이 아니다.
- ARIA는 주인공 사제 / 플레이어 anchor로 별도 배치한다.
- 동료 FIELD row 후보는 ELI, THORNE, LUMINA, RORIN, CAEL이다.
- ARIA FIELD v003 재크롭은 보류한다.

## B. 이유 (Rationale)
- ARIA FIELD v002 = **345×1013**(세로가 긴 전신). 종횡비 ≈ 0.34.
- 다른 동료 FIELD v002 = 대체로 **약 350×450 전후**(반신/준전신). 종횡비 ≈ 0.72~0.83.
  - ELI 354×458 · THORNE 411×484 · LUMINA 385×492 · RORIN 318×441 · CAEL 346×442.
- 같은 ally row 높이(예: 120px)로 맞추면 ARIA만 폭 ~41px로 **혼자 너무 얇게** 보임(Runtime Preview 01 WATCH 실측).
- Seed Healer 정체성: ARIA는 공격 동료가 아니라 **"죽기 직전까지 붙잡는 사제"** = 플레이어 자신. 공용 ally row가 아니라 **별도 anchor(하단 중앙/플레이어 위치)**가 자연스럽다.

## C. 이후 연결 원칙 (Downstream)
- **assets.js hero asset slot 등록은 다음 별도 카드**에서 진행(이번 미수행).
- **battle.js 연결은 그 이후 별도 카드**에서 진행(이번 미수행).
- 이 문서는 **기능 시스템 추가가 아니라 visual placement policy**다.
- 전투 손맛 / botSim baseline에 **영향 없음**.
- PORTRAIT / THUMB는 ARIA 포함 6명 **동일 규칙**으로 사용 가능(별도 취급은 **FIELD 한정**).

## D. 배치 요약 (실 연결 시 지침)
| 용도 | 대상 | 배치 |
|---|---|---|
| Ally field row | ELI, THORNE, LUMINA, RORIN, CAEL | 하단 동료 열(공용 스케일, height 정규화) |
| Priest / Player anchor | ARIA (FIELD) | 하단 중앙 별도 위치(전신 그대로, 공용 스케일 제외) |
| Portrait (카드) | 6명 전원 | 카드 이미지(정사각 cover) |
| Thumb (HUD/파티) | 6명 전원 | 48/64/96px 아이콘 |

## E. 확인용 dev preview
- `dev/hero-placement-policy-preview-01.html` (이 정책을 390×844 mock에서 확인)

## F. Asset Slot 등록 (Hero Asset Slot Link 01)
- Hero Asset Slot Link 01에서 **`HERO_CROP_ASSETS_V002`가 `src/ui/assets.js`에 등록됨**(additive · 기존 export 무변경).
- ARIA placement는 `priestAnchor`, anchorSize는 `medium`, anchorHeightPx는 `170`으로 1차 등록됨.
- ELI/THORNE/LUMINA/RORIN/CAEL placement는 `allyRow`.
- **battle.js runtime 연결은 아직 하지 않음**(별도 카드).
- 등록 검증 dev viewer: `dev/hero-asset-slot-link-01.html`

## G. Battle Visual Link 01 (dev 검증 · 라이브 연결 보류)
- Hero Battle Visual Link 01: `HERO_CROP_ASSETS_V002`를 전투 프레임 visual로 배치하는 **dev 검증**(`dev/hero-battle-visual-link-01-check.html`)에서 확인 — allyRow=ELI/THORNE/LUMINA/RORIN/CAEL FIELD, ARIA=priestAnchor medium 170px(하단 중앙·HUD 미가림).
- ★**라이브 전투 화면 연결은 보류**: 이 프로젝트의 전투 렌더/스타일은 전부 `index.html` 인라인에 있고 허용 대상 `src/ui/render.js`·`src/ui/styles.css`는 존재하지 않음. 라이브 표시는 index.html 수정이 필요하나 이번 카드에서 index.html은 수정 금지 → 유키PD 판단 대기.
- battle.js/botSim/tuning 로직 무변경.

## H. Battle Live Visual Link 01 (라이브 연결 완료)
- Hero Battle Live Visual Link 01: **index.html의 live battle visual layer에 `HERO_CROP_ASSETS_V002`를 제한적으로 연결**(유키PD가 index.html 수정 제한 허용). `#battlefield` 내부 `pointer-events:none` 오버레이(`.hero-vis-layer`) + 토글(🦸 HERO v002).
- ARIA는 priestAnchor medium **170px**(하단 중앙), allyRow는 ELI/THORNE/LUMINA/RORIN/CAEL FIELD로 표시. battle state 무연결·read-only·전투 결과 무관.
- battle.js/botSim/tuning 로직 무변경(botSim 7/7·coreChecks 9/9 유지). ★직전 Battle Visual Link 01이 PARTIAL이었던 사유(전투 렌더가 index.html 인라인)를 이번에 index.html 편집 허용으로 해소.
- ★WATCH: 현재는 실제 3-party 액터 위에 5+ARIA showcase를 겹쳐 표시(디커플드)라 전장이 다소 붐빔 → 토글로 off 가능. 실제 party 액터 비주얼 교체는 별도 카드.

## I. Battle Actor Bind 01 (실제 액터 바인딩 완료)
- Hero Battle Actor Bind 01: 실제 party actor visual을 v002 FIELD로 바인딩(img.src만 교체·visual-only·read-only). 매핑 v0: **warrior→ELI · rogue→THORNE · mage→LUMINA · 사제 액터(act-0)→ARIA FIELD(priestAnchor medium 170px, `.hv-aria-bound` CSS)**. 기존 dead/shielded/tgt/selactor/breath 클래스 시스템 전부 유지 작동.
- Live Visual Link 01의 5명 showcase 레이어는 **dev 확인 전용 default OFF**(토글 라벨 🦸 SHOWCASE)로 강등. RORIN/CAEL은 v0 기본 표시 대상 아님(showcase에서만).
- battle.js/botSim/tuning/파티 데이터 무변경(botSim 7/7·coreChecks 9/9 유지).

## J. Village Screen Portrait Link 01 (초상 UI 연결)
- 마을/여관/전투준비/하단 파티카드 초상을 v002 PORTRAIT/THUMB로 연결(visual-only·read-only). battlefield FIELD actor bind는 별개로 유지. 상세: docs/VILLAGE_SCREEN_PORTRAIT_LINK_01.md.
- 여관=PORTRAIT · 전투준비/파티카드=THUMB · 마을/결과=초상 없어 해당없음 · RORIN/CAEL 기본파티밖 미표시. battle/botSim/tuning/assets.js 무변경.
