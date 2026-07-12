# Earthroot Golem — 12 Pose Sprite Manifest

작성: 렌 · 2026-07-05 (Resource Intake 01)
원본: `assets/bosses/earthroot_golem/source/SH_BOSS_001_EARTHROOT_GOLEM_MASTER_POSESHEET_12POSE_MAGENTA_v001.png.png` (읽기 전용, 미변경)
그리드: 3행 × 4열, 셀 362×362px, 배경 #FF00FF(마젠타)
추출 방식: 고정 셀 캔버스(트림 없음) + 크로마키 투명화(T0=90, T1=210, 언믹스 적용)

## 좌표 ↔ 파일명 매핑

| 좌표 | 포즈명 | 파일명 | 캔버스 | 콘텐츠 bbox(캔버스 내) | 비고 |
|---|---|---|---|---|---|
| [1,1] | Idle | SH_BOSS_001_EARTHROOT_GOLEM_01_IDLE_v001.png | 362×362 | (26,61)-(361,331) | |
| [1,2] | Advance / Move | SH_BOSS_001_EARTHROOT_GOLEM_02_ADVANCE_v001.png | 362×362 | (0,63)-(359,327) | 좌측 경계 근접(왼팔) |
| [1,3] | Basic Attack | SH_BOSS_001_EARTHROOT_GOLEM_03_BASIC_ATTACK_v001.png | 362×362 | (52,48)-(360,329) | |
| [1,4] | Heavy Slam Wind-up | SH_BOSS_001_EARTHROOT_GOLEM_04_HEAVY_SLAM_WINDUP_v001.png | 362×362 | (37,44)-(328,335) | |
| [2,1] | Heavy Slam Impact | SH_BOSS_001_EARTHROOT_GOLEM_05_HEAVY_SLAM_IMPACT_v001.png | 362×362 | (17,59)-(361,313) | |
| [2,2] | Root Bind Cast | SH_BOSS_001_EARTHROOT_GOLEM_06_ROOT_BIND_CAST_v001.png | 362×362 | (0,33)-(361,302) | 좌우 경계 근접(덩굴) |
| [2,3] | Hit / Stagger | SH_BOSS_001_EARTHROOT_GOLEM_07_HIT_STAGGER_v001.png | 362×362 | (0,37)-(345,361) | 좌/하단 경계 근접 |
| [2,4] | Down / Defeat | SH_BOSS_001_EARTHROOT_GOLEM_08_DOWN_DEFEAT_v001.png | 362×362 | (23,109)-(330,308) | |
| [3,1] | Tremor Cast | SH_BOSS_001_EARTHROOT_GOLEM_09_TREMOR_CAST_v001.png | 362×362 | (2,89)-(361,293) | |
| [3,2] | Tremor Release | SH_BOSS_001_EARTHROOT_GOLEM_10_TREMOR_RELEASE_v001.png | 362×362 | (0,19)-(356,310) | 좌측 경계 근접 |
| [3,3] | Final Pressure / Enrage | SH_BOSS_001_EARTHROOT_GOLEM_11_FINAL_PRESSURE_ENRAGE_v001.png | 362×362 | (16,0)-(361,299) | **상단 경계 근접**(덩굴 끝 — 아래 WATCH 참조) |
| [3,4] | Recovery / Reset | SH_BOSS_001_EARTHROOT_GOLEM_12_RECOVERY_RESET_v001.png | 362×362 | (0,30)-(319,277) | 좌측 경계 근접 |

모든 파일 동일 캔버스 크기(362×362) — 애니메이션/포즈 교체 시 프레임 정렬 보존.

## WATCH
- `11_FINAL_PRESSURE_ENRAGE`의 머리 위 가느다란 덩굴 끝 몇 가닥이 원본 시트에서부터 row2/row3 셀 경계에 매우 근접(육안상 인지 불가 수준, 몸통·주먹·얼굴은 전혀 영향 없음). 자동 트림을 쓰지 않고 고정 셀 캔버스를 유지하라는 지시에 따라 손대지 않음.
- 이 12개는 **정리된 리소스**이며 아직 어디에도 연결되지 않음(assets.js/battle.js/index.html 무접촉). 런타임 연결은 별도 개발 카드에서 판단.
