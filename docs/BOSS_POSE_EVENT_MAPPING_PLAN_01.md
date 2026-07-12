# Boss Pose Event Mapping Plan 01 — Earthroot Golem

작성: 렌(Dev) · 2026-07-05 · 판정: 유키PD
성격: **계약/설계 문서 (구현 아님)**. 이 문서는 12포즈를 "붙이는" 것이 아니라 "붙일 순서와 안전선"을 정한다.
전제: Seed Healer 첫 보스 손맛은 이미 FINAL PASS. 이 설계의 최우선 목표는 **그 손맛을 절대 흔들지 않는 것**.

---

## 0. 핵심 아키텍처 결론 (가장 중요)

현재 코드를 읽은 결과, **포즈 연결은 battle.js를 전혀 건드리지 않고 index.html의 렌더 계층에서만 가능**하다.

근거:
- `src/core/battle.js`의 `ev(type, data)`가 모든 전투 사건을 `this.events[]` 큐에 넣는다.
- `index.html`의 `frame()`는 매 프레임 `consume()`를 호출하고, `consume()`는 `B.events`를 전부 꺼내(splice) 처리한다.
- 즉 **보스 액션 이벤트(teleSmash·smash·teleTremor·tremor·rootOn·auto·push·end)는 이미 index.html까지 흘러들어오고 있으나, 현재 `consume()`의 switch가 그것들을 무시(미처리)할 뿐이다.**
- 따라서 Runtime Link 01은 **`consume()`에 case를 추가해 `#act-boss img`의 `src`만 교체**하면 된다. battle.js/tuning.js/botSim.js는 손대지 않는다.

이 문서의 모든 매핑은 이 원칙 위에 있다:
> **포즈 스왑 = index.html 렌더 계층의 `img.src` 교체 + 되돌림 타이머. 전투 로직/tick/수치/타이밍은 읽기만 하고 절대 쓰지 않는다.**

---

## 1. 현재 전투에서 "포즈를 바꿀 수 있는 상황" 목록 (코드 실측)

battle.js가 실제로 발생시키는 이벤트/상태를 기준으로 한 상황 목록:

| # | 전투 상황 | 트리거 (battle.js 실제) | 종류 | index.html에서 지금 쓰는가 |
|---|---|---|---|---|
| S1 | 대기/기본 | (기본 상태) | 상태 | ✔ 라이브 IDLE |
| S2 | 강타 예고 | `teleSmash {unit,wind}` 이벤트 + `bossActor.wind` 클래스 | 이벤트+상태 | 클래스 wind만(글로우) |
| S3 | 강타 충돌(적중) | `smash {unit,shielded}` 이벤트 | 이벤트(1회성) | ✖ (consume 무시) |
| S4 | 지진 예고 | `teleTremor {wind}` 이벤트 + `wind` 클래스 | 이벤트+상태 | 클래스 wind만 |
| S5 | 지진 발동 | `tremor {}` 이벤트 | 이벤트(1회성) | ✖ |
| S6 | 뿌리 속박 발동 | `rootOn {unit}` 이벤트 | 이벤트(1회성) | ✖ |
| S6b | 속박 예고 | (상태만: `tele.root` 세팅) **이벤트 없음** | 상태(비노출) | ✖ |
| S7 | 일반 공격(평타) | `auto {unit}` 이벤트 | 이벤트(빈번·주기적) | ✖ |
| S8 | 보스 피격(맞음) | **전용 이벤트 없음** — 아군 DPS가 매 tick 연속 누적 | (없음) | ✖ |
| S9 | 후반 압박/분노 진입 | `push {}` 이벤트 + `boss.push` 상태 + `app.push-edge` | 이벤트+상태(1회 전환·이후 지속) | 화면 붉은 가장자리만 |
| S10 | 보스 패배 | `end {outcome:'victory'}` + `boss.hp<=0` + `bossActor.dead` 클래스 | 이벤트+상태 | 클래스 dead(그레이스케일)만 |
| S11 | 파티 전멸(플레이어 패배) | `end {outcome:'defeat'}` | 이벤트 | 오버레이만 |
| S12 | 패턴 후 복귀 | (되돌림 = 위 1회성 이벤트 이후 IDLE로 복귀) | 파생 | ✖ |

