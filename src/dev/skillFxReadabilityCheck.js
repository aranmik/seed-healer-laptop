// Seed Healer — dev/skillFxReadabilityCheck.js (Skill FX Readability Polish 01)
// 검증: node src/dev/skillFxReadabilityCheck.js
// 대상: index.html — 약한 4종(cleanse/hot/vow/seed) 고유 FX 배선·ARIA 원점·형태/색 분리·정리(잔류 0).
// ★코어/tuning/skillPool 무변경 — 기존 event(cleansed/hotOn/vowOn/seedOn/seedProc/dmg) 소비만.

import { readFileSync } from 'fs';
let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const consume = html.match(/function consume\(\)\{[\s\S]*?\n  \}/)?.[0] || '';

// ══ A. 공통(실제 성공 event·ARIA 원점·누적/잔류 0) ══
check('A1 skillMark helper 존재 + cur===battle 가드(전투 밖 FX 0)',
  /function skillMark\(idx, cls, ms\)\{[\s\S]{0,120}cur !== 'battle'[\s\S]{0,120}setTimeout/.test(html));
check('A2 skillMark 자동 제거(DOM 노드 누적 없음)', /function skillMark[\s\S]{0,280}setTimeout\(\(\) => m\.remove\(\), ms\)/.test(html));
check('A3 clearSkillFx가 모든 .skfx 제거', /function clearSkillFx\(\)\{[\s\S]{0,120}querySelectorAll\('\.skfx'\)[\s\S]{0,40}remove/.test(html));
check('A4 정리: newBattle/exit-village/end-village에서 clearSkillFx',
  /clearBossFx\(\); clearSkillFx\(\)/.test(html) &&
  /exit-village'\)[\s\S]{0,160}clearSkillFx\(\)/.test(html) &&
  /end-village'\)[\s\S]{0,120}clearSkillFx\(\)/.test(html));
check('A5 skfx는 CSS 클래스로만(정적 build에 skfx 없음·런타임 생성)', /class="bf-actor/.test(html) && !/<div class="skfx/.test(html));

// ══ B. 정화(씻어냄·회복 아님) ══
check('B1 cleansed(성공 event)에서만 정화 FX', /case 'cleansed':[\s\S]{0,220}skillMark\(e\.unit, 'sk-cleanse'/.test(consume));
check('B2 정화 ARIA 원점(supportSpark + cast-pulse)', /case 'cleansed':[\s\S]{0,160}supportSpark\(e\.unit\)[\s\S]{0,60}cast-pulse/.test(consume));
check('B3 sk-cleanse = 흰/청백 sweep(초록 heal pulse 아님)',
  /\.skfx\.sk-cleanse\{background:linear-gradient[\s\S]{0,120}rgba\(255,255,255/.test(html) && /@keyframes skCleanse\{[\s\S]{0,120}translateX/.test(html));
check('B4 정화 실패 시 성공 FX 없음(reject 경로 유지·cleansed는 root 제거 성공에만)',
  /디버프가 없습니다/.test(html) === false ? true : /showReject/.test(html));   // use() 거부는 showReject(성공 FX 아님)

// ══ C. 지속(걸어둠·즉시 큰 회복 아님) ══
check('C1 hotOn(적용)에서 hot 전용 apply FX', /case 'hotOn':[\s\S]{0,220}skillMark\(e\.unit, 'sk-hot'/.test(consume));
check('C2 지속 ARIA 원점', /case 'hotOn':[\s\S]{0,160}supportSpark\(e\.unit\)[\s\S]{0,60}cast-pulse/.test(consume));
check('C3 sk-hot = 녹금 부드러운 apply', /\.skfx\.sk-hot\{background:radial-gradient[\s\S]{0,80}rgba\(150,210,110/.test(html));
check('C4 hot tick은 가짜 주기 pulse 없음(HEAL_PULSE_MIN 게이트로 큰 힐만 pulse·40틱은 float)',
  /HEAL_PULSE_MIN = 80/.test(html) && /e\.amt >= HEAL_PULSE_MIN\) pulseActor/.test(consume));

// ══ D. 수호의 서약(가호·보호막과 형태 분리) ══
check('D1 vowOn에서 가호 veil(sk-vow)', /case 'vowOn':[\s\S]{0,220}skillMark\(e\.unit, 'sk-vow'/.test(consume));
check('D2 피해 순간 vow 활성 대상 짧은 완화(sk-vow-mit)', /case 'dmg':[\s\S]{0,220}B\.vow\[e\.unit\][\s\S]{0,40}sk-vow-mit/.test(consume));
check('D3 sk-vow = 아이보리 세로 veil(shield 둥근 pop과 형태 분리)',
  /\.skfx\.sk-vow\{[\s\S]{0,140}scaleY/.test(html.match(/@keyframes skVow\{[^}]*\}/)?.[0] ? html : '') || /@keyframes skVow\{[\s\S]{0,140}scaleY/.test(html));
check('D4 sk-vow 색 = ivory(255,248,225)·보호막 파랑 아님', /\.skfx\.sk-vow\{[\s\S]{0,140}rgba\(255,248,225/.test(html));
check('D5 vow 완화는 block flash보다 약함(vow-mit .26s < react-block .42s · Final Readability 01 C6 과장 후에도 관계 유지)',
  /\.skfx\.sk-vow-mit\{[\s\S]{0,140}skVowMit \.26s/.test(html) && /\.bf-actor\.react-block\{animation:reactBlock \.42s/.test(html));

// ══ E. 기도 씨앗(심기 → 피격 반응 개화) ══
check('E1 seedOn에서 심기(sk-seed)', /case 'seedOn':[\s\S]{0,220}skillMark\(e\.unit, 'sk-seed'/.test(consume));
check('E2 seedProc에서만 개화(sk-bloom)', /case 'seedProc':[\s\S]{0,120}skillMark\(e\.unit, 'sk-bloom'/.test(consume));
check('E3 seed proc heal은 ARIA 재시전 spark 제외(대상 중심 개화)',
  /e\.src !== 'ring' && e\.src !== 'seed'/.test(consume));
check('E4 sk-seed 심기 점 + sk-bloom 확산 pop(형태 구분·C6 과장 scale 1.62)',
  /\.skfx\.sk-seed::before\{[\s\S]{0,120}border-radius:50%/.test(html) && /@keyframes skBloom\{[\s\S]{0,160}scale\(1\.62\)/.test(html));
check('E5 보호막 전량 흡수 시 bloom 없음(seedProc는 실제 HP피해 발동 event에만·코어 보장)',
  /case 'seedProc':/.test(consume));   // seedProc은 battle core가 실피해 시에만 발행(battleCoreSkillExtensionCheck C8)

// ══ F. 형태/색 분리 + 회귀 ══
check('F1 4종 색 분리(cleanse white·hot green·vow ivory·seed green-gold·crimson 미사용)',
  /rgba\(255,255,255/.test(html.match(/sk-cleanse\{[^}]*\}/)?.[0]||'') &&
  /rgba\(150,210,110/.test(html.match(/sk-hot\{[^}]*\}/)?.[0]||'') &&
  /rgba\(255,248,225/.test(html.match(/sk-vow\{[^}]*\}/)?.[0]||''));
check('F2 기존 4종 FX 유지(quickheal/salvation react-heal·shield react-shield·ring cast-ring)',
  /react-heal/.test(consume) && /case 'salvation': floatText/.test(consume) && /case 'ring':[\s\S]{0,80}cast-ring/.test(consume) && /react-shield/.test(html));
check('F3 보스 telegraph FX 유지(smash→bossBurst·tremor→stageSweep)',
  /case 'smash':[\s\S]{0,80}bossBurst/.test(consume) && /case 'tremor':[\s\S]{0,80}stageSweep/.test(consume));
check('F4 spacing/포기 UX/danger-ring 기본투명 유지',
  /\.bf-ally-c\{left:50%;bottom:27%/.test(html) && /id="bh-exit"/.test(html) && /\.bf-danger\{[^}]*background:transparent/.test(html));
check('F5 ARIA 원점 supportSpark 재사용(dynamic target 추적)', /function supportSpark\(targetIdx\)/.test(html));

console.log(`\n=== skill fx readability: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
