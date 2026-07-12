# README FOR LAPTOP — Seed Healer

**Laptop Carry Pack 01** · 작성: 렌 · 2026-07-04
파일을 노트북으로 옮긴 뒤 보는 간단 안내서. 외부 설치 요구 없음.

---

## 1. 폴더 배치

Carry Pack의 `scaffold/`가 곧 새 프로젝트다. 이렇게 둔다:

```
seed-healer/                 ← 새 프로젝트 루트 (scaffold 내용을 여기로)
  index.html
  src/
    core/   (battle.js, state.js, storage.js)
    data/   (tuning.js, allies.js, skills.js, bosses.js)
    ui/     (assets.js, screens.js, battleHud.js, report.js)
    dev/    (botSim.js)
  assets/   (priest/ allies/ bosses/ icons/ status/ ui/)
  docs/     (Migration Prep Pack P1A_00~10 여기로 복사)
  reference/
    seed_healer_p1_raid_frame_priest.html   ← 원본(정답지) 여기 보관
```

Product Prep Pack(01~07)도 `docs/`에 같이 두면 헌법·명세가 한곳에 모인다.

---

## 2. 로컬 실행 (셋 중 하나)

1. **가장 간단**: `index.html`을 브라우저로 더블클릭.
   - 스캐폴드 Starter는 이 방식으로 열리게 만들어 뒀다.
   - ⚠️ 나중에 `src/`를 ES module(`import`)로 쪼개면, 파일 프로토콜에서 import가 막힐 수 있다. 그때는 아래 2·3번으로.
2. **VS Code Live Server**: 확장 "Live Server" 설치 → `index.html` 우클릭 → "Open with Live Server".
3. **정적 서버**: 터미널에서 프로젝트 폴더 → `python3 -m http.server 8000` → 브라우저 `localhost:8000`.
   - (파이썬은 대부분 노트북에 이미 있음. 없으면 1·2번으로 충분.)

**외부 라이브러리/CDN 설치는 필요 없다. 의존성 0을 유지한다.**

---

## 3. 어떤 파일부터 수정하나

`DAY1_REBUILD_ORDER.md` 순서를 따른다. 요약:
```
tuning.js 확인 → assets.js 확인 → index.html 실행 → HUD 뼈대 →
(리소스 일부 연결) → 손맛 기준 대조 → battle.js 이식 시작
```
로직은 `docs/P1A_03`, 숫자는 `docs/P1A_06`을 옆에 켜두고 짠다.

---

## 4. 리소스 연결 순서

`ASSET_IMPORT_CHECKLIST.md`대로 **전투 화면 먼저**(사제+골렘+아이콘). 파일명은 `RESOURCE_FILENAME_MAP_TEMPLATE.md`에 기록. 이미지 없어도 이모지/CSS로 돌아가니 급할 것 없다.

---

## 5. 원본 HTML은 reference로만

`reference/seed_healer_p1_raid_frame_priest.html`은 **정답지**다. 열어서 동작을 보고, 봇 수치를 대조하고, 애매하면 실행해 확인한다. **코드를 복붙하지 않는다** — 문서(P1A_*)를 보고 새로 짠다.

---

## 6. 처음부터 대개편하지 말 것

스캐폴드 구조를 먼저 그대로 세우고 이해한 뒤에 리팩터. 첫날은 "켜지고, 뼈대 보이고, 숫자 들어있고, 에셋 슬롯 준비됨"까지. 확장·개편은 P1-A 손맛이 재현된 다음.

---

## 7. 손맛 체크 후 다음 단계로

battle.js를 이식하면 `dev/botSim.js`로 봇 4종을 돌려 `docs/P1A_10` baseline과 대조한다(방치 패배 / 스팸 마나파산 / 기본기 빠듯승리 / 스마트 안정승리). 방향이 맞으면 `P1A_HANDFEEL_CHECKSHEET.md`를 손으로 통과. 둘 다 서면 이사 성공 → 그다음에 리소스·확장.

---

## 요약 한 줄
**열고(START_HERE) → 순서대로(DAY1) → 안 깨고(DO_NOT_BREAK) → 손맛 확인(CHECKSHEET).**
