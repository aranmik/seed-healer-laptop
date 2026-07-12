// Seed Healer — dev/bossTelegraphAttackFxCheck.js (Boss Telegraph & Attack FX Polish 01)
// 검증: node src/dev/bossTelegraphAttackFxCheck.js
// 대상: index.html(보스별 telegraph/attack FX 배선·CSS) + bossProbes.js(이벤트 매핑 확인·읽기만).
// ★코어/이벤트 무변경 — 기존 event(teleSmash/smash/teleTremor/tremor/rootOn) 소비 + selectedBoss 색/형태 스위치.

import { readFileSync } from 'fs';
import { BOSS_PROBES } from '../data/bossProbes.js';

let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const stagefxCss = html.match(/\.bf-stagefx\{[^}]*\}/s)?.[0] || '';
const dangerBase = html.match(/\.bf-danger\{[^}]*\}/s)?.[0] || '';

// ══ A. 공통 idle(평상시 조용) ══
check('A1 danger-ring 기본 투명 유지(Combat Clarity 01 회귀)',
  /background:transparent/.test(dangerBase) && /border:2px solid transparent/.test(dangerBase));
check('A2 stage-fx 레이어 기본 opacity:0(평소 비노출)', /opacity:0/.test(stagefxCss) && /pointer-events:none/.test(stagefxCss));
check('A3 battlefield build에 stage-fx 레이어 존재', /id="stage-fx"/.test(html) && /class="bf-stagefx"/.test(html));
check('A4 stage FX 색/형태는 활성 클래스(sfx-gather/sweep)에서만',
  /\.bf-stagefx\.sfx-gather::before\{/.test(html) && /\.bf-stagefx\.sfx-sweep::after\{/.test(html));

// ══ B. telegraph(무엇이 오는지·단일 vs 파티) ══
check('B1 selectBoss가 battlefield 보스색 클래스 설정(bf-water/bf-naga)',
  /bf\.classList\.add\('bf-water'\)/.test(html) && /bf\.classList\.add\('bf-naga'\)/.test(html));
check('B2 renderTele: 파티 예고(tremor)만 stage gather 토글(단일=danger-tgt 구분)',
  /stageFx\.classList\.toggle\('sfx-gather', *!!B\.tele\.tremor\)/.test(html));
check('B3 단일 대상 glow(danger-tgt) 보스색 override(water cyan / naga crimson)',
  /\.bf-water .bf-actor\.danger-tgt\{filter:drop-shadow\(0 0 8px rgba\(84,196,216/.test(html) &&
  /\.bf-naga  ?\.?.*bf-actor\.danger-tgt\{filter:drop-shadow\(0 0 8px rgba\(226,72,64/.test(html));
check('B4 위험 원(.hot) 보스색 override', /\.bf-water .bf-danger\.hot\{/.test(html) && /\.bf-naga  ?\.bf-danger\.hot\{/.test(html));
check('B5 보스 예고 오오라(wind) 보스색 override', /\.bf-water .bf-boss\.wind img\.spr\{/.test(html) && /\.bf-naga  ?\.bf-boss\.wind img\.spr\{/.test(html));

// ══ C. attack resolve(실제 이벤트에서만·짧게·기존 feedback 유지) ══
check('C1 smash resolve → 단일 대상 burst(bossBurst)', /case 'smash':[\s\S]{0,80}bossBurst\(e\.unit\)/.test(html));
check('C2 tremor resolve → 파티 stage sweep(stageSweep)', /case 'tremor':[\s\S]{0,80}stageSweep\(\)/.test(html));
check('C3 FX helper 3종 존재(stageSweep/bossBurst/clearBossFx)',
  /function stageSweep\(\)/.test(html) && /function bossBurst\(idx\)/.test(html) && /function clearBossFx\(\)/.test(html));
check('C4 sweep/burst 자동 정리(setTimeout으로 클래스 제거)',
  /sfx-sweep'\)[\s\S]{0,80}setTimeout[\s\S]{0,60}remove\('sfx-sweep'\)/.test(html) &&
  /atk-burst'\)[\s\S]{0,80}setTimeout[\s\S]{0,60}remove\('atk-burst'\)/.test(html));
check('C5 기존 hit/block reaction 유지(dmg→hero-hit · absorb→react-block)',
  /case 'dmg':[\s\S]{0,120}hero-hit/.test(html) && /case 'absorb':[\s\S]{0,120}react-block/.test(html));

// ══ D. 보스별 이벤트 매핑 + 형태 분리 ══
const g = BOSS_PROBES.golem, w = BOSS_PROBES.water, n = BOSS_PROBES.naga;
check('D1 골렘 강타(smash) 활성 — TUNING 기본(probe boss=null)', g.boss === null);   // golem은 index TUNING 사용(강타 720 활성)
check('D2 물정령 강타(smash) 비활성(한 방 보스 아님)', w.boss.smashInt >= 9999 && w.boss.smashFirst >= 9999);
check('D3 나가 처형(smash) 활성', n.boss.smashDmg > 0 && n.boss.smashInt < 9999);
check('D4 3보스 파티 전체(tremor) 활성', w.boss.tremorDmg > 0 && n.boss.tremorDmg > 0);   // golem tremor=TUNING 기본 활성
check('D5 물정령/나가 상태(root) 활성', w.boss.rootDps > 0 && n.boss.rootDps > 0);
check('D6 stage sweep 형태 보스별 상이(water 넓게 62%·naga 좁게 26%)',
  /\.bf-water .bf-stagefx\.sfx-sweep::after\{width:62%/.test(html) && /\.bf-naga .bf-stagefx\.sfx-sweep::after\{width:26%/.test(html));
check('D7 상태(root) 색 보스별(golem green 기본·water cyan·naga crimson 키프레임)',
  /@keyframes bRootWater\{/.test(html) && /@keyframes bRootNaga\{/.test(html) &&
  /\.bf-water .bf-boss\.bpose-root img\.spr\{animation:bRootWater/.test(html));
check('D8 단일 대상 burst 형태 분리(golem amber ring·naga crimson slash)',
  /\.bf-actor\.atk-burst::before\{[\s\S]*border-radius:50%/.test(html) && /\.bf-naga .bf-actor\.atk-burst::before\{[\s\S]*atkSlash/.test(html));

// ══ E. 흐름 정리(잔류 0) ══
check('E1 newBattle에서 clearBossFx(새 전투 조용 시작)', /clearBossFx\(\);[\s\S]{0,240}bossPose\.reset/.test(html));
check('E2 전투 포기(exit-village) 시 clearBossFx', /exit-village'\)[\s\S]{0,120}clearBossFx\(\)/.test(html));
check('E3 결과→마을(end-village) 시 clearBossFx', /end-village'\)[\s\S]{0,80}clearBossFx\(\)/.test(html));
check('E4 clearBossFx가 gather/sweep/burst 전부 제거',
  /clearBossFx[\s\S]{0,260}remove\('sfx-gather','sfx-sweep'\)[\s\S]{0,160}remove\('atk-burst'\)/.test(html));

// ══ F. 회귀(기존 문법 보존) ══
check('F1 포기 UX 유지(bh-exit / exit-pop)', /id="bh-exit"/.test(html) && /id="exit-pop"/.test(html));
check('F2 아군 staging 존재(Mobile Fit 01 재배치: bf-ally-c 전사 bottom 19% · bf-aria 2%)',
  /\.bf-ally-c\{left:50%;bottom:19%/.test(html) && /\.bf-aria\{left:50%;bottom:2%/.test(html));
check('F3 golem 기본 위험원은 여전히 붉음(.hot red)', /\.bf-danger\.hot\{background:radial-gradient\(ellipse at center,rgba\(224,86,52/.test(html));

console.log(`\n=== boss telegraph & attack fx: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
