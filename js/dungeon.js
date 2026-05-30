/* =============================================
   DUNGEON.JS — 웨이브 던전 전체 로직
   ============================================= */

/* ── 타이밍 상수 ── */
const PLAYER_ATK_INTERVAL = 1000;  // ms
const MONSTER_ATK_INTERVAL = 1800; // ms
const INTER_WAVE_HEAL = 0.35;      // 웨이브 간 35% HP 회복
const ENRAGE_TRIGGER_HP_RATIO = 0.20;

const DUNGEON_ZONE_THEMES = [
  '임프',
  '골렘',
  '독충',
  '망령',
  '심연',
  '화염',
  '빙하',
  '번개',
  '암흑',
  '던전'
];

const DUNGEON_STATUS_DEFS = {
  poison: { label: '중독', durationMs: 10000, dotRatio: 0.015 },
  burn: { label: '화상', durationMs: 9000, dotRatio: 0.020 },
  weaken: { label: '약화', durationMs: 9000, outgoingMul: 0.82 },
  vulnerable: { label: '방어 붕괴', durationMs: 9000, incomingMul: 1.18 }
};

function buildZoneSkillBook(theme) {
  return {
    A: { key: 'A', name: `${theme} A1 강타`, damageMul: 1.0, statuses: [] },
    B1: { key: 'B1', name: `${theme} B1 분쇄`, damageMul: 1.15, statuses: [{ type: 'vulnerable', chance: 0.35 }] },
    B2: { key: 'B2', name: `${theme} B2 독무`, damageMul: 1.08, statuses: [{ type: 'poison', chance: 0.35 }] },
    C1: { key: 'C1', name: `${theme} C1 연속참`, damageMul: 1.22, statuses: [] },
    C2: { key: 'C2', name: `${theme} C2 화염인장`, damageMul: 1.14, statuses: [{ type: 'burn', chance: 0.40 }] },
    C3: { key: 'C3', name: `${theme} C3 절규`, damageMul: 1.12, statuses: [{ type: 'weaken', chance: 0.35 }] },
    D1: { key: 'D1', name: `${theme} D1 군주강타`, damageMul: 1.35, statuses: [{ type: 'vulnerable', chance: 0.55 }] },
    D2: { key: 'D2', name: `${theme} D2 군주독식`, damageMul: 1.28, statuses: [{ type: 'poison', chance: 0.55 }] },
    D3: { key: 'D3', name: `${theme} D3 군주화염`, damageMul: 1.30, statuses: [{ type: 'burn', chance: 0.55 }] },
    ENRAGE: { key: 'ENRAGE', name: `${theme} ENRAGE 광폭화`, damageMul: 1.55, statuses: [{ type: 'weaken', chance: 0.70 }] }
  };
}

const DUNGEON_ZONE_SKILL_BOOKS = DUNGEON_ZONE_THEMES.map(buildZoneSkillBook);

