// Seed Healer — dev/combatCallResponseFxCheck.js (Combat Call-and-Response FX Polish 01)
// 검증: node src/dev/combatCallResponseFxCheck.js
// 대상: index.html(답변 FX visual-only 시차·정리) + src/core/battle.js(계산/이벤트 순서 불변 확인·읽기).
// ★게임 state/HP/shield/heal 적용과 event 발행 순서는 절대 불변 — index.html의 transient CSS class 시작만 ~90ms 지연.

import { readFileSync } from 'fs';
let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const battle = readFileSync(new URL('../../src/core/battle.js', import.meta.url), 'utf8');
const consume = html.match(/function consume\(\)\{[\s\S]*?\n  \}/)?.[0] || '';

// ══ A. 게임 계산/이벤트 순서 불변(코어) ══
const dd = battle.match(/dealDamage\(i, amt, src\)[\s\S]*?\n  heal\(/)?.[0] || '';
const iAbsorb = dd.indexOf("ev('absorb'"), iDmg = dd.indexOf("ev('dmg'");
check('A1 코어 이벤트 순서 불변(absorb → dmg)', iAbsorb >= 0 && iDmg >= 0 && iAbsorb < iDmg);
check('A2 코어에 시각 지연 없음(battle.js setTimeout/rAF 0 = 계산/state 즉시)',
  !/setTimeout|requestAnimationFrame/.test(battle));
check('A3 HP 감소/shield 흡수/heal은 즉시(코어 dealDamage 내 지연 래핑 없음)',
  /u\.hp -= a; hpDmg = a/.test(battle) && /absorbed = Math\.min\(sh\.absorb, a\)/.test(battle));

// ══ B. 답변 FX visual-only 시차(70~120ms) ══
const rd = Number((html.match(/const RESP_DELAY = (\d+)/) || [])[1]);
check('B1 RESP_DELAY 70~120ms 범위', rd >= 70 && rd <= 120, rd + 'ms');
check('B2 afterFx helper(setTimeout 래핑 + timer 추적)',
  /function afterFx\(fn\)\{ fxTimers\.push\(setTimeout\(fn, RESP_DELAY\)\)/.test(html));
check('B3 absorb: 흡수 수치(float)=즉시 · block flash=afterFx 지연',
  /case 'absorb': floatText[\s\S]{0,120}afterFx\(\(\)=>pulseActor\(e\.unit, 'react-block'/.test(consume));
check('B4 dmg: hero-hit 즉시 · vow 완화=afterFx 지연',
  /pulseActor\(e\.unit, 'hero-hit', 180\)/.test(consume) && /afterFx\(\(\)=>skillMark\(e\.unit, 'sk-vow-mit'/.test(consume));
check('B5 seedProc: bloom=afterFx 지연(sweep 뒤)', /case 'seedProc':[\s\S]{0,120}afterFx\(\(\)=>skillMark\(e\.unit, 'sk-bloom'/.test(consume));
check('B6 hero-hit(피격 recoil)는 지연 밖(즉시)', /pulseActor\(e\.unit, 'hero-hit', 180\);/.test(consume) && !/afterFx\([^)]*hero-hit/.test(consume));
check('B7 수치 float은 지연 밖(즉시·결과)', !/afterFx\([^)]*floatText/.test(consume));

// ══ C. 완전 흡수 soft burst ══
check('C1 smash: 전량 흡수(shielded & 같은 프레임 dmg 없음) 감지 → atk-soft toggle',
  /case 'smash':[\s\S]{0,300}toggle\('atk-soft', e\.shielded && !evs\.some\(x => x\.type === 'dmg' && x\.unit === e\.unit\)\)/.test(consume));
check('C2 bossBurst(idx) 원형 유지(기존 체크 보존) + smash 뒤 atk-soft 분리 관리',
  /function bossBurst\(idx\)\{/.test(html) && /classList\.toggle\('atk-soft'/.test(consume));
check('C3 atk-soft CSS = burst 약화(filter opacity·block 주연)', /\.bf-actor\.atk-burst\.atk-soft::before\{filter:opacity\(\.42\)\}/.test(html));
check('C4 실제 공격 사실은 유지(burst 제거 아님·약화만)', /a\.classList\.add\('atk-burst'\)/.test(html));

// ══ D. seed bloom 조건(씨앗 없는 대상/전량 흡수 시 없음 — 코어 event 보장) ══
check('D1 bloom은 seedProc event에서만(씨앗 없는 대상엔 event 없음)', /case 'seedProc':/.test(consume) && (consume.match(/sk-bloom/g) || []).length === 1);
check('D2 seedProc는 실 HP피해(hpDmg≥1 & 생존)에만 발행(코어)', /if \(hpDmg >= 1 && u\.alive\)[\s\S]{0,120}ev\('seedProc'/.test(battle));

// ══ E. 정리/잔류 방지 ══
check('E1 clearFxTimers(지연 timer 전부 clear)', /function clearFxTimers\(\)\{ fxTimers\.forEach\(clearTimeout\); fxTimers = \[\]/.test(html));
check('E2 newBattle/exit-village/end-village에서 clearFxTimers',
  /clearBossFx\(\); clearSkillFx\(\); clearFxTimers\(\)/.test(html) &&
  /exit-village'\)[\s\S]{0,180}clearFxTimers\(\)/.test(html) &&
  /end-village'\)[\s\S]{0,140}clearFxTimers\(\)/.test(html));
check('E3 clearBossFx가 atk-soft도 제거', /function clearBossFx[\s\S]{0,360}remove\('atk-soft'\)/.test(html));

// ══ F. 회귀(기존 FX/문법 보존) ══
check('F1 기존 답변 FX 유지(ring cast-ring · cleanse sk-cleanse · hot sk-hot)',
  /case 'ring':[\s\S]{0,80}cast-ring/.test(consume) && /sk-cleanse/.test(consume) && /sk-hot/.test(consume));
check('F2 보스 telegraph/색 유지(bossBurst·stageSweep·bf-water/bf-naga)',
  /stageSweep\(\)/.test(consume) && /bf-water/.test(html) && /bf-naga/.test(html));
check('F3 평상시 조용(danger-ring 기본 투명) · spacing · 포기 UX 유지',
  /\.bf-danger\{[^}]*background:transparent/.test(html) && /\.bf-ally-c\{left:50%;bottom:19%/.test(html) && /id="bh-exit"/.test(html));

console.log(`\n=== combat call-and-response fx: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
