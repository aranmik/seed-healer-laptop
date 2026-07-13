# Demo v1 Final Lock Hotfix 02

작업일: 2026-07-12 · 담당: 렌(Dev) · 판정: **PASS(렌 자체·로컬+공개 URL)** · 나라님 최종 확인 대기
기준: Mobile Fit Hotfix 01 이후, Lock & Archive 직전 마지막 핫픽스 2건. 새 시스템/기능/밸런스 변경 0.
범위: A ARIA 시각 위치 미세 조정(우측 이동) · B 최초 진입 stutter 완화 preload. **★게임 기능/밸런스/보스·스킬 수치/은총 계약/위협 대기열/모바일핏 무변경 · canonical 무접촉.**

## 1. 변경/신규 파일
| 파일 | 성격 | 내용 |
|---|---|---|
| `index.html` | 변경(visual + preload only) | A ARIA left 50→63% + heal-ring 추종 · B preloadCoreAssets(비차단·backstop) |
| `src/dev/finalLockHotfixCheck.js` | **신규** | 17체크(A ARIA 7·B preload 8·C 보호 2) |
| `src/dev/bossTelegraphAttackFxCheck.js` | 변경(갱신) | F2 ARIA 위치 assertion left 50→63% |
| **동결(무접촉)** | — | `tuning.js`(`d1420e6f…`)·`botSim.js`(`798afb6a…`)·`probeSim.js`(`ce1cc507…`)·`battle.js`·`bossProbes.js`·`skillPool.js`·`assets.js` |

## 2. A. ARIA 시각 위치 미세 조정
- **요청**: ARIA를 정중앙 아래 → **오른쪽으로만** 이동해 전사(중앙)-마법사(우 후방) 사이에 비껴 서게. 하단 후방 정체성 유지.
- **변경(★시각 좌표만)**: `.bf-aria{left:50%→63%; bottom:2%(유지); transform:translateX(-50%)(보존)}` · 발밑 온기 링 `.bf-heal-ring{left:50%→63%}`(ARIA 추종).
- **실측(390px·3보스 동일)**: ARIA center-x = **246**(전사 195 ↔ 마법사 336 사이·우측 비껴) · heal-ring center-x 246(ARIA 추종). "사제가 뒤에서(전사-법사 사이) 지원한다" 읽힘. 전사로 가는 지원 FX 가독성↑.
- **★보호(무변경)**: actor id(act-0)·전투 계산·타깃/HP/행동명/이벤트 그대로. `supportSpark`(사제→대상)는 `actorEls[0]` **bounding rect 실시간 계산** → 새 위치 자동 추적. `cast-pulse/cast-ring`은 actorEls[0] filter(위치 무관). 머리 위 행동명/skillMark는 actorEls[idx] 종속 → 새 위치 정상. transform translateX(-50%) 보존으로 hero-hit(heroHitC) 반응 keyframe 정합.

