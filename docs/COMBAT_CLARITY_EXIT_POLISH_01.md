# Combat Clarity & Exit Polish 01

작업일: 2026-07-11 · 담당: 렌(Dev) · 판정: **★유키PD FINAL PASS (2026-07-11)**
기준: BATTLE_LOADOUT_LINK_01(FINAL PASS) · 나라님 3보스+신규 스킬 실기 대만족("바로 이거다·Demo 완성 후보")

## ★FINAL PASS 확정 기록 (유키PD · 2026-07-11)
- vow/seed 실제 이미지 아이콘(icon_vow/seed.png) 적용 · 성소/준비/전투 스킬바 일관 · 기존 컨셉 리소스 크롭(신규 이미지 0).
- danger-ring 기본 완전 조용화 · 실제 telegraph(.hot)에서만 위험 원 · heal/shield/block/target glow 등 순간 feedback 유지.
- 전투 우상단 포기 버튼+확인 팝업 · "전투 계속"/"마을로 돌아가기"(결과 미경유) · currentLoadout/selectedBoss 유지.
- combatClarityExitCheck 26/0 · Skill Pool/Core/Shrine/Loadout 전부 ALL PASS · botSim 16/0 · probeSim 26 ALL PASS · battle core/tuning 무변경.
- ★시각 WATCH(유키): vow "날개 달린 금색 하트"가 회복 계열로 과하게 읽히는지는 나라님 실기 최종 확인 — 현재 blocker 아님. Spacing 카드에서 아이콘 재변경 금지.
범위: Demo 완성 후보의 **전투 시인성/사용성 polish** 3종 — (A) 신규 스킬 아이콘 (B) 상시 공격 암시 FX 정리 (C) 전투 중 포기→마을 복귀.
★코어(battle.js/tuning.js/bossProbes.js) 무접촉 · 밸런스/패턴/타겟팅/spacing/boss FX 강화는 범위 밖.

## 1. 신규 스킬 아이콘 — 선정 리소스와 이유
- **소스**: `imgage_original/SeedHealer_VisualAsset_Pack_02/icons/concepts/` (마젠타 배경 8컷 시트, 기존 6아이콘의 SET_A와 동일 화풍·격자).
- **vow(수호의 서약)** = `SH_ICON_SHEET_HOLY_SUPPORT_CONCEPT_v001.png` 1행1열 = **날개 달린 금색 하트**(가호/축복/수호).
  - 선택 이유: 의미(보호/서약/가호/축복) 정합 + **기존 shield(SET_A의 금방패+십자)와 모티프 완전 분리**. HOLY 시트의 "방패+깃털"컷은 shield와 혼동 위험이 커 배제.
- **seed(기도 씨앗)** = `SH_ICON_SHEET_NATURE_PASSIVE_CONCEPT_v001.png` 1행1열 = **새싹 돋는 금색 씨앗+반짝임+꽃밭**.
  - 선택 이유: 이름과 정확히 일치(씨앗/생명/회복/빛). renew(지속회복·잎)와는 "씨앗 알맹이" 유무로 구분.
- **추출**: `tools/chroma_extract.ps1`로 기존 아이콘과 동일 파이프라인(T0=90/T1=210·마젠타 키·자동 트림) → `assets/icons/icon_vow.png`(423×437) · `assets/icons/icon_seed.png`(424×437). **기존 아이콘 규격(423×437) 일치** · 마젠타 잔여 0 · 새 이미지 생성 0(기존 확보 리소스 크롭만).

