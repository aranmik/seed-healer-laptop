# Shrine Skill Loadout Runtime 01

작업일: 2026-07-11 · 담당: 렌(Dev) · 판정: **★유키PD FINAL PASS (2026-07-11)**
기준: PRIEST_SKILL_POOL_8_LOADOUT_6_DATA_CONTRACT_01(FINAL PASS) · BATTLE_CORE_SKILL_EXTENSION_01(FINAL PASS) ·
DEMO_V1_IMPLEMENTATION_ROADMAP_01 Card 5 · "마을은 다음 전투의 답을 준비하는 곳이다."

## ★FINAL PASS 확정 기록 (유키PD · 2026-07-11)
- 성소 8종 표시·장착 6슬롯·tap-to-swap(미장착→슬롯)·드래그 없음·중복/빈슬롯 불가·breath 비노출/장착 불가·기본 구성 복원.
- 시설/보스 이동·마을 복귀 중 currentLoadout 유지 · 새로고침 기본 복귀 · 이번 카드는 실제 전투와 의도적 분리.
- shrineLoadoutCheck 29/0 · skillPoolContractCheck 34/0 · battleCoreSkillExtensionCheck 42/0 · botSim 16/0 · probeSim 26 ALL PASS · 전투 코어/tuning 무접촉.
- ★문서 정합 정정: 실제 변경/신규 파일 = **6개**(index.html · skillPool.js · shrineLoadoutCheck.js · SHRINE 문서 · BATTLE_CORE 문서 · ROADMAP 문서). 완료 보고의 "총 5개"는 오기.

성소(기도소)에서 Demo v1 스킬 8종 중 정확히 6종을 세션 기반으로 준비하는 tap-to-swap loadout UI.
★이번 카드 = 성소 UI + 세션 상태까지. **전투 스킬바 연결·new Battle 전달은 다음 카드(Battle Loadout Link 01).**
따라서 이번 카드가 끝나도 실제 전투는 계속 기존 기본 6스킬을 사용.

## 1. currentLoadout 세션 구조
- index.html 제품 Runtime에 `let currentLoadout = createDefaultLoadout()` + `let swapPick = null`(교체 대기 스킬 id) 추가.
- **전투용 `const LOADOUT`(=tuning.DEFAULT_LOADOUT·skill-bar/new Battle 소비)과 완전 분리** — 성소는 currentLoadout만 다룸.
- 정확히 6 · 순서 있음 · 중복 불가 · 빈 슬롯 불가 · 8중 6 · 저장 없음 · 새로고침 시 기본 복귀 · 세션 중 시설/보스 이동에도 유지 · 보스 변경 자동 교체 없음.
- 변경은 `sp_swapLoadout` 통과분만 반영(validateLoadout 최종 게이트).

## 2. 성소 UI 구조 (#scr-chapel · 390px)
- 상단: CHAPEL / 기도소 / 힌트 `다음 토벌에 가져갈 여섯 기도를 고릅니다.`(선택 대기 시 골드 강조 문구로 전환).
- A. **장착 슬롯 6**(`#ld-slots` · 3열×2행): 번호 1~6 + 아이콘 + shortName. 선택 대기 중 `.armed`로 6슬롯 골드 강조.
- B. **보유 8**(`#ld-pool` · 세로 스크롤): 카드 = 아이콘 + 이름 + 역할 라벨 + 플레이어 설명 + 장착 배지(장착 중/교체).
- 하단: `기본 구성으로` · `마을로 돌아가기`.
- 새 시설 없음 · 기존 5시설 문법 유지 · town-bg 위 scr-head/scr-content/back-row 레이아웃 유지.

## 3. 8종 pool / 6슬롯 표시
- 8종 전부 같은 UI 문법(신규 vow/seed도 기존 6종과 동일 카드) — "미구현"처럼 보이지 않음(코어 구현 완료·제품 준비 스킬로 표시).
- 현재 미장착 2종(기본=vow/seed)이 `장착 중`/`교체` 배지로 분명히 읽힘.
- `effect.draft`는 개발 메타 — 플레이어에게 노출 안 함(UI에 미표시).

