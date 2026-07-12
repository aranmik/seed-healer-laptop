# Final Battle Readability & Finish Polish 01

작업일: 2026-07-12 · 담당: 렌(Dev) · 판정: **PASS(렌 자체)** · 유키PD 판정 대기 · 나라님 실기 대기
기준: DEMO_V1_FINAL_MILE_ROADMAP_01 · COMBAT_CALL_RESPONSE_FX_POLISH_01 · SKILL_FX_READABILITY_POLISH_01 · BOSS_TELEGRAPH_ATTACK_FX_POLISH_01 · THREE_BOSS_LOADOUT_PRESSURE_BALANCE_01
목표: "이미 재미있는 전투(맛있게 맵다·98%)"에서 **실제로 벌어지는 사건을 놓치지 않게** 하는 마지막 전투 언어/하단 command UI/FX 과장 + 전략 스킬 1종.
범위: A 전투 정보/이름 매핑 · B command UI · C FX 과장 · D 신규 스킬 "은총의 순간". **★canonical(tuning.js/botSim/probeSim) 동결 — 제품 override로만.**

## 1. 변경/신규 파일
| 파일 | 성격 | 내용 |
|---|---|---|
| `index.html` | 변경(주력) | A1 이벤트 피드 · A2 머리 위 행동 표기 · A3 push 문구 · B4/B5 command UI · C6 FX 과장 · D7 grace UI/consume/renderState |
| `src/core/battle.js` | 변경(최소·grace 전용) | grace 토큰 런타임(use 유효비용·_resolve·step 만료/동결·이벤트). **grace 미장착/미사용 시 byte-identical**(canonical 무영향) |
| `src/data/bossProbes.js` | 변경 | `DEMO_V1_SKILL_TUNING.grace`(제품 override) · water/naga tele `.push` 문구 |
| `src/data/skillPool.js` | 변경 | grace 카탈로그(9번째·uiOrder 9·self·mana 0) |
| `src/dev/finalBattleReadabilityCheck.js` | **신규** | 이번 카드 전용 42체크(grace 런타임 13 · canonical 격리 4 · HTML 배선 25) |
| `src/dev/skillPoolContractCheck.js` | 변경(갱신) | 8→9종 · grace 4체크 추가(35→39) |
| `src/dev/skillFxReadabilityCheck.js` | 변경(갱신) | C6 과장 반영(react-block .42s · bloom 1.62) — 28 유지 |
| `src/dev/shrineLoadoutCheck.js` | 변경(갱신) | 미장착 2→3종(vow/seed/grace) — 29 유지 |
| **동결(무접촉)** | — | `tuning.js`(md5 `d1420e6f…`) · `botSim.js`(md5 `798afb6a…`) · `probeSim.js` · `assets.js` |

## 2. A. 전투 정보 전달 / 이름 매핑

### A1 — 이벤트 피드(곧 / 방금 / 막 해결된)
- **`bh-tele`(곧 일어날 일)**: 리드 라벨 `곧` 추가 — 진행 바+대상+시간은 "다음에 올 위험"임을 명시. **fake 미래 예고 0**(실제 `B.tele` 상태만).
- **`#combat-feed`(방금/막 해결된 일)**: 보스 체력바 아래 **2줄 stacked 타임라인**(높이 30px). 실제 event만 소비 — 최근 2줄(위=fade, 아래=최신).
  - 위험(threat): 강타/처형/돌진동/해일/침식·출혈 resolve(`smash`/`tremor`/`rootOn`).
  - 해결(answer): 보호막 차단(`absorb`≥80) · 정화 해방(`cleansed`) · 씨앗 개화(`seedProc`) · 대응 준비(`shieldOn`/`vowOn`/`seedOn`) · 무료 시전(`graceProc`).
  - 피격(hit): 아군 사망(`death`).