★ 발견 2건(중요):
- **S6b 속박 "예고"는 이벤트가 없다** (tele.root 상태만 조용히 세팅). 예고 포즈를 붙이려면 이벤트가 아니라 상태 폴링이 필요 → CAUTION.
- **S8 보스 "피격"은 전용 이벤트가 없다** (아군 자동 DPS가 매 tick 연속으로 보스 HP를 깎음). 07_HIT_STAGGER를 "맞는 순간"에 붙이려면 index.html에서 `boss.hp` 프레임 간 감소를 감지해야 하고, 연속적이라 스로틀/우선순위가 필요 → CAUTION/DEFER.

---

## 2. 12포즈 매핑표

| 포즈 | 대응 상황 | 트리거(무변경 소스) | 지속형/1회성 | 비고 |
|---|---|---|---|---|
| **01_IDLE** | S1 대기 | 기본 상태 (되돌림 목적지) | 지속 | 이미 라이브. 모든 포즈의 복귀점 |
| **02_ADVANCE** | (S1 변형) 전투 시작 위협감 | 자연 트리거 없음(보스 이동 개념 부재) | — | 인트로 1회 플래시 정도만 가능 → DEFER |
| **03_BASIC_ATTACK** | S7 일반 공격 | `auto {unit}` | 1회성(빈번) | 이벤트 존재하나 자주 발생 → 바쁨 주의 |
| **04_HEAVY_SLAM_WINDUP** | S2 강타 예고 | `teleSmash {unit,wind}` (+ `wind` 클래스) | 지속(예고창 동안) | 플레이어가 이미 읽는 예고와 짝 → 손맛 강화 |
| **05_HEAVY_SLAM_IMPACT** | S3 강타 충돌 | `smash {unit,shielded}` | 1회성(짧게) | 시그니처 위협의 클라이맥스 |
| **06_ROOT_BIND_CAST** | S6 속박 발동 | `rootOn {unit}` | 1회성→짧은 캐스트 | (예고 S6b는 이벤트 없음) |
| **07_HIT_STAGGER** | S8 피격 | **전용 이벤트 없음** (hp 감소 감지 필요) | 파생 | 연속 피격 → 스로틀 필수. CAUTION/DEFER |
| **08_DOWN_DEFEAT** | S10 패배 | `end{victory}` / `boss.hp<=0` / `dead` 클래스 | 지속(종료) | 최고 보상 순간. `dead` 그레이스케일 필터 중첩 주의 |
| **09_TREMOR_CAST** | S4 지진 예고 | `teleTremor {wind}` (+ `wind` 클래스) | 지속(예고창) | smash 예고와 동시성 충돌 가능 |
| **10_TREMOR_RELEASE** | S5 지진 발동 | `tremor {}` | 1회성(짧게) | 전원 타격 순간 |
| **11_FINAL_PRESSURE_ENRAGE** | S9 압박/분노 | `push {}` / `boss.push` / `push-edge` | 지속(진입 후 유지) | 진입 후 "기본 상태"가 됨 → 이후 idle 대신 enrage가 base가 될지 결정 필요 |
| **12_RECOVERY_RESET** | S12 복귀 | 1회성 이벤트 종료 후 idle 복귀 전 프레임 | 파생 | 사실상 "idle로 돌아가기" — 한계효용 낮음. DEFER |

---

## 3. 포즈 우선순위 (필수 — 포즈끼리 싸우지 않게)

여러 상황이 겹칠 수 있으므로(예: 분노 중 강타 예고, 강타 예고 중 지진 예고), Runtime Link는 **단일 우선순위 리졸버**를 둔다. 높은 것이 낮은 것을 덮는다:

```
패배(08) > 분노진입 순간(11) > 강타충돌(05) > 지진발동(10) > 강타예고(04) > 지진예고(09) > 속박(06) > 평타(03) > 피격(07) > 대기(01)
```

