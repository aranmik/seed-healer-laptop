# Battle Loadout Link 01

작업일: 2026-07-11 · 담당: 렌(Dev) · 판정: **★유키PD FINAL PASS (2026-07-11)** · 나라님 실기 대만족
기준: SHRINE_SKILL_LOADOUT_RUNTIME_01(FINAL PASS) · BATTLE_CORE_SKILL_EXTENSION_01(FINAL PASS) ·
DEMO_V1_IMPLEMENTATION_ROADMAP_01 Card 6

## ★FINAL PASS 확정 기록 (유키PD · 2026-07-11)
- 성소 currentLoadout이 제품 단일 loadout 정본으로 연결 · 준비 화면/전투 스킬바/Battle snapshot 순서 일치.
- vow/seed 실제 전투 사용 가능 · 최소 chip/ARIA impulse 연결 · 기본 6스킬 Demo v0 호환 유지.
- battleLoadoutLinkCheck 26/0 · shrineLoadoutCheck 29/0 · skillPoolContractCheck 34/0 · battleCoreSkillExtensionCheck 42/0 · botSim 16/0 · probeSim 26 ALL PASS.
- ★나라님 3보스+신규 스킬 실기 = 대만족("너무너무 좋다·각 보스만의 맛·바로 이거다·Demo 완성 후보").

성소의 `currentLoadout` 6종을 **준비 화면 · 전투 스킬바 · Battle 생성자**에 연결 →
성소에서 고른 여섯 기도가 실제 전투에 나감. **loadout 정본을 currentLoadout 하나로 통일**(구 const LOADOUT 제거).

## 1. currentLoadout → battle snapshot 구조
- `let currentLoadout`(제품 세션 단일 준비 정본)을 index.html 상단에서 선언(성소·준비·전투 공용). 구 `const LOADOUT` 고정 정본 **제거**.
- **snapshot(§3)**: 전투 시작/재도전마다 `newBattle()`에서
  `battleLoadout = validateLoadout(currentLoadout).ok ? currentLoadout.slice() : createDefaultLoadout()`.
  - `.slice()`로 복사 → Battle이 원본 배열을 변형하지 않음 · 전투 중 세션 loadout 우발 변경 차단.
  - invalid(정상 UI 경로에선 미발생) 시 기본 6종 안전 fallback.
  - DEFAULT_LOADOUT은 이제 **fallback 전용**(두 정본 병존 제거).
- `new Battle(PARTY, battleLoadout, PROBE ? {tuning:{boss:PROBE.boss}} : {})` — 기존 생성 signature·probe override 경로 그대로. 기본/물정령/나가 동일 경로.

## 2. 준비 화면 / 스킬바 / Battle 연결
- **준비 화면**(`renderPrepSkills()`): prep 진입(screenHook) 시 currentLoadout 6종을 같은 순서로 아이콘 표시(shortName title). 추천/정답/draft 메타 없음.
- **스킬바**(`buildSkillBar(loadout)`): newBattle에서 battleLoadout 기준 6버튼 동적 렌더 → `data-slot` = Battle 내부 loadout 순서.
- **버튼 상태 루프**: `for s in B.loadout` — cooldown/마나/casting/gcd를 Battle 실제 상태에서 읽어 갱신(구 고정 LOADOUT 참조 제거).
- **입력**: 스킬바 클릭 → `B.use(slot)`(slot id를 직접 _resolve로 우회하지 않음). UI 버튼 순서 == Battle loadout 순서 보장.

## 3. 동적 스킬 버튼 구조
- 각 버튼: `.sbtn[data-slot=i][id=sb-i]` = 번호(i+1) + 아이콘 + shortName + `.rej`(거부 배지) + `.cd-veil`(쿨 숫자).
- 기존 visual grammar 유지(84px·btnNudge·rejShake·cd-veil). `btnEls`는 buildSkillBar가 매 전투 갱신.

## 4. 아이콘 fallback (성소·스킬바 공용 `skillIcon(sid)`)
- 기존 6종: `iconAssetKey` 존재 → `skillSpr(sid)`(연결 PNG). vow/seed: `iconAssetKey:null` → `skillPool.iconChar`(🕊️/🌱).
- **src/ui/assets.js 무접촉** — EMOJI.skills에 vow/seed 없어도 iconChar 폴백으로 해결. 성소·준비·스킬바 전부 동일 skillIcon 재사용.
- 긴 이름은 shortName(수호의 서약→서약·기도 씨앗→씨앗). 브라우저 실측: 버튼 84px 균일·가로 overflow 0·줄바꿈 없음.

## 5. vow/seed 타겟팅
- Battle core 규칙 그대로(코어 무변경): vow/seed = 살아 있는 단일 아군(target:'ally') · ARIA(sel=0) 포함 · dead 거부 · 활성 중 재적용 거부.
- 기존 6종 타겟팅 불변(salvation selfOnly · cleanse 조건부 · ring 전체). UI는 targetType 메타를 skillPool에서 참조 가능하나 **성공/거부 최종 정본은 `B.use(slot)` 결과**.

## 6. vow/seed 최소 기능 feedback (본격 FX polish 아님)
- **vowOn**: 대상 float `🕊️ 서약` + ARIA→대상 supportSpark + 사제 cast-pulse.
- **seedOn**: 대상 float `🌱 씨앗` + supportSpark + cast-pulse.
- **seedProc**: 작은 `🌱` pop(치유 +90 float·react-heal은 기존 heal 이벤트가 담당 — 재사용).
- ARIA가 연출 원점 · 실제 사용 이벤트가 있을 때만 재생(fake periodic 없음).
- 상세 색감/연출 polish는 **후속 Skill FX Readability 카드로 미룸**(§11).

