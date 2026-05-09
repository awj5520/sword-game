/* =============================================
   DUNGEON.JS — 웨이브 던전 전체 로직
   ============================================= */

/* ── 상수 ── */
const DUNGEON_WAVE_COUNT = 10;
const PLAYER_ATK_INTERVAL = 1500;  // ms
const MONSTER_ATK_INTERVAL = 2500; // ms
const INTER_WAVE_HEAL = 0.35;      // 35% HP 회복

const WAVE_HP_MULTS   = [8, 12, 17, 23, 50, 28, 37, 47, 60, 130];
const WAVE_DMG_RATIOS = [0.03, 0.04, 0.05, 0.06, 0.09, 0.06, 0.07, 0.09, 0.11, 0.14];
const WAVE_GOLD_MULTS = [5, 8, 12, 16, 35, 20, 26, 34, 44, 90];
const WAVE_NAMES = [
  '동굴 임프', '어둠의 골렘', '독충 군집', '망령 기사', '👑 어비스 감시자',
  '화염 마귀', '얼음 거인', '번개 정령', '심연의 그림자', '👑 던전 군주'
];

/* ── 웨이브별 몬스터 이미지 경로 (1~10) ── */
const WAVE_MONSTER_IMGS = [
  'images/dungeon/monster_1.png',   // 1층  동굴 임프
  'images/dungeon/monster_2.png',   // 2층  어둠의 골렘
  'images/dungeon/monster_3.png',   // 3층  독충 군집
  'images/dungeon/monster_4.png',   // 4층  망령 기사
  'images/dungeon/monster_5.png',   // 5층  어비스 감시자 (중간 보스)
  'images/dungeon/monster_6.png',   // 6층  화염 마귀
  'images/dungeon/monster_7.png',   // 7층  얼음 거인
  'images/dungeon/monster_8.png',   // 8층  번개 정령
  'images/dungeon/monster_9.png',   // 9층  심연의 그림자
  'images/dungeon/monster_10.png',  // 10층 던전 군주 (최종 보스)
];

/* ── 로컬 상태 ── */
let dungeonActive = false;
let currentWave = 0;
let monsterMaxHp = 0;
let monsterHp = 0;
let monsterDmg = 0;
let playerHp = 0;
let playerMaxHp = 0;
let playerDmg = 0;
let atkTimer = null;
let monsterAtkTimer = null;
let totalGoldEarned = 0;

/* ── 포맷 ── */
function dfmt(n) {
  return (typeof fmtNum === 'function') ? fmtNum(n) : Number(n).toLocaleString('ko-KR');
}

/* ── UI 요소 ── */
function el(id) { return document.getElementById(id); }

function showPanel(id) {
  ['d-start-screen', 'd-battle-screen', 'd-wave-clear-screen', 'd-fail-screen', 'd-complete-screen']
    .forEach(p => { el(p).style.display = p === id ? '' : 'none'; });
}

/* ── 플레이어 HP 바 갱신 ── */
function updatePlayerHpBar() {
  const pct = playerMaxHp > 0 ? Math.max(0, playerHp / playerMaxHp) : 0;
  const fill = el('d-hp-fill');
  fill.style.width = (pct * 100).toFixed(1) + '%';

  // 색상: 빨강 → 노랑 → 초록
  if (pct > 0.5) {
    fill.style.background = 'var(--px-green)';
  } else if (pct > 0.25) {
    fill.style.background = 'var(--px-gold)';
  } else {
    fill.style.background = 'var(--px-red)';
  }

  el('d-hp-text').textContent = `${dfmt(Math.max(0, Math.ceil(playerHp)))} / ${dfmt(playerMaxHp)}`;
}

/* ── 몬스터 HP 바 갱신 ── */
function updateMonsterHpBar() {
  const pct = monsterMaxHp > 0 ? Math.max(0, monsterHp / monsterMaxHp) : 0;
  el('d-monster-hp-fill').style.width = (pct * 100).toFixed(1) + '%';
  el('d-monster-hp-text').textContent = `${dfmt(Math.max(0, Math.ceil(monsterHp)))} / ${dfmt(monsterMaxHp)}`;
}

