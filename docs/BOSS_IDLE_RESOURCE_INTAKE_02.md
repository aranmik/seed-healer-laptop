# Boss Idle Resource Intake 02

작업일: 2026-07-10 · 담당: 렌(Dev) · 판정: **★나라님/유키PD FINAL PASS (2026-07-10)**
확정: IDLE_01=런타임 기본 idle·단일 idle+breathBoss 문법 유지(multi-frame loop 안 씀)·런타임 경로 확정
(water_spirit/SH_BOSS_003_WATER_SPIRIT_IDLE_01_v001.png · naga_warrior/SH_BOSS_006_NAGA_WARRIOR_IDLE_01_v001.png).
기준: BOSS_HANDFEEL_PROBE_RUNTIME_PLAN_01(PASS) · GOLEM_IDLE_ANCHOR_HOTFIX_01(FINAL PASS·단일 idle+breath 문법)
성격: **리소스 intake 전용** — 런타임 배선/패턴 구현 없음·코드 무변경.

## 유키PD HOLD 판정 반영 (기록)
- 구원 selfOnly 유지(스킬 로직 무변경) — 나가는 ARIA도 강하게 압박해 "사제 자신을 죽기 직전에 붙잡는 손맛" 검증.
- battle.js 타겟팅 코어 미해금 — 나가는 "탱커 집중 처형"으로 재해석. 최저HP 추적은 후속 보류.

## 1. 원본 리소스 경로 (읽기 전용·무수정)
- `assets/bosses/_intake/SeedHealer_BossResource_Pack_01/SH_BOSS_003_WATER_SPIRIT/SH_BOSS_003_WATER_SPIRIT_IDLE4_MAGENTA_v001.png` (1448×1086·24bpp)
- `assets/bosses/_intake/SeedHealer_BossResource_Pack_01/SH_BOSS_006_NAGA_WARRIOR/SH_BOSS_006_NAGA_WARRIOR_IDLE4_MAGENTA_v001.png` (1448×1086·24bpp)
- 2×2 그리드(셀 724×543)·경계 클린(비마젠타 0px)·golem idle 시트와 동일 규격 — Plan 01 실측 그대로.

## 2. 추출 파일 목록 (신규 생성·8장)
```
assets/sprites/boss/water_spirit/
  SH_BOSS_003_WATER_SPIRIT_IDLE_01_v001.png   ← ★런타임 기본(A 중립)
  SH_BOSS_003_WATER_SPIRIT_IDLE_02_v001.png      (B 들숨 — 보관)
  SH_BOSS_003_WATER_SPIRIT_IDLE_03_v001.png      (C 날숨 — 보관)
  SH_BOSS_003_WATER_SPIRIT_IDLE_04_v001.png      (D 복귀 — 보관)
assets/sprites/boss/naga_warrior/
  SH_BOSS_006_NAGA_WARRIOR_IDLE_01_v001.png   ← ★런타임 기본(A 중립)
  SH_BOSS_006_NAGA_WARRIOR_IDLE_02~04_v001.png   (보관)
```
- ★골렘 FINAL PASS 문법(단일 idle + breathBoss·multi-frame loop 금지)에 따라 **런타임 기본 = 각 보스 IDLE_01(A 중립) 1장**.
  02~04는 원칙대로 추출·보관만(후속 검토용·런타임 미사용).

## 3. 규격 / 4. 투명화 처리
- 8장 전부 **724×543 · Format32bppArgb(RGBA)** · 골렘 파이프라인 동일:
  `tools/chroma_extract.ps1 -NoTrim -CropW 724 -CropH 543 -T0 90 -T1 210`(unmix on·키색 실측 ~(240,4,242)).
- 픽셀 검수(LockBits 전수 스캔): **4코너 알파 0 · 마젠타 잔여 0/8장 · 불투명 커버리지 보스 내 일관**
  (water 114.7k~121.3k / naga 95.0k~96.1k px — 프레임 간 편차 미미 = unmix 콘텐츠 손상 징후 없음).
