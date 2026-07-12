# Battle Core Skill Extension 01

작업일: 2026-07-11 · 담당: 렌(Dev) · 판정: **★유키PD FINAL PASS (2026-07-11)**
기준: PRIEST_SKILL_POOL_8_LOADOUT_6_DATA_CONTRACT_01(FINAL PASS) · BOSS_SKILL_ANSWER_MATRIX_01 ·
DEMO_V1_IMPLEMENTATION_ROADMAP_01 Card 4 · ★유키PD **battle.js 제한적 해금 승인(신규 2종 한정)**

## ★FINAL PASS 확정 기록 (유키PD · 2026-07-11)
- canonical Runtime = `src/core/battle.js` / `src/data/tuning.js` **단일 정본**(제품·botSim·probeSim 공유).
- 수호의 서약(vow)·기도 씨앗(seed) 코어 구현 완료 · 신규 상태는 기존 전투와 격리 · 신규 스킬 아직 제품 UI 비노출.
- 기존 6스킬 동작/수치/타겟팅 불변 · 기본 loadout 기존 6종 그대로.
- battleCoreSkillExtensionCheck **42/0** · skillPool contract **34/0** · botSim **16/0** · probeSim **26 checks ALL PASS** · Demo v0/3보스 Runtime 무손상.
- ★probeSim 체크 수 정본 = **26 checks ALL PASS**(과거 27 표기는 오기로 폐기).

Demo v1 신규 스킬 2종(vow 수호의 서약 / seed 기도 씨앗)을 전투 코어에 **최소 절개**로 구현.
이번 카드 = 코어 동작 + 검증만. 성소 UI·스킬바 제품 연결·제품 FX·최종 밸런싱·index.html은 범위 밖.

## 1. 실제 수정한 canonical 파일과 이유

### ★구조 조사 결과 (§3 요구)
- **루트 `battle.js`/`tuning.js`/`botSim.js`는 존재하지 않음.** 각 정본은 하나뿐:
  - `src/core/battle.js` — 제품(index.html `await import('./src/core/battle.js')`)·`src/dev/botSim.js`·`src/dev/probeSim.js`가 **전부 이 한 파일**을 import.
  - `src/data/tuning.js` — 제품·`src/core/battle.js`가 import(TUNING/DEFAULT_PARTY/DEFAULT_LOADOUT).
  - probeSim은 `src/dev/botSim.js`의 `Bots`를 재사용(별도 tuning/battle 경로 없음)·boss override만 `bossProbes.js`.
- **결론: 제품과 sim이 같은 정본을 공유 → 한 곳만 고치면 양쪽에 일관 반영, 표류 위험 0.** 사본 이중 수정 불필요.

### 수정/신규 파일 (5종 — 전부 허용 목록 내)
| 파일 | 종류 | 이유 |
|---|---|---|
| `src/core/battle.js` | 수정 | vow/seed 상태·use 가드·_resolve 분기·dealDamage 훅·step 만료 (canonical 전투 코어) |
| `src/data/tuning.js` | 수정 | `TUNING.skills.vow` / `TUNING.skills.seed` 추가 (canonical 수치 정본) |
| `src/data/skillPool.js` | 수정 | vow/seed `implemented:true`·`currentRuntimeId` 갱신 (§9 계약 전환) |
| `src/dev/skillPoolContractCheck.js` | 수정 | implemented 검증 갱신 + 신규 2종 TUNING 대조 2체크 추가 (32→34) |
| `src/dev/battleCoreSkillExtensionCheck.js` | 신규 | vow/seed 전용 코어 검증 42체크 |

### 무접촉 확인 (수정 금지 파일 — mtime 무변동 실측)
`index.html`(13:57·내 17:21 편집 이전) · `src/dev/botSim.js`(07-05) · `src/data/bossProbes.js`(13:55) ·
`src/dev/probeSim.js`(04:49) · `src/ui/assets.js`(07-05) · 보스/영웅 이미지·원본 리소스.
- ★`tuning.js`의 `ALL_SKILLS`(원 P1-A 7종 = 6+breath)는 **의도적 무변경**(skillPoolContractCheck에서만 참조·botSim/probeSim 무관·의미 표류 방지).