/* ── 포션 UI 갱신 ── */
function dungeonUpdatePotionUI() {
  el('dp-small').textContent  = 'x' + (GameData.hpPotionSmall  || 0);
  el('dp-medium').textContent = 'x' + (GameData.hpPotionMedium || 0);
  el('dp-large').textContent  = 'x' + (GameData.hpPotionLarge  || 0);
}

/* ── 배지 갱신 ── */
function updateWaveBadge() {
  el('d-wave-badge').textContent = `WAVE ${currentWave} / ${DUNGEON_WAVE_COUNT}`;
}

/* ── 베스트 웨이브 ── */
function getBestWave() {
  return Number(localStorage.getItem('dungeonBestWave')) || 0;
}

function saveBestWave(wave) {
  const best = getBestWave();
  if (wave > best) {
    localStorage.setItem('dungeonBestWave', wave);
  }
}

/* ── 인터벌 정지 ── */
function clearTimers() {
  if (atkTimer)        { clearInterval(atkTimer);        atkTimer = null; }
  if (monsterAtkTimer) { clearInterval(monsterAtkTimer); monsterAtkTimer = null; }
}

/* ── 던전 시작 ── */
function startDungeon() {
  playerDmg    = GameData.getCurrentDamage();
  playerMaxHp  = GameData.getEffectiveMaxHp();
  playerHp     = Math.max(1, Math.min(GameData.currentHp, playerMaxHp));
  totalGoldEarned = 0;
  currentWave  = 0;
  dungeonActive = true;

  updatePlayerHpBar();
  dungeonUpdatePotionUI();
  nextWave();
}

/* ── 다음 웨이브 ── */
function nextWave() {
  clearTimers();
  currentWave++;
  updateWaveBadge();

  const wi = currentWave - 1; // 0-based index
  monsterMaxHp = Math.max(1, Math.floor(playerDmg * WAVE_HP_MULTS[wi]));
  monsterHp    = monsterMaxHp;
  monsterDmg   = Math.max(1, Math.floor(playerMaxHp * WAVE_DMG_RATIOS[wi]));

  el('d-monster-name').textContent = `[${currentWave}층] ${WAVE_NAMES[wi]}`;
  el('d-log').textContent = '전투 시작!';

  // 몬스터 이미지 교체
  const monsterImg = el('d-monster-img');
  monsterImg.src = WAVE_MONSTER_IMGS[wi];
  monsterImg.classList.remove('d-monster-img--hit');

  // 배경 이미지 표시
  el('d-bg-wrap').style.display = '';

  updateMonsterHpBar();
  showPanel('d-battle-screen');

  // 자동 공격 인터벌
  atkTimer = setInterval(playerAttack, PLAYER_ATK_INTERVAL);
  monsterAtkTimer = setInterval(monsterAttack, MONSTER_ATK_INTERVAL);
}

/* ── 플레이어 공격 ── */
function playerAttack() {
  if (!dungeonActive) return;

  monsterHp -= playerDmg;
  el('d-log').textContent = `⚔ ${dfmt(playerDmg)} 피해!`;
  updateMonsterHpBar();

  // 몬스터 피격 모션
  const img = el('d-monster-img');
  img.classList.remove('d-monster-img--hit');
  void img.offsetWidth; // reflow
  img.classList.add('d-monster-img--hit');

  if (monsterHp <= 0) {
    monsterHp = 0;
    waveCleared();
  }
}

/* ── 몬스터 공격 ── */
function monsterAttack() {
  if (!dungeonActive) return;

  playerHp -= monsterDmg;
  el('d-log').textContent = `💥 몬스터가 ${dfmt(monsterDmg)} 피해!`;
  updatePlayerHpBar();

  if (playerHp <= 0) {
    playerHp = 0;
    updatePlayerHpBar();
    dungeonFail();
  }
}

