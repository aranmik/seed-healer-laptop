# Result Screen Loop Polish 01

작업일: 2026-07-08 · 담당: 렌(Dev) · 판정: PASS(렌 자체) · 유키PD 확인 대기

## 목적
새 결과/통계/저장 시스템을 만들지 않고, 기존 승패 오버레이(`#end-ov`)의 문구·정보 배치·버튼을
읽기 좋게 최소 정리한다. 플레이어가 "내가 파티를 끝까지 붙잡았는지 / 붙잡지 못했는지"를 읽게 한다.

결과 화면 읽기 순서(유키 기준):
1. 승리/패배 큰 제목
2. Seed Healer식 한 줄 결과 문장
3. 이번 전투 요약(요약 pill + 원인/조언 + 성취 칩)
4. 다음 행동 버튼(다시 도전 / 마을로 돌아가 준비)

## 사용 데이터 — 전부 기존 `B.result.report` read-only
battle.js `finish()`가 이미 생성하는 report 필드만 읽음. **새 계산/저장/상태구조 변경 0.**
- `durationText`(전투 시간), `manaEnd`(남은 마나), `deaths[]`(쓰러진 유닛 이름)
- `smashTotal`/`smashShielded`(강타 대응), `absorbed`(보호막 흡수 총량)
- `cause`(패배 원인), `advice`(조언), `chips[]`(승리 성취 칩)

★"쓰러진 동료" 수 = `deaths`에서 사제 이름('사제') 제외 필터(동료 사망만 카운트). 사제 사망은
기존 `cause` 문장이 이미 설명함.

## 변경 내역 (index.html 1파일)
### CSS 추가(additive만·기존 규칙 무변경)
- `.e-head`(톤 한 줄·serif 15px·win 금빛/lose 청빛)
- `.e-stats`(flex-wrap 중앙·max-width 322·390 무오버플로), `.e-stat`/`.es-k`/`.es-v`(요약 pill)

### DOM 슬롯 추가(구조 전면 교체 아님·형제 2개 삽입)
```
h2#end-title → div.e-head#end-head → div.e-sub#end-sub → div.e-stats#end-stats
→ div.e-cause#end-cause → div.e-chips#end-chips → button#end-retry → button#end-village
```

### showEnd() 문구/배치 재작성(read-only)
- 제목: 승리/패배 (기존 win/lose 색 유지)
- 톤 한 줄(하드코딩·데이터 아님): 승리 "끝까지 (모두를) 붙잡아냈다." / 패배 "붙잡지 못했다."
- 상황 한 줄: 승리 "대지뿌리 골렘을 넘겼다." / 패배 "전투가 무너졌다."
- 요약 pill: 전투 시간 · 남은 마나 · 쓰러진 동료 N명 (+강타 막음 X/Y if smashTotal>0)
  (+보호막 흡수 if absorbed>0)
- 원인/조언: 승리→advice / 패배→"무너진 원인 — {cause}"
- 성취 칩: 승리만 기존 chips 유지

### 버튼
- `#end-retry` "다시 도전"(유지) · `#end-village` "마을로 돌아가기"→**"마을로 돌아가 준비"**
  (마을 루프 연결감·핸들러 무변경: retry→newBattle, village→showScreen('village'))

## 검증 (preview 5181 · 390px)
대표 report로 showEnd 변환 실측(라이브 tick은 헤드리스 rAF 정지로 재현 불가 → 동일 변환 재현):
- **승리(2:25/마나17/전원생존/강타 5/5/흡수3480)**: 제목 승리 · "끝까지 모두를 붙잡아냈다." ·
  "대지뿌리 골렘을 넘겼다." · pill 5종 · 칩3(전원생존/보호막명중/마나장인) · 오버레이 fit(844≤844) · 무오버플로
- **패배(0:39/마나0/동료2+사제 down/강타 1/3)**: 제목 패배(청색) · "붙잡지 못했다." · "전투가 무너졌다." ·
  쓰러진 동료 **2명**(사제 제외 정확) · "무너진 원인 — 39초 대지 강타를 보호막 없이 받았습니다." · 칩0 · 무오버플로
- 콘솔 warn/error 0 · 이미지 broken 0 · overlay scrollHeight≤clientHeight(세로 클립 없음)

## 보호 확인
- battle.js/botSim.js/tuning.js/assets.js **무변경**(node --check 통과·mtime 무변동·botSim 7/7·coreChecks 9/9)
- Hero v002 actor bind(ARIA/ELI/THORNE/LUMINA FIELD)·ARIA 170px·showcase OFF **유지**
- 여관 PORTRAIT·전투준비 THUMB·하단 파티카드 THUMB **유지**
- 마을 5시설 readability(Facility Readability 01) **유지**
- 루프 핸들러(retry→battle, village→village) **무변경**
- render.js/styles.css 분리·전투 렌더 리팩터·CSS 재작성·DOM 전면교체 **없음**

## WATCH / 유키PD 확인 필요
- 없음. 참고: preview_screenshot이 상시 rAF로 타임아웃 → 스냅샷/DOM eval 실측으로 대체(페이지 오류 아님).
- 라이브 승패 도달 후 실제 report 값의 톤/요약 최종 미감은 나라님 포그라운드 1회 권장(botSim가 데이터 유효성은 보증).
