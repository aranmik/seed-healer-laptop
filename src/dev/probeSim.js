// Seed Healer — dev/probeSim.js (Boss Probe Sim Baseline 01)
// Water Spirit / Naga Warrior probe 보스의 "플레이 가능한 수치 범위" sanity 하니스.
// ★기존 botSim.js는 무수정 — Bots(봇 4종)를 import로 재사용(직접 실행 가드가 있어 부작용 0·로직 표류 0).
// ★battle.js/tuning.js 무수정 — Battle(party, loadout, { tuning:{ boss } }) deepMerge로만 probe 수치 주입.
// 골렘 Demo v0 baseline은 기존 botSim.js(16 PASS)가 담당 — 이 파일은 probe 2종 전용.
// 실행: node src/dev/probeSim.js

import { Battle, fmtTime } from '../core/battle.js';
import { Bots } from './botSim.js';
import { BOSS_PROBES } from '../data/bossProbes.js';

const PARTY = ['warrior', 'rogue', 'mage'];
const LOADOUT = ['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'ring'];

// ── probe 실행기 — botSim.runBot과 동일 루프 + probe 검증용 확장 지표(유닛별 최저HP·스킬 사용 횟수) ──
export function probeRun(bossKey, botKey) {
  const probe = BOSS_PROBES[bossKey];
  const sim = new Battle(PARTY, LOADOUT, { tuning: { boss: probe.boss } });
  const bot = Bots[botKey]();
  const dt = sim.T.tick;
  let guard = 0;
  while (!sim.result && guard++ < 400 / dt) { bot.decide(sim); sim.step(dt); }
  const r = sim.result ? sim.result.report : null;
  const minPer = {};   // 유닛별 최저 HP% (0=사제, 1=탱커…)
  Object.keys(sim.m.minHp).forEach(k => { minPer[sim.units[k].name] = Math.round(sim.m.minHp[k].pct * 100); });
  const minAll = Math.min(...Object.values(minPer));
  const tankIdx = sim.units.findIndex(u => u.tank);
  return {
    boss: probe.name, bot: bot.name,
    outcome: r ? r.outcome : 'timeout',
    durationText: r ? r.durationText : fmtTime(sim.t), duration: r ? r.duration : sim.t,
    manaEnd: Math.round(sim.mana), manaEmptyAt: sim.m.manaEmptyAt === null ? null : Math.round(sim.m.manaEmptyAt),
    deaths: sim.m.deaths.map(d => d.name + '@' + Math.round(d.t) + 's'),
    minAll, minPer,
    tankMin: tankIdx > 0 ? Math.round(sim.m.minHp[tankIdx].pct * 100) : null,
    priestMin: Math.round(sim.m.minHp[0].pct * 100),
    priestTaken: Math.round(sim.m.priestTaken),
    shaken: Object.values(minPer).filter(p => p < 75).length,   // 최저HP 75% 미만 유닛 수(전체 흔들림 지표)
    smashTotal: sim.m.smashTotal, smashShielded: sim.m.smashShielded,
    rootApplied: sim.m.rootApplied, rootCleansed: sim.m.rootCleansed, rootExpired: sim.m.rootExpired,
    casts: sim.m.castCount, healed: Math.round(sim.m.healed)
  };
}

// ── sanity 판정 — 카드 §5/§8 기준의 최소 게이트(완성 밸런스 아님·"망가지지 않은 초안" 확인) ──
function evalBoss(bossKey, rs) {
  const S = [], ok = (name, pass, note) => S.push({ name, pass: !!pass, note });
  const idle = rs.idle, smart = rs.smart, basic = rs.basic, spam = rs.spam;
  // 공통
  ok('무한전투 없음(전 봇 종료)', ['idle','spam','basic','smart'].every(k => rs[k].outcome !== 'timeout'),
     ['idle','spam','basic','smart'].map(k => rs[k].outcome).join('/'));
  ok('방치=전멸(보스가 실제 위협)', idle.outcome === 'defeat' && idle.duration >= 20 && idle.duration <= 120,
     idle.durationText + ' 전멸(즉사불합리/무의미 압박 아님)');
  ok('스마트=클리어 가능', smart.outcome === 'victory', smart.outcome + ' ' + smart.durationText);
  ok('전투 시간 2~3.5분권', smart.duration >= 100 && smart.duration <= 210, smart.durationText);
  ok('마나 의미 있게 소모', smart.manaEnd < 50 || smart.manaEmptyAt !== null,
     '마나끝 ' + smart.manaEnd + ' · 고갈@' + smart.manaEmptyAt);
  ok('긴장 구간 존재(최저HP)', smart.minAll <= 55, '최저 ' + smart.minAll + '% (' + JSON.stringify(smart.minPer) + ')');
  ok('스마트 사망 0~1명', smart.deaths.length <= 1, smart.deaths.join(',') || '전원 생존');
  ok('기본기 봇=빠듯(승패 무관 긴장)', basic.minAll <= 45 || basic.outcome === 'defeat',
     basic.outcome + ' 최저 ' + basic.minAll + '%');
  ok('스팸=마나 고갈 유도(절제 가치)', spam.manaEmptyAt !== null, '고갈@' + spam.manaEmptyAt);
  if (bossKey === 'water') {
    ok('W1 여러 명 흔들림(75%↓ 3유닛+)', smart.shaken >= 3, smart.shaken + '유닛 · ' + JSON.stringify(smart.minPer));
    ok('W2 지속/고리 실사용', (smart.casts.hot || 0) >= 2 && (smart.casts.ring || 0) >= 2,
       'hot ' + (smart.casts.hot||0) + ' · ring ' + (smart.casts.ring||0));
    ok('W3 침식(정화 압박) 성립', smart.rootApplied >= 5 && smart.rootCleansed >= 4,
       '적용 ' + smart.rootApplied + ' · 정화 ' + smart.rootCleansed);
    ok('W4 보호막 의존 아님(강타 0)', smart.smashTotal === 0, '강타 ' + smart.smashTotal + '회');
  }
  if (bossKey === 'naga') {
    ok('N1 탱커가 죽기 직전까지 몰림', smart.tankMin <= 35, '탱커 최저 ' + smart.tankMin + '%');
    ok('N2 보호막/빠른치유 핵심 사용', (smart.casts.shield || 0) >= 4 && (smart.casts.quickheal || 0) >= 6,
       'shield ' + (smart.casts.shield||0) + ' · quickheal ' + (smart.casts.quickheal||0));
    ok('N3 사제 압박=구원 여지', smart.priestMin <= 55 || (smart.casts.salvation || 0) >= 1,
       '사제 최저 ' + smart.priestMin + '% · 구원 ' + (smart.casts.salvation||0) + '회 · 피격 ' + smart.priestTaken);
    ok('N4 처형이 읽히는 빈도', smart.smashTotal >= 5, '처형 베기 ' + smart.smashTotal + '회(막음 ' + smart.smashShielded + ')');
  }
  return S;
}

export function runProbeBaseline() {
  const out = {};
  for (const bossKey of ['water', 'naga']) {
    const rs = {};
    for (const botKey of ['idle', 'spam', 'basic', 'smart']) rs[botKey] = probeRun(bossKey, botKey);
    out[bossKey] = { runs: rs, checks: evalBoss(bossKey, rs) };
  }
  return out;
}

// ── node 직접 실행 시 리포트(브라우저에선 무해 — import 시 실행 안 됨) ──
if (typeof process !== 'undefined' && process.argv && process.argv[1] && /probeSim\.(m?js)$/.test(process.argv[1])) {
  const all = runProbeBaseline();
  for (const bossKey of ['water', 'naga']) {
    const { runs, checks } = all[bossKey];
    console.log(`\n=== ${runs.smart.boss} (?boss=${bossKey}) ===`);
    for (const k of ['idle', 'spam', 'basic', 'smart']) {
      const r = runs[k];
      console.log(`  [${k}] ${r.outcome} ${r.durationText} · 마나끝 ${r.manaEnd} 고갈@${r.manaEmptyAt} · 최저 ${r.minAll}% 탱 ${r.tankMin}% 사제 ${r.priestMin}% · 사망[${r.deaths.join(',')}] · casts ${JSON.stringify(r.casts)}`);
    }
    checks.forEach(c => console.log(`  [${c.pass ? 'PASS' : 'WATCH'}] ${c.name} — ${c.note}`));
  }
  const fails = ['water', 'naga'].reduce((n, k) => n + all[k].checks.filter(c => !c.pass).length, 0);
  console.log(`\n=== probe sanity: ${fails === 0 ? 'ALL PASS' : fails + ' WATCH'} ===`);
}
