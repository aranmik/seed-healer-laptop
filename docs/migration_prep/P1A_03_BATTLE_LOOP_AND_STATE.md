# P1A · 03 · BATTLE LOOP & STATE — Seed Healer

**Migration Prep Pack 01 (3/11)** · 작성: 렌 · 2026-07-04
전투 루프와 상태를 **재구현 가능한 pseudo-code**로 정리한다. 언어 무관, 결정론 유지가 핵심.

> 결정론 원칙: 난수 0. 유일한 입력 변수는 플레이어(또는 봇)의 `select`/`use`/`cancel`. 시간은 외부가 주는 고정 스텝 `dt`로만 흐른다.

---

## 1. 전투 시작 상태

```
Battle(partyIds[3], loadoutIds[6]):
  t = 0
  units = [ Priest(hp=900, max=900, isPriest=true) ]        # 1번 칸 = YOU
  for id in partyIds: units.push( Ally(from tuning.allies[id]) )
  sel = 1                        # 기본 선택 = 첫 동료
  mana = 100; manaMax = 100
  gcd = 0; cast = null; cd = {}
  shield = {}; hot = {}; root = {}
  breath = loadout contains 'breath'
  boss = { hp=9600, max=9600, push=false,
           nextAuto=3.0, nextSmash=15, nextTremor=25, nextRoot=20,
           autoInt=5.0, tremorInt=28 }
  tele = { smash:null, tremor:null, root:null }   # 진행 중 예고
  rootRota = 0                   # 속박 대상 로테이션 인덱스(결정론)
  trapNext = hunter ? 30 : ∞
  totemPulse = 1                 # 토템/HoT 1초 펄스 누산기
  metrics = { healed, overheal, absorbed, totemHealed, dmgTaken, priestTaken,
              smashTotal, smashShielded, rootApplied, rootCleansed, rootCleanseSum,
              rootExpired, manaEmptyAt=null, deaths[], minHp{per unit}, clutch=false,
              castCount{}, cancels, lastFatal=null }
  result = null
  events = []                    # UI가 소비할 큐
```

---

## 2. 메인 루프 (외부 = UI/봇)

```
# UI: requestAnimationFrame 고정 스텝 누산
onFrame(realDt):
  if paused or ended: return
  acc += clamp(realDt,0,0.25) * speed
  while acc >= TICK(0.05):
      battle.step(TICK); acc -= TICK
      if battle.result: break
  consumeEvents(battle.events)   # 연출/SFX/토스트
  renderHUD(battle)              # 상태 그리기
  if battle.result and not endedYet: endSequence()

# 봇: 동일 루프를 화면 없이
runBot(botKey):
  b = Bot(botKey)
  while not battle.result and guard:
      b.decide(battle)           # select/use 호출
      battle.step(0.05)
  return summarize(battle)
```

---

## 3. step(dt) — 전투 1스텝 (순서가 중요)

```
step(dt):
  if result: return
  t += dt
  gcd = max(0, gcd - dt)
  for k in cd: cd[k] -= dt; drop if <=0

  # (1) 마나 회복 — 깊은 호흡은 '비시전 중'에만 보너스
  regen = tuning.priest.regen(1.8)
  if breath and not cast: regen += tuning.priest.breathBonus(0.8)
  mana = min(manaMax, mana + regen*dt)
  if mana < 7 and metrics.manaEmptyAt==null: metrics.manaEmptyAt = t

  # (2) 시전 진행 — 완료 시 마나 소비(무산=시간 손실만)
  if cast:
     cast.left -= dt
     if cast.left <= 0:
        S = skill(cast.sid); u = units[cast.ti]
        if u dead: emit castFizzle
        elif mana < S.cost: emit castFizzle           # 마나 부족으로 무산
        else: mana -= S.cost; resolve(cast.sid, cast.ti); emit castDone
        cast = null

  # (3) HoT 틱 (1초 펄스)
  for k in hot: tick down; every 1s -> heal(k, hps, 'hot'); drop if expired

  # (4) 보호막 시간 만료
  for k in shield: shield.left -= dt; drop if <=0 (emit shieldFade)

  # (5) 속박 도트 (1초 펄스) — 사망 유발 가능 → 이후 result 체크
  for k in root: tick; every 1s -> dealDamage(k, rootDps(36), 'root'); drop if expired(emit rootFade)

  # (6) 치유 토템 (생존한 토템술사 있으면 1초마다 전원 소힐)
  if aliveTotem: totemPulse -= dt; every 1s -> heal(all alive, totemHps(6), 'totem')

  # (7) 덫 (사냥꾼 생존 시 trapInt마다): 다가오는 강타/돌진동 중 가까운 것을 trapDelay만큼 지연
  if hunter alive and t>=trapNext:
     trapNext += trapInt(30)
     delay nearest of {nextSmash, nextTremor} by trapDelay(3) if not already telegraphing

  # (8) 마지막 압박 (1회 래치, 소프트)
  if not boss.push and (t>=pushTime(120) or boss.hp/max<=pushHpPct(0.25)):
     boss.push=true; boss.autoInt=pushAutoInt(3.8); boss.tremorInt=pushTremorInt(18); emit push
  mul = boss.push ? pushDmgMul(1.12) : 1

  # (9) 전조 생성 → 적중 (아래 4·5절)
  updateTelegraphs(mul)
  resolveTelegraphs(mul)         # 강타·돌진동·속박 적중, 각 적중 후 if result: return

  # (10) 평타
  if t>=boss.nextAuto:
     boss.nextAuto += boss.autoInt
     ti = aggro(); if ti>0: dealDamage(ti, autoDmg(300)*mul, 'auto'); if result: return

  # (11) 아군 자동 딜 → 보스 HP
  dps = sum(alive allies .dps)
  boss.hp -= dps*dt
  if boss.hp<=0: finish('victory'); return

  # (12) 안전장치
  if t>360: finish('defeat')
```

