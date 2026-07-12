# Boss Probe Entry Runtime 01

작업일: 2026-07-10 · 담당: 렌(Dev) · 판정: **★나라님/유키PD FINAL PASS (2026-07-10)**
확정: 기본 URL=골렘 Demo v0 유지·?boss=water/naga 진입 정상·이름/이미지/수치/전조 어휘 분기 정상·
bossProbes.js 구조·index.html 분기·보호 파일 0 수정·골렘 idle FINAL PASS 유지·botSim 16/0 유지.
기준: BOSS_HANDFEEL_PROBE_RUNTIME_PLAN_01(PASS) · BOSS_IDLE_RESOURCE_INTAKE_02(FINAL PASS) · Demo v0 기준점 잠금

## 목적
기본 Earthroot Golem Demo v0를 절대 깨지 않고, `?boss=water` / `?boss=naga`로
Post-Demo Probe 보스 2종에 진입하는 최소 런타임 분기. 손맛 수치 튜닝은 Card C(Sim Baseline)에서.

## 진입 방식
- 기본 URL / `?boss=golem` / 미지원 키 / config 로드 실패 → **골렘 Demo v0** (probe 분기 자체가 비활성)
- `?boss=water` → 물결 성소의 정령 probe / `?boss=naga` → 나가 워리어 probe
- `?dev=1&boss=…` 조합 지원(실측: probe 활성+SHOWCASE 등 dev 도구 공존·골렘 전용 🐞 포즈 셀렉터만 양쪽에서 미노출)

## 신규 파일 — src/data/bossProbes.js (보호 파일 무접촉)
probe 전용 config 모듈. 보스별: `key/name/emoji/idle(Intake 02 FINAL PASS 경로)/dispH/offsetX/hint/clearText/tags[]/tele{}/boss{tuning override}`.
- **water**: 물결 성소의 정령·🌊·dispH 322·offsetX -21·HP 8800·강타 비활성(smashFirst 9999)·잦은 잔파도(tremor 13s/95 전원)·잦은 침식(root 16s/46dps→정화 압박)
- **naga**: 나가 워리어·🐍·dispH 352(스케일 강조)·offsetX -16·HP 9000·집중 처형(smash 17s/880·예고 1.8s)·강한 해일(tremor 26s/190→사제 압박=구원 selfOnly 활용)·가벼운 출혈(root 30s/32dps)
- 수치는 Plan 01 §10 초안 — Card C에서 sim 검증/조정. 유키PD HOLD 판정(구원 selfOnly 유지·탱커 집중 처형 재해석) 주석으로 명기.
- import는 index.html에서 별도 try/catch(실패해도 err에 안 섞임 → 데모 무영향·probe만 비활성).

## index.html 배선 (11개 지점·전부 `PROBE ?` 분기·기본 URL은 기존 코드 경로 그대로)
1. probe config import(무해 실패) + `const PROBE = BOSS_PROBES?.[?boss] || null`
2. `bossShowIdle/bossEmoji/TELE_TXT` — **TELE_TXT 골렘 기본값은 기존 문구와 문자 단위 동일**(데모 텍스트 불변)
3. 게시판 이미지 `board-golem.src = bossShowIdle`
4. probe 문구 분기: HUD `.bh-name`·게시판 q-name/q-hint/tags·마을 fac-desc·준비 "상대"(emoji+이름)
5. 전장 보스 actor `spr(bossShowIdle, bossEmoji)`
6. probe 표시 규격: img inline `height=dispH`·`margin-left=offsetX`(★transform 금지 — breathBoss가 대체·Intake 02 교훈)
7. bossPose 프리로드에 probe idle 추가 + onerror fallback을 probe 자기 idle로(골렘으로 안 돌아감)
8. `setEventImg()` probe 가드 — 포즈 시트 없음: src 스왑/bpose-down 생략(**골렘 포즈가 probe 이미지를 덮지 않음**)·wind glow/FX 클래스는 src 무관이라 그대로 작동·down은 dead 그레이스케일로 대체
9. `startIdle()` = bossShowIdle(단일 idle+breathBoss — 골렘 FINAL PASS 문법 그대로) · materialize(bpose-in)는 probe 생략(포즈 전환 없어 깜빡임 방지)
10. `newBattle()`: `new Battle(PARTY, LOADOUT, PROBE ? {tuning:{boss:PROBE.boss}} : {})` — TUNING 원본 불변(사본 deepMerge)
11. pill: probe 시 "PROBE" 표기(+title에 보스명) / showEnd 승리문구 `PROBE.clearText` / renderTele 어휘 TELE_TXT / dev-pose 셀렉터 probe 미노출

## 검증 (preview 5181 · 390×844 · DOM 실측)
| 항목 | 기본 URL | ?boss=water | ?boss=naga |
|---|---|---|---|
| HUD 보스명 | 대지뿌리 골렘 | 물결 성소의 정령 | 나가 워리어 |
| 보스 HP | 9,600(원본) | **8,800(override 주입 확인)** | **9,000** |
| 보스 이미지 | 골렘 12포즈 01 | WATER IDLE_01(724×543 로드) | NAGA IDLE_01(로드) |
| 표시 | 322px·margin 0 | 322px·**-21px 보정** | **352px**·-16px |
| idle | breathBoss·idleloop F·transition 0s(FINAL PASS) | breathBoss | breathBoss |
| pill | hidden | **PROBE** | PROBE |
| 문구 | 원문 전부(게시판 골렘·태그 6) | 물정령 문구/태그 5/게시판 이미지 | 🐍 나가·준비 상대 |
- 루프: 기본/naga 양쪽에서 5시설→전투→end-village→재진입→end-retry(HP 리셋·probe 유지) 정상.
- ?dev=1&boss=water 공존 정상 · 전장 가시 5(보스+동료3+ARIA) 유지 · broken 0 · 콘솔 warn/error 0 · 무오버플로.
- node --check bossProbes.js OK · **botSim 16 PASS/0 FAIL**(기존 TUNING/battle.js 무변경) · 보호 파일 7종 mtime 무변동.

## WATCH
- ★[나라 실기] probe 보스 색감/엣지(unmix) 육안·dispH/offsetX 눈맛(상수 1줄 조정)·water 화면 상단 여백감·naga 보스 존재감.
  (Browser 스크린샷 도구가 rAF로 상시 타임아웃 — 기능은 DOM 전수 검증·눈확인만 실기)
- 라이브 전조(잔파도/처형 베기 문구)는 tick 필요라 headless 미확인 — TELE_TXT 배선은 코드 경로+골렘 기본값 문자 동일로 검증.
- 승/패 실제 도달(clearText 표시)은 나라 실기 or Card C sim에서.
- root 칩 이모지(⛓️)는 골렘 어휘 그대로(전조 바만 침식/출혈로 분기) — 원하면 후속에서 칩도 분기.

## 다음
**Card C — Boss Probe Sim Baseline 01**: src/dev/probeSim.js 신설(봇 로직 독립 사본+opts.tuning) →
water/naga 초안 수치의 클리어 가능/전멸 경계 sanity·즉사/무한전투 검출·probe baseline 기록(bossProbes.js만 수정)·botSim 16 PASS 회귀 확인 → Card D 나라 실기.
