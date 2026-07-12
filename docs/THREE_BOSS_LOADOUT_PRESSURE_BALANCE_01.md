# Three Boss Loadout Pressure Balance 01

작업일: 2026-07-12 · 담당: 렌(Dev) · 판정: PASS(렌 자체) · 유키PD 판정 대기 · 나라님 반복 실기 대기
기준: THREE_BOSS_COUNTERPLAY_LOADOUT_PRESSURE_PLAN_01(FINAL PASS·유키 승인 수치) · "좋은 준비는 같은 위기를 더 아름답게 해결하게 한다"
범위: 승인 3수치만 변경 — 씨앗 마나 9(제품)·water tremorDmg 132·golem 진동 19/24(제품). **★canonical(tuning.js/botSim) 동결·제품 override로만.**

## 1. 변경 전 정본 구조 (조사)
- **씨앗 마나 Runtime 정본** = `tuning.js` `TUNING.skills.seed.cost = 12`(battle.js `use()`가 `this.T.skills.seed.cost` 읽음). `skillPool.js` mana:12는 **제품 UI 메타**(battle.js 미참조). → tuning.js는 동결 대상(§13)이라 **제품 override로만** 9 적용.
- **UI 마나 표시**: 스킬별 마나 숫자 표시 없음. 버튼 `nomana` 회색화만 `B.T.skills.seed.cost`(런타임값) 사용 → override 시 자동 9. 하드코딩 표시 0(§12-B 불요).
- **보스 override 경로**: index.html newBattle `new Battle(PARTY, loadout, PROBE ? {tuning:{boss:PROBE.boss}} : {})`. water/naga=PROBE.boss deepMerge · golem=PROBE null(TUNING). botSim=`new Battle(...)` override 없이 → tuning.js canonical.
- **probeSim**: bossProbes water/naga.boss 소비(golem 미실행). **botSim = canonical golem(tuning.js)**.
- **기존 check가 고정하던 값**: skillPoolContractCheck `seed.mana === TUNING.cost`(12) · battleCoreSkillExtensionCheck `seed 소모 12`(canonical) · probeSim water sanity(레인지·하드 tremor 없음).

## 2. 구현 — canonical/제품 분리 (§6)
- **bossProbes.js 신규 export**(canonical 완전 분리): `DEMO_V1_SKILL_TUNING = { seed: { cost: 9 } }` · `DEMO_V1_BOSS_OVERRIDE = { golem: { tremorFirst: 19, tremorInt: 24 } }`. + water.boss.tremorDmg 120→132.
- **index.html newBattle**: 제품 override 주입 —
  `prodT.skills = DEMO_V1_SKILL_TUNING`(전 보스 seed 9) · `prodT.boss = PROBE ? PROBE.boss : DEMO_V1_BOSS_OVERRIDE[selectedBoss]`(water/naga 전체·golem 부분) → `new Battle(PARTY, loadout, {tuning: prodT})`. Battle이 TUNING 사본에 deepMerge.
- **skillPool.js**: seed.mana 12→9(제품 메타 일치·§14-A).
- **동결**: tuning.js(md5 `d1420e6f…` 불변)·botSim.js(md5 `798afb6a…` 불변) — override 없이 생성되므로 canonical baseline 그대로.
- ★checkpoint 격리: seed(A)/water(B)/golem(C)를 각각 적용·loadoutPressureProbe stage(base/ABC)로 증분 측정.

## 3. 최종 적용 수치
| 대상 | canonical(동결) | 제품 Demo v1 |
|---|---|---|
| 씨앗 마나 | 12 (tuning.js·botSim) | **9** (override·skillPool 메타) |
| golem tremorFirst/Int | 25 / 28 (tuning.js·botSim) | **19 / 24** (override·hp9600·강타720 상속) |
| water tremorDmg | — | **132** (bossProbes·hp8800 불변) |
| 나가 전수치·vow·기존6 | 전부 동결 | 동결 |
- 롤백 발생: **없음**(19/24·132 유지). 완화 후보 golem 21/26·water 126은 미사용(나라 실기 대기).

