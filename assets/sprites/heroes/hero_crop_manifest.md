# Hero Crop Manifest — Export 01 (v001)

작성: 렌 · 2026-07-05 (Hero Crop Export 01)
성격: v001 후보 크롭. **런타임 미연결.** 원본 CLEAN·source·band2 전부 보존 → Export 02 재생성 가능.
방법: CLEAN에서 **순수 좌표 크롭(알파 보존·리사이즈/리터칭 없음)**. 좌표 공식 = Crop Preview Viewer 01과 동일.

## 선택 band (나라님 1차 선택)
ELI/THORNE/LUMINA/RORIN/CAEL = **band1(위쪽)** · ARIA = **single(전신)**.
band2는 삭제하지 않음(CLEAN 원본에 그대로 보존).

## 크롭 좌표/크기 (band1 또는 single 기준)
좌표 공식: field=밴드 bbox · portrait side=round(min(밴드H×0.9, 밴드W×0.7))·중심 faceCx·상단 밴드y0 · thumb side=round(portrait×0.62)·중심 faceCx·y=밴드y0+밴드H×0.02.

| hero | band | source CLEAN | faceCx | PORTRAIT | FIELD | THUMB | 비고 |
|---|---|---|---|---|---|---|---|
| eli | band1 | eli/…_BASE_CLEAN_v001.png | 733 | 411²@(528,41) | 928×457@(251,41) | 255²@(606,50) | ⚠ THUMB 불투명 0(빈 크롭) |
| thorne | band1 | thorne/…_BASE_CLEAN_v001.png | 689 | 435²@(472,51) | 931×483@(227,51) | 270²@(554,61) | OK |
| lumina | band1 | lumina/…_BASE_CLEAN_v001.png | 763 | 442²@(542,31) | 943×491@(245,31) | 274²@(626,41) | OK |
| rorin | band1 | rorin/…_BASE_CLEAN_v001.png | 697 | 396²@(499,61) | 799×440@(258,61) | 246²@(574,70) | OK |
| cael | band1 | cael/…_BASE_CLEAN_v001.png | 719 | 397²@(521,78) | 893×441@(256,78) | 246²@(596,87) | ⚠ THUMB 불투명 희박(≈empty) |
| aria | single | aria/…_BASE_CLEAN_v001.png | 703 | 615²@(396,38) | 879×1014@(236,38) | 381²@(513,58) | OK (전신+초상) |

## 출력 경로 (각 hero crops/ 폴더 · RGBA · 클램핑 없음)
- `assets/sprites/heroes/{key}/crops/SH_HERO_00N_{NAME}_PORTRAIT_v001.png`
- `assets/sprites/heroes/{key}/crops/SH_HERO_00N_{NAME}_FIELD_v001.png`
- `assets/sprites/heroes/{key}/crops/SH_HERO_00N_{NAME}_THUMB_v001.png`
- 18개 전부 생성. 전부 Format32bppArgb, 알파 보존(순수 Clone 크롭).

## 검수 결과
- **FIELD 6/6**: 견고(밴드 전체·불투명 다수).
- **PORTRAIT 6/6**: 캐릭터 포함(프레이밍 확정은 나라님 육안 필요).
- **THUMB 4/6 OK** · **ELI THUMB=불투명 0(빈 크롭)·CAEL THUMB≈empty** → 넓은/액션 밴드에서 자동 얼굴중심(faceCx=상단15% centroid)이 실제 얼굴을 못 잡음(상단이 팔/무기 벌림으로 넓어 중심-상단이 비어있는 것으로 추정).

## notes
- **band2 preserved**: CLEAN 원본에 두 밴드 모두 보존. band 선택 변경 시 Export 02로 재생성 가능.
- **re-export possible**: 좌표는 위 표에 전부 기록. 얼굴 좌표만 교정하면 portrait/thumb 재추출 즉시 가능.
- 원본 CLEAN/source 무수정 · 리터칭/재채색 0 · 리사이즈 0(순수 좌표 크롭).
- ★WATCH: ELI/CAEL(및 필요시 전원) portrait/thumb의 **얼굴 프레이밍 확정 필요** → Export 02 전에 나라님 육안 또는 face-mark 단계 권장.

---

# Export 02 (v002) — 도형 선택 모델 (현재 유효본)

★**band 모델(v001) 폐기** — CLEAN은 멀티 도형 시트(5명 2×2 4도형·ARIA 2×1 2도형). v001 THUMB는 빈 거터를 잡아 비었음(ELI 0%·CAEL 1%), v001 FIELD는 2도형 포함. **v001 runtime 사용 금지.** 상세: docs/HERO_PORTRAIT_FIELD_CROP_PLAN_02.md.

선택 = 전원 **좌상단 도형(top-left)**. 나라님 확정 좌표. 순수 좌표 크롭(알파 보존·리사이즈/리터칭 0). 출력 `{key}/crops/…_v002.png`.

| hero | face | THUMB (내용) | PORTRAIT (내용) | FIELD 단일도형 (내용) |
|---|---|---|---|---|
| eli | (437,143) | 255²@(310,16) (50%) | 411²@(232,11) (40%) | 354×458@(251,41) (47%) |
| thorne | (430,154) | 270²@(295,19) (50%) | 435²@(213,15) (44%) | 411×484@(227,51) (47%) |
| lumina | (453,140) | 274²@(316,3) (50%) | 442²@(232,0) (44%) | 385×492@(245,31) (52%) |
| rorin | (448,170) | 246²@(325,47) (59%) | 396²@(250,43) (44%) | 318×441@(258,61) (54%) |
| cael | (437,172) | 246²@(314,49) (53%) | 397²@(239,45) (40%) | 346×442@(256,78) (46%) |
| aria | (434,158) | 381²@(244,0) (49%) | 615²@(127,0) (28%) | 345×1013@(236,40) (56%) |

- THUMB 내용 전원 ≥49%(≥35% 충족)·빈 크롭 0·마젠타 잔여 0·코너 투명·RGBA.
- v001 산출물·다른 도형(우/하단·band2)·원본 CLEAN/source 전부 보존. runtime 미연결.