- unmix 사용 근거: 두 보스 모두 aqua/blue 계열(마젠타 보색 방향)이라 보라/핑크 발광 재채색 리스크 낮음 — 커버리지 일관으로 뒷받침.
  ★최종 색감/엣지 육안 확인은 Card B 브라우저 표시 시(WATCH).

## 5. 기본 idle 후보 셀 콘텐츠 실측 (표시/anchor 근거)
| | WATER_SPIRIT IDLE_01 | NAGA_WARRIOR IDLE_01 |
|---|---|---|
| content bbox | (126,57)-(668,480) | (205,42)-(570,514) |
| 본체 크기 | 542×423 (넓은 파도형) | 365×472 (좁고 세로형) |
| 본체 중심 x | 397 (캔버스 중심 362 대비 **+35px 우측**) | 387.5 (**+25.5px 우측**) |
| 발/하단 접지 y | 480 (캔버스의 88.4%) | 514 (94.7% — 매우 낮음·안정) |
| 참고 | 프레임 간 sway 존재(중심 ±105px·상하 48px — 01만 쓰므로 무관) | 동일(±139px·41px — 01만 사용) |

## 6. 표시 크기 / anchor / scale 제안 (Card B에서 적용·실기 조정)
- 기존 `.bf-boss img.spr{height:322px}` 기준(스케일 .593):
  - **Water**: 본체 ≈ 321×251 표시·발 표시 y ≈ 285 (골렘 발 라인 ≈294와 근사) → **dispH 322 그대로 시작** 권장.
  - **Naga**: 본체 ≈ 216×280 — 매니페스트 WATCH("hero처럼 보임·scale 강조 필요") → **dispH ≈ 352 시작** 권장
    (본체 ≈ 237×306·발 ≈ 333 — 골렘보다 아래로 뻗어 위압감·전방 접근감).
- ★anchor 리스크: 두 01 프레임 모두 본체가 캔버스 중심 대비 **우측 +25~35px 치우침** → 표시 시 15~21px 우측 편향.
  보정은 **img margin-left(음수) 또는 컨테이너 offset**으로(★img `transform`은 breathBoss keyframe이 대체하므로 transform 보정 금지 — 골렘 교훈).
- 정적 단일 프레임이라 프레임 간 anchor 수학 불필요(골렘 drift 이슈 원천 회피). 발밑 그림자(::before)는 자동 적용.

## 7. 시각 리스크 (WATCH)
- Water: 몸이 낮고 넓음(파도) → 골렘 대비 화면 위쪽이 비어 보일 수 있음(top 위치·dispH 실기 조정 여지).
- Naga: 세로형·본체 폭 좁음 → 동료(FIELD ~82px)와 비교해 "영웅처럼" 보일 리스크(매니페스트 WATCH) → dispH 352± 실기 판단.
- 우측 치우침 보정(위 §6) · unmix 색감 육안 미확인(Card B 브라우저에서 확인) · POSESHEET는 WIP로 범위 밖(이벤트 포즈 없음).

## 8. Demo v0 / 파이프라인 무손상 확인
- 원본 intake 6파일(양 보스 PNG/README) mtime 무변동(Jul 5 20:58) · 골렘 asset 폴더(12포즈+idle4+manifest) 무접촉.
- 보호 파일 7종 + index.html 무변경(mtime) · **botSim 16 PASS / 0 FAIL**.
- 신규 산출물은 미참조 폴더(water_spirit/·naga_warrior/)에만 생성 → 기본 URL Demo v0에 로드/영향 0.

## 9. 다음 카드(Boss Probe Entry Runtime 01) 준비 여부
**READY.** 런타임 경로 확정:
- `assets/sprites/boss/water_spirit/SH_BOSS_003_WATER_SPIRIT_IDLE_01_v001.png`
- `assets/sprites/boss/naga_warrior/SH_BOSS_006_NAGA_WARRIOR_IDLE_01_v001.png`
→ Card B에서 `src/data/bossProbes.js` 신설 시 이 경로+dispH(322/352)+우측치우침 보정값을 config로 배선하면 됨.
