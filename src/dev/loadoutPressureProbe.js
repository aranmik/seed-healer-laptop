// Seed Healer — dev/loadoutPressureProbe.js (Three Boss Counterplay & Loadout Pressure Plan 01)
// ★read-only 분석 전용: node src/dev/loadoutPressureProbe.js
// 목적: 3보스 × 3구성(기본6/맞춤/비추천)의 실측 비교 + 이벤트 타임라인에서 vow/seed 가치 창 정량화.
// 제품/보호 파일 무변경 — Battle/Bots/BOSS_PROBES import(읽기)만. 봇 정책 변경 없음(smartPlus는 이 파일 안에만 존재).

import { Battle } from '../core/battle.js';
import { DEFAULT_PARTY } from '../data/tuning.js';
import { BOSS_PROBES } from '../data/bossProbes.js';

const DEFAULT6 = ['quickheal', 'shield', 'cleanse', 'salvation', 'hot', 'ring'];
// Matrix §4 추천 loadout(초기 밸런스 기준) — 검증용
const TAILORED = {
  golem: ['quickheal', 'shield', 'vow', 'cleanse', 'salvation', 'hot'],   // 제외: 고리·씨앗
  water: ['quickheal', 'hot', 'ring', 'cleanse', 'seed', 'salvation'],    // 제외: 보호막·서약
  naga:  ['quickheal', 'shield', 'vow', 'salvation', 'seed', 'hot']       // 제외: 정화·고리
};
// 의도적으로 덜 맞는 구성(함정 아님 — 주요 압박에 효율 낮음)
const MISMATCH = {
  golem: ['quickheal', 'cleanse', 'salvation', 'hot', 'ring', 'seed'],    // 방어기(보호막/서약) 없음
  water: ['quickheal', 'shield', 'vow', 'cleanse', 'salvation', 'hot'],   // 방어기 2종·광역/반응 없음(고리/씨앗 없음)
  naga:  ['quickheal', 'cleanse', 'hot', 'ring', 'salvation', 'seed']     // 방어기 없음(처형 raw)
};

const slotOf = (sim, sid) => sim.loadout.indexOf(sid);
const lowestUnit = (sim, includePriest) => {
  let best = -1, bp = 1.01;
  sim.units.forEach((u, i) => {
    if (!u.alive || (!includePriest && u.isPriest)) return;
    const p = u.hp / u.max; if (p < bp) { bp = p; best = i; }
  });
  return best;
};