/* =============================================
   구간 정의 (ZONE_DEFS)
   ─ 10층마다 1구간, 구간당 몬스터 4종
     · mob1 : 1~3층
     · mob2 : 4~6층
     · mob3 : 7~9층
     · boss : 10층 (10배수)
   ─ bg    : 구간 전체 배경 이미지 (공통)
============================================= */
const ZONE_DEFS = [
  {
    name: '동굴 임프 구간',
    bg:   'images/dungeon/bg_zone1.png',
    monsters: [
      { name: '동굴 임프',     img: 'images/dungeon/zone1_mob1.png' },
      { name: '어둠 임프',     img: 'images/dungeon/zone1_mob2.png' },
      { name: '맹독 임프',     img: 'images/dungeon/zone1_mob3.png' },
      { name: '👑 임프 군주',  img: 'images/dungeon/zone1_boss.png' },
    ]
  },
  {
    name: '골렘 구간',
    bg:   'images/dungeon/bg_zone2.png',
    monsters: [
      { name: '돌 골렘',       img: 'images/dungeon/zone2_mob1.png' },
      { name: '철 골렘',       img: 'images/dungeon/zone2_mob2.png' },
      { name: '어둠의 골렘',   img: 'images/dungeon/zone2_mob3.png' },
      { name: '👑 골렘 군주',  img: 'images/dungeon/zone2_boss.png' },
    ]
  },
  {
    name: '독충 구간',
    bg:   'images/dungeon/bg_zone3.png',
    monsters: [
      { name: '독 벌레',       img: 'images/dungeon/zone3_mob1.png' },
      { name: '갑각 독충',     img: 'images/dungeon/zone3_mob2.png' },
      { name: '거대 독충',     img: 'images/dungeon/zone3_mob3.png' },
      { name: '👑 독충 여왕',  img: 'images/dungeon/zone3_boss.png' },
    ]
  },
  {
    name: '망령 구간',
    bg:   'images/dungeon/bg_zone4.png',
    monsters: [
      { name: '망령 병사',     img: 'images/dungeon/zone4_mob1.png' },
      { name: '망령 기사',     img: 'images/dungeon/zone4_mob2.png' },
      { name: '저주받은 망령', img: 'images/dungeon/zone4_mob3.png' },
      { name: '👑 망령 군주',  img: 'images/dungeon/zone4_boss.png' },
    ]
  },
  {
    name: '심연 구간',
    bg:   'images/dungeon/bg_zone5.png',
    monsters: [
      { name: '어비스 정찰자', img: 'images/dungeon/zone5_mob1.png' },
      { name: '어비스 전사',   img: 'images/dungeon/zone5_mob2.png' },
      { name: '어비스 군주',   img: 'images/dungeon/zone5_mob3.png' },
      { name: '👑 어비스 감시자', img: 'images/dungeon/zone5_boss.png' },
    ]
  },
  {
    name: '화염 구간',
    bg:   'images/dungeon/bg_zone6.png',
    monsters: [
      { name: '화염 임프',     img: 'images/dungeon/zone6_mob1.png' },
      { name: '화염 마귀',     img: 'images/dungeon/zone6_mob2.png' },
      { name: '불꽃 군주',     img: 'images/dungeon/zone6_mob3.png' },
      { name: '👑 화염 왕',    img: 'images/dungeon/zone6_boss.png' },
    ]
  },
  {
    name: '빙하 구간',
    bg:   'images/dungeon/bg_zone7.png',
    monsters: [
      { name: '빙하 정령',     img: 'images/dungeon/zone7_mob1.png' },
      { name: '서리 기사',     img: 'images/dungeon/zone7_mob2.png' },
      { name: '얼음 거인',     img: 'images/dungeon/zone7_mob3.png' },
      { name: '👑 서리 군주',  img: 'images/dungeon/zone7_boss.png' },
    ]
  },
  {
    name: '번개 구간',
    bg:   'images/dungeon/bg_zone8.png',
    monsters: [
      { name: '번개 정령',     img: 'images/dungeon/zone8_mob1.png' },
      { name: '폭풍 기사',     img: 'images/dungeon/zone8_mob2.png' },
      { name: '번개 마법사',   img: 'images/dungeon/zone8_mob3.png' },
      { name: '👑 뇌신',       img: 'images/dungeon/zone8_boss.png' },
    ]
  },
  {
    name: '암흑 구간',
    bg:   'images/dungeon/bg_zone9.png',
    monsters: [
      { name: '심연의 그림자', img: 'images/dungeon/zone9_mob1.png' },
      { name: '어둠의 포식자', img: 'images/dungeon/zone9_mob2.png' },
      { name: '공허의 군주',   img: 'images/dungeon/zone9_mob3.png' },
      { name: '👑 암흑 군주',  img: 'images/dungeon/zone9_boss.png' },
    ]
  },
  {
    name: '던전 군주 구간',
    bg:   'images/dungeon/bg_zone10.png',
    monsters: [
      { name: '던전 수호자',   img: 'images/dungeon/zone10_mob1.png' },
      { name: '던전 기사',     img: 'images/dungeon/zone10_mob2.png' },
      { name: '던전 마법사',   img: 'images/dungeon/zone10_mob3.png' },
      { name: '👑 던전 군주',  img: 'images/dungeon/zone10_boss.png' },
    ]
  },
];

/* 전체 층수 = 구간 수 × 10 */
const DUNGEON_WAVE_COUNT = ZONE_DEFS.length * 10;