- 결과: **"보스 스킬 → 차단/대응 → 다음 사건"이 스킵되지 않고 이어져** 읽힌다. "위험"만이 아니라 "차단/정화됨"도 같은 공간에서 읽힘(카드 A1 예시 충족).
- 정리: `clearReadoutFx()`(피드+머리표기+grace-flash)를 newBattle·exit-village·end-village에서 호출 → 잔류 0(브라우저 실측 feedCleared=true).

### A2 — 머리 위 짧은 행동 표기(역할 분리)
- **머리 위 = 지금 누가 무엇을 했는가**(actionPop). **상단 피드 = 곧 올 위험/방금 해결된 결과**(A1). 역할 완전 분리.
- 아군 공격: **실제 딜이 들어가는 순간(hero-lunge 로테이션)에만** — `renderState`가 보스 HP 실감소 시 스로틀(1.3~2s) lunge를 재생하는 기존 경로에 `actionPop(li, ALLY_ACT[id])` 부착. `방패 타격!`(전사)·`기습!`(도적)·`마력탄!`(법사). **스팸 아님**(스로틀·실제 딜 순간만·평소 조용).
- 보스 signature: `smash`/`tremor` resolve에서 `bossActionPop(bossActNames().smash/tremor)` — golem `대지 강타!`/`돌진동!` · water `강타!`/`잔파도!` · naga `처형 베기!`/`해일!`.
- 스타일 분리: `.action-pop.ally`(금테 어두운 배지) vs `.action-pop.boss`(붉은 배지). 720ms 자동 제거.

### A3 — 보스명/용어 매핑 전수 정리
- **push 문구**: renderTele가 골렘 하드코딩(`⚠ 골렘이 마지막 힘을…`) → **`TELE_TXT.push`**(selectedBoss별). golem/water/naga 각 문구 신설(GOLEM_TELE·bossProbes water/naga tele).
- **피드/머리표기 어휘**: `bossActNames()`가 selectedBoss 기준(잔파도/해일/처형). 골렘 어휘 잔류 0.
- 브라우저 실측: water 전투 HUD `골렘` 0(bossName 물결 성소의 정령·bf-water) · naga 전투 HUD `골렘` 0(나가 워리어·bf-naga).

## 3. B. 하단 command UI (B4/B5)
- **슬롯 번호 제거**: `.sbtn .num` DOM/CSS 삭제(실측 hasNum=false).
- **아이콘 확대**: 46×47 → **56×54px**(drop-shadow 추가·더 선명·실측 iconW 56px). si-fb 폴백 30→40px.
- **마나 pill**: 좌상단 파랑 pill로 **누르기 전 즉시 마나 소모 읽힘**(제품 메타 = 런타임 제품 비용 일치). 실측 [10,12,7,16,11,15] · cost 0(grace)= 금색 `무료`. nomana 시 붉은 pill.
- **보호**: 클릭/터치 영역(flex:1·84px 유지)·cooldown veil·casting·nomana·gcd 상태 클래스 전부 유지(실측). 파티 카드·전장 무변경. **390px overflow 0**(실측 golem·naga 0).
- ★검은 여백: 하단 command 정보 밀도(아이콘 크게+마나 pill)로 명확도 상향. 레이아웃 flex 구조는 유지(전장/카드 보호 우선) — 여백 자체 재배치는 미적용(WATCH).

## 4. C. FX 과장 (특별한 순간만·평소 조용)
"질문(telegraph)→충돌(착탄)→답변(보호막/서약/정화/씨앗/고리)→결과" 순간을 **한 단계 크게/또렷하게**. 화면 전체 상시 소음 0(짧은 transient만).
| 대상 | 전 | 후 |
|---|---|---|
| 착탄 burst(golem amber) | 52px·scale 1.28 | **64px·scale 1.55**·opacity↑ |
| 처형 slash(naga) | 72px | **98px**·흰 코어 강조 |
| 파티 sweep(돌진동/잔파도/해일) | base 70px | **base 86·water 106px**·밴드 alpha↑(★해일 쓸고 감 강화) |
| block flash(답변) | reactBlock .34s·11px | **.42s·18px + 금테**(막았다 주연) |
| shield/heal 반응 | 11/9px | **16/13px** |
| 고리(ring) | cast-ring 14px | **20px**(파티 확산 강조) |
| 씨앗 개화(bloom) | 18px·scale 1.32 | **26px·scale 1.62** |
- **보호막+서약 관계 유지**: sk-vow-mit는 .26s로 **불변** → block(.42s)보다 여전히 약함(계약 보존·skillFx D5 갱신 검증). 서약 veil 미과장(과겹침 방지).
- **가림 방지**: 전부 짧게 종료(burst .44s·sweep .42~.82s)·저opacity 밴드·색 분리 유지 → HP바/카드/타겟/보스 telegraph 안 가림(실측 sweep .6s/.42s 색분리 유지).