## 4. tap-to-swap 흐름 (유키 권장: 미장착 → 슬롯)
1. 보유 풀의 **미장착** 카드 탭 → `swapPick` 설정 · 힌트 "‘◯◯’ — 교체할 슬롯을 고르세요" · 슬롯 6 골드 강조.
2. 장착 슬롯 1~6 중 하나 탭 → `swapLoadout(currentLoadout, swapPick, slotIndex)` → ok면 해당 슬롯 스킬과 교체.
3. 정확히 6 유지 · swapPick 해제 · 재렌더.
- 취소: 같은 미장착 카드 재탭 / 슬롯 아닌 곳 / **성소 화면 이탈(screenHook이 swapPick 해제)**.
- 드래그 앤 드롭 없음. 단일 흐름(미장착→슬롯)만 — 반대 흐름과 혼용하지 않음.

## 5. 중복 / 빈 슬롯 방지 방식
- **스왑(대체)만** 제공 → 길이 6 구조적 불변 · 빈 슬롯 발생 불가.
- `swapLoadout`이 이미 장착된 스킬 재장착(`loadout.includes`)·미장착 불가 스킬·범위 밖 슬롯·validateLoadout 실패를 전부 거부(원본 반환).
- 장착된 카드를 풀에서 탭 → **제거하지 않음**. 해당 슬롯 0.6s 초록 flash + "이미 장착 중입니다." 안내(토글 해제 방식 금지).

## 6. breath 비노출
- SKILL_POOL(catalog)에 breath 없음 → 성소 풀에 카드 생성 0(DOM 실측 `hasBreathCard:false`).
- swapLoadout/validateLoadout이 breath id를 dormant로 거부 → 장착 경로 구조적 차단.

## 7. 기본 구성 복원
- `기본 구성으로` 버튼 → `currentLoadout = createDefaultLoadout()` + swapPick 해제 + 재렌더.
- 확인 팝업 없음(저장 없어 과도한 경고 불필요). 기본 = 빠른치유/보호막/정화/구원/지속/고리.

## 8. 준비 화면 반영 여부와 이유 → **옵션 A 선택(성소 내부만)**
- **선택: A. 성소 내부에서만 loadout 확인 · 전투 준비 화면(prep)은 변경하지 않음.**
- 이유: 실제 전투가 아직 기본 6종(`const LOADOUT`)을 사용하므로, prep에 currentLoadout을 표시하면
  "준비 화면 표시 ≠ 실제 전투"의 불일치가 발생(§11 유키 경고). prep의 `prep-skills`는 현행대로 실제 전투 loadout(기본 6종)을
  정직하게 계속 표시 → 표시와 전투가 일치. currentLoadout의 prep/전투 반영은 다음 Battle Loadout Link 01에서 동시 처리.

## 9. 실제 전투 미연결 상태 (★핵심 격리)
- `skill-bar`(전투)·`new Battle(PARTY, LOADOUT, ...)`는 여전히 **const LOADOUT = DEFAULT_LOADOUT**(기본 6종) 소비.
- currentLoadout은 성소 렌더/스왑에서만 읽고 씀 · 전투 경로와 배열 자체가 분리.
- 브라우저 실증: 성소에서 씨앗을 슬롯1에 스왑 → 게시판→준비→전투 진입 → **전투 skill-bar 슬롯1 = 빠른치유**(씨앗/서약 미포함).