// ── smartPlus: botSim smart와 동일 뼈대 + vow/seed 인지(이 파일 전용·botSim 무변경) ──
function smartPlus() {
  let nt = 0, lastRing = -99;
  return {
    name: 'P2+ loadout-aware',
    decide(sim) {
      if (sim.t < nt) return;
      nt = sim.t + 0.2;
      if (sim.cast) return;
      const T = sim.T, you = sim.units[0];
      const has = sid => sim.loadout.includes(sid);
      const tel = sim.tele.smash;
      if (tel && sim.t >= tel.at - T.boss.smashWind + 0.2) {
        const ti = tel.ti;
        const shd = sim.shield[ti] && sim.shield[ti].absorb > 0;
        const overlap = !!sim.tele.tremor;   // 처형/강타 + 해일/진동 겹침 구간 = 서약(창 전체 -40%)이 강한 곳
        // ★shield/vow 이중지출 금지(§8): 한 텔레그래프에 하나만. 겹침 구간=vow · 단일=shield · shield 없으면 vow.
        if (has('vow') && overlap && !sim.vow[ti]) { sim.select(ti); if (sim.use(slotOf(sim, 'vow')).ok) return; }
        else if (has('shield') && !shd) { sim.select(ti); if (sim.use(slotOf(sim, 'shield')).ok) return; }
        else if (has('vow') && !shd && !sim.vow[ti] && !has('shield')) { sim.select(ti); if (sim.use(slotOf(sim, 'vow')).ok) return; }
      }
      if (has('cleanse')) for (const k in sim.root) {
        if (sim.t - sim.root[k].appliedAt >= 0.3) { sim.select(+k); if (sim.use(slotOf(sim, 'cleanse')).ok) return; }
      }
      if (you.hp / you.max < 0.45 && has('salvation') && sim.use(slotOf(sim, 'salvation')).ok) return;
      // 씨앗: 탱커(또는 aggro 대상) 선부착 — 전체피해 예고 중이거나 마나 여유 시(반응 회복 은행)
      if (has('seed')) {
        const tki = sim.units.findIndex(u => u.tank && u.alive);
        const target = tki > 0 ? tki : lowestUnit(sim, false);
        if (target > 0 && !sim.seed[target] && (sim.tele.tremor || sim.mana >= 40)) {
          sim.select(target); if (sim.use(slotOf(sim, 'seed')).ok) return;
        }
      }
      if (has('ring')) {
        const hurtUnits = sim.units.filter(u => u.alive && u.hp / u.max < 0.8);
        const deficitSum = hurtUnits.reduce((s, u) => s + (u.max - u.hp), 0);
        if (hurtUnits.length >= 3 && deficitSum >= 560 && sim.t - lastRing > 12) {
          if (sim.use(slotOf(sim, 'ring')).ok) { lastRing = sim.t; return; }
        }
      }
      if (has('hot')) {
        const tki = sim.units.findIndex(u => u.tank && u.alive);
        if (tki > 0) {
          const h = sim.hot[tki], tank = sim.units[tki];
          if (!h && tank.hp / tank.max < 0.8) { sim.select(tki); if (sim.use(slotOf(sim, 'hot')).ok) return; }
        }
      }
      const danger = sim.units.some(u => u.alive && u.hp / u.max < 0.4);
      if (sim.mana < 20 && !danger) return;
      let worst = 1;
      sim.units.forEach(u => { if (u.alive) worst = Math.min(worst, u.hp / u.max); });
      if (sim.mana < 42 && worst > 0.55 && !tel && !sim.tele.tremor) return;
      if (tel && tel.at - sim.t < 1.2) return;
      const li = lowestUnit(sim, true);
      if (li >= 0) {
        const u = sim.units[li];
        if (u.hp / u.max < 0.66 && (u.max - u.hp) >= T.skills.quickheal.heal * 0.75) {
          sim.select(li); sim.use(slotOf(sim, 'quickheal'));
        }
      }
    }
  };
}

// Balance 01 — checkpoint 격리용 stage opts(index.html 제품 override 경로 미러). 'base'=canonical, 'ABC'=제품 최종.
//   A=씨앗 cost 9 · B=water tremorDmg 132 · C=golem 진동 19/24. (bossProbes DEMO_V1_* 값과 동일)
function stageOpts(bossKey, stage) {
  const t = { skills: { seed: { cost: stage === 'base' ? 12 : 9 } } };   // A
  if (bossKey === 'golem') {
    if (stage === 'ABC') t.boss = { tremorFirst: 19, tremorInt: 24 };    // C (golem만)
  } else {
    const b = JSON.parse(JSON.stringify(BOSS_PROBES[bossKey].boss));
    if (bossKey === 'water' && stage !== 'ABC') b.tremorDmg = 120;       // B 前(base/A) = 120 · 최종 = bossProbes 132
    t.boss = b;
  }
  return { tuning: t };
}

function run(bossKey, loadout, stage) {
  const sim = new Battle(DEFAULT_PARTY, loadout, stageOpts(bossKey, stage || 'ABC'));
  const bot = smartPlus();
  const dt = sim.T.tick; let guard = 0;
  while (!sim.result && guard++ < 400 / dt) { bot.decide(sim); sim.step(dt); }
  const evs = sim.events;
  const minAll = Math.min.apply(null, Object.keys(sim.m.minHp).map(k => sim.m.minHp[k].pct));
  // vow 완화 추정: vowOn~vowFade 창 내 dmg 이벤트 amt(=감소 후) × 2/3 = 감소분(0.4/0.6)
  const vowWin = {}; let vowMit = 0, vowHits = 0;
  for (const e of evs) {
    if (e.type === 'vowOn') vowWin[e.unit] = e.t;
    if (e.type === 'vowFade') delete vowWin[e.unit];
    if (e.type === 'dmg' && vowWin[e.unit] !== undefined) { vowMit += e.amt * 2 / 3; vowHits++; }
  }
  const seedProcs = evs.filter(e => e.type === 'seedProc').length;
  const seedHeal = evs.filter(e => e.type === 'heal' && e.src === 'seed').reduce((s, e) => s + e.amt, 0);
  return {
    outcome: sim.result ? sim.result.report.outcome : 'timeout',
    dur: sim.result ? sim.result.report.durationText : '400+',
    durS: Math.round(sim.t),
    manaEnd: Math.round(sim.mana), manaEmptyAt: sim.m.manaEmptyAt === null ? null : Math.round(sim.m.manaEmptyAt),
    minHp: Math.round(minAll * 100),
    deaths: sim.m.deaths.map(d => d.name + '@' + Math.round(d.t)),
    casts: sim.m.castCount,
    healed: Math.round(sim.m.healed), overhealPct: sim.result ? sim.result.report.overhealPct : 0,
    smash: sim.m.smashTotal + '/' + sim.m.smashShielded,
    vowHits, vowMit: Math.round(vowMit), seedProcs, seedHeal: Math.round(seedHeal),
    events: evs, tankIdx: sim.units.findIndex(u => u.tank)
  };
}