## 7. 상태 chip 정본 (§10 준수)
- renderState가 매 프레임 **Battle 실제 상태**를 읽어 chip 렌더(UI 독립 타이머/충전 없음):
  - vow: `B.vow[i]` 존재 시 `🕊️{ceil(left)}` chip · 없으면 제거.
  - seed: `B.seed[i]` 존재 시 `🌱{charges}` chip(발동 시 ×3→×2→×1 자동 갱신) · 없으면 제거.
- 색: vow=흰금(보호막 파랑과 구분)·seed=올리브그린(지속 🌿과 이모지로 구분). chip 표시 상한 4.
- 전투 종료/재시작 시 새 Battle → 이전 vow/seed 상태 DOM 잔류 없음(renderState가 새 B 기준 렌더).

## 8. 재도전 / 보스 변경 / 마을 복귀 유지
- 재도전(end-retry→newBattle): 같은 selectedBoss·같은 currentLoadout → 새 snapshot·새 Battle(상태/쿨/마나 초기화)·loadout 순서 동일.
- 마을 복귀: currentLoadout 유지 · 성소 재진입 시 현재 구성 표시.
- 다른 보스 선택: currentLoadout 자동 변경 없음 → 같은 여섯 기도로 다른 보스 출전.
- 새로고침: currentLoadout 기본 6종 복귀.

## 9. 기본 Demo v0 호환
- 기본 loadout을 한 번도 안 바꾼 경우 skill bar = 빠른치유/보호막/정화/구원/지속/고리(순서·아이콘·이름 Demo v0 동일·브라우저 실측).
- 수치/타겟팅/쿨/마나/ARIA impulse/heal·shield·block feedback/cast-bar·버튼 안정성/골렘 9,600·idle/물·나가 baseline/게시판·전장 5인/결과·재도전·마을 복귀 전부 유지.

## 10. 검증 결과 (2026-07-11 실측)
| 검증 | 결과 |
|---|---|
| node --check (skillPool·4 dev 체크) | 전부 OK |
| skillPoolContractCheck | 34/0 ALL PASS |
| battleCoreSkillExtensionCheck | 42/0 ALL PASS |
| shrineLoadoutCheck (연결 상태로 갱신) | 29/0 ALL PASS |
| **battleLoadoutLinkCheck (신규)** | **26/0 ALL PASS** (A 기본4·B custom3·C vow5·D seed6·E 흐름4·F 격리5 — 실제 Battle에 custom loadout 주입해 slot↔skill·snapshot 격리 검증) |
| botSim | 16 PASS / 0 FAIL |
| probeSim | ALL PASS (26 checks) |
| 브라우저(5182 verify·375px) | 콘솔 error 0 · **기본 loadout skill bar = Demo v0 동일** · custom(vow/seed) 성소→준비→스킬바 일치(🕊️/🌱 slot 2/5) · **vow 라이브 시전(마나 100→87·chip 🕊️8·cd 12)** · **seed 라이브 시전(마나 100→88·chip 🌱3·cd 6)** · 버튼 84px 균일 · cast-bar 22px 고정 · broken img 0 · 가로 overflow 0(375=375) |
- ★frozen-tab: 프리뷰 탭 rAF 정지(boss HP 동결·gcd 미감소)는 이 프로젝트 상시 이슈 → **tick 의존 동작(seed proc-on-damage·gcd 감소·전투 완주·재도전 완결)은 battleLoadoutLinkCheck(D4 proc·shield 흡수·만료)+battleCoreSkillExtensionCheck가 헤드리스로 담당**. 클릭 핸들러는 renderState를 동기 호출하므로 시전 순간 chip/mana는 라이브 확인됨.

## 11. 상세 FX polish로 미룬 항목 (Skill FX Readability · Card 9)
- vow/seed 전용 색감·모션·대상 강조·seed proc 연출 강화 · 정화/지속 FX 식별력 보강.
- 이번 카드는 "실제 사용·상태를 읽을 수 있는 최소 기능"까지만.

## 12. 보호 / WATCH
- 수정 금지 파일 mtime 무변동: src/core/battle.js · src/data/tuning.js · src/data/bossProbes.js · src/dev/botSim.js · src/dev/probeSim.js · src/ui/assets.js · 이미지/원본.
- 변경/신규 파일(6): index.html · src/data/skillPool.js(변경 없음 — swapLoadout은 Card 5에서 이미 추가·이번 무접촉) · src/dev/shrineLoadoutCheck.js(연결 상태 라벨 갱신) · 신규 src/dev/battleLoadoutLinkCheck.js · 본 문서 · SHRINE FINAL PASS 기록 + Roadmap Card 6 포인터.
  ※실제 코드 변경 = index.html + shrineLoadoutCheck.js + 신규 battleLoadoutLinkCheck.js (skillPool.js는 이번 카드 무변경).
- ★WATCH: draft 수치(vow −40%/8s/13/12 · seed 90×3/15/12/6)는 아직 나라님 실기 미검증 — 이번 연결로 **나라님이 3보스에 vow/seed 실제 사용 가능** → Balance Pass(Card 10) 전 실기 손맛 확인이 다음 관문.
- ★WATCH: chip 표시 상한 4 — 한 유닛에 shield+vow+seed+hot+root 5종 동시 시 root chip이 밀릴 수 있음(실전 드문 조합·polish 카드에서 재검토).
- `skName` 구 상수는 fallback로 계속 사용(무해·유지).

## 다음
- **나라님 신규 스킬 3보스 실기**(vow/seed 손맛·읽힘·난이도) → 유키PD 판정.
- Card 9 Skill FX Readability Polish · Card 10 Three Boss Balance Pass(신규 스킬 봇 반영 여부·draft 수치 확정).