## 4. 실측 비교 (loadoutPressureProbe·smartPlus 봇·제품 override 미러 · 2026-07-12)
| 보스 | 구성 | 결과 | 시간 | 끝마나(고갈) | 최저HP | 특기 |
|---|---|---|---|---|---|---|
| 골렘 | 기본6 baseline(canonical) | 승 | 2:25 | 17 | 52% | 강타 8s창 354~674 |
| 골렘 | 기본6 제품(19/24) | 승 | 2:25 | **7**(@137) | **39%** | 강타 8s창 **835~1214**(창 두꺼워짐) |
| 골렘 | 맞춤(vow) | 승 | 2:25 | **16**(무고갈) | **47%** | vow완화 850·**마나 +9·최저 +8%p** |
| 골렘 | 비추천(무방어) | 승 | 2:25 | 4 | 12% | seed 35proc로 버팀(위험·승리) |
| 물 | 기본6 baseline | 승 | 2:13 | 26(무고갈) | 55% | 압박 없음 |
| 물 | 기본6 제품(132) | 승 | 2:13 | **7~2**(@132) | **48~49%** | 마나 압박 발생(26→7) |
| 물 | 맞춤(seed) | 승 | 2:13 | **8**(@94) | 23% | seed 39proc·**마나 +6**(고리/빠른치유 절약) |
| 물 | 비추천(방어기2) | 승 | 2:13 | 16 | 45% | quickheal 15 스팸 커버 |
| 나가 | 기본6(canonical=제품) | 승 | 2:07 | **9**(@98) | **4%** | ★완전 동결(seed9 무영향) |
| 나가 | 맞춤(vow+seed) | 승 | 2:07 | 4(@91) | **10%** | vow완화+seed·최저 **+6%p**·마나 -5(트레이드) |
| 나가 | 비추천(무방어) | 패 | 2:11 | 11 | 0% | 처형에 무너짐(숙련 극복 여지·봇 defeat) |
- ★기본6 물 마나끝: smartPlus(공격적) 2 · 정제 봇 7(목표 6~15 안). 실제 나라 효율은 그 사이 예상.

## 5. 보스별 결과
### 골렘 (Checkpoint C)
- 진동 위상 19/24로 강타 8s창 피해 354~674 → **835~1214**(두꺼워짐). 기본6 마나 17→7·최저 52→39%(목표 4~12/15~35% 거의 부합). 맞춤(vow)=마나 +9·최저 +8%p·vow완화 850(14회) → **서약의 8초 위험 구간 가치 실측 발생**(Matrix 서약@골렘 ○→◎ 회복). 시간 2:25 유지.
### 물 (Checkpoint B)
- tremorDmg 132로 기본6 마나 26→7(무고갈→고갈@132)·압박 발생. 맞춤(seed)=마나 +6·seed 39proc(11.5s마다 전원 피격=15s 3충전 소진) → **씨앗의 반응 회복 가치**(고리/빠른치유 마나 절약). 시간 2:13 유지.
### 나가 (동결)
- 전수치 동결. 기본6 = canonical과 **완전 동일**(9/4%·seed9는 기본6 무영향). 맞춤(vow+seed)=최저 4→10%(생존 마진)·마나 -5(cleanse/ring 제외 대가). ★과도하게 쉬워지지 않음(§10 게이트 충족)·seed cost 9로도 자동 승리화 없음.

## 6. 맞춤 구성 성공 판정 (§9)
- 골렘 맞춤: 마나 **+9**·최저 **+8%p** → **성공**(2지표 분명).
- 물 맞춤: 마나 **+6** → **성공**(§9 "하나 이상 분명" 충족·최저는 낮으나 물은 마나 소모전).
- 나가 맞춤: 최저 **+6%p**·사망 0 유지 → 부분 성공(마나는 트레이드·실기 정본).
- 실패 조건 없음: 맞춤이 시간 단축 안 함(전부 동일)·자동 승리 아님(위기 유지)·seed 3보스 자동장착 아님(골렘 비추천에서만)·vow≠shield 상위호환(단일=shield 강·겹침=vow 강)·기존 6스킬 폐기 없음.

## 7. Boss × Skill Matrix 갱신
- 서약@골렘 ○→◎(창 두꺼워져 가치 발생) · 서약@나가 ◎ 유지 · 씨앗@물 ○→◎(마나 절약 실측) · 씨앗@나가 ○ 유지.
- 자동장착 스킬 0·완전 폐기 스킬 0.

## 8. 제품 Golem / canonical baseline 분리 (증빙)
- **제품**(Guild Board golem·기본 진입·?boss=golem): index.html newBattle이 DEMO_V1_BOSS_OVERRIDE.golem(19/24) 주입 → 런타임 19/24·hp9600·강타720 상속(balance check C6 실측).
- **canonical**(botSim): override 없이 생성 → tuning.js 25/28·hp9600(C5 실측·botSim 16/0). tuning.js md5 불변.
- golem override는 **부분**(진동만)·water/naga config에 잔류 0(C4·D2).

## 9. loadout-aware 분석 봇 정책 (§8)
- 신규 `src/dev/loadoutPressureProbe.js`의 smartPlus(이 파일 전용·canonical botSim/probeSim 무변경):
  - shield/vow **이중지출 금지** — 한 텔레그래프에 하나만(겹침 구간=vow·단일=shield·shield 없으면 vow).
  - seed=피격 빈도 높은 살아있는 대상 선부착·charge 남은 대상 재사용 금지.
  - cleanse=실제 root 대상만·salvation selfOnly 유지·미래값 치팅 없음.
- ★비관적 하한(봇 판단이 나라보다 낭비)·최종 손맛 정본은 **나라님 실기**.

