# Seed Healer — Demo Scope Lock 01

작성일: 2026-07-08 · 담당: 렌(Dev) · 성격: **스코프 잠금 문서**(코드 수정 0) · 유키PD 판정 기준 문서

> 이 문서는 Seed Healer **데모 v0**의 완성 기준을 잠근다.
> 데모 확보 전까지 새 보스/새 스킬/새 시스템으로 스코프가 흔들리지 않게 하기 위한 기준선이다.
> 코드/전투/화면/자산/로직을 수정하지 않는다. 이 문서가 이후 모든 "데모 확보 전" 카드의 판단 근거다.

---

## 1. 데모 목표

```
사제로 파티를 끝까지 붙잡는 1보스 playable vertical slice.
```

많은 콘텐츠가 아니라, **1보스 1루프** 안에서 "사제로 파티를 붙잡는 게임"임을 전달하는 것이
데모 완성 기준이다. 설명 없이 시작해서 한 판을 끝까지 돌 수 있으면 된다.

## 2. 나라님 개인 목표

```
[나라의 개인 공방]에서
CSS를 벗어나 이미지 에셋을 활용한
최초의 완성된 게임을 확보한다.
```

- Guard Seed도 이미지 에셋 활용을 먼저 시도했으나 현재 **홀딩** 상태.
- Seed Healer는 지금 **"완성된 1판 playable demo" 확보**를 우선 목표로 한다.
- 데모의 개인적 의미: "지금 혼자 어디까지 확보할 수 있는가 / 단 1판이라도 '이런 게임이구나!'를 전달할 수 있는가."

## 3. 데모 완성 정의

```
Seed Healer 데모 완성 =
플레이어가 설명 없이 시작해서,
마을에서 준비하고,
Earthroot Golem 전투를 플레이하고,
결과를 보고,
다시 도전하거나 마을로 돌아갈 수 있는
짧지만 끊기지 않는 1-boss vertical slice.
```

핵심: 콘텐츠 양이 아니라 **끊기지 않는 한 바퀴**와 그 안에서 전달되는 정체성.

## 4. Seed Healer 핵심 정체성

```
"나는 공격하지 않는다. 하지만 전투의 결과는 내 손에 달려 있다."
"죽은 뒤에 복구하는 게임이 아니라, 죽기 직전까지 붙잡는 게임."
```

마을의 핵심 문장: `마을은 다음 전투의 답을 준비하는 곳이다.`

데모에서 전달해야 할 체감:
- 사제는 직접 공격하지 않는다.
- 플레이어는 파티가 무너지기 직전까지 붙잡는다.
- 결과 화면에서 내가 무엇을 막았고 어디서 무너졌는지 읽힌다.
- 마을은 다음 전투를 다시 준비하는 곳으로 읽힌다.
- 이미지 에셋이 실제 게임 루프 안에서 의미 있게 쓰인다.

## 5. 데모 포함 범위 (v0 IN)

현재 전부 구현·검증됨(FINAL PASS). 데모는 아래를 **완성 대상으로 잠근다**.

| # | 포함 항목 | 현재 상태 / 근거 |
|---|---|---|
| 1 | 타이틀 화면 | 로고+motto+시작하기 (Feel Check 01 PASS) |
| 2 | 마을 허브 | sub "다음 전투의 답을 준비하는 곳"+시설5 (PASS) |
| 3 | 마을 5시설 진입/복귀 | 게시판/여관/기도소/기록실/전투준비 (Readability 01 PASS) |
| 4 | 전투 준비 화면 | 요약+THUMB v002+전투 시작 (PASS) |
| 5 | Earthroot Golem 1보스 전투 | live battle·botSim 7/7·coreChecks 9/9 |
| 6 | 현재 6개 사제 스킬 | 기존 loadout (tuning.js 기준선) |
| 7 | 현재 3명 동료 고정 파티 | ELI/THORNE/LUMINA (DEFAULT_PARTY) |
| 8 | ARIA priestAnchor | 170px (Actor Bind 01 PASS) |
| 9 | Hero v002 FIELD/PORTRAIT/THUMB link | actor bind·여관·준비·파티카드 (Portrait Link 01 PASS) |
| 10 | Earthroot Golem visual | 12포즈 런타임 링크+idle loop |
| 11 | 결과 화면 | 톤+요약 pill+버튼 (Result Polish 01 PASS) |
| 12 | 다시 도전 | end-retry→newBattle (PASS) |
| 13 | 마을로 돌아가 준비 | end-village→마을 (PASS) |

