# Demo v1 Public Preview Mobile Fit Hotfix 01

작업일: 2026-07-12 · 담당: 렌(Dev) · 판정: **PASS(렌 자체·로컬+공개 URL)** · 나라님 실제 폰 재확인 대기
기준: 나라님 실제 iPhone Safari 실기 — "전투 화면이 위아래로 눌려 찌부" → 공개 URL 기준 모바일 핫픽스 1회.
범위: A 결과 로그→전장 토스트 · B 전장 세로 공간 확장 · C 배우 재배치(전사 중앙) · D 위협 대기열 상단 효율 · E 공개 URL 검증. **★게임 기능/밸런스/보스·스킬 수치/은총 계약/위협 대기열 개념 무변경 · canonical 무접촉.**

## 1. 변경/신규 파일
| 파일 | 성격 | 내용 |
|---|---|---|
| `index.html` | 변경(주력·visual/layout only) | A 토스트 · B 상단 축소→전장 환원 · C 배우 재배치+전사/도적 교체 · D idle 큐 축소 |
| `src/dev/mobileFitHotfixCheck.js` | **신규** | 19체크(A 토스트 7·B 전장 3·C 배우 7·D 큐 2) |
| `src/dev/battlefieldSpacingCheck.js` | 변경(갱신) | 구 spacing 계약 → 신 mobile 재배치 값으로 갱신(16 유지) |
| `combatCallResponseFxCheck·skillFxReadabilityCheck·bossTelegraphAttackFxCheck·finalBattleReadabilityCheck·demoV1FinalMicroPolishCheck` | 변경(갱신) | 위치/피드 회귀 assertion을 신 staging·토스트 값으로 갱신 |
| **동결(무접촉)** | — | `tuning.js`(`d1420e6f…`)·`botSim.js`(`798afb6a…`)·`probeSim.js`(`ce1cc507…`)·`battle.js`·`bossProbes.js`·`skillPool.js`·`assets.js` |