## 5. D. 은총의 순간 (grace) — 신규 전략 스킬
- **정체성**: 마나 운영의 전략 손맛. cost 0·긴 쿨(90s)·사용 후 8초 안 "다음 성공한 마나 소모 기도 1회"를 무료로. 6장 장착 구조 유지(풀 8→9).
- **계약(구현 확인)**:
  - cost 0 · cd 90 · dur 8 · 다음 "성공한" 마나 소모 스킬 1회만.
  - 거부된 입력(대상 불가/쿨/정화 실패 등) 미소모 · 시전 취소/무산 미소모.
  - 마나 0 스킬/자기 자신 미적용(grace 자신 제외).
  - 시전형(빠른치유)은 시전 시작 claim → 완료 시 무료 소비 · **시전 중 은총 타이머 동결**.
  - 은총 활성 시 마나 부족 스킬도 무료 사용 가능.
  - 상태 chip/FX: `grace-ind`(🙏 은총 {남은초}s·금색 pulse) + 무료 대상 버튼 금테+`무료` 태그.
  - 무료 발동 순간: **`grace-flash`(강한 금빛)+cast-ring+`무료 시전!` float+피드** — 강하게 읽힘.
- **아이콘**: 기존 리소스 범위 내 이모지 폴백 `🙏`(새 그림 생성 0).
- **★canonical 분리**: grace 수치 정본은 **제품 override(bossProbes DEMO_V1_SKILL_TUNING.grace)** — tuning.js 무접촉. battle.js 런타임은 grace 미장착/미사용 시 **완전 무해**(this.grace=null → 기존 경로 byte-identical). botSim/probeSim은 grace를 loadout에 넣지 않아 baseline 불변.
- **battle.js 변경 최소화**(이 스킬 범위 내): constructor(`this.grace=null`) · use(graceHit 유효비용+재시전 deny+cast graceClaim+instant 소비) · _resolve(grace 분기) · step(cast 완료 유효비용+grace 만료/동결). 그 외 리팩터 0.

## 6. 검증 결과 (2026-07-12)
| 검증 | 결과 |
|---|---|
| **finalBattleReadabilityCheck (신규)** | **42/0 ALL PASS** (A grace 런타임 13 · B canonical 격리 4 · C HTML/데이터 배선 25) |
| botSim | **16/0**(canonical·grace 무영향) · probeSim **ALL PASS** |
| threeBossLoadoutPressureBalanceCheck 19/0 · battleCoreSkillExtensionCheck 42/0 · combatCallResponseFxCheck 22/0 | 전부 유지 |
| skillPoolContractCheck **39/0**(35→39·grace 4추가) · skillFxReadabilityCheck 28/0(갱신) · bossTelegraphAttackFxCheck 29/0 · battlefieldSpacingCheck 16/0 · combatClarityExitCheck 26/0 · shrineLoadoutCheck 29/0(갱신) · battleLoadoutLinkCheck 26/0 |
| ★동결 md5 | tuning.js `d1420e6f220043a147674be09208038d` 불변 · botSim.js `798afb6a98d8780ed81372696e1a1103` 불변 |
| 브라우저(5181·390px·DOM/computed) | 콘솔 warn/error **0** · overflow **0**(golem·naga) · broken img **0**(20/0) · 스킬바 슬롯번호 제거·아이콘 56px·마나 pill [10,12,7,16,11,15]·grace `무료` · 피드 30px(threat 색/태그 정상) · **grace 라이브**(armed·ind 8s·무료대상 5버튼·grace 자신 제외) · 피드 exit 정리 · 3보스 선택·성소 9풀(grace 포함)·전투 포기 UX 정상 |
- ★frozen-tab(프리뷰 rAF 정지): 라이브 tick 전투 진행/피드 발화/actionPop/graceProc 소비는 캡처 불가(tickLive=false·문서화된 상시 제약). → **finalBattleReadabilityCheck(코어 step 직접 구동 grace 런타임 13체크 + event 배선 regex) + 클릭 핸들러 동기 실행으로 grace 상태 라이브 확인(armed/ind/free버튼) + computed style(피드/burst/action-pop) + 코어 md5 동결**로 증빙. 발화 타이밍은 코어/체크가 보장.

