// Seed Healer — dev/demoV1FinalMicroPolishCheck.js (Demo v1 Final Micro Polish 01)
// 이번 카드 전용 검증: node src/dev/demoV1FinalMicroPolishCheck.js
// 범위:
//   A. 위협 대기열의 실제 데이터 소스(코어 B.tele) — 최대 3개 동시·개별 해결(fake 예고 0).
//   B. 위협 대기열 DOM/로직 배선(정적 regex).
//   C. 레이아웃 단절감(검은 띠) 해소 CSS.
//   D. 은총 아이콘 로컬 자산 치환 + FX 초미세 강조.
// 난수 0 · DOM 0(코어는 step 직접 구동, HTML/data는 파일 텍스트 검사).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { Battle } from '../core/battle.js';
import { DEFAULT_PARTY, DEFAULT_LOADOUT } from '../data/tuning.js';
import { getSkillById } from '../data/skillPool.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..', '..');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');

let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}

// ══════════════════════════════════════════════════════════════
// A. 위협 대기열 실제 데이터 소스 (코어 B.tele — fake 예고 0)
// ══════════════════════════════════════════════════════════════
(() => {
  // 세 전조(smash/tremor/root)가 동시에 겹치도록 예약을 근접 배치 → 큐가 1~3행을 실제 telegraph로만 채울 수 있음을 증명.
  const B = new Battle(DEFAULT_PARTY, DEFAULT_LOADOUT);
  B.boss.nextSmash = 5.0;   // wind 1.5 → 3.5부터 telegraph
  B.boss.nextRoot  = 5.1;   // wind 1.0 → 4.1부터
  B.boss.nextTremor = 5.2;  // wind 2.5 → 2.7부터
  let maxSimul = 0, sawTriple = false;
  for (let i = 0; i < 100 && B.t < 4.95; i++) {
    B.step(0.05);
    const n = (B.tele.smash?1:0) + (B.tele.tremor?1:0) + (B.tele.root?1:0);
    if (n > maxSimul) maxSimul = n;
    if (n === 3) sawTriple = true;
  }
  check('A1 코어가 최대 3개 telegraph 동시 보유(큐 1~3행의 실제 소스)', maxSimul === 3 && sawTriple, 'maxSimul=' + maxSimul);
  check('A2 세 전조가 각각 독립 슬롯(smash/tremor/root)', !!B.tele.smash && !!B.tele.tremor && !!B.tele.root);

  // 개별 해결: smash가 resolve되어도 tremor/root는 유지(그 행만 사라짐)
  const before = { s: !!B.tele.smash, t: !!B.tele.tremor, r: !!B.tele.root };
  for (let i = 0; i < 6 && B.tele.smash; i++) B.step(0.05);   // t 5.0 통과 → smash resolve
  check('A3 smash resolve 후 그 슬롯만 비고 tremor/root 유지(개별 해결)',
    before.s && before.t && before.r && !B.tele.smash && !!B.tele.tremor && !!B.tele.root);
})();

(() => {
  // 위협이 하나도 없으면(예약 밀어둠) 큐 소스는 전부 null → idle(가짜 예고 0)
  const B = new Battle(DEFAULT_PARTY, DEFAULT_LOADOUT);
  B.boss.nextSmash = B.boss.nextTremor = B.boss.nextRoot = 999;
  for (let i = 0; i < 40; i++) B.step(0.05);
  check('A4 위협 없을 때 B.tele 전부 null(큐 idle=실제 상태만·fake 0)',
    !B.tele.smash && !B.tele.tremor && !B.tele.root);
})();

// ══════════════════════════════════════════════════════════════
// B. 위협 대기열 DOM/로직 배선 (정적)
// ══════════════════════════════════════════════════════════════
check('B1 threat-queue 요소 + idle + "곧" 리드 라벨',
  /id="threat-queue"/.test(html) && /id="tq-idle"/.test(html) && /class="t-lead">곧<\/span>/.test(html));
check('B2 renderTele가 B.tele 3종을 각 행으로(smash/tremor/root)',
  /B\.tele\.smash[\s\S]{0,120}k:'smash'/.test(html) && /B\.tele\.tremor[\s\S]{0,120}k:'tremor'/.test(html) && /B\.tele\.root[\s\S]{0,120}k:'root'/.test(html));
