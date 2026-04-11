const codexSummaryEl = document.getElementById('codex-summary');
const codexGroupListEl = document.getElementById('codex-group-list');

const CODEX_GROUPS = [
  {
    title: '1세계 - 초원',
    monsters: [
      { id: 'slime', name: '슬라임', image: 'slime_grass_1.png', stage: 1, boss: false },
      { id: 'slime_helmet', name: '투구 슬라임', image: 'slime_grass_2.png', stage: 2, boss: false },
      { id: 'slime_warrior', name: '전사 슬라임', image: 'slime_grass_3.png', stage: 3, boss: false },
      { id: 'slime_rage', name: '광폭화 슬라임', image: 'slime_grass_4.png', stage: 4, boss: false },
      { id: 'slime_king', name: '슬라임 왕', image: 'slime_grass_5.png', stage: 5, boss: true }
    ]
  },
  {
    title: '1세계 - 오크 부락',
    monsters: [
      { id: 'orc_1', name: '풋내기 오크', image: 'orc_1.png', stage: 1, boss: false },
      { id: 'orc_2', name: '전사 오크', image: 'orc_2.png', stage: 2, boss: false },
      { id: 'orc_3', name: '광전사 오크', image: 'orc_3.png', stage: 3, boss: false },
      { id: 'orc_4', name: '주술사 오크', image: 'orc_4.png', stage: 4, boss: false },
      { id: 'orc_king', name: '오크 족장', image: 'orc_5.png', stage: 5, boss: true }
    ]
  },
  {
    title: '1세계 - 드래곤 협곡',
    monsters: [
      { id: 'dragon_1', name: '새끼 드레이크', image: 'dragon_1.png', stage: 1, boss: false },
      { id: 'dragon_2', name: '불꽃 드레이크', image: 'dragon_2.png', stage: 2, boss: false },
      { id: 'dragon_3', name: '비늘 와이번', image: 'dragon_3.png', stage: 3, boss: false },
      { id: 'dragon_4', name: '다크 드래곤', image: 'dragon_4.png', stage: 4, boss: false },
      { id: 'dragon_king', name: '골드 드래곤', image: 'dragon_5.png', stage: 5, boss: true }
    ]
  },
  {
    title: '1세계 - 우주',
    monsters: [
      { id: 'space_slime', name: '갤럭시 슬라임', image: 'galaxy_slime.png', stage: 1, boss: false },
      { id: 'space_orc', name: '갤럭시 오크', image: 'galaxy_orc.png', stage: 2, boss: false },
      { id: 'space_dragon', name: '갤럭시 드래곤', image: 'galaxy_dragon.png', stage: 3, boss: true }
    ]
  },
  {
    title: '2세계 - 동굴',
    monsters: [
      { id: 'bat_1', name: '동굴 박쥐', image: 'bat_1.png', stage: 1, boss: false },
      { id: 'bat_2', name: '어둠 박쥐', image: 'bat_2.png', stage: 2, boss: false },
      { id: 'bat_3', name: '흡혈 박쥐', image: 'bat_3.png', stage: 3, boss: false },
      { id: 'bat_4', name: '광폭 박쥐', image: 'bat_4.png', stage: 4, boss: false },
      { id: 'bat_king', name: '박쥐 군주', image: 'bat_boss.png', stage: 5, boss: true }
    ]
  },
  {
    title: '2세계 - 무덤',
    monsters: [
      { id: 'skeleton_1', name: '해골 병사', image: 'skeleton_1.png', stage: 1, boss: false },
      { id: 'skeleton_2', name: '해골 궁수', image: 'skeleton_2.png', stage: 2, boss: false },
      { id: 'skeleton_3', name: '해골 기사', image: 'skeleton_3.png', stage: 3, boss: false },
      { id: 'skeleton_4', name: '저주받은 해골', image: 'skeleton_4.png', stage: 4, boss: false },
      { id: 'skeleton_king', name: '해골 군주', image: 'skeleton_boss.png', stage: 5, boss: true }
    ]
  },
  {
    title: '2세계 - 악마 성',
    monsters: [
      { id: 'demon_1', name: '악마 하수인', image: 'demon_1.png', stage: 1, boss: false },
      { id: 'demon_2', name: '악마 기사', image: 'demon_2.png', stage: 2, boss: false },
      { id: 'demon_3', name: '지옥 마법사', image: 'demon_3.png', stage: 3, boss: false },
      { id: 'demon_4', name: '타락한 군주', image: 'demon_4.png', stage: 4, boss: false },
      { id: 'demon_king', name: '마왕', image: 'demon_boss.png', stage: 5, boss: true }
    ]
  },
  {
    title: '2세계 - 마계',
    monsters: [
      { id: 'sin_greed', name: '탐욕의 망령', image: 'sin_greed.png', stage: 1, boss: false },
      { id: 'sin_envy', name: '질투의 망령', image: 'sin_envy.png', stage: 2, boss: false },
      { id: 'sin_god', name: '분노의 신', image: 'sin_god.png', stage: 3, boss: true }
    ]
  },
  {
    title: '3세계 - 아틀란티스',
    monsters: [
      { id: 'w3_atlantis_1', name: '산호 슬라임', image: 'w3_atlantis_1.png', stage: 1, boss: false },
      { id: 'w3_atlantis_2', name: '심해 해마 기사', image: 'w3_atlantis_2.png', stage: 2, boss: false },
      { id: 'w3_atlantis_3', name: '잠수꾼 망령', image: 'w3_atlantis_3.png', stage: 3, boss: false },
      { id: 'w3_atlantis_4', name: '크라켄', image: 'w3_atlantis_4.png', stage: 4, boss: false },
      { id: 'w3_poseidon', name: '포세이돈', image: 'w3_atlantis_5_poseidon.png', stage: 5, boss: true }
    ]
  },
  {
    title: '3세계 - 언더월드',
    monsters: [
      { id: 'w3_underworld_1', name: '길잃은 영혼', image: 'w3_underworld_1.png', stage: 1, boss: false },
      { id: 'w3_underworld_2', name: '지옥 사냥개', image: 'w3_underworld_2.png', stage: 2, boss: false },
      { id: 'w3_underworld_3', name: '사신의 그림자', image: 'w3_underworld_3.png', stage: 3, boss: false },
      { id: 'w3_underworld_4', name: '스틱스 망령', image: 'w3_underworld_4.png', stage: 4, boss: false },
      { id: 'w3_hades', name: '하데스', image: 'w3_underworld_5_hades.png', stage: 5, boss: true }
    ]
  },
  {
    title: '3세계 - 천둥',
    monsters: [
      { id: 'w3_thunder_1', name: '구름 정령', image: 'w3_thunder_1.png', stage: 1, boss: false },
      { id: 'w3_thunder_2', name: '번개 박쥐', image: 'w3_thunder_2.png', stage: 2, boss: false },
      { id: 'w3_thunder_3', name: '스톰 나이트', image: 'w3_thunder_3.png', stage: 3, boss: false },
      { id: 'w3_thunder_4', name: '천둥 골렘', image: 'w3_thunder_4.png', stage: 4, boss: false },
      { id: 'w3_zeus', name: '제우스', image: 'w3_thunder_5_zeus.png', stage: 5, boss: true }
    ]
  },
  {
    title: '3세계 - 신계',
    monsters: [
      { id: 'w3_cronos', name: '크로노스', image: 'w3_divine_1_cronos.png', stage: 1, boss: true },
      { id: 'w3_gaia', name: '가이아', image: 'w3_divine_2_gaia.png', stage: 2, boss: true },
      { id: 'w3_chaos', name: '카오스', image: 'w3_divine_3_chaos.png', stage: 3, boss: true }
    ]
  },
  {
    title: '3세계 - 운명의 균열',
    monsters: [
      { id: 'rift_1', name: '확률의 도사', image: 'rift_1.png', stage: 1, boss: false },
      { id: 'rift_2', name: '양면의 문지기', image: 'rift_2.png', stage: 2, boss: false },
      { id: 'rift_3', name: '균형의 심판관', image: 'rift_3.png', stage: 3, boss: false },
      { id: 'rift_4', name: '심연의 분열체', image: 'rift_4.png', stage: 4, boss: true }
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

function getKillCount(killStats, monsterId) {
  return toSafeNumber(killStats[monsterId]);
}

function createCodexCard(monster, killCount) {
  const unlocked = killCount > 0;
  const card = document.createElement('div');
  card.className = `codex-card ${unlocked ? 'unlocked' : 'locked'}`;

  const thumb = document.createElement('img');
  thumb.className = 'codex-thumb';
  thumb.src = `images/monsters/${monster.image}`;
  thumb.alt = unlocked ? monster.name : '잠금된 몬스터';
  card.appendChild(thumb);

  const main = document.createElement('div');
  main.className = 'codex-main';

  const nameEl = document.createElement('div');
  nameEl.className = 'codex-name';
  nameEl.innerText = unlocked ? monster.name : '???';
  main.appendChild(nameEl);

  const metaEl = document.createElement('div');
  metaEl.className = 'codex-meta';
  metaEl.innerText = `스테이지 ${monster.stage}`;
  main.appendChild(metaEl);

  card.appendChild(main);

  const right = document.createElement('div');
  right.className = 'codex-right';

  if (monster.boss) {
    const bossEl = document.createElement('div');
    bossEl.className = 'codex-boss';
    bossEl.innerText = 'BOSS';
    right.appendChild(bossEl);
  }

  const killEl = document.createElement('div');
  killEl.className = 'codex-kill';
  killEl.innerText = unlocked ? `${formatNumber(killCount)}회` : '미해금';
  right.appendChild(killEl);

  card.appendChild(right);

  return card;
}

function renderCodex() {
  const killStats = GameData.killStats || {};
  const allMonsters = CODEX_GROUPS.flatMap((group) => group.monsters);

  const discoveredCount = allMonsters.reduce((sum, monster) => {
    return sum + (getKillCount(killStats, monster.id) > 0 ? 1 : 0);
  }, 0);
  const bossTotal = allMonsters.filter((monster) => monster.boss).length;
  const bossDiscovered = allMonsters.reduce((sum, monster) => {
    if (!monster.boss) return sum;
    return sum + (getKillCount(killStats, monster.id) > 0 ? 1 : 0);
  }, 0);

  codexSummaryEl.innerText =
    `해금 ${formatNumber(discoveredCount)} / ${formatNumber(allMonsters.length)} | ` +
    `보스 ${formatNumber(bossDiscovered)} / ${formatNumber(bossTotal)}`;

  codexGroupListEl.innerHTML = '';

  CODEX_GROUPS.forEach((group) => {
    const groupEl = document.createElement('section');
    groupEl.className = 'codex-group';

    const groupHead = document.createElement('div');
    groupHead.className = 'codex-group-head';

    const titleEl = document.createElement('div');
    titleEl.className = 'codex-group-title';
    titleEl.innerText = group.title;
    groupHead.appendChild(titleEl);

    const unlockedInGroup = group.monsters.reduce((sum, monster) => {
      return sum + (getKillCount(killStats, monster.id) > 0 ? 1 : 0);
    }, 0);

    const progressEl = document.createElement('div');
    progressEl.className = 'codex-group-progress';
    progressEl.innerText = `${formatNumber(unlockedInGroup)} / ${formatNumber(group.monsters.length)}`;
    groupHead.appendChild(progressEl);

    groupEl.appendChild(groupHead);

    const cardListEl = document.createElement('div');
    cardListEl.className = 'codex-card-list';

    group.monsters.forEach((monster) => {
      const killCount = getKillCount(killStats, monster.id);
      cardListEl.appendChild(createCodexCard(monster, killCount));
    });

    groupEl.appendChild(cardListEl);
    codexGroupListEl.appendChild(groupEl);
  });
}

renderCodex();