되돌림 규칙:
- 1회성 포즈(05/10/06/03/07)는 index.html 타이머로 **짧게(예: 250~500ms) 표시 후 base 포즈로 복귀**.
- base 포즈 = 분노 진입 전엔 01_IDLE, 분노 진입 후엔 11_ENRAGE 또는 01_IDLE(유키PD 결정 항목).
- 지속형(04/09 예고)은 해당 tele 상태가 사라질 때 base로 복귀.
- **되돌림 타이머는 index.html의 setTimeout로만. 절대 battle.js tick에 의존하거나 tick을 바꾸지 않는다.**

---

## 4. 위험도 분류 (SAFE / CAUTION / DEFER)

### SAFE — 이벤트가 실존하고, 1회성/경계가 명확해 index.html src 교체만으로 안전
- **01_IDLE** — 기본 상태(이미 라이브)
- **08_DOWN_DEFEAT** — `end{victory}`/`boss.hp<=0`. 1회성·종료 시점·최고 보상. (단 `dead` 그레이스케일 필터 중첩 처리 결정 필요)
- **05_HEAVY_SLAM_IMPACT** — `smash` 이벤트. 짧은 1회성.
- **04_HEAVY_SLAM_WINDUP** — `teleSmash` 이벤트 + 기존 `wind` 클래스. 예고창 동안 지속.
- **10_TREMOR_RELEASE** — `tremor` 이벤트. 짧은 1회성.
- **09_TREMOR_CAST** — `teleTremor` 이벤트 + `wind` 클래스.
- **06_ROOT_BIND_CAST** — `rootOn` 이벤트.
- **11_FINAL_PRESSURE_ENRAGE** — `push` 이벤트/`boss.push` 상태.

### CAUTION — 이벤트/상태와 엮이나 타이밍·우선순위·중첩 처리를 조심해야 함
- **03_BASIC_ATTACK** — `auto`는 SAFE 이벤트지만 **빈번**. 우선순위 하위 + 최소표시시간 없이 넣으면 다른 포즈와 깜빡임 경쟁. 최소표시시간·우선순위 필수.
- **06/09/10 동시성** — 강타/지진 예고·발동이 겹칠 때 §3 리졸버가 없으면 포즈가 튄다.
- **11_ENRAGE의 base 승격** — push는 진입 후 지속 상태. 진입 후 base가 idle이냐 enrage냐를 정하지 않으면 이후 모든 되돌림 목적지가 애매해짐.
- **07_HIT_STAGGER** — 전용 이벤트 없음. `boss.hp` 프레임 간 감소를 index.html에서 감지해야 함(연속 피격). 스로틀 + 낮은 우선순위 + windup/impact/dead를 절대 가리지 않기 필수.
- **08_DOWN_DEFEAT + dead 필터** — 기존 `dead` 클래스가 img에 grayscale 필터를 건다. 08 포즈에 그레이스케일이 이중으로 얹히면 의도와 다를 수 있음 → 필터 예외 처리 결정.
- **DEV pose selector와의 공존** — Ingame Preview 01의 🐞 DEV selector가 수동으로 src를 덮는다. 런타임 자동 스왑과 수동 스왑이 충돌 가능 → Runtime Link에서 "자동 중엔 DEV override 우선/보류" 규칙 명시.

### DEFER — 지금 붙이면 손맛/명료성을 흔들 수 있어 보류
- **02_ADVANCE** — 전투에 보스 이동 개념이 없음. 자연 트리거 부재. (인트로 플래시 정도만 후순위 검토)
- **12_RECOVERY_RESET** — 사실상 "idle 복귀"와 중복. 한계효용 낮음.
- **07_HIT_STAGGER** — 코어 세트 검증 전까지 보류(연속 피격 특성).
- **12포즈 전체 애니메이션 / 프레임 시퀀스** — 전면 보류. 이번 단계는 상태-포즈 1:1 스왑까지만.

---

## 5. Runtime Link 01 — "처음에 연결할 최소 포즈" 추천

원칙(유키PD): 처음부터 12개 다 붙이지 않는다. 3~5개, 이벤트가 실존하고 손맛을 강화하는 것부터.

