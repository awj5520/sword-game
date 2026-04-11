const battleGrid = document.getElementById('battle-stats-grid');
const profileGrid = document.getElementById('profile-stats-grid');
const monsterKillListEl = document.getElementById('monster-kill-list');
const updatedAtEl = document.getElementById('stats-updated-at');

const BATTLE_DEFAULTS = {
  totalBattles: 0,
  totalBattleSeconds: 0,
  monsterKillCount: 0,
  damageTakenTotal: 0,
  damageTakenByHit: 0,
  damageTakenByDot: 0,
  monsterHitCount: 0,
  dotHitCount: 0,
  statusAppliedCount: 0,
  statusBlockedCount: 0,
  antidoteUsedCount: 0,
  playerAttackAttempts: 0,
  playerAttackHits: 0,
  playerAttackMisses: 0,
  playerAttackBlockedByTimeStop: 0
};

const MONSTER_KILL_LABELS = {
  slime: '슬라임',
  slime_helmet: '투구 슬라임',
  slime_warrior: '전사 슬라임',
  slime_rage: '광폭화 슬라임',
  slime_king: '슬라임 왕',

  orc_1: '풋내기 오크',
  orc_2: '전사 오크',
  orc_3: '광전사 오크',
  orc_4: '주술사 오크',
  orc_king: '오크 족장',

  dragon_1: '새끼 드레이크',
  dragon_2: '불꽃 드레이크',
  dragon_3: '비늘 와이번',
  dragon_4: '다크 드래곤',
  dragon_king: '골드 드래곤',

  space_slime: '갤럭시 슬라임',
  space_orc: '갤럭시 오크',
  space_dragon: '갤럭시 드래곤',

  bat_1: '동굴 박쥐',
  bat_2: '어둠 박쥐',
  bat_3: '흡혈 박쥐',
  bat_4: '광폭 박쥐',
  bat_king: '박쥐 군주',

  skeleton_1: '해골 병사',
  skeleton_2: '해골 궁수',
  skeleton_3: '해골 기사',
  skeleton_4: '저주받은 해골',
  skeleton_king: '해골 군주',

  demon_1: '악마 하수인',
  demon_2: '악마 기사',
  demon_3: '지옥 마법사',
  demon_4: '타락한 군주',
  demon_king: '마왕',

  sin_greed: '탐욕의 망령',
  sin_envy: '질투의 망령',
  sin_god: '분노의 신',

  w3_atlantis_1: '산호 슬라임',
  w3_atlantis_2: '심해 해마 기사',
  w3_atlantis_3: '잠수꾼 망령',
  w3_atlantis_4: '크라켄',
  w3_poseidon: '포세이돈',

  w3_underworld_1: '길잃은 영혼',
  w3_underworld_2: '지옥 사냥개',
  w3_underworld_3: '사신의 그림자',
  w3_underworld_4: '스틱스 망령',
  w3_hades: '하데스',

  w3_thunder_1: '구름 정령',
  w3_thunder_2: '번개 박쥐',
  w3_thunder_3: '스톰 나이트',
  w3_thunder_4: '천둥 골렘',
  w3_zeus: '제우스',

  w3_cronos: '크로노스',
  w3_gaia: '가이아',
  w3_chaos: '카오스',

  rift_1: '확률의 도사',
  rift_2: '양면의 문지기',
  rift_3: '균형의 심판관',
  rift_4: '심연의 분열체'
};