// ── 이벤트 타임라인 → 위협 창 분석(기본6 run의 events 사용) ──
function cadence(r, bossKey) {
  const evs = r.events, tank = r.tankIdx;
  const times = t => evs.filter(e => e.type === t).map(e => Math.round(e.t));
  const iv = a => a.slice(1).map((v, i) => v - a[i]);
  const smashT = times('smash'), tremorT = times('tremor'), rootT = times('rootOn');
  // 탱커 HP-피해 사건 빈도 → 씨앗(15s·3충전) proc 잠재
  const tankDmg = evs.filter(e => e.type === 'dmg' && e.unit === tank);
  const per15 = r.durS > 0 ? (tankDmg.length / r.durS * 15).toFixed(1) : '0';
  // 강타 시점 기준 8초 창(서약) 내 대상 피해 합(감소 전 환산 아님·관측값)
  const vowWindows = smashT.map(st => {
    const dmg = evs.filter(e => e.type === 'dmg' && e.t >= st - 1 && e.t <= st + 7)
      .reduce((s, e) => s + e.amt, 0);
    return Math.round(dmg);
  });
  return { smashT, smashIv: iv(smashT), tremorT: tremorT.slice(0, 8), tremorIv: iv(tremorT), rootT, tankHitsPer15: per15, vow8sWindows: vowWindows };
}

const line = (label, r) => {
  console.log(`  [${label}] ${r.outcome} ${r.dur} · 마나끝 ${r.manaEnd} 고갈@${r.manaEmptyAt} · 최저HP ${r.minHp}% · 사망[${r.deaths}]`);
  console.log(`      casts ${JSON.stringify(r.casts)} · 힐 ${r.healed}(OH ${r.overhealPct}%) · 강타 ${r.smash} · vow완화 ${r.vowMit}(${r.vowHits}회) · seed proc ${r.seedProcs}(+${r.seedHeal})`);
};
for (const boss of ['golem', 'water', 'naga']) {
  console.log(`\n═══ ${boss.toUpperCase()} ═══`);
  // checkpoint 격리: 기본6을 canonical baseline vs 제품 최종(ABC)으로 대조
  line('기본6·canonical baseline(seed12/water120/golem25·28)', run(boss, DEFAULT6, 'base'));
  const finalDefault = run(boss, DEFAULT6, 'ABC');
  line('기본6·제품 최종(seed9/water132/golem19·24)', finalDefault);
  line('맞춤·제품 최종', run(boss, TAILORED[boss], 'ABC'));
  line('비추천·제품 최종', run(boss, MISMATCH[boss], 'ABC'));
  const c = cadence(finalDefault, boss);
  console.log(`  [cadence·기본6 제품] smash@${c.smashT} (간격 ${c.smashIv}) · tremor 간격 ${c.tremorIv} · root@${c.rootT}`);
  console.log(`      탱커 HP피해사건 ${c.tankHitsPer15}회/15s(씨앗 proc 잠재) · 강타 8s창 피해 ${c.vow8sWindows}(서약 창 가치)`);
}
console.log('\n=== loadout pressure probe: 분석 전용(제품 무변경·index.html override 미러) ===');