### 추천안 A — 코어 4포즈 (렌 1순위 추천)
```
01_IDLE  (base·이미 라이브)
04_HEAVY_SLAM_WINDUP  ← teleSmash (플레이어가 이미 읽는 강타 예고와 짝 = 손맛 강화)
05_HEAVY_SLAM_IMPACT  ← smash (예고→충돌 클라이맥스, 방패 예측 루프 보상)
08_DOWN_DEFEAT        ← end{victory}/hp0 (전투의 최고 보상 순간)
```
이유: 4개 전부 **이벤트 실존·SAFE**, 그리고 이 게임의 코어 루프("강타를 예측해 방패로 막는다")를 **정확히 시각적으로 보강**한다. 평타(03)는 빈번해서 일부러 제외 → 첫 연결에서 화면이 바빠지지 않음.

### 추천안 B — 초안전 3포즈 (더 보수적으로 갈 때)
```
01_IDLE
05_HEAVY_SLAM_IMPACT
08_DOWN_DEFEAT
```
이유: 지속형(예고) 없이 **1회성 두 개 + base**만. 우선순위 리졸버 최소, 리스크 최소. "일단 안전하게"면 이걸로.

### 유키PD 원안(01+07+08)에 대한 렌 의견
유키PD가 제시한 초안전안 `01_IDLE + 07_HIT_STAGGER + 08_DOWN_DEFEAT`은 방향은 옳으나, **07_HIT_STAGGER는 전용 이벤트가 없어**(아군 DPS 연속 피격) 첫 연결로는 오히려 스로틀/우선순위 부담이 크다. 그래서 **07 자리를 05_HEAVY_SLAM_IMPACT로 대체**하기를 권한다(같은 3포즈 규모, 이벤트 실존, 리스크 더 낮음). 07은 코어 세트가 실기 검증된 뒤 CAUTION 항목으로 추가.

---

## 6. 리소스 WATCH (설계에 명시·이번 미수정)

- **05_HEAVY_SLAM_IMPACT FX가 06_ROOT_BIND_CAST 셀 영역과 인접/침범한 흔적** — 나라님 사소 WATCH. 현재 수정하지 않음. 05·06을 둘 다 런타임 연결할 경우 실기에서 티가 나면 Boss Pose Cleanup 01로 분리.
- **11_FINAL_PRESSURE_ENRAGE 상단 덩굴 미세 클리핑** — 현재 수정하지 않음. 스케일/여백 때문에 실기에서 거슬리면 Cleanup 01.
- 두 WATCH 모두 **리소스(그림) 이슈**이지 매핑/로직 이슈가 아니다. 매핑은 이 그림들을 그대로 표시만 한다.

---

## 7. 절대 금지선 (Runtime Link 01에서도 유지)

- battle.js/botSim.js/tuning.js 무변경. 전투 수치·보스 패턴·스킬 효과·AI·tick·타이밍·승패 조건 불변.
- 포즈 스왑은 **index.html의 `#act-boss img.src` 교체 + setTimeout 되돌림**까지만. 이벤트는 **읽기만**(consume에서 소비하되 전투 상태를 바꾸지 않음).
- 되돌림 타이머는 절대 battle.js tick에 의존/개입하지 않음.
- botSim baseline 7/7 · coreChecks 9/9 는 매핑 연결 후에도 그대로여야 함(로직 무변경이므로 자동 보장).
- Runtime Link 01 후에도 나라님 실기 손맛 판정(승리 2:25 급·전원 생존 급)이 흔들리면 실패로 간주하고 롤백.

---

## 8. 다음 작업 후보

- **A. Boss Pose Runtime Link 01** — 위 추천안 A(코어 4) 또는 B(초안전 3)만 실제 이벤트 연결. index.html consume()에 case 추가 + 우선순위 리졸버 + 되돌림 타이머. battle.js 무변경. (렌 1순위)
- **B. Boss Pose Preview 01B** — 보스 스케일/위치 미세 조정(현재 height 322px·top 2%). 나라님이 "더 크게/더 위로" 원할 때만.
- **C. Boss Pose Cleanup 01** — 05/06 FX bleed 또는 11 클리핑이 실제 인게임에서 거슬릴 때만 리소스 정리(별도 리소스 카드).

권장 순서: **A(코어 세트) → 나라님 실기 손맛 재확인 → 필요 시 B/C.**
