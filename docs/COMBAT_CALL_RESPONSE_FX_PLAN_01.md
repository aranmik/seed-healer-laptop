# Combat Call-and-Response FX Plan 01

작성일: 2026-07-12 · 담당: 렌(Dev) · 판정: **★유키PD 확정(2026-07-12)** — Combat Call-and-Response FX Polish 01로 구현 착수
성격: **설계 잠금 문서** — Polish 카드 범위 확정(§5 착탄 답변 FX ~70~120ms visual-only 시차)
기준: 나라님 확정 문법 — **"보스가 전장에 질문한다 → 플레이어가 전장을 읽는다 → ARIA가 스킬로 답한다 → 질문과 답이 FX로 충돌한다 → HP와 마나 결과가 화면에 남는다."**

## 0. 원칙 (재확인)
- **새 FX를 늘리는 계획이 아님** — 이미 존재하는 질문 FX(보스 telegraph/attack)와 답 FX(스킬 8종)의 **타이밍·충돌·강약**만 정리.
- 보스 위협이 먼저 읽히고(주연), 사제 답이 뒤따르며(대응), 결과는 HP/마나/chip으로 남는다(정산).
- 화면 전체를 덮는 추가 효과 금지 · 평상시 조용 유지 · 3보스 색 문법(amber/cyan/crimson) 불변.

## 1. 현재 자산 목록 (전부 기존재 — 재사용만)
- 질문: bh-tele 예고바 · danger-tgt(보스색 glow) · danger-ring.hot · wind 오오라 · stage-fx gather/sweep · bossBurst(ring/slash) · bpose 4종.
- 답: supportSpark+cast-pulse(ARIA 원점) · react-heal/shield/block · cast-ring · sk-cleanse/sk-hot/sk-vow/sk-vow-mit/sk-seed/sk-bloom · chip 6종 · float 텍스트.

## 2. Earthroot Golem — 문답표
| 단계 | 이벤트/상태 | 화면 | 비고 |
|---|---|---|---|
| 질문 예고 | teleSmash(1.5s) | 대상 amber glow + 위험원 + 04 windup + 예고바 | 기존·유지 |
| 답(선제) | shield/vowOn | 파란 둥근 pop **또는** 아이보리 세로 장막 + ARIA spark | 기존·유지 |
| 충돌 | smash | 05 impact + amber ring burst → **absorb=block flash 주연** 또는 **dmg+vow-mit 완화** | ★정리 대상 ① |
| 결과 | float/HP바/chip | (720)흡수 or -302 완화 수치 | 기존 |
| 질문(광역) | teleTremor→tremor | gather→sweep(amber) + 전원 hit | 5-A 위상 조정 시 강타 직후 등장 |
| 답(복구) | ring/hot/quickheal | cast-ring 확산·sk-hot 정착·react-heal | 기존 |
- **정리 ①(Polish 카드 핵심)**: 착탄 프레임에 bossBurst(amber)와 block flash(파랑)/vow-mit(아이보리)가 동시 재생 — 현재 우연히 겹침. **질문(burst) 0~150ms → 답(block/vow-mit) 100ms부터**로 시차를 명시해 "충돌"이 읽히게. 구현 후보: vow-mit/react-block 재생을 dmg/absorb consume에서 ~100ms 지연(setTimeout) — 1곳·저위험.
- 생략 후보(과할 때): 강타가 완전 흡수됐을 때 amber burst 축소(방어 성공 주연=block) — 선택 사항.

## 3. Water Spirit — 문답표
| 단계 | 이벤트/상태 | 화면 | 비고 |
|---|---|---|---|
| 질문 예고 | teleTremor(2s) | cyan gather 라인 + 예고바 "잔파도 — 전원" | 기존 |
| 답(선부착) | seedOn(선택) | 씨앗 pop + 🌱3 chip(사전 심기) | 기존 |
| 충돌 | tremor | cyan sweep 통과 + 전원 hit + **seed bloom 연쇄** | ★정리 대상 ② |
| 답(복구) | ring | ARIA cast-ring 따뜻한 green/gold 확산 | 기존 — 나라님이 사랑한 문답 |
| 질문(상태) | rootOn(침식) | bpose-root cyan + ⛓️chip | 기존 |
| 답(제거) | cleansed | 흰 sweep + chip 제거 동시 | 기존 |
- **정리 ②**: sweep(0.82s) 통과 중 seed bloom이 대상별로 터짐 — 현재 동시 다발. **sweep이 지나간 직후(피격 순서대로) bloom이 이어지는 리듬**이 이상적이나, 코어 이벤트 순서(전원 즉시 피해)상 자연 동시성 허용. Polish에서는 bloom 시차 대신 **bloom 크기 절제 확인만**(sweep cyan vs bloom green 색 분리는 이미 확보).
- 색 충돌 방지 재확인: 답 FX는 green/gold 계열만(힐 초록≠공격 cyan 이미 분리) — 신규 조정 불필요, 검증 항목으로만.

## 4. Naga Warrior — 문답표
| 단계 | 이벤트/상태 | 화면 | 비고 |
|---|---|---|---|
| 질문 예고 | teleSmash(1.8s) | 대상 crimson lock glow + 예고바 "처형 베기 →" | 기존 |
| 답(선제) | shield/vowOn | 둥근 pop 또는 세로 장막 — **"어느 쪽?"이 이 보스의 고민** | 기존 |
| 충돌 | smash | crimson slash + block/vow-mit | ★정리 ①과 동일 시차 적용 |
| 질문(연속) | teleTremor→tremor(해일) | teal gather→좁고 빠른 sweep | 기존 |
| 답(반응) | seedProc/quickheal/salvation | bloom·react-heal·ARIA 자가 구조 | 기존 |
| 질문(상태) | rootOn(출혈) | bpose-root crimson + chip | 기존 |
- 나가 특화 확인: **처형(대상 1명 crimson)과 해일(전원 teal)이 연속**될 때 FX가 서로 침범 않는지 — 창 겹침 구간(§Plan 4)이 나가 손맛의 핵심이므로 "질문 2개가 겹쳐도 각각 읽힘"을 Polish 검증 목록에 포함.

## 5. Polish 카드 구현 범위 (좁게 잠금)
1. **착탄 시차**: dmg/absorb의 답 FX(react-block·sk-vow-mit)를 ~100ms 지연 — 질문→답 순서 강제. (index.html consume 2곳)
2. **문답 검증 스윕**: §2~4 표의 각 행이 실기에서 순서대로 읽히는지 3보스 확인(구현 없이 확인만인 행 다수).
3. 선택(과하면 생략): 완전 흡수 시 amber/crimson burst 축소.
- **하지 않음**: 새 FX 종류 추가 · 색 변경 · stage-fx/스킬 FX 형태 변경 · 코어/이벤트 변경.

## 6. 검증 계획
- 기존 skillFxReadabilityCheck 28 + bossTelegraphAttackFxCheck 29 유지 · 시차 도입 시 두 체크에 지연 배선 assert 1~2개 추가.
- 실기: 골렘 강타 문답 / 물 잔파도→고리 문답(나라님 최애) / 나가 처형→해일 연속 문답.