check('B3 임박 순 정렬(위=가장 곧) + 최대 3(독립 슬롯)',
  /active\.sort\(\(a,b\)=>\(a\.at-B\.t\)-\(b\.at-B\.t\)\)/.test(html));
check('B4 개별 해결/퇴장 — 사라진 telegraph 행만 tqResolve',
  /for \(const k of Object\.keys\(threatRows\)\) if \(!activeKeys\.has\(k\)\) tqResolve\(k\)/.test(html) &&
  /function tqResolve\(/.test(html) && /tq-resolved/.test(html));
check('B5 차단(보호막) smash = safe/대비 완료 개별 표시',
  /const shielded = a\.k === 'smash'[\s\S]{0,80}B\.shield\[a\.ti\]/.test(html) && /대비 완료/.test(html) && /막아냄/.test(html));
check('B6 기존 보스 FX 부수효과 보존(sfx-gather=!!B.tele.tremor · dangerRing hot · danger-tgt)',
  /stageFx\.classList\.toggle\('sfx-gather', *!!B\.tele\.tremor\)/.test(html) &&
  /dangerRing\.classList\.add\('hot'\)/.test(html) && /dangerRing\.classList\.remove\('hot'\)/.test(html) &&
  /danger-tgt/.test(html));
check('B7 전환(새 전투/포기/복귀) 시 clearThreatQueue 정리',
  /function clearThreatQueue\(/.test(html) && /clearReadoutFx\(\)\{[\s\S]{0,80}clearThreatQueue\(\)/.test(html));
check('B8 A3 보스명 매핑 — push 문구 TELE_TXT.push + threatLabels 보스별(water 잔파도·naga 해일)',
  /B\.boss\.push \? \(TELE_TXT\.push/.test(html) &&
  /function threatLabels\(\)[\s\S]{0,220}water[\s\S]{0,90}잔파도[\s\S]{0,160}naga[\s\S]{0,90}해일/.test(html));
check('B9 대기열 min-height 예약(0~2행 전장 들썩임 방지·border-box)',
  /\.threat-queue\{[\s\S]{0,60}min-height:47px/.test(html) && /\.tq-row\{[\s\S]{0,40}box-sizing:border-box/.test(html) &&
  /\.tq-idle\[hidden\]\{display:none\}/.test(html));

// ══════════════════════════════════════════════════════════════
// C. 레이아웃 단절감(검은 띠) 해소
// ══════════════════════════════════════════════════════════════
check('C1 전투 화면 바탕=전장 톤(cast 예약 슬롯 검은 띠 해소)', /#scr-battle\{background:var\(--night\)\}/.test(html));
check('C2 전장 하단 apron gradient(배우 발밑→command 연결)',
  /\.battlefield::after\{[\s\S]{0,140}linear-gradient\(to bottom,transparent,rgba\(16,10,4/.test(html));

// ══════════════════════════════════════════════════════════════
// D. 은총 아이콘 로컬 자산 치환 + FX 초미세
// ══════════════════════════════════════════════════════════════
(() => {
  const g = getSkillById('grace');
  check('D1 grace iconImg = 기존 로컬 추출 아이콘(신규 파일 0)',
    !!g && typeof g.iconImg === 'string' && g.iconImg.includes('visual_assets/icons/extracted/'));
  check('D2 참조 아이콘 파일 실제 존재(로컬 자산)', !!g.iconImg && existsSync(join(ROOT, g.iconImg)));
  check('D3 iconChar 폴백 유지(이미지 실패 시)', g.iconChar === '🙏');
})();
check('D4 skillIcon가 iconImg를 <img>로 렌더(성소/전투/UI 일관)',
  /S\.iconImg[\s\S]{0,80}<img class="spr[\s\S]{0,40}src="\$\{S\.iconImg\}"/.test(html));
check('D5 FX 초미세 — 예고 행 은은한 맥동(tqPulse) + 해결 행 결과 pop(tqResPop)',
  /@keyframes tqPulse\{/.test(html) && /@keyframes tqResPop\{/.test(html) &&
  /\.tq-row:not\(\.safe\):not\(\.tq-resolved\)\{animation:tqPulse/.test(html));

console.log(`\n=== demo v1 final micro polish: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
