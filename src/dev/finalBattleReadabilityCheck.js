// Seed Healer — dev/finalBattleReadabilityCheck.js (Final Battle Readability & Finish Polish 01)
// 이번 카드 전용 검증: node src/dev/finalBattleReadabilityCheck.js
// 범위:
//   A. grace(은총의 순간) 전투 코어 런타임 — 제품 override(DEMO_V1_SKILL_TUNING.grace) 주입 Battle로 결정론 구동.
//   B. canonical 격리 — override 없는 Battle에는 grace 상태/이벤트 0(botSim baseline 무영향).
//   C. index.html 읽힘 배선(정적 regex) — A1 피드 / A2 머리 위 표기 / A3 보스명 매핑 / B4 command UI / C6 FX 과장 / D7 grace UI.
// 난수 0 · DOM 0(코어는 step 직접 구동, HTML은 파일 텍스트 검사).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Battle } from '../core/battle.js';
import { DEFAULT_PARTY, DEFAULT_LOADOUT } from '../data/tuning.js';
import { DEMO_V1_SKILL_TUNING } from '../data/bossProbes.js';
import { getSkillById } from '../data/skillPool.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..', '..');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const battleSrc = readFileSync(join(ROOT, 'src', 'core', 'battle.js'), 'utf8');

let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}

// 제품 Battle(은총 override 주입) · botSim/probeSim은 이 경로를 쓰지 않음(canonical 보존).
const GRACE_L = ['grace', 'shield', 'quickheal', 'cleanse', 'hot', 'ring'];
const SLOT = { grace: 0, shield: 1, quickheal: 2, cleanse: 3, hot: 4, ring: 5 };
function graceBattle(loadout) { return new Battle(DEFAULT_PARTY, loadout || GRACE_L, { tuning: { skills: DEMO_V1_SKILL_TUNING } }); }
function evCount(B, type) { return B.events.filter(e => e.type === type).length; }
function quietBoss(B) { B.boss.nextAuto = B.boss.nextSmash = B.boss.nextTremor = B.boss.nextRoot = Infinity; }

// ══════════════════════════════════════════════════════════════
// A. 은총의 순간 (grace) — 전투 코어 런타임
// ══════════════════════════════════════════════════════════════
(() => {
  // A1 — grace 시전: 토큰 부여·마나 0 소모·cd 90·graceOn
  const B = graceBattle(); B.gcd = 0; B.select(2);
  const r = B.use(SLOT.grace);
  check('A1 grace 시전 = 토큰 부여·마나 0 소모·cd 90·graceOn 1',
    r.ok === true && !!B.grace && B.grace.left === DEMO_V1_SKILL_TUNING.grace.dur &&
    B.mana === 100 && B.cd.grace === DEMO_V1_SKILL_TUNING.grace.cd &&
    evCount(B, 'graceOn') === 1 && evCount(B, 'graceProc') === 0);

  // A2 — 다음 마나 소모 스킬(보호막 12)이 무료 · graceProc · 토큰 소진
  B.gcd = 0; B.select(3); const m0 = B.mana;
  const r2 = B.use(SLOT.shield);
  check('A2 다음 마나 스킬 무료(보호막 12 무소모)·graceProc·토큰 소진',
    r2.ok === true && B.mana === m0 && !B.grace && evCount(B, 'graceProc') === 1 && !!B.shield[3]);

  // A3 — 은총 소진 후 다음 스킬은 정상 과금
  B.gcd = 0; B.cd = {}; B.select(2); const m1 = B.mana;
  B.use(SLOT.shield);
  check('A3 은총 소진 후 정상 과금(보호막 -12)', (m1 - B.mana) === 12);
})();

(() => {
  // A4 — 활성 중 grace 재시전 거부
  const B = graceBattle(); B.gcd = 0; B.use(SLOT.grace); B.gcd = 0; B.cd = {};
  const r = B.use(SLOT.grace);
  check('A4 활성 중 grace 재시전 거부', r.ok === false && !!B.grace);
})();