const MONSTER_STAGE_GROUPS = [
  {
    title: '1세계 - 초원',
    monsters: [
      { id: 'slime', stage: 1 },
      { id: 'slime_helmet', stage: 2 },
      { id: 'slime_warrior', stage: 3 },
      { id: 'slime_rage', stage: 4 },
      { id: 'slime_king', stage: 5 }
    ]
  },
  {
    title: '1세계 - 오크 부락',
    monsters: [
      { id: 'orc_1', stage: 1 },
      { id: 'orc_2', stage: 2 },
      { id: 'orc_3', stage: 3 },
      { id: 'orc_4', stage: 4 },
      { id: 'orc_king', stage: 5 }
    ]
  },
  {
    title: '1세계 - 드래곤 협곡',
    monsters: [
      { id: 'dragon_1', stage: 1 },
      { id: 'dragon_2', stage: 2 },
      { id: 'dragon_3', stage: 3 },
      { id: 'dragon_4', stage: 4 },
      { id: 'dragon_king', stage: 5 }
    ]
  },
  {
    title: '1세계 - 우주',
    monsters: [
      { id: 'space_slime', stage: 1 },
      { id: 'space_orc', stage: 2 },
      { id: 'space_dragon', stage: 3 }
    ]
  },
  {
    title: '2세계 - 동굴',
    monsters: [
      { id: 'bat_1', stage: 1 },
      { id: 'bat_2', stage: 2 },
      { id: 'bat_3', stage: 3 },
      { id: 'bat_4', stage: 4 },
      { id: 'bat_king', stage: 5 }
    ]
  },
  {
    title: '2세계 - 무덤',
    monsters: [
      { id: 'skeleton_1', stage: 1 },
      { id: 'skeleton_2', stage: 2 },
      { id: 'skeleton_3', stage: 3 },
      { id: 'skeleton_4', stage: 4 },
      { id: 'skeleton_king', stage: 5 }
    ]
  },
  {
    title: '2세계 - 악마 성',
    monsters: [
      { id: 'demon_1', stage: 1 },
      { id: 'demon_2', stage: 2 },
      { id: 'demon_3', stage: 3 },
      { id: 'demon_4', stage: 4 },
      { id: 'demon_king', stage: 5 }
    ]
  },
  {
    title: '2세계 - 마계',
    monsters: [
      { id: 'sin_greed', stage: 1 },
      { id: 'sin_envy', stage: 2 },
      { id: 'sin_god', stage: 3 }
    ]
  },
  {
    title: '3세계 - 아틀란티스',
    monsters: [
      { id: 'w3_atlantis_1', stage: 1 },
      { id: 'w3_atlantis_2', stage: 2 },
      { id: 'w3_atlantis_3', stage: 3 },
      { id: 'w3_atlantis_4', stage: 4 },
      { id: 'w3_poseidon', stage: 5 }
    ]
  },
  {
    title: '3세계 - 언더월드',
    monsters: [
      { id: 'w3_underworld_1', stage: 1 },
      { id: 'w3_underworld_2', stage: 2 },
      { id: 'w3_underworld_3', stage: 3 },
      { id: 'w3_underworld_4', stage: 4 },
      { id: 'w3_hades', stage: 5 }
    ]
  },
  {
    title: '3세계 - 천둥',
    monsters: [
      { id: 'w3_thunder_1', stage: 1 },
      { id: 'w3_thunder_2', stage: 2 },
      { id: 'w3_thunder_3', stage: 3 },
      { id: 'w3_thunder_4', stage: 4 },
      { id: 'w3_zeus', stage: 5 }
    ]
  },
  {
    title: '3세계 - 신계',
    monsters: [
      { id: 'w3_cronos', stage: 1 },
      { id: 'w3_gaia', stage: 2 },
      { id: 'w3_chaos', stage: 3 }
    ]
  },
  {
    title: '3세계 - 운명의 균열',
    monsters: [
      { id: 'rift_1', stage: 1 },
      { id: 'rift_2', stage: 2 },
      { id: 'rift_3', stage: 3 },
      { id: 'rift_4', stage: 4 }
    ]
  }
];

function toSafeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, Math.floor(num)) : 0;
}

function formatNumber(value) {
  return toSafeNumber(value).toLocaleString('ko-KR');
}