/* ── 웨이브 정보 계산 ── */
function getWaveInfo(wave) {
  const zoneIdx    = Math.floor((wave - 1) / 10);          // 0-based 구간 번호
  const posInZone  = ((wave - 1) % 10) + 1;                // 구간 내 위치 (1~10)
  const isBoss     = (posInZone === 10);
  const zone       = ZONE_DEFS[Math.min(zoneIdx, ZONE_DEFS.length - 1)];

  // mob 인덱스: 1~3층→0, 4~6층→1, 7~9층→2, 10층→3(보스)
  const monsterIdx = isBoss ? 3 : Math.min(2, Math.floor((posInZone - 1) / 3));
  const monster    = zone.monsters[monsterIdx];

  // 스탯 스케일링 (구간마다 1.5배 성장)
  const zoneMul  = Math.pow(1.5, zoneIdx);
  const posMul   = isBoss ? 8.0 : (1.0 + (posInZone - 1) * 0.28);
  const hpMult   = Math.max(1, Math.round(8 * zoneMul * posMul));
  const dmgRatio = Math.min(0.30, 0.03 + zoneIdx * 0.015 + (isBoss ? 0.04 : 0));
  const goldMult = Math.max(1, Math.round((5 + zoneIdx * 8) * (isBoss ? 6 : 1)));

  return { zone, monster, isBoss, hpMult, dmgRatio, goldMult };
}

function clampZoneIndex(zoneIdx) {
  return Math.max(0, Math.min(zoneIdx, DUNGEON_ZONE_SKILL_BOOKS.length - 1));
}

function pickRandom(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx];
}

function getSkillPoolByPosInZone(posInZone, skillBook) {
  if (posInZone >= 1 && posInZone <= 3) return [skillBook.A];
  if (posInZone >= 4 && posInZone <= 6) return [skillBook.B1, skillBook.B2];
  if (posInZone >= 7 && posInZone <= 9) return [skillBook.C1, skillBook.C2, skillBook.C3];
  return [skillBook.D1, skillBook.D2, skillBook.D3];
}

function selectMonsterSkillForWave(wave, currentHp, maxHp) {
  const zoneIdx = clampZoneIndex(Math.floor((wave - 1) / 10));
  const posInZone = ((wave - 1) % 10) + 1;
  const skillBook = DUNGEON_ZONE_SKILL_BOOKS[zoneIdx];
  const pool = [...getSkillPoolByPosInZone(posInZone, skillBook)];

  if (posInZone === 10 && maxHp > 0 && currentHp / maxHp <= ENRAGE_TRIGGER_HP_RATIO) {
    pool.push(skillBook.ENRAGE);
  }

  return pickRandom(pool) || { key: 'BASIC', name: '기본 공격', damageMul: 1.0, statuses: [] };
}

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
let dungeonStatusEffects = {};
let dungeonSkillFxTimer = null;

const dungeonFieldEl = document.getElementById('dungeon-field');
const dungeonMonsterAreaEl = document.getElementById('d-monster-area');
const dungeonSkillFxTextEl = document.createElement('div');
dungeonSkillFxTextEl.className = 'd-skill-fx-text';
if (dungeonMonsterAreaEl) {
  dungeonMonsterAreaEl.appendChild(dungeonSkillFxTextEl);
}

/* ── 포맷 ── */
function dfmt(n) {
  return (typeof fmtNum === 'function') ? fmtNum(n) : Number(n).toLocaleString('ko-KR');
}

function resetDungeonStatusEffects() {
  dungeonStatusEffects = {};
}

function cleanupDungeonStatusEffects() {
  const now = Date.now();
  Object.keys(dungeonStatusEffects).forEach((type) => {
    const expiresAt = Number(dungeonStatusEffects[type]) || 0;
    if (expiresAt <= now) {
      delete dungeonStatusEffects[type];
    }
  });
}

function hasDungeonStatus(type) {
  cleanupDungeonStatusEffects();
  const expiresAt = Number(dungeonStatusEffects[type]) || 0;
  return expiresAt > Date.now();
}

function applyDungeonStatus(type, durationMs) {
  if (!DUNGEON_STATUS_DEFS[type]) return false;
  const safeDurationMs = Math.max(0, Math.floor(Number(durationMs) || 0));
  if (safeDurationMs <= 0) return false;

  const now = Date.now();
  const nextUntil = now + safeDurationMs;
  const currentUntil = Number(dungeonStatusEffects[type]) || 0;
  dungeonStatusEffects[type] = Math.max(currentUntil, nextUntil);
  return true;
}

function getPlayerIncomingStatusMul() {
  let mult = 1;
  if (hasDungeonStatus('vulnerable')) {
    mult *= Number(DUNGEON_STATUS_DEFS.vulnerable.incomingMul) || 1;
  }
  return Math.max(0.01, mult);
}