## 10. 검증 결과 (2026-07-12)
| 검증 | 결과 |
|---|---|
| **threeBossLoadoutPressureBalanceCheck (신규)** | **19/0 ALL PASS** (A seed 6·B water 2·C golem 6·D naga 2·E loadout 2·F vow 1) |
| skillPoolContractCheck | **35/0**(seed 제품9/canonical12 대조로 갱신·강화) |
| battleCoreSkillExtensionCheck 42/0(seed 12 canonical) · combatCallResponseFx 22/0 · skillFx 28/0 · bossTelegraph 29/0 · spacing 16/0 · clarity 26/0 · shrine 29/0 · loadoutLink 26/0 |
| botSim | **16/0**(canonical golem·seed12·tuning.js 사용) |
| probeSim | **ALL PASS**(water 132 반영·sanity 유지) |
| ★동결 증빙 | tuning.js md5 `d1420e6f…` 불변 · botSim.js md5 `798afb6a…` 불변 |
| 브라우저(5182·375) | 콘솔0 · 골렘 hp9600·**제품 seed 실제 마나 -9**(100→91)·chip 🌱3 · 나가 hp8400 동결 · 물 hp8800 · 3보스 진입 정상 · overflow0·broken0 |
- ★frozen-tab: water 132/golem 19/24는 tick 의존이라 라이브 관찰 불가 → **balance check 런타임 Battle 실측 + probe(smartPlus) + 코어 md5 동결**로 증빙. seed 마나 9는 클릭 시 라이브 확인.

## 11. 기존 check 기대값 변경 근거 (§15)
- **skillPoolContractCheck**: 기존 `신규 2종 mana === TUNING.cost` → vow는 유지(strict), seed는 `skillPool.mana===9 && TUNING.skills.seed.cost===12 동결`로 분리. **약화 아님**(canonical 12 동결 assertion 추가 = 더 강함·제품9와 canonical12를 둘 다 검증). 이유: 씨앗은 제품 override로만 9(tuning.js 12 동결).
- 그 외 check 기대값 변경 없음(battleCoreSkillExtensionCheck seed 12 그대로·probeSim 구조 유지).

## 12. 나라님 추천 실기 구성
- **골렘**: 빠른치유·보호막·**수호의 서약**·정화·구원·지속 (고리·씨앗 제외) — 강타는 보호막, 강타 뒤 진동창은 서약.
- **물정령**: 빠른치유·지속·고리·정화·**기도 씨앗**·구원 (보호막·서약 제외) — 잔파도마다 씨앗 반응, 고리로 전원 복구.
- **나가**: 빠른치유·보호막·**수호의 서약**·구원·**기도 씨앗**·지속 (정화·고리 제외) — 처형=보호막/서약, 해일=씨앗.

## 13. 나라님 실기 확인 포인트
- 기본6으로 3보스 클리어되지만 **골렘/물이 예전보다 마나가 빠듯**한지(무난한 승리에서 벗어남).
- 골렘: 서약을 가져오면 강타 뒤 진동창이 편해지는지(마나/HP 마진).
- 물: 씨앗을 가져오면 고리/빠른치유 부담이 줄어 마나가 남는지.
- 나가: 예전 쫄깃함(탱커 4%) 그대로인지 · 맞춤이 자동 승리처럼 쉬워지지 않는지.
- 물 132가 너무 빡빡한지(그렇다면 126) · 골렘 19/24가 즉사처럼 느껴지는지(그렇다면 21/26).

## 14. WATCH / HOLD
- ★**물 tremorDmg 132**: 기본6 마나끝 정제봇 7(목표 안)·smartPlus 2(하한). 롤백 조건 미충족이라 132 유지하되 **나라 실기가 너무 빡빡하면 126**(우선 조치). 최저HP 48~49%는 물 정체성(마나 소모전)상 허용.
- ★**나가 맞춤 마나 -5**: vow/seed가 cleanse/ring보다 마나 효율 낮은 트레이드 — 봇 기준·실기 정본. 나가 과도하게 쉬워지면 **seed cost 10 롤백 후보를 유키PD에 제안**(임의 롤백 금지·§10).
- 골렘 기본6 최저 39%는 목표 15~35% 살짝 위(덜 위험) — 나라 실기로 판단·필요 시 미세 조정은 다음 카드.
- RESP_DELAY 90ms·FX 변경 없음(§11 보호 유지).

## 15. Demo v1 Completion Checklist 진입 가능 여부
- **가능**. 승인 3수치 적용·canonical 동결·전체 회귀 ALL PASS·맞춤 가치 실측 발생. 남은 것 = **나라님 3보스 × 구성 반복 실기**(최종 손맛 정본) → 결과 따라 물 126/골렘 21·26/씨앗 10 미세 롤백 후보 판단 → Completion Checklist.

## 다음
- 유키PD 판정 → **나라님 3보스 × loadout 반복 실기**(§12 추천 구성) → 필요 시 미세 롤백 → **Demo v1 Completion Checklist 01**. 상세 = DEMO_V1_FINAL_MILE_ROADMAP_01.
