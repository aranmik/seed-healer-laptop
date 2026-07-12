// Seed Healer — dev/combatClarityExitCheck.js (Combat Clarity & Exit Polish 01)
// 검증: node src/dev/combatClarityExitCheck.js
// 대상: (A) vow/seed 실제 아이콘 적용 · (B) 상시 위험 원 조건화 · (C) 전투 중 포기→마을 복귀 UX.
// 순수 데이터(skillPool) + 아이콘 파일 존재/규격(fs) + index.html 배선(문자열 assert). 코어 무접촉.

import { readFileSync, existsSync } from 'fs';
import { getSkillById } from '../data/skillPool.js';

let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}
const idxURL = new URL('../../index.html', import.meta.url);
const html = readFileSync(idxURL, 'utf8');
function pngSize(url) { const b = readFileSync(url); return { sig: b[0] === 0x89 && b[1] === 0x50, w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; }

// ══ A. 신규 스킬 아이콘 ══
const vow = getSkillById('vow'), seed = getSkillById('seed');
check('A1 vow.iconImg = assets/icons/icon_vow.png', vow.iconImg === 'assets/icons/icon_vow.png');
check('A2 seed.iconImg = assets/icons/icon_seed.png', seed.iconImg === 'assets/icons/icon_seed.png');
const vowURL = new URL('../../assets/icons/icon_vow.png', import.meta.url);
const seedURL = new URL('../../assets/icons/icon_seed.png', import.meta.url);
check('A3 icon_vow.png 존재', existsSync(vowURL));
check('A4 icon_seed.png 존재', existsSync(seedURL));
const vs = pngSize(vowURL), ss = pngSize(seedURL);
check('A5 icon_vow.png = 유효 PNG · 기존 아이콘 규격(423x437)', vs.sig && vs.w === 423 && vs.h === 437, `${vs.w}x${vs.h}`);
check('A6 icon_seed.png = 유효 PNG · 규격 근사(424x437)', ss.sig && ss.w === 424 && ss.h === 437, `${ss.w}x${ss.h}`);
check('A7 vow/seed iconChar 폴백 유지(🕊️/🌱)', vow.iconChar === '🕊️' && seed.iconChar === '🌱');
check('A8 vow/seed iconAssetKey는 여전히 null(assets.js 무접촉)', vow.iconAssetKey === null && seed.iconAssetKey === null);
check('A9 skillIcon이 iconImg 분기 보유(성소/준비/스킬바 공용)', /S\.iconImg.*<img class="spr/.test(html));
check('A10 기존 6종 아이콘 경로 무손상(assets.js icons 참조)',
  ['icon_quick_heal', 'icon_shield', 'icon_cleanse', 'icon_salvation', 'icon_renew', 'icon_ring']
    .every(n => existsSync(new URL('../../assets/icons/' + n + '.png', import.meta.url))));

// ══ B. 상시 공격 암시 FX 정리(danger-ring 조건화) ══
const dangerBase = html.match(/\.bf-danger\{[^}]*\}/s)?.[0] || '';
const dangerHot = html.match(/\.bf-danger\.hot\{[^}]*\}/s)?.[0] || '';
check('B1 danger-ring 기본 = 투명(상시 붉은 데칼 제거)',
  /background:transparent/.test(dangerBase) && /border:2px solid transparent/.test(dangerBase) && /box-shadow:none/.test(dangerBase));
check('B2 danger-ring 기본에 붉은 상시 그라디언트 없음',
  !/radial-gradient/.test(dangerBase));
check('B3 실제 예고(.hot)일 때만 붉은 원 표시',
  /radial-gradient/.test(dangerHot) && /ringPulse/.test(dangerHot));
check('B4 renderTele가 예고 시 hot add / 평소 remove(조건부 노출)',
  /dangerRing\.classList\.add\('hot'\)/.test(html) && /dangerRing\.classList\.remove\('hot'\)/.test(html));
check('B5 기존 heal/shield/block feedback 보존(react-heal/react-shield/react-block)',
  /react-heal/.test(html) && /react-shield/.test(html) && /react-block/.test(html));
check('B6 사제 온기(bf-heal-ring)·강타 대상 glow(danger-tgt)·예고 오오라(wind) 보존',
  /bf-heal-ring/.test(html) && /danger-tgt/.test(html) && /bf-boss\.wind/.test(html));

// ══ C. 전투 중 포기 → 마을 복귀 UX ══
check('C1 전투 우상단 포기 버튼(bh-exit) 존재', /id="bh-exit"/.test(html) && /class="bh-exit"/.test(html));
check('C2 확인 팝업(exit-pop) + 2선택지 존재', /id="exit-pop"/.test(html) && /id="exit-stay"/.test(html) && /id="exit-village"/.test(html));
check('C3 버튼 클릭 → 팝업 열기', /bh-exit'\)\.addEventListener\('click', *\(\) *=> *\{ *\$\('exit-pop'\)\.classList\.add\('on'\)/.test(html));
check('C4 전투 계속 → 팝업만 닫음', /exit-stay'\)\.addEventListener\('click', *\(\) *=> *\{ *\$\('exit-pop'\)\.classList\.remove\('on'\)/.test(html));
check('C5 마을로 돌아가기 → 팝업 닫고 village(결과 미경유)',
  /exit-village'\)[\s\S]{0,140}showScreen\('village'\)/.test(html));
check('C6 마을 복귀는 승패/결과 처리 아님(showEnd/finish 미호출)',
  !/exit-village'\)[\s\S]{0,140}(showEnd|finish)\(/.test(html));
check('C7 새 전투 진입 시 포기창 닫힘 보장(newBattle)', /exit-pop'\)\.classList\.remove\('on'\)/.test(html));
check('C8 팝업 dim 배경 + 390px 적합(max-width)', /\.exit-pop\{[^}]*background:rgba/.test(html) && /\.exit-box\{[^}]*max-width:290px/.test(html));

// ══ D. currentLoadout / selectedBoss 유지(코드 구조) ══
check('D1 마을 복귀는 showScreen만 — currentLoadout/selectedBoss 미변경',
  !/exit-village'[^;]*currentLoadout *=/.test(html) && !/exit-village'[^;]*selectedBoss *=/.test(html));
check('D2 전투는 tick(cur===battle)만 진행 — village 이동 시 자동 정지', /cur *=== *'battle'/.test(html) || /cur!=='battle'|cur *!== *'battle'/.test(html));

console.log(`\n=== combat clarity & exit: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
