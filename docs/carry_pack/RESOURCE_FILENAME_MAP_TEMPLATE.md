# RESOURCE FILENAME MAP (TEMPLATE) — Seed Healer

**Laptop Carry Pack 01** · 작성: 렌 · 2026-07-04
루미 이미지를 받으면 **실제 파일명**을 여기 적어 관리한다. `assets.js` 키와 매칭시키는 용도.

> 상태 값: `미연결` / `연결` / `교체 필요` / `보류` 중 하나.
> 폴백: 실제 파일이 없으면 이모지/CSS로 자동 렌더되므로 급하지 않은 건 `보류`로 둬도 게임은 돈다.

---

## 사제
| 구분 | assets.js 키 | 권장 파일명 | 실제 파일명 | 상태 | 메모 |
|---|---|---|---|---|---|
| 사제 | priest.idle | priest_idle.png |  | 미연결 | 1순위·필수 |
| 사제 | priest.castHeal | priest_cast_heal.png |  | 미연결 |  |
| 사제 | priest.castShield | priest_cast_shield.png |  | 미연결 |  |
| 사제 | priest.castCleanse | priest_cast_cleanse.png |  | 미연결 |  |
| 사제 | (프레임 처리) | priest_down.png |  | 보류 | 🪦 폴백 |

## 동료
| 구분 | assets.js 키 | 권장 파일명 | 실제 파일명 | 상태 | 메모 |
|---|---|---|---|---|---|
| 방패 전사 | allies.warrior.idle | warrior_idle.png |  | 미연결 | 필수 |
| 방패 전사 | allies.warrior.hurt | warrior_hurt.png |  | 보류 |  |
| 방패 전사 | allies.warrior.down | warrior_down.png |  | 보류 |  |
| 차단 도적 | allies.rogue.idle | rogue_idle.png |  | 미연결 | 필수 |
| 화염 마법사 | allies.mage.idle | mage_idle.png |  | 미연결 | 필수 |
| 치유 토템 주술사 | allies.shaman.idle | shaman_idle.png |  | 미연결 | 필수 |
| 덫 사냥꾼 | allies.hunter.idle | hunter_idle.png |  | 미연결 | 필수 |

## 보스 — 대지뿌리 골렘
| 구분 | assets.js 키 | 권장 파일명 | 실제 파일명 | 상태 | 메모 |
|---|---|---|---|---|---|
| 골렘 | boss.golem.idle | golem_idle.png |  | 미연결 | 1순위·필수 |
| 골렘 | boss.golem.attack | golem_attack.png |  | 미연결 |  |
| 골렘 | boss.golem.slamCast | golem_slam_cast.png |  | 미연결 | 강타 예고 |
| 골렘 | boss.golem.slamHit | golem_slam_hit.png |  | 미연결 |  |
| 골렘 | boss.golem.rootCast | golem_root_cast.png |  | 보류 |  |
| 골렘 | boss.golem.enrage | golem_enrage.png |  | 미연결 | 압박 |

## 스킬 아이콘
| 구분 | assets.js 키 | 권장 파일명 | 실제 파일명 | 상태 | 메모 |
|---|---|---|---|---|---|
| 빠른 치유 | icons.quickHeal | icon_quick_heal.png |  | 미연결 | 1순위 |
| 보호막 | icons.shield | icon_shield.png |  | 미연결 | 1순위 |
| 정화 | icons.cleanse | icon_cleanse.png |  | 미연결 | 1순위 |
| 구원의 기도 | icons.salvation | icon_salvation.png |  | 미연결 | 1순위 |
| 지속 회복 | icons.renew | icon_renew.png |  | 미연결 | 1순위 |
| 빛의 고리 | icons.ring | icon_ring.png |  | 미연결 | 1순위 |
| 깊은 호흡 | icons.breath | icon_breath.png |  | 미연결 | 1순위 |

## 상태이상/버프 칩
| 구분 | assets.js 키 | 권장 파일명 | 실제 파일명 | 상태 | 메모 |
|---|---|---|---|---|---|
| 보호막 | status.shield | status_shield.png |  | 보류 | 칩 폴백 |
| 속박 | status.rootBind | status_root_bind.png |  | 보류 | 칩 폴백 |
| 지속 회복 | status.renew | status_renew.png |  | 보류 | 칩 폴백 |
| 강타 경고 | status.slamWarning | warning_slam_target.png |  | 보류 | 🎯 폴백 |

## UI/배경 (후순위)
| 구분 | assets.js 키 | 권장 파일명 | 실제 파일명 | 상태 | 메모 |
|---|---|---|---|---|---|
| 전투 배경 | ui.battleBg | battle_background.png |  | 보류 | CSS 폴백 |
| 마을 배경 | ui.townBg | town_bg.png |  | 보류 |  |
| 여관 배경 | ui.innBg | inn_bg.png |  | 보류 |  |
| 기도소 배경 | ui.chapelBg | chapel_bg.png |  | 보류 |  |
| 게시판 배경 | ui.boardBg | board_bg.png |  | 보류 |  |
| 기록실 배경 | ui.archiveBg | archive_bg.png |  | 보류 |  |
| 결과(승) | ui.resultWin | result_win.png |  | 보류 | CSS 틴트 폴백 |
| 결과(패) | ui.resultLose | result_lose.png |  | 보류 | CSS 틴트 폴백 |

---

### 진행 요약 (수기 기록용)
- 연결 완료: __ / __
- 1순위(전투 화면) 완료 여부: [ ]
- 폴백으로 충분해 보류한 슬롯: __개
