# Demo v1 Completion Checklist 01

작성일: 2026-07-12 · 담당: 렌(Dev) · 기준: Demo v1 FINAL PASS(나라님 3보스 실기 완료·은총 손맛/아이콘 확인 완료)
상태: **공개 URL 실기 대기** — 아래 로컬 항목 전부 PASS, 공개 배포 이후 항목은 대기.

## A. 로컬 완성 (전부 PASS)
- [x] **로컬 3보스 FINAL PASS** — 골렘/물결 성소의 정령/나가 워리어 나라님 실기 완료.
- [x] **은총의 순간 손맛 FINAL PASS** — 마나 0·무료 시전 발동/읽힘/아이콘 조화 확인.
- [x] **canonical / 제품 분리 PASS** — tuning.js `d1420e6f…` · botSim.js `798afb6a…` · probeSim.js `ce1cc507…` md5 불변. 제품 override(씨앗9·골렘19/24·물132·은총)로만 적용.
- [x] **전체 회귀 PASS (2026-07-12 실행)**
  - demoV1FinalMicroPolishCheck 20/0 · finalBattleReadabilityCheck 42/0 · skillPoolContractCheck 39/0 · battleCoreSkillExtensionCheck 42/0 · combatCallResponseFxCheck 22/0 · skillFxReadabilityCheck 28/0 · bossTelegraphAttackFxCheck 29/0 · battlefieldSpacingCheck 16/0 · combatClarityExitCheck 26/0 · shrineLoadoutCheck 29/0 · battleLoadoutLinkCheck 26/0 · threeBossLoadoutPressureBalanceCheck 19/0
  - botSim 16/0 · probeSim ALL PASS
- [x] **3보스 이름 매핑** — 물/나가 전투 HUD·위협 대기열에 "골렘" 문구 0(실측).
- [x] **9풀 / 6장착** — 성소 9스킬 풀, 6슬롯 장착 구조.
- [x] **은총 아이콘 · 런타임** — 성소/전투 스킬바 img 로드·"무료" pill·무료 발동 읽힘.
- [x] **390px overflow 0 · console warn/error 0 · broken image 0** (로컬 5181 실측).
- [x] **포기/재도전/보스 변경 상태 초기화** — 위협 대기열·피드·머리표기·FX·grace 잔류 0.
- [x] **위협 대기열 1~3행** — 실제 B.tele(smash/tremor/root) 최대 3 독립 행·개별 해결·fake 예고 0.

## B. 공개 배포
- [x] **공개 Pages 배포 (2026-07-12)** — repo `aranmik/seed-healer-laptop`(public) · **URL https://aranmik.github.io/seed-healer-laptop/** · main/root · HTTPS enforced · build `built`.
- [x] **경로/이미지/콘솔 (공개 URL)** — 공개 Linux 서버 실측: 전 자산 200(모듈/아이콘/스프라이트/배경/은총 아이콘)·**case 민감성 문제 0(broken image 0)**·console error 0.
- [x] **desktop / 390px 검증** — overflow 0 · 3보스 이름 정상(골렘 문구 0) · 성소 9풀/6장착 · 은총 아이콘·무료 pill · 위협 대기열 idle.
- [ ] **휴대폰 실기** — 나라님 게이트(실제 폰에서 접속).
- [ ] **다른 기기 접속** — 나라님 게이트.
- [~] **favicon** — `/favicon.ico` 404(무해·기본 아이콘·"신규 이미지 금지" 범위라 미추가). 외부 네트워크 의존성 0.

## C. 잠금 (다음 카드 — 이번 카드 범위 밖)
- [x] **릴리스 commit** — `3c9766a3af1922eabd6022bd33c67399d9eec50c` (main·209파일 89MB·runtime+docs) + 문서 URL 갱신 커밋.
- [ ] **최종 tag** — ★이번 카드에서 생성하지 않음. 나라님 휴대폰 실기 PASS 후 **Demo v1 Lock & Archive 01**에서.
- [ ] **최종 잠금 문서** — Lock & Archive 01.

## 다음
- 나라님 휴대폰/타 기기 실기(공개 URL) → PASS 시 **Demo v1 Lock & Archive 01**(최종 tag·불변 잠금).
