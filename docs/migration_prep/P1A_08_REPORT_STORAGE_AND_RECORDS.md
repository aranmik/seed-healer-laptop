# P1A · 08 · REPORT, STORAGE & RECORDS — Seed Healer

**Migration Prep Pack 01 (8/11)** · 작성: 렌 · 2026-07-04
결과 화면 / 기록실 리포트 / localStorage 저장 구조를 재구현 가능하게 정리.

---

## 1. 전투 리포트 객체 (battle.finish가 생성 → UI 소비)

전투 중 `metrics`에 누적한 값을 종료 시 확정. 필드:

| 필드 | 의미 | 산출 |
|---|---|---|
| outcome | 'victory' / 'defeat' | 승/패 |
| boss / duration / durationText | 보스명·전투 시간(초·mm:ss) | — |
| healed | 유효 회복(오버힐 제외, 토템 제외) | metrics.healed |
| overhealPct | 오버힐 비율 % | overheal/(healed+overheal)×100 |
| totemHealed | 토템 회복(별도 집계) | metrics.totemHealed |
| absorbed | 보호막 흡수 총량 | metrics.absorbed |
| dmgTaken / priestTaken | 받은 피해 / 그중 사제 | — |
| manaEnd | 종료 시 남은 마나 | round(mana) |
| manaEmptyAt | 마나<7 최초 시각(없으면 null) | — |
| deaths[] | 사망자 이름 배열 | — |
| smashTotal / smashShielded | 강타 총 횟수 / 보호막 대응 | 대응률로 표시 |
| rootApplied / rootCleansed / rootExpired | 속박 발생/정화/만료 | — |
| cleanseAvg | 평균 정화 소요(초, 없으면 null) | rootCleanseSum/rootCleansed |
| crisis[] | 위기 순간 top3 {t, name, pct} | minHp<35% 정렬 |
| cause | 패배 원인 한 문장(승리 시 null) | 9절 규칙(03 문서) |
| advice | 추천 1줄 | 아래 §3 |
| chips[] | 하이라이트 칩 최대 3 | §2 규칙 |
| party[] / loadout[] | 당시 편성·로드아웃 | 스냅샷 |
| abandoned | 포기 여부(선택) | 일시정지→포기 시 true |

---

## 2. 하이라이트 칩 규칙 (승리 시, 최대 3개)

우선순위대로 평가, 앞 3개 채택:
```
전원 생존   : 아군 사망 0
아슬아슬한 승리: 전 유닛 최저 HP ≤ 10%
보호막 명중  : smashTotal≥3 AND smashShielded/smashTotal ≥ 0.8
위기의 손   : 회복 중 대상이 HP<15%였던 순간 존재(clutch)
정화 성공   : rootApplied>0 AND rootExpired==0 AND cleanseAvg≤3s
마나 장인   : 남은 마나/최대 ≥ 0.25
```
(나라님 0/6 승리 판정: '아슬아슬한 승리'+'위기의 손' 조합이 떴다 — 보호막 명중·정화 성공은 미달.)

---

## 3. 추천(advice) 규칙

```
패배:
  강타 미대응 있음 → "강타 예고 {smashWind}초를 노려 보호막을 먼저 걸어보세요."
  아니고 마나 고갈 → "오버힐을 줄이고, 손을 쉬는 구간을 만들어 보세요."
  그 외 → "지속 회복을 미리 발라 낙폭을 줄여보세요."
승리:
  강타 미대응 있음 → "다음 목표: 강타 대응 {n}/{total} → 전부 보호막으로."
  오버힐>25% → "오버힐 {p}% — 필요한 만큼만 기도하면 마나가 남습니다."
  남은 마나<25 → "마나가 아슬아슬했습니다. 깊은 호흡 장착을 시험해 보세요."
  그 외 → "완벽에 가깝습니다. 기록 단축에 도전해 보세요."
```
거울 원칙: 점수가 아니라 **다음 행동**을 비춘다.

---

## 4. 결과 화면 표시 (§9)

- 배너: 🏆 승리 / 🌙 패배(중단), 보스명·시간.
- 지표 2×3: 전투 시간 / 총 회복(오버힐%) / 받은 피해(사제) / 남은 마나 / 사망 / 강타 대응.
- 칩 줄(승리 시).
- 보상 박스: 승리=첫/반복 재화, 패배=「실패는 분석」 안내(보상 없음).
- 버튼: 다시 도전 / 마을로 / 기록실에서 보기.

## 5. 기록실 표시 (§10)

- 헤더: 승/패 + 보스·시간.
- 지표 행: 강타 대응률 / 정화(성공·평균·만료) / 마나 고갈 시점 / 남은 마나 / 총 회복·오버힐 / 받은 피해 / 사망.
- 위기 순간: crisis top3 ("t=82s · 방패 전사 HP 26%까지 하락").
- 패배 시 원인 문장(📌), 항상 추천(🧭).
- 누적 표시: "골렘 클리어 ×N · 최고 기록 mm:ss".

---

## 6. 보상 (§ Lock 10)

| 상황 | 골드 | 기도 조각 | 보스 증표 |
|---|---|---|---|
| 첫 클리어 | +420 | +12 | +1 |
| 반복 클리어(숙련) | +180 | +4 | — (첫 클리어 한정) |
| 패배/중단 | 0 | 0 | 0 (분석만) |

증표는 **첫 클리어에만**. 반복은 골드·조각 감소 지급(파밍화 방지).

---

## 7. localStorage 저장 (§11)

- 키: `seed_healer_p1_save` · 스키마: `SCHEMA = 1`.
- try/catch 필수. 저장 실패 시 토스트 1회 후 **게임 계속**(죽지 않음).
- 로드 시 검증: `v===SCHEMA` && party·loadout이 배열. 불일치/손상 → null → defaultState로 안전 시작(마이그레이션 스텁 위치).

저장 대상(state):
```
v(스키마), roster(보유 동료), party(편성 3), skills(보유 스킬), loadout(6슬롯),
cur{gold, shard, thread, sigil}, clears{golem}, best{golem: 초 or null},
lastReport(직전 리포트 객체 전체), settings{mute}
```

**하위호환 주의점**:
- 스키마 올릴 때(필드 추가/의미 변경) SCHEMA++ 하고 마이그레이션 스텁에서 구버전→신버전 변환. 변환 불가능하면 안전 초기화(진행 손실은 있어도 크래시 금지).
- `lastReport`는 리포트 스키마가 바뀌면 렌더가 깨질 수 있으니, 로드 후 필드 존재 여부를 옵셔널하게 참조(없으면 "기록 없음" 처리).
- best.golem은 초 정수 or null. 표시 시 fmtTime.
- 재구현 시 키·스키마 번호를 원본과 다르게 잡아도 되지만, **기존 저장과 섞이면 안 되므로 새 키를 쓰는 걸 권장**.