## 3. B. 최초 진입 preload / decode
- **문제**: 최초 실행/첫 진입 시 이미지 최초 decode로 살짝 까닥거림.
- **구현**: `preloadCoreAssets()` — 연결된 **핵심 런타임 자산만** 백그라운드 preload+decode.
  - **매니페스트(연결된 런타임만·자동 수집)**: `ASSETS.ui`(배경) · `ASSETS.boss`(골렘 idle+12pose+idle loop) · `ASSETS.icons`(스킬 아이콘) · `ASSETS.priest` · `HERO_V002` crops(고정 파티 4+배우 field/portrait/thumb) · `BOSS_PROBES` water/naga idle · `skillPool.iconImg`(vow/seed/**은총**). **실측 51개**.
  - **제외**: `/source/`·`_intake`·`MAGENTA`·`MASTER`·`POSESHEET` 정규식 필터 → **미사용 대형 원본/master/source preload 0**(실측 bad=0). 확장자 필터(png/jpg/webp)로 "모든 파일" 방지.
  - **비차단**: `new Image()+img.decode()`를 `Promise.allSettled`로 병렬·**실패 허용**(per-image `.catch()`) · 전체 `try/catch`(실패해도 게임 정상·fallback 유지). 게임은 preload를 **대기하지 않음**.
  - **시작 시점**: 첫 페인트 후 — `requestIdleCallback({timeout:1000})` 조기 시작 + `setTimeout(800)` **backstop**(중복 가드 `__preloadStarted`). ★Safari(requestIdleCallback 미지원)·hidden 탭 모두에서 반드시 1회 실행. 외부 네트워크 의존 0.
- **효과**: 타이틀 노출 직후 백그라운드로 51개 핵심 자산 로드+decode 완료 → 전투/보스/성소 첫 진입 시 이미 캐시+decode됨 → 최초 decode stutter 완화. 재도전/다음 전투는 브라우저 캐시로 유지. preload 완료 여부와 무관하게 게임은 즉시 진행(대기 0).

## 4. 검증 결과 (2026-07-12)
| 검증 | 결과 |
|---|---|
| **finalLockHotfixCheck (신규)** | **17/0 ALL PASS** (A ARIA 7·B preload 8·C 보호 2) |
| botSim 16/0 · probeSim ALL PASS · canonical md5 3파일 불변 | |
| 회귀 전체 ALL PASS | mobileFitHotfix 19 · demoV1FinalMicroPolish 20 · finalBattleReadability 42 · skillPoolContract 39 · coreExtension 42 · callResponse 22 · skillFx 28 · **bossTele 29(ARIA 갱신)** · spacing 16 · clarity 26 · shrine 29 · loadoutLink 26 · balance 19 |
| **로컬(5181·390px)** | ARIA cx 246(전사195↔법사336 사이·3보스 동일) · heal-ring 추종 246 · **preload total 51/done 51/ready true·bad(master/source) 0** · overflow 0 · console 0 · broken 0 · 3보스 이름 정상 |
| **공개 URL(https://aranmik.github.io/seed-healer-laptop/·390px)** | (§5 재배포 후 실측) |
- ★frozen-tab: requestIdleCallback은 hidden 프리뷰서 미발동 → **setTimeout backstop**으로 실동작 확인(총 51 preload/decode 완료 실측). 스크린샷은 rAF 타임아웃 → DOM/geometry/performance/console 증빙. 실눈맛=나라님 폰.

## 5. push / Pages 재배포
- (§commit/push 후 기입) commit hash · Pages build · 공개 URL 재검증.

## 6. 보호/정본 유지
- Demo v1 전투 손맛·3보스 수치·seed 제품9/canonical12·은총 계약·9풀6장착·위협 대기열·mobile fit hotfix 반영·공개 URL 배포 상태 전부 유지.
- canonical(tuning/botSim/probeSim) md5 불변 · battle.js/bossProbes/skillPool/assets 무접촉 · 변경은 index.html(visual+preload) + dev 체크뿐.

## 7. 나라님 실제 폰 재확인 포인트
- ARIA가 오른쪽으로 비껴(전사-마법사 사이) 서서 더 마음에 드는지 · 전사에게 가는 보호막/치유/서약/씨앗 FX가 더 잘 보이는지.
- 전장 구도(전사 중앙 / 도적 좌 / 법사 우 / ARIA 우하단 후방)가 자연스러운지.
- 최초 실행/첫 전투·첫 보스·첫 성소 진입 때 **까닥거림이 줄었는지** · preload 때문에 첫 화면이 멈추거나 어색한 대기가 없는지.
- 위협 대기열/토스트/마나 pill/은총/이름 매핑/포기/재도전 그대로 정상인지.

## 8. Lock & Archive 진입 가능 여부
- 나라님 폰에서 "ARIA 위치 더 좋다 + 까닥거림 줄었다" 확인되면 → **Demo v1 Lock & Archive 01**(최종 tag·불변 잠금) 바로 진입.

## 다음
- commit/push → Pages 재배포 → 공개 URL 390 재검증 → 나라님 폰 재확인 → Demo v1 Lock & Archive 01.
