# P1A · 02 · REBUILD FILE STRUCTURE — Seed Healer

**Migration Prep Pack 01 (2/11)** · 작성: 렌 · 2026-07-04
현재 단일 HTML을 노트북 새 프로젝트에서 **모듈로 나누는 설계도.** 코드가 아니라 "무엇을 어디에 둘지"의 지도다.

> 원본 구조 대응: 단일 HTML은 논리적으로 ①전투 코어(현 sim.js 상당) ②UI 3레이어(현 app1/2/3 상당) ③봇·검증 하니스로 나뉘어 있다. 이걸 아래처럼 편다.

---

## 1. 제안 디렉토리 트리

```
src/
  core/
    battle.js      전투 시뮬(결정론) — DOM 무관
    state.js       메타 진행 상태(보유/편성/재화/기록)
    storage.js     localStorage 직렬화·복원·마이그레이션
  data/
    tuning.js      모든 튜닝 상수 (단일 진실 원천)
    allies.js      동료 5종 정의
    skills.js      스킬 7종 정의
    bosses.js      보스(골렘) 패턴 타임라인 정의
  ui/
    screens.js     타이틀/마을/게시판/여관/기도소/준비/결과/기록실 라우팅·렌더
    battleHud.js   전투 HUD 렌더·입력·연출(흔들림/비네트/플로팅/SFX)
    report.js      결과 화면 + 기록실 리포트 렌더
    assets.js      ASSETS 매니페스트 + sprite 헬퍼
  dev/
    botSim.js      봇 4종 + 변형 + coreChecks (QA 하니스)
index.html         마운트 지점 + 정적 전투 스켈레톤 + CSS(또는 별도 css/)
```

빌드 도구를 쓰지 않을 거면 각 파일을 `<script type="module">` import로 연결하거나, 현재처럼 순서 concat + 단일 `<script>`도 가능(원본이 후자).

---

## 2. 파일별 명세

### core/battle.js — 전투 시뮬 (최우선 이식)
- **책임**: 결정론 전투 1회를 처음부터 끝까지 계산. DOM을 절대 만지지 않는다.
- **포함**: `class Battle`(또는 Sim) — 유닛 배열(1번=사제), 보스 상태, 마나/GCD/쿨다운/보호막/HoT/속박, `step(dt)`, `use(slotIdx)`, `select(i)`, `cancelCast()`, `finish(outcome)`, 이벤트 큐, 결과 집계.
- **연결**: `data/tuning.js`(값)·`data/allies.js`·`data/skills.js`·`data/bosses.js`를 읽음. UI는 이 클래스의 `events`를 소비하고 상태를 렌더. `dev/botSim.js`도 이 클래스를 그대로 구동.
- **결합도 주의**: UI/DOM/타이머 참조 절대 금지(순수성 유지 = 봇·결정론의 전제). 시간은 외부가 주는 `dt`로만.
- **이식 우선순위**: ★★★ (1순위)

### core/state.js — 메타 진행 상태
- **책임**: 전투 밖의 영속 상태. 보유 동료·편성(party)·보유 스킬·로드아웃(6슬롯)·재화 4종·클리어 횟수·최고 기록·직전 리포트·설정(음소거).
- **포함**: `defaultState()`, 상태 객체, 편성/장착 변경 함수(검증 포함: 3인/6슬롯 상한).
- **연결**: `storage.js`가 저장/복원. `ui/screens.js`가 읽고 변경. `battle.js` 시작 시 party·loadout을 스냅샷으로 넘김.
- **결합도 주의**: 전투 진행 상태(HP 등)와 섞지 말 것 — 이건 "저장되는 것"만.
- **이식 우선순위**: ★★☆

### core/storage.js — 저장
- **책임**: `state`를 localStorage에 try/catch로 저장/복원. schemaVersion 확인, 손상/불일치 시 안전 초기화.
- **포함**: `save(state)`, `load()`, `hasSave()`, SAVE_KEY, SCHEMA 상수, 마이그레이션 스텁.
- **연결**: `state.js`와 1:1.
- **결합도 주의**: 저장 실패가 게임을 죽이면 안 됨(경고 1회 후 진행).
- **이식 우선순위**: ★★☆

### data/tuning.js — 튜닝 상수 (단일 진실 원천)
- **책임**: 손맛을 만드는 모든 숫자. 06 문서의 표가 이 파일이 된다.
- **포함**: boss{...}, tankMit, allies{...스탯}, priest{...}, gcd, skills{...스탯}, ui{dangerPct}.
- **연결**: 거의 모든 파일이 읽음. **쓰기는 없음**(런타임 불변).
- **결합도 주의**: 값이 여러 곳에 흩어지면 안 됨. 재구현의 핵심 규율.
- **이식 우선순위**: ★★★ (1순위 — battle.js와 동시)

