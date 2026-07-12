// Seed Healer — dev/battleLoadoutLinkCheck.js (Battle Loadout Link 01)
// currentLoadout → 전투 snapshot → Battle/스킬바 slot 매핑 검증: node src/dev/battleLoadoutLinkCheck.js
// 대상: src/core/battle.js(Battle) + src/data/skillPool.js(helper). index.html newBattle snapshot 로직을 LinkModel로 미러링.
// ★battle 코어 use()/dealDamage 자체는 battleCoreSkillExtensionCheck가 담당 — 여기선 "loadout 연결(slot↔skill 순서·snapshot 격리)"에 집중.

import { Battle } from '../core/battle.js';
import { DEFAULT_PARTY } from '../data/tuning.js';
import { createDefaultLoadout, validateLoadout, swapLoadout } from '../data/skillPool.js';

let pass = 0, fail = 0;
function check(name, cond, note) {
  if (cond) { pass++; console.log(`[PASS] ${name}${note ? ' — ' + note : ''}`); }
  else { fail++; console.log(`[FAIL] ${name}${note ? ' — ' + note : ''}`); }
}
const DEFAULT6 = ['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'ring'];
const CUSTOM = ['quickheal', 'shield', 'vow', 'salvation', 'hot', 'seed'];

// index.html newBattle의 snapshot 로직 미러 — validateLoadout 통과분만 slice, invalid면 기본 6종 fallback.
function snapshot(currentLoadout) {
  return (validateLoadout(currentLoadout).ok) ? currentLoadout.slice() : createDefaultLoadout();
}
function mkBattle(loadout) { return new Battle(DEFAULT_PARTY, snapshot(loadout)); }
function cast(B, slot, targetIdx) { B.gcd = 0; if (targetIdx !== undefined) B.select(targetIdx); return B.use(slot); }
function quietBoss(B) { B.boss.nextAuto = B.boss.nextSmash = B.boss.nextTremor = B.boss.nextRoot = Infinity; }

// ══ A. 기본 loadout ══
(() => {
  const B = mkBattle(createDefaultLoadout());
  check('A1 Battle.loadout = 기본 6종·순서 일치', JSON.stringify(B.loadout) === JSON.stringify(DEFAULT6));
  check('A2 스킬바 슬롯 수 = 6', B.loadout.length === 6);
  const r = cast(B, 5, 2);   // slot5 = ring
  check('A3 기존 스킬 slot 사용 정상(ring)', r.ok === true);
})();

// ══ B. custom loadout ══
(() => {
  const B = mkBattle(CUSTOM);
  check('B1 Battle.loadout = custom·순서 일치', JSON.stringify(B.loadout) === JSON.stringify(CUSTOM));
  check('B2 제외한 cleanse/ring 슬롯 없음', !B.loadout.includes('cleanse') && !B.loadout.includes('ring'));
  check('B3 vow 슬롯2·seed 슬롯5 존재', B.loadout[2] === 'vow' && B.loadout[5] === 'seed');
})();

// ══ C. vow 실제 사용(loadout 경유) ══
(() => {
  const B = mkBattle(CUSTOM); const mana0 = B.mana;
  const r = cast(B, 2, 3);   // slot2 = vow, 대상 mage(3)
  check('C1 vow 슬롯 사용 성공 + 상태 생성', r.ok === true && !!B.vow[3]);
  check('C2 마나 13 소모', (mana0 - B.mana) === 13);
  check('C3 cooldown 12 적용', B.cd['vow'] === 12);
  const r2 = cast(B, 2, 3);  // 같은 대상 재시전(cd 남음) → 거부
  check('C4 활성 중 재시전 거부', r2.ok === false);
  const Be = mkBattle(CUSTOM); quietBoss(Be); cast(Be, 2, 3);
  for (let i = 0; i < 170 && Be.vow[3]; i++) Be.step(0.05);
  check('C5 8초 만료', !Be.vow[3]);
})();

// ══ D. seed 실제 사용(loadout 경유) ══
(() => {
  const B = mkBattle(CUSTOM); const mana0 = B.mana;
  const r = cast(B, 5, 2);   // slot5 = seed, 대상 rogue(2)
  check('D1 seed 슬롯 사용 성공 + 3 charges', r.ok === true && B.seed[2] && B.seed[2].charges === 3);
  check('D2 마나 12 소모', (mana0 - B.mana) === 12);
  check('D3 cooldown 6 적용', B.cd['seed'] === 6);
  const proc0 = B.events.filter(e => e.type === 'seedProc').length;
  B.dealDamage(2, 100, 'test');
  check('D4 실제 HP 피해 후 seedProc + charge-1',
    B.events.filter(e => e.type === 'seedProc').length === proc0 + 1 && B.seed[2].charges === 2);
  const Bf = mkBattle(CUSTOM); cast(Bf, 5, 2); Bf.shield[2] = { absorb: 360, max: 360, left: 20 };
  Bf.dealDamage(2, 300, 'test');
  check('D5 보호막 전량 흡수 시 충전 유지', Bf.seed[2].charges === 3 && Bf.events.filter(e => e.type === 'seedProc').length === 0);
  const Be = mkBattle(CUSTOM); quietBoss(Be); cast(Be, 5, 2);
  for (let i = 0; i < 320 && Be.seed[2]; i++) Be.step(0.05);
  check('D6 15초 만료', !Be.seed[2]);
})();

// ══ E. 흐름(성소 교체 → snapshot 일관) ══
(() => {
  // 성소에서 vow/seed 교체 → snapshot이 그대로 전투로
  let cur = createDefaultLoadout();
  cur = swapLoadout(cur, 'vow', 2).loadout;   // cleanse→vow
  cur = swapLoadout(cur, 'seed', 5).loadout;  // ring→seed
  const snap1 = snapshot(cur);
  check('E1 성소 교체 → snapshot 반영', JSON.stringify(snap1) === JSON.stringify(cur));
  const B1 = new Battle(DEFAULT_PARTY, snap1);
  check('E2 준비/전투 loadout 일치', JSON.stringify(B1.loadout) === JSON.stringify(cur));
  // 재도전 = 같은 currentLoadout에서 새 snapshot
  const snap2 = snapshot(cur);
  check('E3 재도전 후 같은 loadout', JSON.stringify(snap2) === JSON.stringify(cur));
  // 기본 구성 복원 → 다음 전투 기본 6종
  const reset = createDefaultLoadout();
  check('E4 기본 구성 복원 후 전투 = 기본 6종', JSON.stringify(snapshot(reset)) === JSON.stringify(DEFAULT6));
})();

// ══ F. 격리 ══
(() => {
  const cur = ['quickheal', 'shield', 'vow', 'salvation', 'hot', 'seed'];
  const snap = snapshot(cur);
  snap[0] = 'MUTATED';
  check('F1 snapshot이 currentLoadout 원본 비변형', cur[0] === 'quickheal');
  const B = mkBattle(cur); B.loadout[0] = 'HACK';
  check('F2 Battle.loadout 변형이 currentLoadout에 영향 없음', cur[0] === 'quickheal');
  check('F3 invalid loadout(5개) → 기본 6종 fallback',
    JSON.stringify(snapshot(['quickheal', 'shield', 'vow', 'salvation', 'hot'])) === JSON.stringify(DEFAULT6));
  check('F4 breath 포함 loadout → fallback(breath 미노출)',
    JSON.stringify(snapshot(['quickheal', 'shield', 'breath', 'salvation', 'hot', 'ring'])) === JSON.stringify(DEFAULT6));
  check('F5 스킬 버튼(loadout) 항상 정확히 6개', mkBattle(cur).loadout.length === 6 && mkBattle(createDefaultLoadout()).loadout.length === 6);
})();

console.log(`\n=== battle loadout link: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
