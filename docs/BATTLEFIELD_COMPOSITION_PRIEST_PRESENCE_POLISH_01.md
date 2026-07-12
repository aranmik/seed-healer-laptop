# Battlefield Composition & Priest Presence Polish 01

작업일: 2026-07-09 · 담당: 렌(Dev) · 판정: **★나라님 실기 방향 FINAL PASS (2026-07-09)**

## ★ 방향 FINAL PASS (나라님 실기 · 2026-07-09)
나라님 실기: "아주 좋다. 이 구성이 맞다. 내가 스킬을 쓰면 ingame 아리아로부터 임펄스가 생기고
연출이 나오는 것이 너무 좋다. 카드 4명 구성과 전장 구성의 연결감도 좋아졌다." → **아래 방향 확정(되돌리지 않음)**:
1. 하단 카드 순서 = 전사 / 도적 / 법사 / 사제(YOU)
2. 전장에 아리아(사제) 실제 노출 유지 (다시 비노출로 되돌리지 않음)
3. 아리아가 전장 스킬 연출의 원점(사제 기점 impulse)
4. cast-bar 들썩임 제거 방식
→ 구현 디테일(아리아 단독 규격·스킬 버튼 슬롯)은 PRIEST_PRESENCE_SKILL_BAR_STABILITY_HOTFIX_01에서 후속 정리.

기준: DEMO_SCOPE_LOCK_01 · PARTY_CARD_LAYOUT_POLISH_01 · GOLEM_IDLE_ANCHOR_HOTFIX_01(FINAL PASS)

## ★ 전투 문법 변경 (나라님 재판단 · Visual Hotfix 01 일부 폐기)
기존 "ARIA 전장 비노출" 규칙(DEMO_VISUAL_HOTFIX_01)을 데모 기준으로 **폐기**하고 새 문법으로 잠금:
```
battlefield visible actors = Earthroot Golem + 전사(ELI) + 도적(THORNE) + 법사(LUMINA) + 사제(ARIA)
사제 = 후방 지원자: 도적(중앙 전방) 아래쪽 하단 빈 공간. 전방 3인처럼 서지 않음.
전장 주도권은 여전히 골렘 + 동료 3명 구도.
하단 카드 순서 = 전사 → 도적 → 법사 → 사제(YOU) — 전장 구성과 UI 매칭.
```
사유: ①카드 4명 vs 전장 3명 인지부조화 ②나라님 조작(사제 스킬)이 전장 속 사제로부터
동료에게 전달되는 연출 요구. 데모 완성감 우선(확장성보다).

## 변경 (index.html · CSS/JS visual-only · battle.js 무관)
### 1. 하단 카드 순서: 전사→도적→법사→사제(YOU)
- cardMeta를 [PARTY…, aria] 순으로 재배열하되 **id/data-idx는 B.units 인덱스(0=사제·1~3=편성) 그대로**
  → renderState/select/hp-N/chips-N 매핑 무변경(표시 순서만 변경). YOU 배지·골드 테두리·Layout Polish 01(64px·고정슬롯) 유지.
- 실측: DOM 순서 전사(1)/도적(2)/법사(3)/아리아(0·YOU)·사제 카드 select 정상(sel 하이라이트).

### 2. ARIA 전장 노출 (후방 지원자)
- `.bf-aria{visibility:hidden}` 제거. 위치는 기존 anchor(left:50%·bottom:2.5%) = 도적 바로 아래 하단 중앙.
- 크기 150px(기존 anchor 170에서 소폭 절제 — 주도권은 골렘+3 유지·"너무 작지 않게"와 균형).
- 실측(390×844·bf 474px): ARIA 중앙 50%·y312~462(하단 1/3)·도적(y226~325) 아래·전장 내부(하단 UI 무겹침).
- 발밑 접지 그림자(::before)·breathAlly 숨쉬기 자동 적용. 피격 recoil도 사제 포함(`.bf-aria.hero-hit`=heroHitC·translateX(-50%) 보존).

### 3. cast-bar 들썩임 제거 (고정 예약 슬롯)
- 원인: cast-bar가 열릴 때 height 0→22px로 battlefield(flex:1)를 밀어 아군이 ~7px 들썩임.
- 처리: **높이 22px+margin 4px 상시 예약**, 열림/닫힘은 opacity만 토글(+숨김 중 pointer-events:none).
- 실측: cast-bar on/off 시 battlefield 높이 이동 **0px**·아군 위치 이동 **0px**. (전장은 상시 26px 작아진 상태로 고정 — 기준선 불변)

### 4. 사제 기점 support impulse (새 FX 이미지 0 · DOM+CSS만)
- **castPulse**(.3s 금/연녹 glow·컨테이너 filter=breath 독립) + **support-spark**(9px 빛 입자가 사제 손높이→대상 동료로 ~200ms 이동 후 소멸·CSS transition).
- 발동(전부 read-only 이벤트/상태): 단일 대상 직접 힐(heal amt≥80·src≠ring·unit>0)→spark+사제 pulse /
  보호막 새로 걸림(renderState diff)→spark+사제 pulse / **ring(광역)→사제 중심 castRing outward pulse만**(spark 3발 산만 방지) /
  salvation(자가)→기존 react-heal glow가 사제 몸에서 발동(이제 보임).
- 도착 glow는 기존 react-heal/react-shield가 담당 → "사제가 원점, 효과가 아군에게 간다" 읽힘 완성.
- ★end-to-end 실증: 전사 선택→보호막 사용(instant·동기)→spark 생성(사제 위치 195px 기점)·사제 cast-pulse·전사 react-shield/칩/마나 88 전부 확인.

## 유지 (골렘 FINAL PASS / 전투 로직)
- 골렘 idle FINAL PASS 무변경(실측 breathBoss·idleloop false·transition 0s·재전투 후에도 유지).
- 전투 계산/수치/타겟팅/패턴/승패 무변경 · 보호파일 무변경(mtime)·**botSim 16 PASS·0 FAIL**.

## 검증 (preview 5181 · 390×844)
- 카드 순서·사제 select·ARIA 위치/크기/가시성·cast-bar 이동 0px·spark end-to-end·골렘 FINAL PASS·
  루프 전구간(5시설·board→battle·end-village→마을·end-retry HP9,600)·spark 잔류 0·lingering 클래스 0·
  콘솔 warn/error 0·broken 0·무오버플로·기본 URL dev 숨김/?dev=1 복원.
- ★검증 중 함정: 새 preview 인스턴스에서 뷰포트 미리사이즈 상태(0×0 battlefield)로 측정해 이상값 → 390×844 리사이즈 후 정상 재측정.

## 남은 WATCH
- ★[나라 실기] ①사제 150px 크기감(더 크게 170/작게) ②사제 위치(중앙 하단 — 살짝 좌/우 offset 원하면 조정)
  ③spark 속도/크기/밝기 ④cast-bar 상시 예약으로 전장이 26px 작아진 체감 — 전부 상수 1줄 조정 가능.
- 라이브 연속 전투 중 spark 빈도(quickheal 연타 시 스파크 연발)는 실기 확인 필요 — 과하면 spark에도 throttle 추가 후보.
- prep 화면 파티 요약(#prep-party)은 편성 3인만 표시(사제 미포함) — 기존 유지. 사제 포함 원하면 별도 한 줄.
