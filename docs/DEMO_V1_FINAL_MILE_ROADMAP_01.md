# Demo v1 Final Mile Roadmap 01

작성일: 2026-07-12 · 담당: 렌(Dev) · 기준: THREE_BOSS_COUNTERPLAY_LOADOUT_PRESSURE_PLAN_01 · COMBAT_CALL_RESPONSE_FX_PLAN_01
Demo v1 마감까지 남은 카드를 **유한하고 명확하게** 잠근다. 아래 5카드로 종료.

| # | 카드 | 목표 | 변경 예상 파일 | 난이도 | 회귀 위험 | 선행 | 성공 기준 |
|---|---|---|---|---|---|---|---|
| 1 | ✅ **Three Boss Counterplay & Loadout Pressure Plan 01** (본 카드) | 재미 기준선 잠금·기본6 강세 원인 정량화·보스별 질문/압박/금지선·신규 가치 설계 | docs 3종 + read-only probe | 低 | 0(무변경) | — | 목표선·후보·금지선 문서 확정 |
| 2 | ✅ **Combat Call-and-Response FX Polish 01** (**구현 완료 2026-07-12·렌 PASS·유키PD 판정+나라 실기 대기**) | 답변 FX(block/vow완화/bloom) ~90ms 시차·완전흡수 soft burst·코어 무변경 | index.html·신규 combatCallResponseFxCheck.js | 低 | 低 | 1 | combatCallResponseFxCheck 22/0·기존 회귀 전부 복원(skillFx 28·bossTelegraph 29) |
| 3 | ✅ **Three Boss Loadout Pressure Balance 01** (**구현 완료 2026-07-12·렌 PASS·유키 판정+나라 실기 대기**) | 씨앗 마나 9(제품 override)·water tremorDmg 132·golem 진동 19/24(제품 override)·tuning.js/botSim 동결 | bossProbes.js·skillPool.js·index.html·신규 balance check·loadoutPressureProbe | **中** | **中(수치)** | 1 | balance 19/0·botSim 16/0·probeSim ALL PASS·맞춤 가치 실측(골렘 vow 마나+9·물 seed 마나+6)·시간 2:07~2:25·tuning.js md5 동결 |
| 4 | **나라님 3보스 × loadout 반복 실기** | 기본/맞춤/비추천 × 3보스 손맛 판정(최소 6판) — "가져온 보람" 체감 확인 | (없음·실기) | — | — | 2·3 | 신규 2종을 "선택하고 싶다" 판정·위기/마나 체감 목표선 부합 |
| 5 | **Demo v1 Completion Checklist 01** | 완성 체크리스트·전 문서 FINAL 정리·Demo v1 완성 선언 | docs | 低 | 0 | 4 | 나라님 "작지만 완성된 게임" 선언 |

- 순서 근거: FX 시차(2)는 수치와 무관해 Balance(3)와 병행 가능하나, 실기(4)가 한 번에 끝나도록 2→3→4 직렬 권장.
- 매 카드 공통 회귀: 기존 dev 체크 8종 + botSim 16/0 + probeSim ALL PASS(수치 카드에서 게이트 갱신 시 문서화) + 390px/콘솔0.
- 금지선(전 카드): 3보스 HP·전투 시간 2:40+·기존 6종 너프·필수 하드락·무작위 즉사·새 시스템·salvation selfOnly·나가 수치.

## 유키PD 선결 판단 — ★확정 (2026-07-12)
1. 골렘 진동 위상 승인(tremorFirst 25→19·Int 28→24) — **★tuning.js 정본 금지 → bossProbes/catalog Demo v1 golem override로만** (botSim baseline 보존).
2. 씨앗 mana 12→9 승인 · heal 90 유지. 서약 mana 13 유지(골렘 실측 후 재검토). 물 tremorDmg 132(안전선 깨지면 126 롤백). 나가 동결.
- ★카드 3(Balance)에서만 적용 — 카드 2(FX Polish)는 수치 무변경.
