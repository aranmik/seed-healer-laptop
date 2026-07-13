# Demo v1 Completion Checklist 01

작성일: 2026-07-12 · 담당: 렌(Dev) · 기준: Demo v1 FINAL PASS(나라님 3보스 실기·은총 손맛/아이콘·공개 모바일 실기 확인 완료)
상태: **✅ 완료 / LOCKED (2026-07-12)** — 로컬·공개 배포·휴대폰 실기·잠금 전부 PASS. tag `demo-v1.0.0`.

## A. 로컬 완성 (전부 PASS)
- [x] **로컬 3보스 FINAL PASS** — 골렘/물결 성소의 정령/나가 워리어 나라님 실기 완료.
- [x] **은총의 순간 손맛 FINAL PASS** — 마나 0·무료 시전 발동/읽힘/아이콘 조화 확인.
- [x] **canonical / 제품 분리 PASS** — tuning.js `d1420e6f…` · botSim.js `798afb6a…` · probeSim.js `ce1cc507…` md5 불변. 제품 override(씨앗9·골렘19/24·물132·은총)로만 적용.
- [x] **전체 회귀 PASS (2026-07-12 잠금 직전 실행)**
  - finalLockHotfixCheck 17/0 · mobileFitHotfixCheck 19/0 · demoV1FinalMicroPolishCheck 20/0 · finalBattleReadabilityCheck 42/0 · skillPoolContractCheck 39/0 · battleCoreSkillExtensionCheck 42/0 · combatCallResponseFxCheck 22/0 · skillFxReadabilityCheck 28/0 · bossTelegraphAttackFxCheck 29/0 · battlefieldSpacingCheck 16/0 · combatClarityExitCheck 26/0 · shrineLoadoutCheck 29/0 · battleLoadoutLinkCheck 26/0 · threeBossLoadoutPressureBalanceCheck 19/0
  - botSim 16/0 · probeSim ALL PASS (26/0)
- [x] **3보스 이름 매핑** — 물/나가 전투 HUD·위협 대기열에 "골렘" 문구 0(실측).
- [x] **9풀 / 6장착** — 성소 9스킬 풀, 6슬롯 장착 구조.
- [x] **은총 아이콘 · 런타임** — 성소/전투 스킬바 img 로드·"무료" pill·무료 발동 읽힘.
- [x] **390px overflow 0 · console warn/error 0 · broken image 0** (로컬 5181 실측).
- [x] **포기/재도전/보스 변경 상태 초기화** — 위협 대기열·피드·머리표기·FX·grace 잔류 0.
- [x] **위협 대기열 1~3행** — 실제 B.tele(smash/tremor/root) 최대 3 독립 행·개별 해결·fake 예고 0.
- [x] **결과 토스트** — 상단 고정 레일 대신 전장 오버레이 토스트(Mobile Fit 01).
- [x] **최종 모바일 staging** — 전사 중앙(x195)·도적 좌(x56)·법사 우(x336)·ARIA 우하단 후방(x246)·보스 상향(3보스 실측 동일).
- [x] **핵심 이미지 preload** — 51개 연결 런타임 자산 비차단 preload/decode(master/source 제외·실패 허용).

## B. 공개 배포 (전부 PASS)
- [x] **공개 Pages 배포 (2026-07-12)** — repo `aranmik/seed-healer-laptop`(public) · **URL https://aranmik.github.io/seed-healer-laptop/** · main/root · HTTPS enforced · build `built`.
- [x] **경로/이미지/콘솔 (공개 URL)** — 공개 Linux 서버 실측: 전 자산 HTTP 200·**case 민감성 문제 0(broken image 0)**·console error 0·overflow 0·물/나가 "골렘" 잔류 0.
- [x] **desktop / 390px 검증** — 3보스 이름 정상 · 9풀/6장착 · 은총 아이콘+무료 pill · 위협 대기열/토스트 · staging · preload 51.
- [x] **휴대폰 실기 (나라님 폰·PASS)** — 실제 iPhone Safari 접속·조작 PASS(카드 최종 판정). Mobile Fit 01(찌부 완화)·Final Lock 02(ARIA·preload) 반영 후 재확인 PASS.
- [~] **다른 사람 별도 기기 접속 — 선택 검증 / 미수행 / non-blocking**. 필수 잠금 게이트 아님(정적 사이트·상대경로·공개 200 확인됨). 정직 기록: 제3자 별도 기기 실측은 수행하지 않음.
- [~] **favicon** — `/favicon.ico` 404(무해·기본 아이콘·신규 이미지 금지 범위라 미추가·non-blocking).

## C. 잠금 (완료)
- [x] **최종 commit** — 잠금 문서 커밋(§Lock & Archive 01) · working tree clean · local==origin.
- [x] **최종 tag** — `demo-v1.0.0` (annotated) → 잠금 commit.
- [x] **최종 잠금 문서** — `docs/DEMO_V1_LOCK_AND_ARCHIVE_01.md`.

## 결론
- 로컬·공개 배포·휴대폰 실기·잠금 게이트 전부 충족. **Seed Healer Demo v1 = FINAL PASS / LOCKED**. 이후 Demo v1 runtime 직접 수정 금지 — 후속은 별도 버전/브랜치/카드.
