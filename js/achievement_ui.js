const huntList = document.getElementById('hunt-achievement-list');
const goldList = document.getElementById('gold-achievement-list');
const upgradeList = document.getElementById('upgrade-achievement-list');
const codexList = document.getElementById('codex-achievement-list');
const achievementSummary = document.getElementById('achievement-summary');

function toSafeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, Math.floor(num)) : 0;
}

function formatNumber(value) {
  return toSafeNumber(value).toLocaleString('ko-KR');
}

function getDoneCount(list) {
  return list.reduce((sum, ach) => sum + (Achievement.unlocked[ach.id] ? 1 : 0), 0);
}

function makeCard(title, done) {
  const card = document.createElement('div');
  card.className = `ach-card${done ? ' done' : ''}`;

  const titleEl = document.createElement('div');
  titleEl.className = 'ach-title';
  titleEl.innerText = done ? `${title} ✅` : title;
  card.appendChild(titleEl);

  return card;
}

function addLine(card, text, subtle = false) {
  const line = document.createElement('div');
  line.className = `ach-progress${subtle ? ' subtle' : ''}`;
  line.innerText = text;
  card.appendChild(line);
}

function renderHunt(list) {
  huntList.innerHTML = '';
  list.forEach((ach) => {
    const done = Boolean(Achievement.unlocked[ach.id]);
    const card = makeCard(ach.title, done);

    const target = toSafeNumber(ach.target);
    ach.monsters.forEach(([monsterId, monsterName]) => {
      const kills = toSafeNumber(GameData.killStats?.[monsterId]);
      const left = Math.max(0, target - kills);
      addLine(card, `${monsterName}: ${left === 0 ? '완료' : `${formatNumber(left)}마리 남음`}`);
    });

    huntList.appendChild(card);
  });
}

function renderGold(list) {
  goldList.innerHTML = '';
  list.forEach((ach) => {
    const done = Boolean(Achievement.unlocked[ach.id]);
    const card = makeCard(ach.title, done);

    const left = Math.max(0, toSafeNumber(ach.target) - toSafeNumber(GameData.totalGold));
    addLine(card, left === 0 ? '완료' : `${formatNumber(left)} 골드 남음`);

    goldList.appendChild(card);
  });
}

function renderUpgrade(list) {
  upgradeList.innerHTML = '';
  list.forEach((ach) => {
    const done = Boolean(Achievement.unlocked[ach.id]);
    const card = makeCard(ach.title, done);

    const left = Math.max(0, toSafeNumber(ach.target) - toSafeNumber(GameData.level));
    if (left === 0) {
      addLine(card, '완료');
    } else if (toSafeNumber(ach.target) >= 1e12) {
      addLine(card, `${formatNumber(left)} 강화 수치 남음`);
    } else {
      addLine(card, `+${formatNumber(left)}강 남음`);
    }

    if (ach.desc) {
      addLine(card, ach.desc, true);
    }

    upgradeList.appendChild(card);
  });
}

function renderCodex(list) {
  codexList.innerHTML = '';

  const allMonsterIds = Array.isArray(Achievement.allMonsterIds) ? Achievement.allMonsterIds : [];
  const totalMonsters = allMonsterIds.length;

  list.forEach((ach) => {
    const done = Boolean(Achievement.unlocked[ach.id]);
    const card = makeCard(ach.title, done);

    const requiredKills = toSafeNumber(ach.allMonsterMinKills);
    const satisfied = allMonsterIds.reduce((sum, monsterId) => {
      return sum + (toSafeNumber(GameData.killStats?.[monsterId]) >= requiredKills ? 1 : 0);
    }, 0);

    const left = Math.max(0, totalMonsters - satisfied);
    addLine(card, `조건: 모든 몬스터 ${formatNumber(requiredKills)}회 이상`);
    addLine(card, `진행도: ${formatNumber(satisfied)} / ${formatNumber(totalMonsters)}`);
    addLine(card, left === 0 ? '완료' : `${formatNumber(left)}종 남음`);

    if (ach.desc) {
      addLine(card, ach.desc, true);
    }

    codexList.appendChild(card);
  });
}

function renderSummary(allAchievements) {
  const done = getDoneCount(allAchievements);
  achievementSummary.innerText = `달성 ${formatNumber(done)} / ${formatNumber(allAchievements.length)}`;
}

function renderAllAchievements() {
  Achievement.checkAll();

  const all = Array.isArray(Achievement.list) ? Achievement.list : [];
  const huntAchievements = all.filter((ach) => ach.category === 'hunt');
  const goldAchievements = all.filter((ach) => ach.category === 'gold');
  const upgradeAchievements = all.filter((ach) => ach.category === 'upgrade');
  const codexAchievements = all.filter((ach) => ach.category === 'codex');

  renderHunt(huntAchievements);
  renderGold(goldAchievements);
  renderUpgrade(upgradeAchievements);
  renderCodex(codexAchievements);
  renderSummary(all);
}

renderAllAchievements();
