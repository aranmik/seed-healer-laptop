# Hero 6 Base — Source Intake Manifest

작성: 렌 · 2026-07-05 (Resource Intake Pack 02 / B)
성격: 리소스 정리(intake)만. **런타임 미연결.** 원본은 source 폴더에 그대로 보존.

## 입력 원본
- 폴더: `assets/heroes/source/`
- ★모든 원본 파일명 끝 이중 확장자 `.png.png` — 원본 그대로 존중(변경 안 함)
- 전부 1448×1086, 24bpp(알파 없음), 배경 #FF00FF 마젠타(투명 아님)

## 정리 결과 (원본 → sprites 구조 · 클린 파일명으로 복사만 · 리사이즈/리페인트/재구성 없음)
| hero key | 파일명 | 경로 | 캔버스 | 투명 배경 | 비고 |
|---|---|---|---|---|---|
| eli | SH_HERO_001_ELI_BASE_v001.png | assets/sprites/heroes/eli/ | 1448×1086 | ✖ (마젠타) | 전사 |
| thorne | SH_HERO_002_THORNE_BASE_v001.png | assets/sprites/heroes/thorne/ | 1448×1086 | ✖ (마젠타) | 도적 |
| lumina | SH_HERO_003_LUMINA_BASE_v001.png | assets/sprites/heroes/lumina/ | 1448×1086 | ✖ (마젠타) | 법사 |
| rorin | SH_HERO_004_RORIN_BASE_v001.png | assets/sprites/heroes/rorin/ | 1448×1086 | ✖ (마젠타) | 주술/술사 |
| cael | SH_HERO_005_CAEL_BASE_v001.png | assets/sprites/heroes/cael/ | 1448×1086 | ✖ (마젠타) | 사냥꾼 |
| aria | SH_HERO_006_ARIA_BASE_v001.png | assets/sprites/heroes/aria/ | 1448×1086 | ✖ (마젠타) | **주인공 사제** |

- 6/6 존재·정상 로드·빈 파일 없음·깨진 이미지 없음.
- 파일명은 클린 `.png`(원본 `.png.png` → 복사 시 정리). 원본 6종은 source 폴더에 무변경 보존.

## 상태 / 결정
- **이번 단계에서 마젠타 제거(투명화)를 수행하지 않음.** 6종 모두 명백한 마젠타 chroma 배경이지만,
  각 캐릭터에 **보라/핑크 계열 의상·발광 요소**가 있을 수 있어(과거 Companion Extract에서 Lumina 성운/Thorne·Eli 보라 프린지가 마젠타 키잉+언믹스에 손상된 선례) **"손상 없이 제거 가능"이 보장되지 않음.**
- 지시("무리한 후처리는 하지 말고 상태를 보고서에 남길 것" / "손상 없이 제거 가능한 경우에만")에 따라 **원본 상태(마젠타) 그대로 정리**하고 상태만 기록.

## WATCH
- 투명 추출은 **별도 카드(Hero Extract)에서 per-hero 크로마 튜닝**(T1·-NoUnmix·-Erase 개별 조정) 필요. 특히 lumina(성운/오브)·thorne(보라)·eli(보라 프린지) 주의.
- 캔버스 1448×1086(가로형)은 스탠딩 초상/전장 컷 용도 판단 후 크롭 규격 결정 필요(runtime 단계).
- 현재는 intake만. runtime 연결·viewer·초상/전장 컷 분리는 별도 카드.