**순서 이유**: 회복·유지효과(1~6)를 먼저 정산해 "이번 스텝 시작 시점의 상태"로 위험(9~10)을 적용. 압박 래치(8)를 위험보다 앞에 둬 이번 스텝부터 가속 반영. 아군 딜(11)은 마지막 — 승리 판정이 위험 판정보다 늦어야 "강타로 죽었는데 동시에 보스도 죽어 무승부" 같은 모호함이 없다.

---

## 4. 아군 행동 (AI)

아군은 **자동 딜만** 한다(별도 판단 없음, 결정론). 기여는 DPS 합산 + 특수효과:
```
aggro():                         # 어그로 우선순위
  if 살아있는 탱커 존재: return 탱커
  else: return 살아있는 아군 중 최고 dps  # 탱커 없으면 물몸이 표적 (의도된 난이도)

토템술사: step (6)에서 전원 소힐
덫사냥꾼: step (7)에서 위험 지연
그 외: dps만 보스 HP에 기여
```

---

## 5. 보스 행동 (전조 → 적중, 상세는 04 문서)

```
updateTelegraphs(mul):
  # 강타: 대상=현재 aggro, 예고 smashWind(1.5)s 전에 tele.smash 생성
  if not tele.smash and t >= nextSmash - smashWind:
     ti = aggro(); if ti>0: tele.smash={ti, at:nextSmash}; emit teleSmash
     else: nextSmash += smashInt   # 표적 없으면 스킵
  # 돌진동: 전원 대상, tremorWind(2.5)s 전 생성
  if not tele.tremor and t >= nextTremor - tremorWind: tele.tremor={at:nextTremor}; emit teleTremor
  # 속박: 대상=비탱커 DPS순 로테이션, rootWind(1.0)s 전 생성
  if not tele.root and t >= nextRoot - rootWind:
     ti = rootTarget(); if ti>0: tele.root={ti, at:nextRoot} else nextRoot += rootInt

resolveTelegraphs(mul):
  if tele.smash and t>=tele.smash.at:
     ti=tele.smash.ti; nextSmash+=smashInt; tele.smash=null
     if alive: metrics.smashTotal++; shd = has active shield
               if shd: smashShielded++; dealDamage(ti, smashDmg(720)*mul, 'smash'); if result:return
  if tele.tremor and t>=tele.tremor.at:
     nextTremor+=boss.tremorInt; tele.tremor=null
     for each alive unit (사제 포함): dealDamage(u, tremorDmg(130)*mul, 'tremor'); if result:return
  if tele.root and t>=tele.root.at:
     ti=tele.root.ti; nextRoot+=rootInt; tele.root=null
     if alive: root[ti]={left:rootDur(8), appliedAt:t}; metrics.rootApplied++; emit rootOn

rootTarget():                    # 결정론 로테이션
  pool = 살아있는 비탱커 아군, dps 내림차순
  pick = pool[rootRota % len]; rootRota++; return index
```

---

## 6. 사제 입력 처리

```
select(i): if units[i] exists: sel=i; emit select

use(slotIdx):
  sid = loadout[slotIdx]; S = skill(sid)
  거부 체크(순서대로, 실패 시 {ok:false, reason}):
    - 빈 슬롯 / 패시브 → 거부
    - cast 진행 중 → reason 'casting'
    - gcd>0 → reason 'gcd' (배지 없이 슬롯 플래시만, 소프트)
    - cd[sid]>0 → '재사용 대기 N초'
    - mana < S.cost → '마나가 부족합니다'
    - 대상 필요(ally/selfOnly)인데 대상 사망 → '대상이 쓰러져 있습니다'
    - shield 재적용(이미 활성) → '이미 보호막이 유지 중입니다'
    - cleanse인데 대상에 디버프 없음 → '제거할 디버프가 없습니다'
  통과 시:
    gcd = 1.0; castCount[sid]++
    if S.type=='cast': cast={sid,ti,left:S.cast}; emit castStart; return ok   # 마나는 완료 시
    else: mana -= S.cost; resolve(sid, ti); return ok                          # 즉시형은 지금 소비

cancelCast(): if cast: cast=null; metrics.cancels++; emit castCancel   # 마나 환원 불필요(아직 미소비)
```

