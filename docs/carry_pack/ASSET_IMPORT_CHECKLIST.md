# ASSET IMPORT CHECKLIST — Seed Healer

**Laptop Carry Pack 01** · 작성: 렌 · 2026-07-04
루미 리소스를 노트북 프로젝트에 연결할 때 쓰는 체크리스트. **이미지가 없어도 게임은 완전히 돈다**(이모지/CSS 폴백). 슬롯은 채워지는 대로 켜진다.

> 상세 슬롯↔키 매핑은 `docs/P1A_09_ASSET_SLOT_MANIFEST.md`. 발주 표준문은 Product Prep Pack `06_VISUAL_DIRECTION_AND_ASSET_PLAN.md`.

---

## 연결 우선순위 원칙

**전투 화면 하나를 먼저 완성**한다(스타일 검수를 실전에서). 그다음 마을·기타. 88컷 한 번에 붙이지 말 것.

```
1순위: 사제 idle + 골렘 idle + 스킬 아이콘 7 + 전투 배경
2순위: 동료 5종 idle + 골렘 포즈
3순위: 상태 칩 · 마을/결과 장식
```

---

## 카테고리별 체크리스트

### 1. 사제 (주인공)
- [ ] priest_idle → `assets.priest.idle` — **필수 · 1순위** · 폴백 ✨ 유지
- [ ] priest_cast_heal → `assets.priest.castHeal` — 선택 · 폴백 유지
- [ ] priest_cast_shield → `assets.priest.castShield` — 선택 · 폴백 유지
- [ ] priest_cast_cleanse → `assets.priest.castCleanse` — 선택 · 폴백 유지
- [ ] priest_down → (프레임 🪦 처리) — 선택

### 2. 동료 5종
- [ ] warrior_idle → `assets.allies.warrior.idle` — **필수** · 폴백 🛡️
- [ ] warrior_hurt / warrior_down → 선택(프레임 회색화·🪦로 대체 가능)
- [ ] rogue_idle → `assets.allies.rogue.idle` — **필수** · 폴백 🗡️
- [ ] mage_idle → `assets.allies.mage.idle` — **필수** · 폴백 🔥
- [ ] shaman_idle → `assets.allies.shaman.idle` — **필수** · 폴백 🪶
- [ ] hunter_idle → `assets.allies.hunter.idle` — **필수** · 폴백 🪤

### 3. 대지뿌리 골렘
- [ ] golem_idle → `assets.boss.golem.idle` — **필수 · 1순위** · 폴백 CSS 골렘
- [ ] golem_attack → `assets.boss.golem.attack` — 선택 · 폴백 CSS hit 포즈
- [ ] golem_slam_cast → `assets.boss.golem.slamCast` — 선택 · 폴백 CSS windup
- [ ] golem_slam_hit → `assets.boss.golem.slamHit` — 선택
- [ ] golem_root_cast → `assets.boss.golem.rootCast` — 선택(전조 바로 대체)
- [ ] golem_enrage → `assets.boss.golem.enrage` — 선택 · 폴백 CSS push(붉은 균열)

### 4. 스킬 아이콘 7종 (1순위 권장)
- [ ] icon_quick_heal → `assets.icons.quickHeal` — 폴백 ✚
- [ ] icon_shield → `assets.icons.shield` — 폴백 🛡
- [ ] icon_cleanse → `assets.icons.cleanse` — 폴백 💧
- [ ] icon_salvation → `assets.icons.salvation` — 폴백 🕯️
- [ ] icon_renew → `assets.icons.renew` — 폴백 🌿
- [ ] icon_ring → `assets.icons.ring` — 폴백 ◎
- [ ] icon_breath → `assets.icons.breath` — 폴백 🌬️

### 5. 상태이상/버프 칩
- [ ] status_shield → `assets.status.shield` — 선택(폴백 🛡+수치 하늘색 칩)
- [ ] status_root_bind → `assets.status.rootBind` — 선택(폴백 ⛓️ 확대·맥박 칩)
- [ ] status_renew → `assets.status.renew` — 선택(폴백 🌿 칩)
- [ ] warning_slam_target → `assets.status.slamWarning` — 선택(폴백 🎯+앰버 강조)

### 6. 전투 HUD 장식
- [ ] battle_background → `assets.ui.battleBg` — 선택(폴백 CSS 그라데이션 #241b12→#171009)
- [ ] (프레임/슬롯 프레임 장식) — 선택 · **가독성 우선, 장식은 절제**

### 7. 마을/시설 배경 후보 (2~3순위)
- [ ] town_bg / inn_bg / chapel_bg / board_bg / archive_bg → 선택 · 폴백 CSS

### 8. 결과 화면 장식 후보 (후순위)
- [ ] result_win / result_lose 장식 → 선택 · 폴백 CSS 틴트(승=골드/패=새벽블루)

---

## 연결 규칙 (DO_NOT_BREAK와 연동)

- 이미지 연결 후에도 **레이드 프레임 수치·칩이 계속 읽혀야** 한다. 안 읽히면 그 이미지는 뺀다.
- **스킬 버튼 > 캐릭터 그림.** 그림 때문에 슬롯이 작아지면 안 됨.
- 폴백을 **제거하지 말 것.** 이미지 누락 시에도 게임이 돌아야 병렬 개발이 산다.
- 파일은 `assets/<카테고리>/` 하위에, 파일명은 `RESOURCE_FILENAME_MAP_TEMPLATE`에 기록.