### 적용처 / 방식 (assets.js 무접촉)
- `skillPool.js` vow/seed에 **`iconImg` 필드 additive 추가**(iconChar 🕊️/🌱은 최후 폴백 유지 · iconAssetKey는 여전히 null).
- index.html `skillIcon(sid)` 3단 폴백: 기존 6종=`skillSpr`(assets.js 연결 PNG) → vow/seed=`S.iconImg`(신규 이미지) → 이모지.
- **성소 8pool·6슬롯 · 준비 화면 · 전투 스킬바 6버튼** 전부 이 skillIcon 공용 → 일관 적용. 브라우저 실측: 4곳 모두 `icon_vow.png`/`icon_seed.png` 렌더 · 이모지 placeholder 탈피.
- ★**assets.js 무접촉 이유**: skillIcon이 index.html에서 iconImg를 직접 소비 → `ASSETS.icons`/`EMOJI.skills` 변경 불요. 아이콘 파일만 assets/icons/에 추가.

## 2. 상시 공격 암시 FX — 원인 분석과 정리
### 원인(정확히)
- `.bf-danger`(#danger-ring, 보스 발밑 위험 원)의 **기본 상태**(`.hot` 아닐 때)에 상시 스타일이 있었음:
  - `background: radial-gradient(...rgba(224,86,52,.30)...)` (상시 붉은 원)
  - `border: 2px solid rgba(255,110,70,.36)` + `box-shadow: inset ... rgba(224,86,52,.30)` (상시 붉은 테두리/광).
- 노출 조건: danger-ring은 **보스 종류 무관 battlefield에 상시 렌더**(index.html battlefield 빌드) → **3보스(골렘/물정령/나가) 전부** 평소에도 보스 발밑에 붉은 원이 떠 있음 → "지금 공격 대비해야 하나?" 상시 오해.

### 정리 방식(조건부 노출)
- `.bf-danger` 기본을 **완전 조용(투명)**: `background:transparent; border:2px solid transparent; box-shadow:none`.
- `.bf-danger.hot`(실제 강타/속박 예고)일 때만 붉은 그라디언트+테두리+inset광+ringPulse.
- `renderTele`가 예고 후보 존재 시 `dangerRing.classList.add('hot')`, 평소 `remove('hot')` → **실제 telegraph 순간만** 붉게(0.2s 부드러운 fade-in). 코어/JS 로직 무변경(CSS 기본값만 조용화).
- **보존(나라님이 좋아한 실제 feedback 손대지 않음)**: heal pulse(react-heal)·shield pop(react-shield)·block flash(react-block)·강타 대상 실루엣 glow(danger-tgt)·예고 오오라(bf-boss.wind)·사제 발밑 금색 온기(bf-heal-ring). 전부 유지.
- 문법 결과: 평소=조용 / 실제 telegraph=또렷 / 실제 attack·hit=짧고 명확.

## 3. 전투 중 포기 → 마을 복귀 UX
- **버튼**: 전투 화면 boss HUD 우상단에 작은 `✕`(#bh-exit). dev-pill과 별개(dev-pill은 ?dev=1만·bh-exit는 항상).
- **확인창**(#exit-pop·모달·dim 배경 blur): "전투를 포기하고 마을로 돌아갈까요?" + "준비한 기도(스킬)는 그대로 유지됩니다." + 2버튼.
  - **전투 계속**(#exit-stay) → 팝업만 닫음(현재 전투 유지).
  - **마을로 돌아가기**(#exit-village) → 팝업 닫고 `showScreen('village')`.
- **규칙 준수**: 결과 화면 미경유(showEnd/finish 미호출) · 보상 없음 · 승패 처리 아님 · tick은 `cur==='battle'`에서만 도므로 village 이동 시 자동 정지 · 다음 진입 시 newBattle로 새 Battle.
- 390px: `.exit-box` max-width 290px 작은 확인창(과대 모달 아님) · 닫기 동작 분명. newBattle 진입 시 `exit-pop` 강제 닫힘 보장.

## 4. currentLoadout / selectedBoss 유지
- "마을로 돌아가기"는 `showScreen('village')`만 호출 → currentLoadout/selectedBoss 배열/변수 **미변경**(코드상 대입 없음).
- 브라우저 실측: 전투 중(naga·서약/씨앗 장착) 포기→마을 → 성소 재진입 시 슬롯 = 빠른치유/보호막/**서약**/구원/지속/**씨앗** 유지 · 게시판 재진입 시 naga 여전히 선택(.sel) 유지.
- 마을→성소/게시판 재이동·재도전/다른 보스 선택 흐름 무손상.

## 5. Demo v0 / 3보스 보호
- 기본 6스킬 순서/동작/타겟팅/쿨/마나/ARIA impulse/heal·shield·block feedback/cast-bar 22px/버튼 nudge/골렘 9,600·idle/물·나가 baseline/게시판 selectedBoss/전장 5인/결과·재도전·마을 복귀 전부 유지.
- 수정 금지 파일 mtime 무변동: src/core/battle.js·src/data/tuning.js·src/data/bossProbes.js·src/dev/botSim.js·src/dev/probeSim.js·**src/ui/assets.js**(아이콘 파일만 추가·assets.js 코드 무변경)·이미지 원본.

## 6. 검증 결과 (2026-07-11 실측)
| 검증 | 결과 |
|---|---|
| node --check (skillPool·5 dev 체크) | 전부 OK |
| **combatClarityExitCheck (신규)** | **26/0 ALL PASS** (A 아이콘10·B FX정리6·C 포기UX8·D 유지2) |
| skillPoolContractCheck | 34/0 ALL PASS |
| battleCoreSkillExtensionCheck | 42/0 ALL PASS |
| shrineLoadoutCheck | 29/0 ALL PASS |
| battleLoadoutLinkCheck | 26/0 ALL PASS |
| botSim | 16 PASS / 0 FAIL |
| probeSim | ALL PASS (26 checks) |
| 브라우저(5182·375px) | 콘솔 error 0 · vow/seed 아이콘 성소/준비/스킬바 전부 실제 이미지(icon_vow/seed.png) · **danger-ring 평소 background:none/border:transparent(붉은 원 사라짐)** · .hot 시 붉은 그라디언트 복귀 · 포기 버튼→팝업→전투 계속/마을 복귀 정상 · 마을 복귀 후 loadout(서약/씨앗)·selectedBoss(naga) 유지 · broken img 0 · 가로 overflow 0(375=375) |
- ★frozen-tab(프리뷰 rAF 정지)로 tick 의존 동작은 헤드리스 체크가 담당 · 클릭/CSS 즉시 반영은 라이브 확인.

## 7. WATCH
- danger-ring 붉은 테두리는 0.2s transition으로 fade-in — 순간 계측 시 mid-transition(투명)로 보일 수 있으나 telegraph 지속(1~2.5s) 동안 완전 표시(실플레이 문제 없음·의도된 부드러운 등장).
- vow 아이콘=날개 하트(가호). shield=방패와 모티프 분리했으나, 둘 다 "방어 계열"이라 나라님 실기에서 직관 재확인 권장(문제 시 HOLY 다른 컷 후보 있음).
- 신규 스킬 chip 상한 4(이전 카드 WATCH 유지) · draft 수치 미확정(Balance Pass).
- 포기 버튼 ✕는 boss HUD 우상단 — 전투 중 오터치 가능성은 확인창이 방어(즉시 종료 아님).

## 8. 다음 카드로 넘길 항목 (이번 범위 밖·§4)
- **Battlefield Spacing Polish 01**: 아군 3인 전장 위치 하향 재배치 · 나가↔도적 겹침 해소 spacing.
- **Boss Telegraph & Attack FX Polish 01**: 보스별 telegraph/attack FX 본격 강화(이번엔 상시 오해 제거만).

## 다음
- 유키PD 판정 → Battlefield Spacing Polish 01 또는 Boss Telegraph & Attack FX Polish 01(둘 다 착수 준비됨).
- 나라님 실기 재확인(아이콘 눈맛·위험 원 조용해진 시인성·포기 버튼 편의) 권장.