(() => {
  // A5 — grace 자기 자신엔 무료 적용 안 됨(graceProc 0 · cost 0 스킬 판정)
  const B = graceBattle(); B.gcd = 0; B.use(SLOT.grace);
  check('A5 grace 자신(cost 0)에는 무료 미적용(graceProc 0 유지)', evCount(B, 'graceProc') === 0 && !!B.grace);
})();

(() => {
  // A6 — 거부된 입력(정화 대상에 디버프 없음)은 토큰 미소모
  const B = graceBattle(); B.gcd = 0; B.use(SLOT.grace);
  B.gcd = 0; B.select(2);
  const r = B.use(SLOT.cleanse);   // root 없음 → deny
  check('A6 거부된 스킬 입력은 은총 미소모', r.ok === false && !!B.grace && evCount(B, 'graceProc') === 0);
})();

(() => {
  // A7 — 시전형(빠른치유) 무료: 시전 시작 claim → 완료 시 무료 소비
  const B = graceBattle(); quietBoss(B); B.units[3].hp = 400;
  B.gcd = 0; B.use(SLOT.grace);
  B.gcd = 0; B.select(3); B.use(SLOT.quickheal);
  check('A7a 시전 claim(graceClaim) 표시·토큰 유지', !!B.cast && B.cast.graceClaim === true && !!B.grace);
  const mBefore = B.mana;
  for (let i = 0; i < 40 && B.cast; i++) B.step(0.05);   // 1.2s 완료
  check('A7b 시전 완료 = 무료(마나 감소 없음·regen만)·graceProc·회복 발생',
    !B.cast && B.mana >= mBefore && !B.grace && evCount(B, 'graceProc') === 1 && B.units[3].hp > 400);

  // A7c 대조 — 은총 없이 시전 완료는 마나 차감(regen<cost라 순감소)
  const C = graceBattle(); quietBoss(C); C.units[3].hp = 400; C.mana = 50;
  C.gcd = 0; C.select(3); C.use(SLOT.quickheal); const cb = C.mana;
  for (let i = 0; i < 40 && C.cast; i++) C.step(0.05);
  check('A7c (대조) 은총 없으면 시전이 마나 차감', C.mana < cb && C.units[3].hp > 400);
})();

(() => {
  // A8 — 시전 취소는 토큰 미소모
  const B = graceBattle(); quietBoss(B); B.gcd = 0; B.use(SLOT.grace);
  B.gcd = 0; B.select(3); B.use(SLOT.quickheal);
  B.cancelCast(); B.step(0.05);
  check('A8 시전 취소는 은총 미소모', !B.cast && !!B.grace && evCount(B, 'graceProc') === 0);
})();

(() => {
  // A9a — 미사용 은총은 8초 후 만료(graceFade)
  const B = graceBattle(); quietBoss(B); B.gcd = 0; B.use(SLOT.grace);
  for (let i = 0; i < 170 && B.grace; i++) B.step(0.05);   // 8s + 여유
  check('A9a 미사용 은총 8초 만료(graceFade 1·graceProc 0)',
    !B.grace && evCount(B, 'graceFade') === 1 && evCount(B, 'graceProc') === 0);

  // A9b — 시전 중(claim) 은총 타이머 동결
  const C = graceBattle(); quietBoss(C); C.gcd = 0; C.use(SLOT.grace); const g0 = C.grace.left;
  C.gcd = 0; C.select(3); C.use(SLOT.quickheal);   // claim
  C.step(0.5);   // 시전 진행 중(1.2s 미완)
  check('A9b 시전 claim 중 은총 타이머 동결', !!C.cast && !!C.grace && C.grace.left === g0);
})();

(() => {
  // A10 — 은총 활성 시 마나 부족 스킬도 무료로 사용 가능
  const B = graceBattle(); B.gcd = 0; B.use(SLOT.grace);
  B.mana = 3; B.gcd = 0; B.select(3);
  const r = B.use(SLOT.shield);   // cost 12 > 3 이지만 은총으로 무료
  check('A10 은총 시 마나 부족 스킬도 무료 사용', r.ok === true && !!B.shield[3] && B.mana === 3 && !B.grace);
})();