## 6. 데모 제외 범위 (v0 OUT — "영원히"가 아니라 "데모 확보 전까지 열지 않음")

```
새 보스 / 새 스킬 / 스킬 장착·변경 / 스킬 강화
동료 교체 / 동료 영입 / 파티 편성
성장 시스템 / 보상 시스템 / 저장 시스템 / 기록실 실제 저장 기능
상태 아이콘 HUD 적용 / 스킬 FX 이미지 추가
Phone Preview / GitHub Pages / 외부 배포 / commit / push
```

★ 위 항목은 데모 v0 완성 기준에서 **제외**한다. 데모 확보 전까지 열지 않는다.
   기능이 없는 시설(기도소 변경·여관 편성·기록실 저장)은 **정직한 placeholder**로 유지하되
   허술하지 않게 정리된 상태를 유지한다(이미 Readability 01에서 "확인용/준비 중"으로 명시됨).

## 7. 데모 마감 기준 ("작아도 예쁜 완성작")

나라님은 이 데모를 **이미지 에셋을 활용한 최초의 완성형 개인 공방 게임**으로 본다.
따라서 v0은 작아도 되지만 마감은 아래를 만족해야 한다.

```
[마감]
Seed Healer 데모는 작은 1보스 게임이어도,
나라님이 "이 정도면 내가 만든 첫 이미지 에셋 활용 완성작이라고 말할 수 있다"고
느낄 정도의 화면 완성감을 가져야 한다.
```

- 작아도 완성된 게임처럼 보여야 한다.
- 이미지 에셋이 실제 게임 루프 안에서 의미 있게 쓰여야 한다.
- 타이틀/마을/전투/결과가 **같은 게임처럼** 이어져야 한다.
- 390px 모바일 프레임에서 답답하거나 깨져 보이면 안 된다.
- 버튼/칩/카드/초상/전투 이미지 배치가 "임시 테스트"처럼 보이면 안 된다.

**마감 방향 우선순위**:
1. 새 콘텐츠 추가보다 **현재 화면의 완성감** 우선
2. 새 시스템 추가보다 **기존 루프의 시각적 정리** 우선
3. 화려한 FX보다 **이미지/간격/문구/버튼의 일관성** 우선
4. 기능 없는 시설은 **정직한 placeholder**로 보이되 허술하지 않게

## 8. 데모 성공 기준 (전부 YES면 로컬 데모 완성 후보)

| 항목 | 기준 | 현재 |
|---|---|---|
| 루프 | 타이틀→마을→시설→전투→결과→복귀→재전투 끊김 없음 | YES (Feel Check 01) |
| 전투 | 골렘전이 재미있고 사제로 붙잡는 감각 | YES (나라 실플레이 "재미있다") |
| 화면 | 지금 어디인지·다음에 뭘 누를지 안다 | YES (Readability 01) |
| 마을 | "다음 전투를 준비하는 곳"으로 읽힘 | YES |
| 결과 | "붙잡아냈다/붙잡지 못했다"가 읽힘 | YES (Result Polish 01) |
| 이미지 에셋 | Hero v002·Golem visual이 루프 안에서 쓰임 | YES |
| 마감 | 작아도 완성작처럼·임시 테스트처럼 안 보임 | 마감 단계 판단(§10) |
| 정직함 | 미구현을 구현된 것처럼 말하지 않음 | YES |
| 안전 | battle.js/botSim.js/tuning.js 기준선 유지 | YES (7/7·9/9) |
| 모바일 | 390px 가로 오버플로 0 | YES |
| 범위 | 새 보스·스킬·성장·저장 없이 의도 전달 | YES |

→ 현재 대부분 YES. 남은 것은 **§7 마감 완성감**의 미세 정리와 나라님 실기 미감 확인.

## 9. 현재 FINAL PASS 상태 (모순 없이 반영)