function getPlayerOutgoingStatusMul() {
  let mult = 1;
  if (hasDungeonStatus('weaken')) {
    mult *= Number(DUNGEON_STATUS_DEFS.weaken.outgoingMul) || 1;
  }
  return Math.max(0.01, mult);
}

function applyDungeonDotDamage() {
  let totalDot = 0;
  const labels = [];

  ['poison', 'burn'].forEach((type) => {
    if (!hasDungeonStatus(type)) return;
    const def = DUNGEON_STATUS_DEFS[type];
    const dotRatio = Math.max(0, Number(def.dotRatio) || 0);
    const dotDamage = Math.max(1, Math.floor(playerMaxHp * dotRatio));
    totalDot += dotDamage;
    labels.push(`${def.label} -${dfmt(dotDamage)}`);
  });

  if (totalDot > 0) {
    playerHp -= totalDot;
  }

  return { totalDot, labels };
}

function tryApplySkillStatuses(skill) {
  const applied = [];
  const entries = Array.isArray(skill?.statuses) ? skill.statuses : [];

  entries.forEach((entry) => {
    const type = entry.type;
    const def = DUNGEON_STATUS_DEFS[type];
    if (!def) return;

    const chance = Math.max(0, Math.min(1, Number(entry.chance) || 0));
    if (Math.random() >= chance) return;

    if (applyDungeonStatus(type, def.durationMs)) {
      applied.push(def.label);
    }
  });

  return applied;
}

/* ── UI 요소 ── */
function el(id) { return document.getElementById(id); }

function getDungeonSkillFxClass(skill) {
  const key = String(skill?.key || '');
  const statuses = Array.isArray(skill?.statuses) ? skill.statuses : [];
  const statusTypes = statuses.map((entry) => entry.type);

  if (key === 'ENRAGE') return 'd-skill-fx-enrage';
  if (statusTypes.includes('poison')) return 'd-skill-fx-poison';
  if (statusTypes.includes('burn')) return 'd-skill-fx-burn';
  if (statusTypes.includes('vulnerable')) return 'd-skill-fx-heavy';
  if (statusTypes.includes('weaken')) return 'd-skill-fx-heavy';
  if ((Number(skill?.damageMul) || 1) >= 1.4) return 'd-skill-fx-heavy';
  return 'd-skill-fx-basic';
}

function clearDungeonSkillEffectVisual() {
  if (dungeonFieldEl) {
    dungeonFieldEl.classList.remove(
      'd-skill-fx-active',
      'd-skill-fx-basic',
      'd-skill-fx-heavy',
      'd-skill-fx-poison',
      'd-skill-fx-burn',
      'd-skill-fx-enrage'
    );
  }

  const monsterImg = el('d-monster-img');
  if (monsterImg) {
    monsterImg.classList.remove('d-monster-img--skill-strike');
  }

  dungeonSkillFxTextEl.classList.remove('show');
  dungeonSkillFxTextEl.textContent = '';

  if (dungeonSkillFxTimer) {
    clearTimeout(dungeonSkillFxTimer);
    dungeonSkillFxTimer = null;
  }
}

function playDungeonSkillEffect(skill) {
  if (!skill || !dungeonFieldEl) return;

  clearDungeonSkillEffectVisual();

  const visualClass = getDungeonSkillFxClass(skill);
  dungeonFieldEl.classList.add('d-skill-fx-active', visualClass);

  const monsterImg = el('d-monster-img');
  if (monsterImg) {
    monsterImg.classList.add('d-monster-img--skill-strike');
  }

  dungeonSkillFxTextEl.textContent = `⚠ ${skill.name || '특수 기술'}`;
  void dungeonSkillFxTextEl.offsetWidth;
  dungeonSkillFxTextEl.classList.add('show');

  dungeonSkillFxTimer = setTimeout(() => {
    clearDungeonSkillEffectVisual();
  }, 700);
}