/* ── 웨이브 클리어 ── */
function waveCleared() {
  clearTimers();
  dungeonActive = false;

  // 골드 지급
  const wi = currentWave - 1;
  const goldBase = GameData.level * WAVE_GOLD_MULTS[wi];
  const earned = GameData.earnGold(goldBase);
  totalGoldEarned += earned;
  GameData.save();

  // 퀘스트 훅
  if (window.DailyQuest) DailyQuest.trackDungeonWave(currentWave);

  // 베스트 저장
  saveBestWave(currentWave);

  if (currentWave >= DUNGEON_WAVE_COUNT) {
    // 완전 클리어
    syncHpToGameData();
    dungeonComplete();
    return;
  }

  // 웨이브 간 HP 회복
  const healAmt = Math.floor(playerMaxHp * INTER_WAVE_HEAL);
  playerHp = Math.min(playerMaxHp, playerHp + healAmt);
  updatePlayerHpBar();

  // 클리어 화면
  el('d-clear-title').textContent = `${currentWave}층 클리어!`;
  el('d-clear-reward').textContent = `💰 +${dfmt(earned)} 골드 획득`;
  el('d-heal-info').textContent = `❤ HP +${dfmt(healAmt)} 회복`;
  showPanel('d-wave-clear-screen');
}

/* ── 다음 웨이브 버튼 ── */
function goNextWave() {
  dungeonActive = true;
  nextWave();
}

/* ── 던전 실패 ── */
function dungeonFail() {
  clearTimers();
  dungeonActive = false;
  syncHpToGameData();

  el('d-fail-info').innerHTML =
    `${currentWave - 1}층까지 클리어<br>💰 총 ${dfmt(totalGoldEarned)} 골드 획득`;
  showPanel('d-fail-screen');
}

/* ── 완전 클리어 ── */
function dungeonComplete() {
  el('d-complete-info').innerHTML =
    `모든 ${DUNGEON_WAVE_COUNT}층 클리어!<br>💰 총 ${dfmt(totalGoldEarned)} 골드 획득`;
  showPanel('d-complete-screen');
}

/* ── HP 동기화 ── */
function syncHpToGameData() {
  GameData.currentHp = Math.max(0, Math.ceil(playerHp));
  GameData.save();
}

/* ── 포션 사용 ── */
function dungeonUsePotion(size) {
  if (!dungeonActive) return;

  let healAmt = 0;
  if (size === 'small') {
    if (!GameData.hpPotionSmall) return;
    GameData.hpPotionSmall--;
    healAmt = Math.floor(playerMaxHp * 0.25);
  } else if (size === 'medium') {
    if (!GameData.hpPotionMedium) return;
    GameData.hpPotionMedium--;
    healAmt = Math.floor(playerMaxHp * 0.50);
  } else if (size === 'large') {
    if (!GameData.hpPotionLarge) return;
    GameData.hpPotionLarge--;
    healAmt = playerMaxHp; // 풀충
  }

  playerHp = Math.min(playerMaxHp, playerHp + healAmt);
  updatePlayerHpBar();
  GameData.save();
  dungeonUpdatePotionUI();

  el('d-log').textContent = `🧪 HP +${dfmt(healAmt)} 회복!`;
}

/* ── 이벤트 바인딩 ── */
document.getElementById('d-start-btn').addEventListener('click', startDungeon);

document.getElementById('d-manual-attack').addEventListener('click', function () {
  if (!dungeonActive) return;
  playerAttack();
  // 자동 공격 타이머 리셋
  if (atkTimer) {
    clearInterval(atkTimer);
    atkTimer = setInterval(playerAttack, PLAYER_ATK_INTERVAL);
  }
});

document.getElementById('d-next-wave-btn').addEventListener('click', goNextWave);

document.getElementById('d-retry-btn').addEventListener('click', function () {
  showPanel('d-start-screen');
  el('d-bg-wrap').style.display = 'none';
  dungeonActive = false;
  currentWave = 0;
  updateWaveBadge();
  updateBestWaveDisplay();
});

document.getElementById('d-done-btn').addEventListener('click', function () {
  showPanel('d-start-screen');
  el('d-bg-wrap').style.display = 'none';
  dungeonActive = false;
  currentWave = 0;
  updateWaveBadge();
  updateBestWaveDisplay();
});

/* ── 베스트 표시 ── */
function updateBestWaveDisplay() {
  const best = getBestWave();
  el('d-best-wave').textContent = best > 0 ? `최고 기록: ${best}층` : '';
}

/* ── 초기화 ── */
dungeonUpdatePotionUI();
updateBestWaveDisplay();