## 2. 수호의 서약(vow) 구현 계약
- `TUNING.skills.vow = { type:'instant', dmgMul:0.60, dur:8, cost:13, cd:12, target:'ally' }` (★draft).
- use: `target:'ally'` 생존 대상 필요(사제=sel 0으로 자기 지정 가능). 재적용 가드 `if(sid==='vow'&&this.vow[ti]) deny`.
- _resolve: `this.vow[ti] = { mul: S.dmgMul, left: S.dur }` · 이벤트 `vowOn` · cd는 기존 `if(S.cd)this.cd[sid]=S.cd`가 처리.
- dealDamage: tank 감쇄 직후, **보호막 흡수 前** `if(vw&&a>0) a = Math.round(a*vw.mul)`. 미장착 시 `this.vow[i]` undefined → no-op.
- step (4b): `v.left-=dt; if(v.left<=0) delete + vowFade`.
- 사망 시: dealDamage 사망 블록에서 `delete this.vow[i]`.

## 3. 기도 씨앗(seed) 구현 계약
- `TUNING.skills.seed = { type:'instant', healPerHit:90, charges:3, dur:15, cost:12, cd:6, target:'ally' }` (★draft).
- use: vow와 동일 구조. 재적용 가드 `if(sid==='seed'&&this.seed[ti]) deny`.
- _resolve: `this.seed[ti] = { charges: S.charges, left: S.dur }` · 이벤트 `seedOn`.
- dealDamage **말미**(HP 피해 적용·사망 판정 후): `if(hpDmg>=1 && u.alive){ const sd=this.seed[i]; if(sd&&sd.charges>0){ sd.charges--; ev('seedProc'); heal(90,'seed'); if(sd.charges<=0){ delete + seedFade } } }`.
- step (4c): `s.left-=dt; if(s.left<=0) delete + seedFade` (충전 남아도 15초 제거).
- 사망 시: dealDamage 사망 블록에서 `delete this.seed[i]`.

## 4. 피해 처리 순서 (계약 §5·§6 준수)
```
원피해 amt
 → tank 감쇄 (기존·전사만 −30% · Math.round)      ← 기존 문법 불변
 → vow 비율 감소 (−40% · Math.round(a*0.6))         ← 신규 · 보호막 前
 → shield 흡수 (기존 총량 흡수)
 → HP 피해 적용 (hpDmg = 남은 a)
 → 사망 판정
 → seed 반응 (hpDmg≥1 & 생존 시 사건당 1회 · heal 90 · charge−1)  ← 신규 · 말미
```
- **반올림**: vow는 기존 tank 감쇄와 **동일하게 `Math.round`** 적용(원 피해 계산 문법 준수). tank+vow 동시 대상 = `round(round(amt*0.7)*0.6)` 순차 반올림(곱은 교환가능이나 반올림은 순차).
- **통계/로그 기록 방식**:
  - vow로 감소된 피해분은 **별도 통계 없음**(기존 tank 감쇄와 동일 — 예방된 피해는 미기록). `m.absorbed`/`m.dmgTaken`/`dmg` 이벤트는 전부 **vow 감소 후** 값을 기록.
  - seed 치유는 `heal(...,'seed')` 경유 → 기존 `m.healed`/`m.overheal`/`heal` 이벤트에 정상 합류(과치유 포함 기존 규칙 그대로).
  - 신규 이벤트 `vowOn/vowFade/seedOn/seedProc/seedFade`는 events[]에만 추가(report 24필드 구조 불변).

## 5. shield / vow / seed 상호작용
- vow + shield: vow가 먼저 비율 감소 → shield가 감소분을 흡수(검증 B9: 100→vow 60→shield 흡수 60·shield 잔량 300).
- seed + shield 전량 흡수: HP 피해 0 → seed 미발동·충전 불소모(C8).
- seed + shield 부분 흡수: HP 피해 발생분에 1회 발동(C9).
- vow + seed 동시: vow 감소 후 남은 HP 피해에 seed 1회 발동(C10).
- seed + HoT: 독립 공존(C15). vow/seed는 서로 다른 대상에도 각각 적용 가능(B7·C5).

## 6. 상태 적용 / 만료 / 재적용 규칙
- 한 대상 vow/seed 각 1개만(중첩 불가) · 활성 중 같은 대상 재시전 거부(B6·C4) · 다른 대상 동시 적용 가능.
- vow 8초·seed 15초 정확 만료(B4·C13) · seed 충전 0 즉시 제거(C12) · 대상 사망 시 상태 무효(C14).
- seed 재귀/중복 없음: heal은 dealDamage 미호출 → 구조적으로 재귀 불가 · 한 피해 사건당 정확히 1회(C11).