// ══════════════════════════════════════════════════════════════
// B. canonical 격리 — override 없는 Battle에는 grace 무영향
// ══════════════════════════════════════════════════════════════
(() => {
  const B = new Battle(DEFAULT_PARTY, DEFAULT_LOADOUT);   // canonical(override 없음)
  check('B1 canonical 초기 grace = null', B.grace === null);
  while (!B.result && B.t < 400) B.step(0.05);
  const g = evCount(B, 'graceOn') + evCount(B, 'graceProc') + evCount(B, 'graceFade');
  check('B2 canonical 전투에 grace 이벤트 0', g === 0);
  check('B3 canonical 전투 종료 시 grace null 유지', B.grace === null);

  // B4 — grace를 T.skills에 주입해도 loadout에 없으면 완전 무해(결정론 불변)
  function runIdle(useOverride) {
    const b = useOverride ? graceBattle(DEFAULT_LOADOUT) : new Battle(DEFAULT_PARTY, DEFAULT_LOADOUT);
    while (!b.result && b.t < 400) b.step(0.05);
    return b;
  }
  const a = runIdle(true), b = runIdle(false);
  check('B4 grace def 주입만으로 결과 불변(loadout 미장착 시)',
    JSON.stringify(a.result.report) === JSON.stringify(b.result.report) &&
    a.grace === null && evCount(a, 'graceOn') === 0);
})();

