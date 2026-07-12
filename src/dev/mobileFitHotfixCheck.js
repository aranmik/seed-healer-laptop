// Seed Healer — dev/mobileFitHotfixCheck.js (Public Preview Mobile Fit Hotfix 01)
// 이번 카드 전용 검증: node src/dev/mobileFitHotfixCheck.js
// 범위(정적): A 결과 로그→전장 토스트 · B 전장 세로 공간 회수(상단 축소) · C 배우 재배치(전사 중앙·도적 flank) · D 위협 대기열 유지.
// ★게임 기능/밸런스/보스·스킬 수치/은총 계약/위협 대기열 개념 무변경 · canonical 파일 무접촉(md5는 회귀 스위트가 검증).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..', '..');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const battleSrc = readFileSync(join(ROOT, 'src', 'core', 'battle.js'), 'utf8');

let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}
const num = (re) => { const m = html.match(re); return m ? parseFloat(m[1]) : NaN; };

// ══════════════════════════════════════════════════════════════
// A. 결과 로그 → 전장 오버레이 토스트
// ══════════════════════════════════════════════════════════════
check('A1 상단 고정 결과 레일(#combat-feed) 제거', !/id="combat-feed"/.test(html));
check('A2 전장 오버레이 토스트 컨테이너(#combat-toast)가 battlefield 빌드에 존재',
  /id="combat-toast"/.test(html) && /bf\.innerHTML =[\s\S]{0,600}combat-toast/.test(html));
check('A3 combat-toast는 전장 하단 오버레이(absolute·bottom·pointer-events none·z-index)',
  /\.combat-toast\{position:absolute[\s\S]{0,120}pointer-events:none/.test(html));
check('A4 pushFeed가 #combat-toast에 .ct-item 토스트 append + 자동 제거(1800ms)',
  /function pushFeed\(text, kind\)\{[\s\S]{0,500}getElementById\('combat-toast'\)/.test(html) &&
  /el\.appendChild\(t\)/.test(html) && /setTimeout\(\(\) => t\.remove\(\), 1800\)/.test(html) && /'ct-item ' \+ k/.test(html));
check('A5 동시 최대 3(약한 stack) + 짧은 fade out(ctToast)',
  /children\.length > 3/.test(html) && /@keyframes ctToast\{/.test(html));
check('A6 실제 event 기반 유지(consume absorb/cleansed/seedProc → pushFeed·fake 0)',
  /case 'absorb':[\s\S]{0,300}pushFeed\(/.test(html) && /case 'cleansed':[\s\S]{0,240}pushFeed\(/.test(html) && /case 'seedProc':[\s\S]{0,220}pushFeed\(/.test(html));
check('A7 전환 시 토스트 정리(clearFeed가 combat-toast 비움 · clearReadoutFx 연결)',
  /function clearFeed\(\)\{[\s\S]{0,120}combat-toast'\)[\s\S]{0,40}innerHTML = ''/.test(html) && /clearReadoutFx\(\)\{[\s\S]{0,80}clearFeed\(\)/.test(html));

// ══════════════════════════════════════════════════════════════
// B. 전장 세로 공간 회수(상단 정보영역 축소)
// ══════════════════════════════════════════════════════════════
check('B1 위협 대기열 idle 예약 1행(24px)로 축소(상단 빈 공간 회수)',
  /\.threat-queue\{[\s\S]{0,90}min-height:24px/.test(html));
check('B2 전장(battlefield)은 flex:1로 상단 축소분 자동 환원',
  /\.battlefield\{flex:1/.test(html));
check('B3 전장↔command 검은 띠 해소(직전 카드) 유지(#scr-battle 전장 톤 + apron)',
  /#scr-battle\{background:var\(--night\)\}/.test(html) && /\.battlefield::after\{/.test(html));

// ══════════════════════════════════════════════════════════════
// C. 배우 staging 재배치 (★시각 좌표만)
// ══════════════════════════════════════════════════════════════
check('C1 slotCls 재배치: 전사→중앙(bf-ally-c) · 도적→좌flank(bf-ally-l flip) · 법사→우(bf-ally-r)',
  /const slotCls = \['bf-ally-c','bf-ally-l flip','bf-ally-r'\]/.test(html));
const cB = num(/\.bf-ally-c\{left:50%;bottom:([\d.]+)%;/);
const lB = num(/\.bf-ally-l\{left:3\.5%;bottom:([\d.]+)%\}/);
const rB = num(/\.bf-ally-r\{right:3\.5%;bottom:([\d.]+)%\}/);
const aB = num(/\.bf-aria\{[^}]*bottom:([\d.]+)%/);
const bossTop = num(/\.bf-boss\{left:50%;top:([\d.]+)%/);
check('C2 전사(중앙)가 전방 축 = 가장 아래 + 전원 하단 밴드', cB < lB && cB < rB && [lB, cB, rB].every(v => v >= 15 && v <= 26), `c${cB}/l${lB}/r${rB}`);
check('C3 보스 소폭 상향(top 1%) · ARIA 하단 중앙(2%)', bossTop === 1 && aB === 2, `boss ${bossTop}% · aria ${aB}%`);
check('C4 height는 각 히어로 crop 유지(전사 106·도적 99·법사 103)',
  /\.bf-ally-c img\.spr\{height:106px\}/.test(html) && /\.bf-ally-l img\.spr\{height:99px\}/.test(html) && /\.bf-ally-r img\.spr\{height:103px\}/.test(html));
check('C5 ★시각 좌표만 — battle.js는 순수 로직(DOM/visual 토큰 0·staging 무관)',
  !/bf-ally|translateX|combat-toast|document\.|\.style|getElementById/.test(battleSrc));
check('C6 머리 위 행동명 원점 보존(actionPop가 actorEls[li] 실시간 위치 추적 · ALLY_ACT warrior/rogue/mage)',
  /actionPop\(li, ALLY_ACT\[aid\]/.test(html) && /const ALLY_ACT = \{ warrior:'방패 타격!', rogue:'기습!', mage:'마력탄!'/.test(html));
check('C7 하단 파티 카드 순서 무변경(PARTY = DEFAULT_PARTY = warrior/rogue/mage)',
  /const PARTY = DEFAULT_PARTY\.slice\(0,3\)/.test(html));

// ══════════════════════════════════════════════════════════════
// D. 위협 대기열 개념 유지
// ══════════════════════════════════════════════════════════════
check('D1 위협 대기열(threat-queue·최대 3행·개별 해결) + "곧" 리드 라벨 유지',
  /id="threat-queue"/.test(html) && /function tqResolve\(/.test(html) && /class="t-lead">곧<\/span>/.test(html));
check('D2 보스명 매핑 유지(threatLabels 보스별 · push 문구 TELE_TXT.push)',
  /function threatLabels\(\)/.test(html) && /B\.boss\.push \? \(TELE_TXT\.push/.test(html));

console.log(`\n=== mobile fit hotfix: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