### data/allies.js · skills.js · bosses.js — 정의
- **책임**: 각각 동료/스킬/보스 패턴의 "정의"(스탯은 tuning 참조 또는 병합). 05·04 문서가 원천.
- **연결**: `battle.js`가 소비. `ui`가 이름·설명·이모지·아이콘 키를 읽음.
- **결합도 주의**: 순수 데이터로. 로직(AI 판단)은 battle.js의 규칙으로 두는 게 원본과 일치.
- **이식 우선순위**: ★★☆

### ui/screens.js — 화면 라우팅/렌더
- **책임**: 전투 외 8화면 렌더 + `show(id)` 라우터 + 정적 버튼 바인딩. 07 문서가 원천.
- **연결**: `state.js` 읽기/변경, `storage.save`, `battleHud.startBattle` 호출.
- **결합도 주의**: 여관 역할 문구·기도소 설명 문구는 요청서 지정 문구 그대로.
- **이식 우선순위**: ★★☆

### ui/battleHud.js — 전투 HUD (읽힘의 핵심)
- **책임**: `battle.js`를 rAF 고정스텝으로 구동, 이벤트→연출/SFX, 6존 HUD 렌더, 입력(프레임 선탭→스킬 탭), 일시정지/포기. 07 문서가 원천.
- **포함**: 진입 오버레이, 프레임/슬롯 DOM 구축, `consumeEvents`, `renderHUD`, `renderTele`, 손맛 툴킷(shake/vign/flash/addFloat), 합성 SFX, 종료 시퀀스.
- **연결**: `battle.js`(구동·이벤트), `assets.js`(스프라이트), `report.js`(종료 후), `state`(보상 반영).
- **결합도 주의**: 게임 로직을 여기 넣지 말 것 — HUD는 battle의 상태를 "그리기만". 판정은 전부 battle.js.
- **이식 우선순위**: ★★☆

### ui/report.js — 결과·기록실
- **책임**: 결과 화면(지표·칩·보상 버튼) + 기록실 리포트(위기 순간·원인·추천). 08 문서가 원천.
- **연결**: `state.lastReport` 읽기, `battle.js`가 만든 report 객체 소비.
- **이식 우선순위**: ★★☆

### ui/assets.js — 에셋 슬롯
- **책임**: ASSETS 매니페스트(전부 null) + `spr()`/`allySpr()`/`skillSpr()` 헬퍼(값 있으면 <img>, 없으면 이모지/도형). 09 문서가 원천.
- **연결**: 모든 UI가 렌더 시 호출.
- **결합도 주의**: 이미지 없어도 완전 동작해야 함. base64 대량 내장 금지.
- **이식 우선순위**: ★☆☆ (마지막)

### dev/botSim.js — QA 하니스
- **책임**: 봇 4종+변형 + coreChecks. `battle.js`를 그대로 구동해 결정론 회귀 검증. 10 문서가 원천.
- **연결**: `battle.js`만 의존(순수). 인게임 데브 패널 또는 node 양쪽에서 실행 가능하게.
- **이식 우선순위**: ★★☆ (코어 직후 — 곡선 회귀에 필요)

---

## 3. 의존 방향 (한눈에)

```
tuning.js ─┐
allies.js ─┤
skills.js ─┼─▶ core/battle.js ─▶ dev/botSim.js
bosses.js ─┘        │
                    ▼
state.js ◀─▶ storage.js
   │                │
   ▼                ▼
ui/screens.js ─▶ ui/battleHud.js ─▶ ui/report.js
        └──────────▶ ui/assets.js ◀────────┘
```

규율: **화살표는 위→아래로만.** battle.js가 UI를 알면 안 되고(순수성), tuning은 아무도 안 가리킨다(값만). 이 방향만 지키면 봇·결정론·이미지 병렬성이 전부 보존된다.

---

## 4. 재구현 착수 순서 (파일 기준)

1. `data/tuning.js` + `core/battle.js` (동시) → node에서 결정론 1판 돌아가는지
2. `dev/botSim.js` → 봇 4종 수치가 10 문서 baseline과 일치하는지 (**여기서 재미 회귀 판정**)
3. `data/allies.js`·`skills.js`·`bosses.js` 분리(코어에 인라인했다면 뽑아내기)
4. `core/state.js` + `core/storage.js`
5. `ui/assets.js` → `ui/battleHud.js` → `ui/screens.js` → `ui/report.js`
6. `index.html` 결합 + 실기 확인