기본 대상 규칙: `target=='ally'`는 `sel`(선택된 프레임), `selfOnly`(구원의 기도)는 항상 사제(index 0).

---

## 7. resolve(sid, ti) — 스킬 효과

```
if S.cd: cd[sid] = S.cd
quickheal: heal(ti, 400)
shield:    shield[ti] = {absorb:360, left:20}
cleanse:   if root[ti]: metrics.rootCleansed++; rootCleanseSum += (t - root[ti].appliedAt); delete root[ti]
salvation: amt = (priest.max - priest.hp)*0.75 + 100; heal(0, amt)
hot:       hot[ti] = {hps:40, left:12}
ring:      for each alive: heal(i, 160)
breath:    (패시브 — resolve 없음)
```

---

## 8. 피해/회복/사망 처리

```
dealDamage(i, amt, src):
  if dead or result: return
  if unit.tank: amt *= (1 - tankMit(0.30))       # 탱커 감쇄
  if shield[i]: absorbed=min(shield.absorb,amt); shield.absorb-=absorbed; amt-=absorbed
                metrics.absorbed+=absorbed; if shield.absorb<=0 delete(emit shieldBreak); emit absorb
  if amt>0: hp-=amt; metrics.dmgTaken+=amt; if isPriest metrics.priestTaken+=amt; emit dmg
  update minHp[i]
  if hp<=0:
     hp=0; alive=false; clear hot/root/shield[i]; metrics.deaths.push(...); lastFatal={...}; emit death
     if isPriest: finish('defeat'); return           # 사제 사망 = 즉시 패배
     if no allies alive: finish('defeat'); return     # 전멸
     if (was tank or src=='auto'): shift aggro to new target (emit aggroShift)

heal(i, amt, src):
  if dead: return
  applied = min(max-hp, amt); hp += applied
  if src=='totem': metrics.totemHealed += applied
  else: metrics.healed += applied; metrics.overheal += (amt-applied)
        if applied>0 and (hp-applied)/max < 0.15: metrics.clutch = true   # 위기의 손
  emit heal
```

---

## 9. 종료·집계 (finish)

```
finish(outcome):
  if result: return
  crisis = units where minHp<35%, sorted by pct asc, top3
  overhealPct = round(100 * overheal / (healed+overheal))
  cleanseAvg = rootCleansed ? rootCleanseSum/rootCleansed : null

  # 패배 원인 문장 (우선순위)
  if defeat:
     lf=lastFatal
     if lf.unit==0: cause="돌진동 피해를 사제가 회복 없이 받아 쓰러졌습니다."(+마나고갈 시각)
     elif lf.src=='smash': cause="{t}초 대지 강타를 보호막 없이 받았습니다."(+마나고갈이 선행했으면 복합)
     elif manaEmptyAt<lf.t: cause="후반 마나가 바닥나 치유가 끊겼습니다."
     elif lf.src=='root': cause="속박 정화가 늦어 {name}이(가) 추가 피해를 받았습니다."
     else: cause="회복량이 받은 피해를 따라가지 못했습니다."
  else: cause=null

  # 하이라이트 칩 (승리 시, 최대 3, 08 문서 규칙)
  chips = evaluate(전원생존/아슬아슬/보호막명중/위기의손/정화성공/마나장인)

  result = { outcome, report:{ duration, healed, overhealPct, totemHealed, absorbed,
             dmgTaken, priestTaken, manaEnd, manaEmptyAt, deaths[], smashTotal, smashShielded,
             rootApplied, rootCleansed, rootExpired, cleanseAvg, crisis, cause, advice, chips,
             party, loadout } }
  emit end
```

집계는 전투 중 metrics에 계속 누적 → finish에서 리포트 객체로 확정. UI는 이 객체만 소비(08 문서).

---

## 10. 이벤트 큐 (UI 결합 지점)

battle은 DOM을 모른다. 대신 `events[]`에 사건을 쌓고, UI가 프레임마다 splice하여 소비:
```
로그류: log
피해/회복: dmg, heal, absorb, shieldBreak
버프: shieldOn, hotOn, cleansed, salvation, ring, shieldFade, rootFade
전조: teleSmash, smash, teleTremor, tremor, rootOn
상태: aggroShift, push, death, castStart, castDone, castFizzle, castCancel, select, end
```
이 목록이 **battle과 HUD의 계약**이다. 재구현 시 이 이벤트명을 유지하면 HUD 코드가 그대로 붙는다.