## 7. 보호/정본 유지
- canonical tuning.js/botSim.js md5 불변 · probeSim 무변경 · 3보스 수치(golem 제품 19/24·water 132·naga 동결) 무변경 · seed 제품 9/canonical 12 분리 유지.
- 기존 6+2 스킬 로직·selectedBoss·shrine tap-to-swap·exit UX·기존 FX 문법(문답 90ms 시차·보스색 분리·평소 조용)·party card 무변경.
- battle.js grace 확장은 grace 범위 내 최소(관련 외 리팩터 0). commit/push·외부 배포·Phone Preview 미수행.

## 8. WATCH / 다음
- ★**frozen-tab 라이브 손맛**: 피드 2줄 회전 속도·머리표기 스팸 여부·FX 과장 정도(과함/약함)·grace 무료 발동 체감은 **나라님 포그라운드 실기**가 최종 정본.
- ★**grace 밸런스 draft**: cd 90·dur 8은 초안(effect.draft). 실기에서 "전투 중 1~2회·전략적"인지 확인 → 과하면 cd 상향, 약하면 하향(제품 override만·canonical 무접촉).
- **검은 여백 재배치 미적용**: command 밀도로 명확도는 올렸으나 레이아웃 여백 자체 재배치는 전장/카드 보호 우선으로 보류 — 실기 후 필요 시 별도 미세 카드.
- FX 과장이 "과하다" 판정 시 개별 값 하향 용이(수치화됨). block/vow 관계·색 분리는 보존됨.
- 진입 가능: 나라님 3보스 × loadout(+은총) 실기 → 필요 시 grace/FX 미세 → **Demo v1 Completion Checklist 01**.

## 9. 나라님 실기 확인 포인트
- 상단: 보스 체력만 줄지 않고 **"곧 올 위험 / 방금 차단·정화됨"이 2줄로 이어져** 읽히는지(처형→보호막 차단→다음 해일).
- 머리 위: 아군이 때릴 때 `마력탄!` 등이 잠깐 떠 **"쟤가 때려서 보스 HP가 줄었구나"** 읽히는지 · 너무 자주 뜨지 않는지.
- 이름: 물/나가 전투에서 골렘 문구가 하나도 안 보이는지.
- command: 마나 숫자가 버튼 위에서 **누르기 전에** 읽히는지 · 아이콘이 더 크고 선명한지.
- FX: 해일이 더 크게 쓸고 가는지 · 보호막/정화/씨앗/고리 답변이 더 또렷한지 · 그래도 telegraph/HP가 안 가리는지.
- 은총: 성소에서 장착 → 전투 중 은총 켜면 다음 기도가 금색 `무료`로 바뀌고, 쓰는 순간 **금빛 "무료 시전!"**이 강하게 뜨는지 · 남은 시간이 읽히는지 · 전략적으로 재미있는지.

## 다음
- 유키PD 판정 → 나라님 3보스 × loadout(+은총) 실기 → 필요 시 미세 조정 → Demo v1 Completion Checklist 01.