```
Hero Battle Live Visual Link 01 → FINAL PASS
Hero Battle Actor Bind 01 → FINAL PASS      (ARIA priestAnchor 170px)
Village Return Loop Visual Check 01 → FINAL PASS
Village Screen Portrait Link 01 → FINAL PASS  (PORTRAIT/THUMB v002)
Village Facility Readability 01 → FINAL PASS
Result Screen Loop Polish 01 → FINAL PASS
First Playable Feel Check 01 → FINAL PASS (수정 0)
botSim baseline 유지 (7/7 · coreChecks 9/9)
```

관련 문서(이 잠금과 모순 없음):
- docs/HERO_PLACEMENT_POLICY_01.md — ARIA anchor / ally row 정책
- docs/PLAYABLE_LOOP_CHECK_01.md — 루프 점검
- docs/VILLAGE_SCREEN_PORTRAIT_LINK_01.md — 초상/썸네일 링크
- docs/VILLAGE_FACILITY_READABILITY_01.md — 5시설 역할/placeholder 문구
- docs/RESULT_SCREEN_LOOP_POLISH_01.md — 결과 화면 요약
- docs/FIRST_PLAYABLE_FEEL_CHECK_01.md — 첫 playable 실기 점검

## 10. non-blocker WATCH (데모 마감 단계에서 판단)

전부 blocker 아님. 지금 열지 않고, 마감 단계에서 필요 시 판단한다.

- 나라님 실기에서 실제 승패 결과 화면 미감 확인 (headless는 rAF 정지로 자동재현 불가)
- 우상단 🦸 SHOWCASE 토글을 **데모 마감 전 숨길지** 판단 (현재 default OFF·dev 확인용)
- 기록실 문구 톤 통일 여부 ("지난 전투를 비추는 거울"이 타 시설보다 시적)
- 전투 중 이탈 버튼 없음 유지 여부
- 마을 → 타이틀 복귀 경로 없음 유지 여부
- RORIN/CAEL 기본 파티 밖 미표시 유지
- inn PORTRAIT 46×40 눈맛 확인

## 11. 데모 확보 전 운영 방향

**허용(데모 완성에 필요한 마감 작업)**:
```
첫 playable loop 점검
화면별 마감/시인성/문구/간격 정리
이미지 에셋 배치 완성감 개선
390px 기준 깨짐/답답함/임시 느낌 제거
전투/마을/결과가 같은 게임처럼 이어지게 polish
나라님 실기 확인 결과 반영
```

**금지(데모 이후 확장)**:
```
새 보스 / 새 스킬 / 새 성장 / 새 저장 / 새 파티 편성 / 새 시설 기능
새 상태 아이콘 HUD 적용 / 스킬 FX 이미지 추가
Phone Preview / GitHub Pages / commit / push
```

**모든 카드 판단 질문**:
```
이 작업이 데모 완성에 필요한가? 아니면 데모 이후 확장인가?
→ 확장이면 지금은 WATCH로만 남긴다.
```

## 12. 다음 추천 카드

**A. 마감(데모 완성에 필요 · 권장 우선)**
- A1. Demo Finish Pass 01 — 화면별 완성감/간격/시인성/문구 일관성 정리(코드 최소·index.html 마감 polish).
      SHOWCASE 토글 숨김 여부·기록실 문구 통일 등 §10 WATCH 중 마감 항목 처리.
- A2. Result Live Feel Confirm — 나라님 포그라운드 실기로 실제 승/패 결과 화면 미감 확정(코드 0·확인 카드).
- A3. Mobile Frame Polish — 390px에서 임시 느낌 남은 화면 최종 정리(있으면).

**B. 확장(데모 이후 · 지금은 열지 않음 · WATCH)**
- 새 스킬/스킬 장착·강화, 동료 교체·영입·편성, 성장/보상/저장, 기록실 실저장,
  상태 아이콘 HUD, 스킬 FX, 새 보스(안개왕뱀 등), Phone Preview/배포.

→ 데모 확보 전까지는 **A 계열만** 진행한다. B는 데모 PASS 후 유키PD 재판단.

---

### 잠금 선언
```
Seed Healer 데모 v0 = 1보스 1루프 vertical slice.
스코프를 늘리지 않는다. 작지만 예쁜 완성작으로 마감한다.
이미지 에셋을 활용한, 나라의 공방 첫 완성형 게임.
```
