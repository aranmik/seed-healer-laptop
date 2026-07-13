# Demo v1 Lock & Archive 01

작성일: 2026-07-12 · 담당: 렌(Dev) · 판정: **Seed Healer Demo v1 — FINAL PASS / LOCKED**
공개 URL: https://aranmik.github.io/seed-healer-laptop/ · 저장소: https://github.com/aranmik/seed-healer-laptop (public)
tag: **`demo-v1.0.0`** (annotated) → 잠금 커밋(본 문서 포함 docs 커밋)

---

## A. 최종 판정
- **Seed Healer Demo v1 = FINAL PASS / LOCKED.**
- 나라님 최종 실기 승인 — 로컬 3보스 전부 클리어 + 손맛 FINAL PASS, 공개 GitHub Pages 모바일(iPhone Safari) 실기 PASS.
- Mobile Fit Hotfix 01(전장 찌부 완화) + Final Lock Hotfix 02(ARIA 위치·이미지 preload)까지 반영·PASS.
- **판단: 이 Demo는 "어떤 게임을 하려는지"를 충분히 전달한다** — 공격하지 않는 사제가 전장을 읽고 파티를 살려내는 3보스 Vertical Slice의 손맛이 완성되었다. 현재 공개 LIVE 버전을 불변 정본으로 확정한다.

## B. 잠긴 제품 범위 (이 버전에 포함·고정)
- **보스 3종**: Earthroot Golem(대지뿌리 골렘) · Water Spirit(물결 성소의 정령) · Naga Warrior(나가 워리어).
- **고정 파티 4명**: ELI(방패 전사) · THORNE(차단 도적) · LUMINA(화염 마법사) · ARIA(사제·플레이어).
- **9스킬 풀 / 정확히 6개 장착**: 빠른치유·보호막·정화·구원·지속·고리 + 수호의 서약·기도 씨앗·**은총의 순간**.
- **은총의 순간**: 마나 0·긴 재사용, 8초 안 다음 성공한 기도 1회를 무료로(마나 운영 전략).
- **최대 3행 위협 대기열**(실제 telegraph 기반·개별 해결) + **전장 결과 토스트**.
- **최종 모바일 staging**: 전사 중앙(전방 축) / 도적 좌 flank / 법사 우 후방 / ARIA 우하단 후방 / 보스 상향.
- **핵심 이미지 preload**(51개 연결 런타임 자산·비차단).
- **공개 GitHub Pages 버전**(정적 HTML/CSS/JS·상대경로·저장 없음).

## C. 명시적 미포함 (누락 오류 아님 · 의도적 범위 밖)
- **사운드** — ★Demo v1의 **의도적 범위 밖**. 누락/미완료(blocker) 아님. Demo v1 잠금 이후 별도 후속 단계에서만 검토.
- 저장/기록 실데이터 · 성장/보상/장비 · 추가 보스 · 추가 동료 · 추가 스킬 · 스토리 확장 · 다중 난이도.

## D. 잠금 규칙
- **Demo v1 runtime 직접 수정 금지** (게임 기능/밸런스/UI/FX/배치/로딩 코드).
- **추가 기능·추가 핫픽스 금지** (bug hotfix 명목 포함).
- 후속 개발은 **별도 버전/브랜치/카드**에서 시작한다(이 정본을 직접 고치지 않는다).
- **tag `demo-v1.0.0` 정본은 이동·재작성 금지** · **force push / tag overwrite 금지** · history rewrite 금지.

## E. 최종 증빙 (잠금 시점)
- **런타임 정본 = 코드 커밋 `9c2db82`** (fix(final-lock): ARIA offset right + core-asset preload — 마지막 runtime 변경). 이후 문서만 변경.
- **tag**: `demo-v1.0.0` (annotated) → 본 문서를 포함한 잠금 docs 커밋(정확한 hash는 잠금 커밋/보고 참조).
- **공개 URL**: https://aranmik.github.io/seed-healer-laptop/ (HTTP 200 · Pages build `built`).
- **대표 검사(2026-07-12 잠금 직전·런타임 무변경 상태 실행) — 전부 PASS**
  - finalLockHotfix 17/0 · mobileFitHotfix 19/0 · demoV1FinalMicroPolish 20/0 · finalBattleReadability 42/0 · skillPoolContract 39/0 · battleCoreSkillExtension 42/0 · combatCallResponseFx 22/0 · skillFxReadability 28/0 · bossTelegraphAttackFx 29/0 · battlefieldSpacing 16/0 · combatClarityExit 26/0 · shrineLoadout 29/0 · battleLoadoutLink 26/0 · threeBossLoadoutPressureBalance 19/0
  - botSim 16/0 · probeSim 26/0 (ALL PASS)
- **canonical md5 (불변·동결)**
  - `src/data/tuning.js`  = `d1420e6f220043a147674be09208038d`
  - `src/dev/botSim.js`   = `798afb6a98d8780ed81372696e1a1103`
  - `src/dev/probeSim.js` = `ce1cc5070c7a8063949a2350611566db`
- **주요 파일 SHA-256 (런타임 정본 지문)**
  - `index.html`            = `37572bae3da473a8f923361e05f79adce0700146c4961a2d280217b1426c572b`
  - `src/core/battle.js`    = `a749011d0e04acd3c787a869099c8628b81db7e8b0104a699c6207df3fc8e748`
  - `src/data/tuning.js`    = `818729ef67bc3d0fd1119912d7b153487da6800cd0a8178a0198481303070357`
  - `src/data/bossProbes.js`= `ee51efd0504e44514db3bfa9e1c2b5c553337807baa711572e59367465a3cb06`
  - `src/data/skillPool.js` = `d2462ac8f18192c0f98c1f68f7914f75c7af8583b274baa533bb6c5be0d02f81`
  - `src/ui/assets.js`      = `3e62131c5d1b9e2d8bce7d81fe07e7f2ae6a8b0b6cd4817ddd682adc432d98cf`
- **잠금 시 상태**: working tree clean · local HEAD == origin/main · repo visibility PUBLIC · 기존 동일 tag 없음(신규 생성).
- **공개 URL smoke(390px)**: 첫 진입 타이틀 · 3보스 이름 정상(물/나가 "골렘" 0) · 9풀/6장착 · 은총 아이콘+무료 pill · 위협 대기열/토스트 · staging(전사195/도적56/법사336/ARIA246) · preload 51 · overflow 0 · console error 0 · broken 0.

## 개발 종료
- **Seed Healer Demo v1 개발 종료(LOCKED).** 추가 기능·핫픽스 없이 이 정본으로 고정한다.
- GitHub Release는 선택 사항 · 별도 바이너리/중복 ZIP을 repo에 추가하지 않는다(tag/source archive가 정본 다운로드 수단).
