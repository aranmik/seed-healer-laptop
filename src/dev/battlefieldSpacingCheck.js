// Seed Healer — dev/battlefieldSpacingCheck.js (Battlefield Spacing Polish 01)
// 검증: node src/dev/battlefieldSpacingCheck.js
// 대상: index.html 아군 3명(bf-ally-l/c/r) 공통 하향 + ARIA/보스/반응 transform 무변경(문자열 assert).
// ★위치는 bottom(위치 속성)으로만 조정 → transform/filter 반응과 충돌 없음을 구조로 검증. 실 geometry는 브라우저 실측(문서).

import { readFileSync } from 'fs';
let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const num = (re) => { const m = html.match(re); return m ? parseFloat(m[1]) : NaN; };

// ★Mobile Fit Hotfix 01 재배치: 전사=중앙 전방 축(c) · 도적=좌 flank(l) · 법사=우 후방(r) · 전원 하단 · 보스 소폭 상향.
const lB = num(/\.bf-ally-l\{left:3\.5%;bottom:([\d.]+)%\}/);   // 도적
const cB = num(/\.bf-ally-c\{left:50%;bottom:([\d.]+)%;/);      // 전사(중앙 전방)
const rB = num(/\.bf-ally-r\{right:3\.5%;bottom:([\d.]+)%\}/);  // 법사
const aB = num(/\.bf-aria\{[^}]*bottom:([\d.]+)%/);
const bossTop = num(/\.bf-boss\{left:50%;top:([\d.]+)%/);

// ══ A. 모바일 재배치 대형 ══
check('A1 전사(중앙)가 전방 축 = 셋 중 가장 아래(bottom% 최소·보스 정면에서 버팀)',
  cB < lB && cB < rB, `c ${cB} < l ${lB} · r ${rB}`);
check('A2 전원 하단 밴드(bottom 15~26% — 하단 정렬·전장 상단 미침범)',
  [lB, cB, rB].every(v => v >= 15 && v <= 26), `l ${lB} · c ${cB} · r ${rB}`);
check('A3 좌우 문법 유지(도적 left flank · 법사 right · 전사 중앙 translateX)',
  /\.bf-ally-l\{left:3\.5%/.test(html) && /\.bf-ally-r\{right:3\.5%/.test(html) && /\.bf-ally-c\{left:50%;bottom:[\d.]+%;transform:translateX\(-50%\)\}/.test(html));
check('A4 ARIA 하단 중앙(2%) · 보스 소폭 상향(top 1%)', aB === 2 && bossTop === 1, `aria ${aB}% · boss top ${bossTop}%`);

// ══ B. 반응/FX 충돌 없음(bottom 위치 vs transform/filter 반응) ══
check('B1 위치는 bottom/left(위치 속성)만 조정 — 아군 l/r 규칙에 transform 없음',
  /\.bf-ally-l\{left:3\.5%;bottom:[\d.]+%\}/.test(html) && /\.bf-ally-r\{right:3\.5%;bottom:[\d.]+%\}/.test(html));
check('B2 중앙 아군 base transform(translateX(-50%)) 보존', /\.bf-ally-c\{left:50%;bottom:[\d.]+%;transform:translateX\(-50%\)\}/.test(html));
check('B3 반응 transform keyframe이 중앙 translateX(-50%) 보존(heroHitC/heroLungeC)',
  /@keyframes heroHitC\{[^}]*translateX\(-50%\)/.test(html) && /@keyframes heroLungeC\{[^}]*translateX\(-50%\)/.test(html));
check('B4 filter 계열 순간 반응 무손상(react-heal/shield/block·cast-pulse/ring)',
  /react-heal/.test(html) && /react-shield/.test(html) && /react-block/.test(html) && /cast-pulse/.test(html) && /cast-ring/.test(html));
check('B5 support-spark(사제→대상 impulse)는 actor bounding rect 동적 계산(이동 자동 추적)',
  /getBoundingClientRect\(\)/.test(html) && /support-spark/.test(html));
check('B6 발밑 그림자(::before)·선택/보호막/사망 상태는 actor 종속(자동 추적)',
  /\.bf-actor::before/.test(html) && /\.bf-actor\.shielded/.test(html) && /\.bf-actor\.dead/.test(html) && /\.bf-actor\.selactor/.test(html));

// ══ C. 3보스 공통(아군 위치 보스별 분기 없음) ══
check('C1 아군 위치 CSS 단일 정의 + JS bottom 재배치 없음(보스별 아군 위치 분기 없음)',
  (html.match(/\.bf-ally-c\{left:50%;bottom:/g) || []).length === 1 && !/\.style\.bottom/.test(html));
check('C2 selectBoss는 보스 img/height/marginLeft만 갱신(아군 위치 무접촉)',
  !/bf-ally[^\n]*=\s*['"`]?\d/.test(html));

// ══ D. 하단 UI/ARIA 보호(값 기반) ══
check('D1 ARIA 하단 중앙(bottom 2% · 파티 카드 침범 없이 최후방)', aB === 2, `aria bottom ${aB}%`);
check('D2 아군 하단 밴드가 과도하게 낮지 않음(bottom ≥ 15% — 카드/apron 침범 방지)',
  Math.min(lB, cB, rB) >= 15, `min bottom ${Math.min(lB, cB, rB)}%`);

// ══ E. 이전 카드 보호(danger-ring 조건화·포기 UX 무손상) ══
check('E1 danger-ring 기본 투명 유지(Combat Clarity 01)', /\.bf-danger\{[^}]*background:transparent/.test(html));
check('E2 포기 버튼/팝업 무손상', /id="bh-exit"/.test(html) && /id="exit-pop"/.test(html));

console.log(`\n=== battlefield spacing: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