## 10. Battle Loadout Link(Card 6)에서 사용할 API / DOM
- **세션 상태**: `currentLoadout`(6종 배열·validateLoadout 통과 보장) → Card 6에서 `const LOADOUT` 대신 이 값을 `new Battle`·skill-bar 빌드에 주입.
- **스킬바 재렌더**: 현재 skill-bar 빌드(`$('skill-bar').innerHTML = LOADOUT.map(...)`)를 함수화해 currentLoadout으로 교체하면 됨.
- **아이콘 폴백 계약**: `skillIcon(sid)` — 기존 6종=연결 PNG(skillSpr), vow/seed=skillPool.iconChar(🕊️/🌱). **스킬바 연결에서도 동일 skillIcon 재사용 가능**(assets.js 무접촉 유지).
- **순수 helper**: skillPool.js의 `swapLoadout`(신규 additive)·validateLoadout·createDefaultLoadout·getUnequippedSkills.

## 11. 검증 결과 (2026-07-11 실측)
| 검증 | 결과 |
|---|---|
| node --check (skillPool·shrineLoadoutCheck 등) | 전부 OK |
| shrineLoadoutCheck | **29 PASS / 0 FAIL — ALL PASS** |
| skillPoolContractCheck | 34/0 ALL PASS |
| battleCoreSkillExtensionCheck | 42/0 ALL PASS |
| botSim | 16 PASS / 0 FAIL |
| probeSim | ALL PASS (26 checks) |
| 브라우저(5182 verify·375px) | 콘솔 error 0 · 슬롯 6 · 풀 8 · breath 카드 0 · tap-to-swap(vow→슬롯6·seed→슬롯5)·reset·장착 카드 "이미 장착 중"·**전투 skill-bar=기본 6종(격리)**·시설/보스 왕복 후 loadout 유지·가로 overflow 0(375=375)·broken img 0·vow/seed 🕊️/🌱 |
- shrineLoadoutCheck는 index.html 세션 로직(currentLoadout/swapPick/swap/reset/facility 이동)을 SessionModel로 미러링해 순수 로직·지속 불변식을 검증. DOM/화면 유지는 브라우저 실측으로 별도 확인.
- ★preview_screenshot은 이 프로젝트 상시 타임아웃 이슈로 실패 → DOM/console/geometry 실측으로 증빙(기존 카드와 동일).

## 12. Demo v0 / 3보스 보호
- 수정 금지 파일 mtime 무변동: src/core/battle.js · src/data/tuning.js · src/data/bossProbes.js · src/dev/botSim.js · src/dev/probeSim.js · src/ui/assets.js · 이미지/원본.
- 기본 URL Demo v0(골렘 9,600)·물정령/나가 probe·게시판 3보스 선택·selectedBoss·ARIA impulse·골렘 idle·cast-bar/스킬버튼 안정화 전부 유지(browser 실측·probeSim ALL PASS).
- 변경 파일: index.html(성소 UI·세션 상태·CSS) + skillPool.js(swapLoadout **additive** export만·기존 계약 불변) + 신규 shrineLoadoutCheck.js + docs.

## 13. WATCH
- ★신규 스킬은 성소에서 준비되지만 **아직 전투에 나가지 않음**(Card 6 전까지) — 나라님께 "성소에서 고른 새 기도는 다음 단계에서 실제 전투에 들어간다"는 점 안내 필요.
- assets.js EMOJI.skills에 vow/seed 없음은 유지(성소는 iconChar 폴백으로 해결·assets.js 무접촉). Card 6 스킬바 연결도 skillIcon 폴백 재사용 → assets.js 계속 무접촉 가능.
- prep 화면은 옵션 A로 미변경 — Card 6에서 currentLoadout을 prep·전투에 동시 반영.
- draft 수치(vow/seed)는 실기 미검증 — Card 6 연결 후 나라님 실기가 첫 손맛 검증.
- `skName` 상수(구 chapel 표시용)는 이제 미사용(무해·다른 코드 영향 0). 필요 시 후속 cleanup 카드에서 제거 가능.

## 다음
- 유키PD 판정 → **Card 6 Battle Runtime Loadout Link 01**(currentLoadout → skill-bar/new Battle 주입·prep 동시 반영·재도전/보스변경 일관·회귀 스윕) 착수 가능.
- 이후 Card 9 Skill FX Readability(vow/seed FX 식별) · Card 10 Three Boss Balance Pass.