function showPanel(id) {
  const isBattle = (id === 'd-battle-screen');

  // 전투 레이아웃 (몬스터 영역 + UI)
  el('d-battle-layout').style.display = isBattle ? 'flex' : 'none';

  // 비전투 패널들
  ['d-start-screen', 'd-wave-clear-screen', 'd-fail-screen', 'd-complete-screen']
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
  if (currentWave > 0) {
    const zoneIdx = Math.floor((currentWave - 1) / 10) + 1;
    el('d-wave-badge').textContent = `구간 ${zoneIdx}  |  WAVE ${currentWave} / ${DUNGEON_WAVE_COUNT}`;
  } else {
    el('d-wave-badge').textContent = `WAVE 0 / ${DUNGEON_WAVE_COUNT}`;
  }
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
  resetDungeonStatusEffects();
  clearDungeonSkillEffectVisual();

  updatePlayerHpBar();
  dungeonUpdatePotionUI();
  nextWave();
}

/* ── 다음 웨이브 ── */
function nextWave() {
  clearTimers();
  currentWave++;
  updateWaveBadge();
  resetDungeonStatusEffects();
  clearDungeonSkillEffectVisual();

  const info = getWaveInfo(currentWave);
  monsterMaxHp = Math.max(1, Math.floor(playerDmg * info.hpMult));
  monsterHp    = monsterMaxHp;
  monsterDmg   = Math.max(1, Math.floor(playerMaxHp * info.dmgRatio));

  el('d-monster-name').textContent = `[${currentWave}층] ${info.monster.name}`;
  el('d-log').textContent = '전투 시작!';

  // 몬스터 이미지 + 배경 교체
  const monsterImg = el('d-monster-img');
  monsterImg.src = info.monster.img;
  monsterImg.classList.remove('d-monster-img--hit');
  monsterImg.classList.remove('d-monster-img--skill-strike');
  el('d-bg-img').src = info.zone.bg;

  updateMonsterHpBar();
  showPanel('d-battle-screen');

  // 자동 공격 인터벌
  atkTimer = setInterval(playerAttack, PLAYER_ATK_INTERVAL);
  monsterAtkTimer = setInterval(monsterAttack, MONSTER_ATK_INTERVAL);
}

/* ── 플레이어 공격 ── */
function playerAttack() {
  if (!dungeonActive) return;

  const outgoingMul = getPlayerOutgoingStatusMul();
  const finalPlayerDamage = Math.max(1, Math.floor(playerDmg * outgoingMul));
  monsterHp -= finalPlayerDamage;
  const weakened = hasDungeonStatus('weaken');
  el('d-log').textContent = weakened
    ? `⚔ ${dfmt(finalPlayerDamage)} 피해! (약화)`
    : `⚔ ${dfmt(finalPlayerDamage)} 피해!`;
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

  const skill = selectMonsterSkillForWave(currentWave, monsterHp, monsterMaxHp);
  playDungeonSkillEffect(skill);
  const dotResult = applyDungeonDotDamage();
  if (playerHp <= 0) {
    playerHp = 0;
    updatePlayerHpBar();
    dungeonFail();
    return;
  }

  const incomingMul = getPlayerIncomingStatusMul();
  const finalMonsterDamage = Math.max(
    1,
    Math.floor(monsterDmg * (Number(skill.damageMul) || 1) * incomingMul)
  );
  playerHp -= finalMonsterDamage;
  const appliedStatuses = tryApplySkillStatuses(skill);

  const logs = [`💥 ${skill.name} -${dfmt(finalMonsterDamage)} HP`];
  if (dotResult.labels.length > 0) {
    logs.push(`지속피해: ${dotResult.labels.join(', ')}`);
  }
  if (appliedStatuses.length > 0) {
    logs.push(`상태이상: ${appliedStatuses.join(', ')}`);
  }
  el('d-log').textContent = logs.join(' | ');
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
  clearDungeonSkillEffectVisual();

  // 골드 지급
  const goldBase = GameData.level * getWaveInfo(currentWave).goldMult;
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
  clearDungeonSkillEffectVisual();
  syncHpToGameData();

  el('d-fail-info').innerHTML =
    `${currentWave - 1}층까지 클리어<br>💰 총 ${dfmt(totalGoldEarned)} 골드 획득`;
  showPanel('d-fail-screen');
}

/* ── 완전 클리어 ── */
function dungeonComplete() {
  clearDungeonSkillEffectVisual();
  el('d-complete-info').innerHTML =
    `모든 ${DUNGEON_WAVE_COUNT}층 정복!<br>💰 총 ${dfmt(totalGoldEarned)} 골드 획득`;
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
  dungeonActive = false;
  currentWave = 0;
  updateWaveBadge();
  updateBestWaveDisplay();
});

document.getElementById('d-done-btn').addEventListener('click', function () {
  showPanel('d-start-screen');
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
