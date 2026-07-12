# DAY 1 REBUILD ORDER — Seed Healer 노트북 첫날

**Laptop Carry Pack 01** · 작성: 렌 · 2026-07-04
첫날은 **뼈대·수치·에셋 슬롯**까지. 전투 로직은 마지막 or 둘째 날. 각 단계에 목표/성공 기준/실패 시 확인/절대 금지를 붙였다.

---

## Step 0 · 원본을 reference로 보관
- **목표**: `seed_healer_p1_raid_frame_priest.html`을 새 프로젝트 `reference/`에 복사.
- **성공 기준**: 브라우저로 열어 P1-A가 실제로 돈다(골렘전 1판 가능).
- **실패 시**: 파일 경로/인코딩 확인. 원본은 단일 HTML이라 더블클릭이면 열린다.
- **절대 금지**: 원본 수정. 이건 정답지다. 읽기 전용으로 생각.

## Step 1 · 새 프로젝트 폴더 생성
- **목표**: 작업 폴더 하나 생성(예: `seed-healer/`).
- **성공 기준**: 빈 폴더가 에디터(VS Code 등)에서 열린다.
- **실패 시**: —
- **절대 금지**: 기존 다른 프로젝트 폴더 안에 섞지 말 것.

## Step 2 · scaffold 구조 복사
- **목표**: 이 Carry Pack의 `scaffold/` 내용을 새 폴더로 복사.
- **성공 기준**: `src/`, `assets/`, `index.html`이 자리 잡음. 트리 구조가 `README_FOR_LAPTOP.md`와 일치.
- **실패 시**: 폴더 누락 확인(특히 `assets/` 하위 6개).
- **절대 금지**: 구조 임의 변경(먼저 그대로 → 이해한 뒤 리팩터).

## Step 3 · tuning.js 확인
- **목표**: `src/data/tuning.js`를 열어 P1-A 핵심 수치가 들어 있는지 본다.
- **성공 기준**: boss.hp 9600, smashDmg 720, priest.mana 100 등 06 문서 값이 보인다. `TODO_FROM_P1A_DOC_06` 주석이 남은 항목 파악.
- **실패 시**: `docs/P1A_06_TUNING_CONSTANTS.md` 표와 1:1 대조해 채움.
- **절대 금지**: 값 "개선"(이식 단계에선 원본과 동일해야 봇 회귀가 성립).

## Step 4 · assets.js 슬롯 확인
- **목표**: `src/ui/assets.js`의 슬롯 트리와 폴백 헬퍼를 이해.
- **성공 기준**: 모든 슬롯 null이어도 이모지/CSS로 렌더되는 구조임을 확인. 슬롯명이 `ASSET_IMPORT_CHECKLIST`와 일치.
- **실패 시**: 폴백 헬퍼(`spr`)가 null→이모지 분기하는지 확인.
- **절대 금지**: base64 이미지 인라인. 외부 파일 경로만.

## Step 5 · index.html 최소 실행 확인
- **목표**: `index.html`을 브라우저로 열어 Starter 화면 표시.
- **성공 기준**: "Seed Healer Laptop Starter" + 폰 프레임 + 상태 칩(Asset Slots Ready / Tuning Ready / Battle Core Pending)이 보인다. 콘솔 에러 0.
- **실패 시**: 스크립트 로드 경로 확인(상대경로). 파일 프로토콜에서 ES module import가 막히면 README의 Live Server 방식으로.
- **절대 금지**: 실행 안 된다고 원본 HTML을 통째로 붙여넣기.

## Step 6 · 전투 HUD 뼈대 확인
- **목표**: Starter에서 6존(A보스/B예고/C전장/D프레임4칸/E슬롯/F마나) 빈 레이아웃 확인.
- **성공 기준**: 레이드 프레임 4칸 자리(1번=YOU 표식)와 6슬롯 자리가 세로로 보인다.
- **실패 시**: `P1A_07_UI_SCREEN_FLOW_AND_HUD.md` 6존 맵과 대조.
- **절대 금지**: 이 단계에서 실제 전투 연결(아직 코어 없음).

## Step 7 · 루미 리소스 일부만 연결
- **목표**: 있으면 사제 idle + 골렘 idle + 스킬 아이콘 몇 개만 슬롯에 연결(없으면 스킵).
- **성공 기준**: 연결한 슬롯만 이미지로 뜨고, 안 한 건 여전히 이모지 폴백. `RESOURCE_FILENAME_MAP_TEMPLATE`에 상태 기입.
- **실패 시**: 파일명이 assets.js 키와 매칭되는지, 경로가 `assets/` 하위인지 확인.
- **절대 금지**: 전체 88컷 한 번에 연결(전투 화면 먼저 — CHECKLIST 우선순위 준수).

## Step 8 · 손맛 기준표와 비교
- **목표**: `P1A_HANDFEEL_CHECKSHEET.md`를 꺼내 현재 상태 점검(아직 전투 전이면 "읽힘" 항목 위주).
- **성공 기준**: 뼈대·수치·에셋이 준비됐고, 무엇을 지켜야 하는지 손에 잡힘.
- **실패 시**: `DO_NOT_BREAK.md` 재확인.
- **절대 금지**: 체크 통과 전 다음 단계 강행.

## Step 9 · battle.js 이식 시작 (여기부터 코어)
- **목표**: `P1A_03_BATTLE_LOOP_AND_STATE.md`의 pseudo를 실제 코드로. DOM 무관 순수 클래스부터.
- **성공 기준**: node로 봇 1판이 돌고, `P1A_10` baseline과 방향이 맞기 시작(방치 패배 등).
- **실패 시**: step 순서(12단계)·이벤트명·결정론(난수 0) 재확인. 값은 06, 로직은 03.
- **절대 금지**: 봇 검증 없이 UI부터 붙이기. 코어→봇 회귀→HUD 순서.

---

## 첫날 끝 그림
```
새 프로젝트가 켜지고,
폰 프레임 안에 전투 HUD 6존 뼈대가 보이고,
tuning.js엔 P1-A 숫자가 들어 있고,
ASSETS 슬롯은 연결만 하면 되는 상태.
(battle.js는 착수했거나 내일 아침 첫 일감.)
```
둘째 날: battle.js 완성 → 봇 baseline 대조 → HUD 연결 → 마을/저장 → 손맛 체크시트 전 항목.