## 7. 기존 6스킬 불변 확인
- 기존 6스킬 동작/수치/타겟팅/보스 패턴/승패·사망 판정/마나 시스템 **무변경**(신규 분기는 sid==='vow'/'seed'에서만 진입).
- 보호막 총량 360·재적용 잠금 불변(B11·B12) · 빠른치유 등 정상(A8).
- **격리 증명(D1~D4)**: 기본 6 loadout 전투는 결정론 일치(D1) · vow/seed 이벤트 0(D2) · 상태 0(D3) · 신규 필드는 빈 객체 기본값(D4).
- 회귀: botSim 16/0 · probeSim ALL PASS 유지(수치·타이밍 불변).

## 8. 신규 스킬 제품 비노출 상태
- index.html 무접촉 → 제품 스킬바는 기존 6종 그대로 · 성소 8→6 교체 기능 없음 · 기본 Demo v0 플레이 화면 변화 0.
- vow/seed는 **자동 검증/직접 코어 호출로만** 검증됨. 제품 노출은 후속 Card 5(Shrine)·Card 6(Battle Loadout Link).

## 9. 검증 결과 (2026-07-11 실측 · 실제 출력 숫자)
| 검증 | 결과 |
|---|---|
| node --check (5 파일) | 전부 OK |
| skillPoolContractCheck | **34 PASS / 0 FAIL — ALL PASS** (기존 32 + vow/seed TUNING 대조 2) |
| battleCoreSkillExtensionCheck | **42 PASS / 0 FAIL — ALL PASS** (A 공통 9·B vow 12·C seed 17·D 회귀 4) |
| botSim | **16 PASS / 0 FAIL** |
| probeSim | **ALL PASS (26 checks)** — ★과거 보고 27이 아니라 스크립트 실제 출력 26을 정본 기록 |
| 수정 금지 파일 mtime | index.html/botSim/bossProbes/probeSim/assets 무변동 |

## 10. 후속 Shrine/Battle Loadout Link Runtime API
- **Runtime ID**: `vow`(수호의 서약) · `seed`(기도 씨앗). 기존 6종과 동일하게 loadout 배열에 넣으면 `use(slot)`으로 시전.
- **use(slotIdx)** → `{ok:true}` 또는 `{ok:false,reason}` + `reject` 이벤트(기존 계약 그대로).
- **상태 조회(렌더용)**: `B.vow[unitIdx]={mul,left}` · `B.seed[unitIdx]={charges,left}` (shield/hot과 동형 — 상태칩/게이지 표시 가능).
- **FX 이벤트(Card 9용)**: `vowOn/vowFade` · `seedOn/seedProc(=피격 반응 순간)/seedFade`.
- Battle 생성자는 이미 `loadoutIds` 수용 → 성소가 만든 6종 배열을 `new Battle(party, loadout)`에 넘기면 됨(battle.js 추가 수정 불요).

## 11. 밸런스 draft 항목 (Three Boss Balance Pass·Card 10)
- vow: dmgMul 0.60(−40%)·dur 8·cost 13·cd 12 — 전부 draft. skillPool `effect.draft:true` 유지.
- seed: healPerHit 90·charges 3·dur 15·cost 12·cd 6 — 전부 draft.
- Matrix 초안 방향(vow=골렘/나가 축·seed=물정령/나가 축)의 실제 성립은 Balance Pass에서 sim+실기로 확정.

## 12. 남은 WATCH
- ★**assets.js EMOJI.skills에 vow/seed 없음**(🕊️/🌱) — 이번 카드 index.html 미노출이라 렌더 경로 미도달. **Card 5(Shrine UI)에서 아이콘 표기 필요**(assets.js additive 또는 skillPool.iconChar 사용). 신규 이미지 생성 금지 원칙상 이모지 placeholder.
- seed의 "보호막 전량 흡수 시 charge 불소모"는 계약대로 구현(C8) — 밸런스상 물정령 잔파도 대비 씨앗 가치는 Card 10에서 재확인.
- 신규 스킬은 봇(botSim/probeSim smart)이 **인지하지 못함**(기본 6종만 사용) → 신규 스킬 포함 loadout의 자동 난이도 평가는 Card 10에서 봇 확장 여부 판단.
- draft 수치는 실기 미검증(제품 미노출) — Card 5/6 연결 후 나라님 실기가 첫 손맛 검증.

## 다음
- 유키PD 판정 → **Card 5 Shrine Skill Loadout Runtime 01**(성소 tap-to-swap·`let LOADOUT`·스킬바 재렌더·vow/seed 아이콘 표기) 착수 가능.
- Card 6 Battle Runtime Loadout Link · Card 9 Skill FX Readability · Card 10 Balance Pass 후속.
