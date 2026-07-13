// Seed Healer — dev/finalLockHotfixCheck.js (Final Lock Hotfix 02)
// 이번 카드 전용 검증: node src/dev/finalLockHotfixCheck.js
// 범위(정적): A ARIA 우측 미세 이동(전사-법사 사이·하단 후방 유지·FX 원점 자동 추적) · B 핵심 자산 preload(비차단·실패허용).
// ★게임 기능/밸런스/보스·스킬 수치/은총 계약 무변경 · canonical 무접촉(회귀 스위트가 md5 검증).

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

// ══════════════════════════════════════════════════════════════
// A. ARIA 우측 미세 이동
// ══════════════════════════════════════════════════════════════
check('A1 ARIA 우측 이동(left 63%) + 하단 후방 유지(bottom 2%) + translateX(-50%) 보존',
  /\.bf-aria\{left:63%;bottom:2%;transform:translateX\(-50%\)\}/.test(html));
check('A2 ARIA 발밑 온기 링(bf-heal-ring)이 새 위치(left 63%) 따라감',
  /\.bf-heal-ring\{position:absolute;left:63%;bottom:2%/.test(html));
check('A3 지원 FX 원점 자동 추적 — supportSpark가 actorEls[0](ARIA) bounding rect 실시간 계산',
  /function supportSpark\(targetIdx\)\{[\s\S]{0,200}actorEls\[0\][\s\S]{0,200}getBoundingClientRect\(\)/.test(html));
check('A4 cast-pulse/cast-ring 원점 = ARIA(actorEls[0]·위치 무관 filter) 유지',
  /pulseActor\(0, 'cast-pulse'/.test(html) && /pulseActor\(0, 'cast-ring'/.test(html));
check('A5 머리 위 행동명/스킬 마크 = actorEls[idx] 종속(위치 자동 추적)',
  /function actionPop\(actorIdx, text, cls\)\{[\s\S]{0,160}actorEls\[actorIdx\]/.test(html) &&
  /function skillMark\(idx, cls, ms\)\{[\s\S]{0,80}actorEls\[idx\]/.test(html));
check('A6 actor id/파티 무변경(act-0 = ARIA · PARTY = DEFAULT_PARTY)',
  /id="act-0"/.test(html) && /const PARTY = DEFAULT_PARTY\.slice\(0,3\)/.test(html));
check('A7 전장 구도 유지(전사 중앙 bf-ally-c bottom 19% · 도적 좌 · 법사 우)',
  /\.bf-ally-c\{left:50%;bottom:19%/.test(html) && /\.bf-ally-l\{left:3\.5%/.test(html) && /\.bf-ally-r\{right:3\.5%/.test(html));

// ══════════════════════════════════════════════════════════════
// B. 핵심 자산 preload / decode
// ══════════════════════════════════════════════════════════════
check('B1 preloadCoreAssets 함수 존재', /function preloadCoreAssets\(\)\{/.test(html));
check('B2 Image()+decode()+Promise.allSettled(비차단·병렬)',
  /new Image\(\)/.test(html) && /img\.decode/.test(html) && /Promise\.allSettled\(/.test(html));
check('B3 master/source/미사용 대형 원본 제외 필터',
  /!\/\\\/source\\\/\|_intake\|MAGENTA\|MASTER\|POSESHEET\/i\.test\(v\)/.test(html));
check('B4 매니페스트 = 연결된 런타임만(ASSETS ui/boss/icons/priest + HERO crops + BOSS_PROBES idle + skillPool iconImg)',
  /walk\(ASSETS\.ui/.test(html) && /walk\(ASSETS\.boss/.test(html) && /walk\(ASSETS\.icons/.test(html) &&
  /HERO_V002\[k\][\s\S]{0,20}\.crops/.test(html) && /BOSS_PROBES\[b\]/.test(html) && /s\.iconImg/.test(html));
check('B5 비차단 시작(requestIdleCallback 조기 + setTimeout backstop 항상 발동·중복 가드·게임 대기 안 함)',
  /if \(window\.requestIdleCallback\) requestIdleCallback\(__startPreload, \{ timeout: 1000 \}\)/.test(html) &&
  /setTimeout\(__startPreload, 800\)/.test(html) && /if \(__preloadStarted\) return; __preloadStarted = true/.test(html));
check('B6 실패 허용/게임 정상(try-catch + per-image .catch)',
  /function preloadCoreAssets\(\)\{\s*try \{/.test(html) && /\.catch\(\(\) => \{\}\)/.test(html));
check('B7 "모든 파일" preload 금지 — 확장자 필터(이미지 only)', /\\\.\(png\|jpe\?g\|webp\)\$/.test(html));
check('B8 외부 네트워크 의존 0(preload가 http(s) 원격 URL 추가 안 함)',
  !/new Image[\s\S]{0,200}https?:\/\//.test(html));

// ══════════════════════════════════════════════════════════════
// C. 보호(무변경)
// ══════════════════════════════════════════════════════════════
check('C1 battle.js 순수 로직(preload/aria/DOM 토큰 0)',
  !/preloadCoreAssets|bf-aria|requestIdleCallback|new Image|decode\(/.test(battleSrc));
check('C2 위협 대기열·토스트·은총 아이콘 렌더·모바일핏 유지(threat-queue·combat-toast·skillIcon iconImg·전사 중앙)',
  /id="threat-queue"/.test(html) && /id="combat-toast"/.test(html) &&
  /S\.iconImg[\s\S]{0,60}src="\$\{S\.iconImg\}"/.test(html) &&
  /const slotCls = \['bf-ally-c','bf-ally-l flip','bf-ally-r'\]/.test(html));

console.log(`\n=== final lock hotfix: ${pass} PASS / ${fail} FAIL ${fail === 0 ? '— ALL PASS' : ''} ===`);
if (fail > 0) process.exitCode = 1;