// ══════════════════════════════════════════════════════════════
// C. index.html / data 읽힘 배선 (정적 검사)
// ══════════════════════════════════════════════════════════════
// ── A1 이벤트 피드 ──
check('C-A1a combat-feed 요소 + pushFeed/clearFeed/renderFeed 존재',
  /id="combat-feed"/.test(html) && /function pushFeed\(/.test(html) && /function clearFeed\(/.test(html) && /function renderFeed\(/.test(html));
check('C-A1b 피드가 실제 event에 배선(absorb 차단·cleansed 해방·seedProc 개화)',
  /case 'absorb':[\s\S]{0,260}pushFeed\(/.test(html) && /case 'cleansed':[\s\S]{0,220}pushFeed\(/.test(html) && /case 'seedProc':[\s\S]{0,200}pushFeed\(/.test(html));
check('C-A1c 위험/해결/피격 3계열 태그 존재', /FEED_TAG\s*=\s*\{[\s\S]{0,120}threat[\s\S]{0,80}answer/.test(html));
check('C-A1d bh-tele "곧" 리드 라벨(곧 일어날 일)', /class="t-lead">곧<\/span>/.test(html));
check('C-A1e 새 전투/포기/복귀에서 clearReadoutFx(피드 잔류 0)',
  /function clearReadoutFx\(\)/.test(html) &&
  /exit-village'\)[\s\S]{0,160}clearReadoutFx\(\)/.test(html) &&
  /end-village'\)[\s\S]{0,160}clearReadoutFx\(\)/.test(html));

// ── A2 머리 위 행동 표기 ──
check('C-A2a actionPop/bossActionPop + ALLY_ACT 존재',
  /function actionPop\(/.test(html) && /function bossActionPop\(/.test(html) && /const ALLY_ACT\s*=/.test(html));
check('C-A2b 아군 공격 표기 = 실제 딜(lunge) 순간에만 배선',
  /hero-lunge'[\s\S]{0,140}actionPop\(li, ALLY_ACT\[aid\]/.test(html));
check('C-A2c 보스 signature 머리 위(smash/tremor resolve)',
  /case 'smash':[\s\S]{0,400}bossActionPop\(bossActNames\(\)\.smash\)/.test(html) &&
  /case 'tremor':[\s\S]{0,200}bossActionPop\(bossActNames\(\)\.tremor\)/.test(html));
check('C-A2d action-pop CSS(ally/boss) + auto-remove 720ms',
  /\.action-pop\.ally\{/.test(html) && /\.action-pop\.boss\{/.test(html) && /setTimeout\(\s*\(\)\s*=>\s*p\.remove\(\), 720\)/.test(html));

// ── A3 보스명/용어 매핑 ──
check('C-A3a renderTele push 문구 = TELE_TXT.push(골렘 하드코딩 제거)',
  /B\.boss\.push \? \(TELE_TXT\.push/.test(html));
check('C-A3b bossActNames가 selectedBoss별 어휘(water 잔파도·naga 해일)',
  /function bossActNames\(\)[\s\S]{0,200}water[\s\S]{0,40}잔파도[\s\S]{0,120}naga[\s\S]{0,40}해일/.test(html));

// ── B4/B5 command UI ──
check('C-B4a 스킬바 슬롯 번호 제거(.sbtn .num CSS 없음)', !/\.sbtn \.num\{/.test(html));
check('C-B4b 아이콘 확대(56x54) + m-cost 마나 pill', /\.sbtn img\.spr\{width:56px;height:54px/.test(html) && /\.sbtn \.m-cost\{/.test(html));
check('C-B4c buildSkillBar가 마나 pill 렌더(제품 메타 mana)', /class="m-cost\$\{mc===0\?' free':''\}"/.test(html));
check('C-B4d nomana/cooldown/casting 상태 보호(command UI 안정)',
  /btn\.classList\.toggle\('nomana'/.test(html) && /btn\.classList\.toggle\('cd', onCd\)/.test(html) && /btn\.classList\.toggle\('casting'/.test(html));

// ── C6 FX 과장 ──
check('C-C6a 착탄 burst 확대(64px·scale 1.55) / naga slash 확대(98px)',
  /\.bf-actor\.atk-burst::before\{[\s\S]{0,120}width:64px/.test(html) && /scale\(1\.55\)/.test(html) && /bf-naga \.bf-actor\.atk-burst::before\{width:98px/.test(html));
check('C-C6b party sweep 과장(base 86px·bloom scale 1.62)',
  /\.bf-stagefx\{[\s\S]{0,80}height:86px/.test(html) && /scale\(1\.62\)/.test(html));
check('C-C6c block/shield 답변 flash 강화(reactBlock .42s·18px glow)',
  /reactBlock \.42s/.test(html) && /@keyframes reactBlock\{[\s\S]{0,60}0 18px/.test(html));
check('C-C6d 보스 telegraph/HP 안 가림(sweep 짧게·색분리 유지)',
  /animation:sfxSweep \.6s/.test(html) && /animation:sfxSweep \.42s/.test(html));

// ── D7 grace UI/데이터 ──
check('C-D7a battle.js grace 런타임(토큰·graceHit·_resolve·이벤트)',
  /this\.grace = null/.test(battleSrc) && /const graceHit = /.test(battleSrc) &&
  /sid === 'grace'/.test(battleSrc) && /graceOn/.test(battleSrc) && /graceProc/.test(battleSrc) && /graceFade/.test(battleSrc));
check('C-D7b battle.js 시전 claim 동결(graceClaim)', /graceClaim/.test(battleSrc));
check('C-D7c 제품 override DEMO_V1_SKILL_TUNING.grace(cost0·cd90·dur8)',
  DEMO_V1_SKILL_TUNING.grace && DEMO_V1_SKILL_TUNING.grace.cost === 0 &&
  DEMO_V1_SKILL_TUNING.grace.cd === 90 && DEMO_V1_SKILL_TUNING.grace.dur === 8);
check('C-D7d skillPool grace 카탈로그(9번째·self·implemented·mana0)',
  (() => { const g = getSkillById('grace'); return !!g && g.uiOrder === 9 && g.mana === 0 && g.implemented === true && g.targetType === 'self'; })());
check('C-D7e grace UI 배선(grace-ind·grace-armed·free-tag·graceFlash·consume 케이스)',
  /id="grace-ind"/.test(html) && /grace-armed/.test(html) && /class="free-tag"/.test(html) &&
  /function graceFlash\(/.test(html) && /case 'graceOn':/.test(html) && /case 'graceProc':/.test(html));
check('C-D7f 무료 발동 강조(graceFlash + 무료 시전! float + 피드)',
  /case 'graceProc':[\s\S]{0,160}graceFlash\(\)[\s\S]{0,120}무료 시전/.test(html));

console.log(`\n=== final battle readability: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
