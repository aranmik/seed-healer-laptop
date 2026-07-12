# Battlefield Spacing Polish 01

작업일: 2026-07-11 · 담당: 렌(Dev) · 판정: **★유키PD FINAL PASS (2026-07-11)** · 나라님 눈맛 실기 확인
기준: COMBAT_CLARITY_EXIT_POLISH_01(FINAL PASS) · 나라님 실기 피드백(나가↔도적 겹침·아군 3명 약간 아래로)

## ★FINAL PASS 확정 기록 (유키PD · 2026-07-11)
- ELI/THORNE/LUMINA 아군 3명 공통 약 20px 하향(bf-ally-l 29→24.5% · c 31.5→27% · r 28→23.5%) · 골렘/물정령/나가 동일 규격 · ARIA 위치 불변(bottom 2.5%).
- 전사/도적/마법사 상대 대형 유지 · 나가↔도적 수직 실루엣 중첩 약 20px 감소 · actor hit/action transform 충돌 없음(중앙 heroHitC/heroLungeC로 translateX(-50%) 보존).
- ARIA impulse/support spark/각종 FX 추적 정상 · 하단 UI 충돌 없음 · battlefieldSpacingCheck 16/0 · 기존 전체 회귀 ALL PASS · 코어/데이터/tuning 무변경.
- ★도적↔ARIA 세로 여유 약 10px → 추가 하향 금지(다음 겹침 조정은 나가 offset 또는 도적 X 극소 분리로만).
범위: **CSS visual-only** — 아군 3명(전사/도적/마법사) 공통 하향으로 보스와 시각 분리 · 나가↔도적 겹침 완화. ARIA/보스/코어/수치 무변경.

## 1. 기존 actor 위치 구조 (조사)
- 전투 배우는 `.bf-actor` 절대위치 컨테이너 + 자식 `img.spr`. 위치는 **CSS 고정**(index.html), 보스별 JS 분기 없음(selectBoss는 보스 img/height/marginLeft만 갱신).
- 슬롯 매핑(`slotCls=['bf-ally-l flip','bf-ally-c','bf-ally-r']`): party[0] warrior→**bf-ally-l**(ELI·flip) · [1] rogue→**bf-ally-c**(THORNE·중앙) · [2] mage→**bf-ally-r**(LUMINA). ARIA(사제)=`bf-aria`.
- **반응 시스템(★§4 핵심)**:
  - 순간 반응 중 **transform 계열**: `heroHit`/`heroLunge`(피격 recoil·outgoing lunge). 중앙 아군은 `heroHitC`/`heroLungeC` 별도 keyframe으로 **base transform `translateX(-50%)` 보존**.
  - **filter 계열**: react-heal/react-shield/react-block/cast-pulse/cast-ring/danger-tgt/safe-tgt(위치 무관).
  - 발밑 그림자(`.bf-actor::before`)·선택(`selactor`)·보호막(`shielded`)·사망(`dead`)·breath = 전부 actor 종속.
  - support-spark(사제→대상 impulse)는 **actor `getBoundingClientRect()` 동적 계산**.
- ★결론: **위치를 `bottom`(위치 속성)으로만 옮기면 transform/filter 반응과 충돌 0**(bottom은 transform을 건드리지 않음·heroHitC의 translateX(-50%)도 무관). = 채택 방식.

## 2. 하향 방식과 선택 이유
- `.bf-ally-l/c/r`의 **`bottom%`만 공통 -4.5%p** 낮춤. transform/left/right/height/보스/ARIA 무변경.
- 이유: (a) §4 충돌 회피(transform 반응 보존) (b) 공통 규격(보스별/아군별 땜질 없음·§5) (c) 좌우 상대차/깊이 유지(§6).
- 좌우 예외·나가 전용 offset·도적만 이동 = 미사용(1차 해법=공통 하향). 나가 실측 후 추가 예외 불필요 판정.

## 3. 변경 전/후 위치 수치 (bottom% · 브라우저 실측 px)
| 배우 | bottom% 전→후 | 발(bottom) px 전→후 | top px 전→후 |
|---|---|---|---|
| bf-ally-l 전사 | 29 → **24.5** | 314 → **334** | 208 → **228** |
| bf-ally-c 도적 | 31.5 → **27** | 303 → **323** | 204 → **224** |
| bf-ally-r 마법사 | 28 → **23.5** | 318 → **338** | 215 → **235** |
| bf-aria 사제 | 2.5 → **2.5(불변)** | 431 → **431(불변)** | 333 → **333(불변)** |
- **공통 하향 delta = -4.5%p ≈ +20px** (3명 동일) · 상대 순서 c>l>r 유지 · 좌우 cx(58/188/318) 무변경.
- 배틀필드 442px 기준(375px viewport). 3보스 전부 동일 아군 좌표(golem/water/naga 측정치 일치).

## 4. ARIA 위치 불변
- bf-aria bottom 2.5%·top 333·bottom 431 전부 불변(check A4/D1·브라우저 실측). ARIA는 여전히 후방/하단 지원 원점.
- 아군 하향 후 **allyC↔ARIA 간격 30→10px**(여전히 양수·안 겹침). allyC(cx 188)만 ARIA와 같은 컬럼이라 제약 → 하향폭을 이 간격이 결정(그래서 -4.5%p·최소 이동). allyL/R(cx 58/318)은 ARIA(cx 150~226)와 다른 컬럼이라 발이 ARIA top 아래로 가도 수평 미겹침.
- ARIA→대상 impulse/cast pulse/방향성 전부 동적 추적(위치 무관).