function formatDuration(totalSec) {
  const sec = toSafeNumber(totalSec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getBattleStats() {
  const base = { ...BATTLE_DEFAULTS };
  const raw = (GameData && GameData.battleStats) || {};

  Object.keys(BATTLE_DEFAULTS).forEach((key) => {
    base[key] = toSafeNumber(raw[key]);
  });
  return base;
}

function createStatCard(label, value) {
  const card = document.createElement('div');
  card.className = 'stat-card';

  const titleEl = document.createElement('div');
  titleEl.className = 'stat-label';
  titleEl.innerText = label;

  const valueEl = document.createElement('div');
  valueEl.className = 'stat-value';
  valueEl.innerText = value;

  card.appendChild(titleEl);
  card.appendChild(valueEl);
  return card;
}

function renderBattleStats(stats) {
  const resolvedAttacks = stats.playerAttackHits + stats.playerAttackMisses;
  const hitRate = resolvedAttacks > 0
    ? `${Math.floor((stats.playerAttackHits / resolvedAttacks) * 100)}%`
    : '0%';
  const avgDamagePerBattle = stats.totalBattles > 0
    ? Math.floor(stats.damageTakenTotal / stats.totalBattles)
    : 0;

  const cards = [
    ['누적 전투 횟수', formatNumber(stats.totalBattles)],
    ['누적 전투 시간', formatDuration(stats.totalBattleSeconds)],
    ['몬스터 처치 수', formatNumber(stats.monsterKillCount)],
    ['받은 피해(총)', formatNumber(stats.damageTakenTotal)],
    ['받은 피해(직격)', formatNumber(stats.damageTakenByHit)],
    ['받은 피해(지속)', formatNumber(stats.damageTakenByDot)],
    ['전투당 평균 피해', formatNumber(avgDamagePerBattle)],
    ['상태이상 적용', formatNumber(stats.statusAppliedCount)],
    ['상태이상 무효화', formatNumber(stats.statusBlockedCount)],
    ['무효화 물약 사용', formatNumber(stats.antidoteUsedCount)],
    ['내 공격 시도', formatNumber(stats.playerAttackAttempts)],
    ['내 공격 적중', formatNumber(stats.playerAttackHits)],
    ['내 공격 실패', formatNumber(stats.playerAttackMisses)],
    ['내 공격 명중률', hitRate],
    ['시간정지로 막힘', formatNumber(stats.playerAttackBlockedByTimeStop)]
  ];

  battleGrid.innerHTML = '';
  cards.forEach(([label, value]) => {
    battleGrid.appendChild(createStatCard(label, value));
  });
}

function renderProfileStats() {
  const killKinds = Object.keys(GameData.killStats || {}).filter((k) => toSafeNumber(GameData.killStats[k]) > 0).length;
  const fateItemCount =
    toSafeNumber(GameData.fateDiceTicket) +
    toSafeNumber(GameData.dualSealTicket) +
    toSafeNumber(GameData.fateScaleTicket) +
    toSafeNumber(GameData.chaosSealTicket);

  const cards = [
    ['강화 레벨', `+${formatNumber(GameData.level)}`],
    ['공격력', formatNumber(GameData.getCurrentDamage())],
    ['최대 HP', formatNumber(GameData.maxHp)],
    ['현재 HP', formatNumber(GameData.currentHp)],
    ['보유 골드', formatNumber(GameData.gold)],
    ['누적 골드', formatNumber(GameData.totalGold)],
    ['처치한 몬스터 종류', formatNumber(killKinds)],
    ['운명 아이템 보유 합계', formatNumber(fateItemCount)]
  ];

  profileGrid.innerHTML = '';
  cards.forEach(([label, value]) => {
    profileGrid.appendChild(createStatCard(label, value));
  });
}

function createMonsterKillRow(monsterName, count) {
  const row = document.createElement('div');
  row.className = 'kill-row';

  const leftEl = document.createElement('div');
  leftEl.className = 'kill-left';

  const nameEl = document.createElement('div');
  nameEl.className = 'kill-name';
  nameEl.innerText = monsterName;

  const countEl = document.createElement('div');
  countEl.className = 'kill-count';
  countEl.innerText = `${formatNumber(count)}회`;

  leftEl.appendChild(nameEl);
  row.appendChild(leftEl);
  row.appendChild(countEl);
  return row;
}

function renderMonsterKillList() {
  const killStats = GameData.killStats || {};
  monsterKillListEl.innerHTML = '';

  const knownIds = new Set();
  MONSTER_STAGE_GROUPS.forEach((group) => {
    const groupEl = document.createElement('section');
    groupEl.className = 'kill-group';

    const groupHeader = document.createElement('div');
    groupHeader.className = 'kill-group-title';
    groupHeader.innerText = group.title;
    groupEl.appendChild(groupHeader);

    const rowsEl = document.createElement('div');
    rowsEl.className = 'kill-group-rows';

    let groupTotal = 0;
    group.monsters.forEach((monster) => {
      knownIds.add(monster.id);
      const count = toSafeNumber(killStats[monster.id]);
      groupTotal += count;
      const monsterName = MONSTER_KILL_LABELS[monster.id] || monster.id;
      const label = `스테이지 ${monster.stage} · ${monsterName}`;
      rowsEl.appendChild(createMonsterKillRow(label, count));
    });

    const groupTotalEl = document.createElement('div');
    groupTotalEl.className = 'kill-group-total';
    groupTotalEl.innerText = `합계 ${formatNumber(groupTotal)}회`;

    groupEl.appendChild(rowsEl);
    groupEl.appendChild(groupTotalEl);
    monsterKillListEl.appendChild(groupEl);
  });

  const unknownEntries = Object.keys(killStats)
    .filter((key) => !knownIds.has(key))
    .map((key) => ({ key, count: toSafeNumber(killStats[key]) }))
    .sort((a, b) => b.count - a.count);

  if (unknownEntries.length > 0) {
    const extraGroupEl = document.createElement('section');
    extraGroupEl.className = 'kill-group';

    const titleEl = document.createElement('div');
    titleEl.className = 'kill-group-title';
    titleEl.innerText = '기타';
    extraGroupEl.appendChild(titleEl);

    const rowsEl = document.createElement('div');
    rowsEl.className = 'kill-group-rows';
    unknownEntries.forEach((entry) => {
      rowsEl.appendChild(createMonsterKillRow(entry.key, entry.count));
    });

    extraGroupEl.appendChild(rowsEl);
    monsterKillListEl.appendChild(extraGroupEl);
  }
}

function renderUpdatedAt() {
  const now = new Date();
  const dateText = now.toLocaleDateString('ko-KR');
  const timeText = now.toLocaleTimeString('ko-KR');
  updatedAtEl.innerText = `조회 시각: ${dateText} ${timeText}`;
}

function renderStatsPage() {
  const battleStats = getBattleStats();
  renderBattleStats(battleStats);
  renderProfileStats();
  renderMonsterKillList();
  renderUpdatedAt();
}

renderStatsPage();
