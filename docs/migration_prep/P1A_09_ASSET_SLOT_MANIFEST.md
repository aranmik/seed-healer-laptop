# P1A · 09 · ASSET SLOT MANIFEST — Seed Healer

**Migration Prep Pack 01 (9/11)** · 작성: 렌 · 2026-07-04
루미 이미지 교체를 위한 슬롯 문서. **이미지 파일은 만들지 않는다.** 슬롯명·용도·현재 대체 표현·필수 여부만 정리.

> P1-A에서 모든 슬롯은 **null**(placeholder). 값을 넣으면 `<img>`로 스왑, 없으면 이모지/CSS로 렌더. base64 대량 내장 금지 — 외부 파일 경로/URL만.

---

## 1. 현재 ASSETS 구조 (원본 실물)

```
ASSETS = {
  priest: null,
  shieldWarrior: null,
  interruptRogue: null,
  fireMage: null,
  healingTotemShaman: null,
  trapHunter: null,
  earthrootGolem: null,
  battleBackground: null,
  skillIcons: { quickheal, shield, cleanse, salvation, hot, ring, breath }  // 전부 null
}
```
헬퍼: `spr(url,emoji)` → url 있으면 img, 없으면 emoji. `allySpr(id)`·`priestSpr()`·`skillSpr(sid)`가 이를 감쌈. 골렘은 CSS 조립(코어 발광·팔·이끼) — url 넣으면 img로 대체.

---

## 2. 요청서 슬롯명 ↔ 현재 키 매핑

원본은 캐릭터 단위 1키(포즈는 CSS/코드로 표현)이고, 요청서는 포즈 단위로 세분화되어 있다. 재구현 시 **포즈 단위로 확장**할 것을 권장(루미 발주가 포즈별이므로 — 06 Prep Pack 문서). 아래는 매핑 + 확장 제안.

### 사제 (필수)
| 요청 슬롯 | 현재 키 | 용도 | 현재 대체 | 권장 이미지 성격 | 필수 |
|---|---|---|---|---|---|
| priest_idle | priest | 마을·전장 대기·프레임 초상 | ✨ | 크림 로브 소녀 사제 대기 | **필수** |
| priest_cast_heal | (priest 확장) | 빠른 치유 시전 | ✨ | 지팡이 빛 모으는 포즈 | 선택 |
| priest_cast_shield | (priest 확장) | 보호막 시전 | ✨ | 방벽 세우는 포즈 | 선택 |
| priest_cast_cleanse | (priest 확장) | 정화 시전 | ✨ | 정화 손짓 | 선택 |
| priest_down | (priest 확장) | 사제 사망(=패배) | 🪦 | 쓰러진 사제 | 선택 |

### 동료 (idle 필수, 나머지 선택)
| 요청 슬롯 | 현재 키 | 대체 | 필수 |
|---|---|---|---|
| warrior_idle / warrior_hurt / warrior_down | shieldWarrior | 🛡️ / (프레임 상태) / 🪦 | idle **필수** |
| rogue_idle | interruptRogue | 🗡️ | **필수** |
| mage_idle | fireMage | 🔥 | **필수** |
| shaman_idle | healingTotemShaman | 🪶 | **필수** |
| hunter_idle | trapHunter | 🪤 | **필수** |

(hurt/down은 P1-A에서 프레임 회색화·🪦로 처리 → 이미지 없이도 성립. 폴리싱 단계 선택.)

### 보스 골렘 (idle 필수, 포즈 선택)
| 요청 슬롯 | 현재 키 | 용도 | 대체 | 필수 |
|---|---|---|---|---|
| golem_idle | earthrootGolem | 대기 | CSS 골렘(bob) | **필수** |
| golem_attack | (확장) | 평타 | CSS hit 포즈 | 선택 |
| golem_slam_cast | (확장) | 강타 예고 | CSS windup 포즈 | 선택 |
| golem_slam_hit | (확장) | 강타 적중 | CSS hit + 흔들림 | 선택 |
| golem_root_cast | (확장) | 속박 시전 | (전조 바로 대체) | 선택 |
| golem_enrage | (확장) | 압박 | CSS push(균열 붉은빛) | 선택 |

### 스킬 아이콘 (전투 슬롯·기도소·준비 화면)
| 요청 슬롯 | 현재 키 | 대체 이모지 | 필수 |
|---|---|---|---|
| icon_quick_heal | skillIcons.quickheal | ✚ | 선택(권장) |
| icon_shield | skillIcons.shield | 🛡 | 선택(권장) |
| icon_cleanse | skillIcons.cleanse | 💧 | 선택(권장) |
| icon_salvation | skillIcons.salvation | 🕯️ | 선택(권장) |
| icon_renew | skillIcons.hot | 🌿 | 선택(권장) |
| icon_ring | skillIcons.ring | ◎ | 선택(권장) |
| icon_breath | skillIcons.breath | 🌬️ | 선택(권장) |

### 배경·상태·경고
| 요청 슬롯 | 현재 키/처리 | 대체 | 필수 |
|---|---|---|---|
| (전투 배경) | battleBackground | CSS 그라데이션(#241b12→#171009) | 선택 |
| status_shield | (칩 처리) | 🛡+수치 하늘색 칩 | 선택 |
| status_root_bind | (칩 처리) | ⛓️+초 확대·맥박 칩 | 선택 |
| status_renew | (칩 처리) | 🌿+초 칩 | 선택 |
| warning_slam_target | (프레임/바 처리) | 🎯+앰버 강조+예고 바 | 선택 |

---

## 3. 교체 순서 (Set 도착 시 · Prep Pack 06과 정합)

1. **전투 화면 먼저**: priest_idle + golem_idle + skillIcons 6~7 + battleBackground = 전투 한 화면 완성 → 스타일 검수를 실전에서.
2. 마을·게시판(배경 + 골렘 초상).
3. 여관·기도소(동료 초상 + 아이콘).
4. 포즈 확장(사제 cast_*, 골렘 slam_* 등) — 폴리싱.

**규율**: 이미지가 없어도 게임은 완전히 돌아가야 한다(병렬 개발 전제). 슬롯은 채워지는 대로 켜지고, 안 채워지면 이모지/CSS로 폴백. 이 폴백을 재구현에서 절대 제거하지 말 것.

---

## 4. 재구현 시 assets.js 계약

```
슬롯 키는 위 표를 따른다(캐릭터 단위 유지 or 포즈 단위 확장 — 택1, 단 헬퍼가 폴백 보장).
spr(url, emoji): url null → <span>emoji</span>, 아니면 <img src=url>.
allySpr(id) / priestSpr() / skillSpr(sid): 위 spr을 감싼다.
FX(플래시·비네트·플로팅·SFX)는 이미지가 아니라 코드 — ASSETS에 넣지 않는다.
```