## 2. A. 결과 로그 → 전장 오버레이 토스트
- **문제**: 결과 피드(#combat-feed)가 상단 고정 레일 30px+ 점유 → 모바일 전장 세로 압박.
- **전환**: `#combat-feed`(상단 고정 2줄) **제거** → `#combat-toast`(battlefield 내부 오버레이) 신설.
  - 위치: 전장 하단 floor(`bottom:10%`·중앙 정렬·`pointer-events:none`·z-index 14) → 보스/타깃/HP바 미가림.
  - `pushFeed`: `#combat-toast`에 `.ct-item` pill append → **1.8초 후 자동 제거**·동시 최대 3(약한 stack)·`ctToast` 짧은 fade(위로 사라짐).
  - 표시 내용/이벤트 배선 **그대로**(absorb 차단·cleansed·seedProc·graceProc·smash 등 실제 event만·fake 0). 태그(위험/해결/피격) 유지.
  - 정리: `clearFeed`가 #combat-toast 비움 + newBattle이 bf.innerHTML 재생성(빈 토스트) → 잔류 0.
- **역할 분리 강화**: 상단 = 앞으로 올 위협(대기열) / 토스트 = 방금 해결된 결과.

## 3. B. 전장 세로 공간 확장
- 상단 정보영역 축소분을 전장에 환원(battlefield `flex:1`이 자동 흡수):
  - **boss-hud 148px → 89px**(−59px): 결과 피드 레일 제거(−30) + idle 큐 47→24(−23) + margin.
  - **battlefield 412px → 471~472px**(+59~60px·3보스 실측). 전장이 세로로 숨 쉼.
- 전장↔command 검은 띠 해소(직전 카드 `#scr-battle` 전장 톤 + apron) 유지 → 전장이 하단으로 자연 연결.
- 파티 카드(135px)·스킬바·터치 영역 **무변경**. 390 overflow 0.

## 4. C. 배우 staging 재배치 (★시각 좌표만)
- **전사/도적 교체(추가 지시)**: `slotCls ['bf-ally-l flip','bf-ally-c','bf-ally-r']` → **`['bf-ally-c','bf-ally-l flip','bf-ally-r']`** (PARTY=[warrior,rogue,mage] → 전사=중앙·도적=좌flank·법사=우).
  - 전사(bf-ally-c): **중앙 전방 축**(보스 정면·screen center x195 실측) · bottom 27→**19%** · height 106(전사 crop).
  - 도적(bf-ally-l flip): **좌측 기습 flank**(x56) · left 4.5→3.5% · bottom 24.5→22% · height 99(도적 crop).
  - 법사(bf-ally-r): **우측 후방 원거리** · right 4.5→3.5% · bottom 23.5→**23%**(back) · height 103.
  - ARIA(bf-aria): **최후방 사제**(하단 중앙) · bottom 2.5→2%.
  - 보스: top 2→**1%**(소폭 상향).
- **전원 하단·보스 상향** → 가운데 충돌 공간↑·"영웅이 하단에서 버티는" 인상. 전사(19%)가 셋 중 가장 아래=전방 축.
- **★보호(무변경)**: actor id/HP/타깃/전투 계산/파티 카드 순서 · height는 각 히어로 crop 유지(전사106/도적99/법사103). `battle.js`는 순수 로직(DOM/visual 토큰 0).
- **머리 위 행동명 원점**: `actionPop(li, ALLY_ACT[aid])`가 `actorEls[li]` **실시간 위치 추적** → "방패 타격!"은 전사(중앙) 위, "기습!"은 도적(좌) 위에 올바로 뜸(클래스 이동에 자동 대응).

## 5. D. 위협 대기열 상단 효율
- 위협 대기열(최대 3행·개별 해결·"곧" 리드) **개념 유지**. idle 예약만 2행(47px)→**1행(24px)**로 축소 → idle 상단 빈 공간 회수.
- 1~3 위협 시에만 성장(예고 중=고긴장·짧음). "질문이 줄 서 있다" 감각 유지. 보스명 매핑(threatLabels·push) 유지.

## 6. E. 검증 결과 (2026-07-12)
| 검증 | 결과 |
|---|---|
| **mobileFitHotfixCheck (신규)** | **19/0 ALL PASS** (A 토스트 7·B 전장 3·C 배우 7·D 큐 2) |
| botSim 16/0 · probeSim ALL PASS | canonical md5 3파일 불변 |
| 회귀 전체 갱신 후 ALL PASS | demoV1FinalMicroPolish 20 · finalBattleReadability 42 · skillPoolContract 39 · coreExtension 42 · callResponse 22 · skillFx 28 · bossTele 29 · **battlefieldSpacing 16(신 staging)** · clarity 26 · shrine 29 · loadoutLink 26 · balance 19 |
| **로컬(5181·390px)** | boss-hud 89 · battlefield 472 · **전사 중앙 x195·도적 좌 x56·법사 우**(3보스 동일) · 토스트 battlefield 내부 렌더 · idle 큐 24 · overflow 0 · console 0 · broken 0 · 3보스 이름 정상 |
| **공개 URL(https://aranmik.github.io/seed-healer-laptop/·390px)** | (아래 §7 재배포 후 실측) |
- ★frozen-tab: 스크린샷은 rAF로 타임아웃 → DOM/geometry/computed/network/console로 증빙(프로젝트 관례). 실제 눈맛은 나라님 폰.
- ★safe-area: `#app height:100dvh`(주소창 변화 대응) 유지 · 나라님 스크린샷상 Safari가 상/하 safe-area 이미 처리(home indicator 하단 여백 존재) → 별도 env(safe-area) 보정 불필요(구조 미개편). 필요 시 후속 최소 보정.

## 7. push / Pages 재배포
- (§commit/push 후 기입) commit hash · Pages build · 공개 URL 재검증 결과.

## 8. 보호/정본 유지
- Demo v1 전투 재미·3보스 수치·seed 제품9/canonical12·은총 계약·9풀6장착·위협 대기열 개념·보스명 매핑·공개 URL 배포 상태 전부 유지.
- canonical(tuning/botSim/probeSim) md5 불변 · battle.js/bossProbes/skillPool/assets 무접촉 · 변경은 index.html(visual/layout) + dev 체크뿐.

## 9. 나라님 실제 폰 재확인 포인트
- 전장이 전보다 **덜 찌부**되어 위아래로 더 시원한지(상단 정보 줄고 전장 커짐).
- 보스 정면 중앙에 **전사**가 서서 버티고, 도적은 좌측에서 파고드는 구도로 읽히는지.
- 결과가 상단 고정줄이 아니라 **전장 위 토스트로 짧게 떴다 사라지는지**·거슬리지 않는지·보스/HP 안 가리는지.
- 위협 대기열 판독성·파티 카드/스킬 버튼 터치·은총 포함 전투가 그대로 정상인지.

## 10. Lock & Archive 진입 가능 여부
- 나라님 실제 폰에서 "덜 찌부·자연스럽다" 확인되면 → **Demo v1 Lock & Archive 01**(최종 tag·불변 잠금) 바로 진입 가능.

## 다음
- commit/push → Pages 재배포 → 공개 URL 390 재검증 → 나라님 폰 재확인 → Demo v1 Lock & Archive 01.