## 5. 3보스 공통 적용
- 아군 위치 = CSS 단일 정의(보스별 분기 0·check C1/C2). golem/water/naga **전부 동일 아군 좌표**(실측 l 334/c 323/r 338 동일).
- 보스는 각자 유지: golem/water 322px(feet 331)·naga 352px(feet 361·offsetX-16). 보스 이미지/크기/offset 무변경(잔류 0).

## 6. 나가/도적 겹침 개선 결과
- 나가: boss feet 361·cx 188. 도적(allyC) cx 188(=나가 중심·centerDist 0).
- **allyC top이 나가 몸통을 침범하는 높이: 157→137px(-20px 감소)**. 보스→party 최상단 간격: 195→**215px(+20)**.
- 효과: party가 하나의 낮은 횡 대형으로 내려앉아 나가의 큰 실루엣이 위쪽에서 또렷이 지배 → "도적이 나가와 같은 자리" 인상 완화. (2.5D상 중앙 컬럼 공유는 불가피 — 수직 분리로 해소.)
- 나가 존재감 유지(보스 크기/offset 무변경). golem/water도 boss→party 간격 +20px로 동일하게 개선.

## 7. actor reaction / FX 추적 보호
- 위치 이동을 bottom으로만 → transform 반응(heroHit/heroLunge·중앙 translateX(-50%)) 무손상(check B2/B3).
- filter 반응(heal/shield/block/cast pulse·ring)·danger-tgt glow·발밑 그림자·선택/보호막/사망 상태 = actor 종속 자동 추적(check B4/B6).
- support-spark·초상 FX = getBoundingClientRect 동적 계산 → 이동한 actor 자동 목표(check B5). vow/seed chip은 하단 party 카드(전장 위치 무관)라 영향 0.
- FX 디자인 자체 무변경(이번 카드 범위 밖).

## 8. 하단 UI 충돌 검증 (브라우저 실측)
- party 최하단 발 = 338px(allyR) < cast-bar top 442px → **충돌 0·크롭 0**(check noCrop=true·모든 actor 배틀필드 내).
- allyC 발 323 < ARIA top 333 → ARIA 미겹침(gap 10px). hero-hit(+3px)·lunge(-5px) 최대 이동에도 여유(worst ~7px).
- 가로 overflow 0(375=375) · broken img 0 · 콘솔 error 0(전 세션).

## 9. 회귀 결과 (2026-07-11 실측)
| 검증 | 결과 |
|---|---|
| node --check | OK |
| **battlefieldSpacingCheck (신규)** | **16/0 ALL PASS** (A 공통대형4·B 반응충돌6·C 3보스공통2·D UI보호2·E 이전카드2) |
| combatClarityExitCheck | 26/0 ALL PASS |
| skillPoolContractCheck | 34/0 · battleCoreSkillExtensionCheck 42/0 · shrineLoadoutCheck 29/0 · battleLoadoutLinkCheck 26/0 |
| botSim | 16 PASS / 0 FAIL · probeSim ALL PASS (26 checks) |
| 브라우저(5182·375px) | 3보스 아군 좌표 동일(+20px 하향)·ARIA 불변·boss→party 간격 +20·나가 겹침 -20·allyC↔ARIA 10px·크롭0·overflow0·콘솔0·danger-ring 여전히 보스중심/조용·포기 버튼 정상 |
- 수정 파일: **index.html**(CSS 3줄) + 신규 src/dev/battlefieldSpacingCheck.js. ★skillPool.js 등 다른 데이터/코어 파일 무접촉(mtime 무변동: battle/tuning/skillPool/bossProbes/botSim/probeSim/assets).

## 10. 나라님 실기 확인 항목 (스크린샷 도구 rAF timeout → 눈맛은 실기)
- 골렘/물정령/나가 전투에서 아군 3명이 살짝 내려와 보스와 분리돼 보이는지.
- 특히 **나가에서 도적이 보스에 붙어 보이던 인상이 줄었는지**.
- 아군 3명이 하나의 파티로 안정적으로 읽히는지(전사 좌·도적 중앙·마법사 우 깊이감 유지).
- ARIA가 여전히 뒤/아래 지원자로 뭉치지 않고 읽히는지.
- 하단 카드/스킬바와 안 부딪는지.

## 11. WATCH
- allyC(도적·cx 188)는 ARIA와 같은 컬럼이라 하향폭 상한이 낮음(현재 gap 10px). 더 내리길 원하면 ARIA 컬럼 회피(도적 cx 미세 이동)가 필요하나 §6/§7 위반 → 현 -4.5%p가 안전 최대치 근방.
- 2.5D 특성상 중앙 아군과 보스의 컬럼 공유(cx 188) 자체는 유지 — 수직 분리로만 완화(디자인 한계·실기에서 충분한지 판정).
- 스크린샷 도구 rAF timeout 지속(DOM geometry로 대체 증빙).

## 12. 다음 Boss Telegraph & Attack FX Polish 01로 넘길 항목
- 보스별 telegraph/attack FX 본격 강화(예고 가독성·타점 명확화). 이번엔 상시 오해 제거+spacing만.
- (필요 시) 나가 실루엣 자체의 시각 offset 미세 조정은 그 카드에서 재검토.

## 다음
- 유키PD 판정 + 나라님 눈맛 실기 → Boss Telegraph & Attack FX Polish 01 착수.
