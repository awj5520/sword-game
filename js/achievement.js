function getKillCount(monsterId) {
  return Math.max(0, Number(GameData.killStats?.[monsterId]) || 0);
}

const HUNT_ACHIEVEMENT_DEFS = [
  {
    id: 'slime_slayer',
    title: '슬라임 슬레이어',
    target: 20,
    damageMul: 1.1,
    monsters: [
      ['slime', '슬라임'],
      ['slime_helmet', '투구 슬라임'],
      ['slime_warrior', '전사 슬라임'],
      ['slime_rage', '광폭화 슬라임'],
      ['slime_king', '슬라임 왕']
    ]
  },
  {
    id: 'orc_conquer',
    title: '오크 부락 점령',
    target: 30,
    damageMul: 1.2,
    monsters: [
      ['orc_1', '풋내기 오크'],
      ['orc_2', '전사 오크'],
      ['orc_3', '광전사 오크'],
      ['orc_4', '주술사 오크'],
      ['orc_king', '오크 족장']
    ]
  },
  {
    id: 'dragon_master',
    title: '드래곤 마스터',
    target: 40,
    damageMul: 1.3,
    monsters: [
      ['dragon_1', '새끼 드레이크'],
      ['dragon_2', '불꽃 드레이크'],
      ['dragon_3', '비늘 와이번'],
      ['dragon_4', '다크 드래곤'],
      ['dragon_king', '골드 드래곤']
    ]
  },
  {
    id: 'space_conqueror',
    title: '우주 정복자',
    target: 50,
    damageMul: 1.5,
    monsters: [
      ['space_slime', '갤럭시 슬라임'],
      ['space_orc', '갤럭시 오크'],
      ['space_dragon', '갤럭시 드래곤']
    ]
  },
  {
    id: 'cave_hunter',
    title: '동굴 사냥꾼',
    target: 60,
    damageMul: 1.08,
    monsters: [
      ['bat_1', '동굴 박쥐'],
      ['bat_2', '어둠 박쥐'],
      ['bat_3', '흡혈 박쥐'],
      ['bat_4', '광폭 박쥐'],
      ['bat_king', '박쥐 군주']
    ]
  },
  {
    id: 'grave_exorcist',
    title: '무덤 퇴마사',
    target: 70,
    damageMul: 1.09,
    monsters: [
      ['skeleton_1', '해골 병사'],
      ['skeleton_2', '해골 궁수'],
      ['skeleton_3', '해골 기사'],
      ['skeleton_4', '저주받은 해골'],
      ['skeleton_king', '해골 군주']
    ]
  },
  {
    id: 'demon_castle_breaker',
    title: '악마 성 파괴자',
    target: 80,
    damageMul: 1.1,
    monsters: [
      ['demon_1', '악마 하수인'],
      ['demon_2', '악마 기사'],
      ['demon_3', '지옥 마법사'],
      ['demon_4', '타락한 군주'],
      ['demon_king', '마왕']
    ]
  },
  {
    id: 'hell_subjugator',
    title: '마계 제압자',
    target: 90,
    damageMul: 1.11,
    monsters: [
      ['sin_greed', '탐욕의 망령'],
      ['sin_envy', '질투의 망령'],
      ['sin_god', '분노의 신']
    ]
  },
  {
    id: 'atlantis_tamer',
    title: '아틀란티스 테이머',
    target: 100,
    damageMul: 1.12,
    monsters: [
      ['w3_atlantis_1', '산호 슬라임'],
      ['w3_atlantis_2', '심해 해마 기사'],
      ['w3_atlantis_3', '잠수꾼 망령'],
      ['w3_atlantis_4', '크라켄'],
      ['w3_poseidon', '포세이돈']
    ]
  },
  {
    id: 'underworld_reaper',
    title: '언더월드 리퍼',
    target: 110,
    damageMul: 1.13,
    monsters: [
      ['w3_underworld_1', '길잃은 영혼'],
      ['w3_underworld_2', '지옥 사냥개'],
      ['w3_underworld_3', '사신의 그림자'],
      ['w3_underworld_4', '스틱스 망령'],
      ['w3_hades', '하데스']
    ]
  },
  {
    id: 'thunder_dominator',
    title: '천둥 지배자',
    target: 120,
    damageMul: 1.14,
    monsters: [
      ['w3_thunder_1', '구름 정령'],
      ['w3_thunder_2', '번개 박쥐'],
      ['w3_thunder_3', '스톰 나이트'],
      ['w3_thunder_4', '천둥 골렘'],
      ['w3_zeus', '제우스']
    ]
  },
  {
    id: 'divine_trials',
    title: '신계 시련 돌파',
    target: 130,
    damageMul: 1.15,
    monsters: [
      ['w3_cronos', '크로노스'],
      ['w3_gaia', '가이아'],
      ['w3_chaos', '카오스']
    ]
  },
  {
    id: 'rift_judge',
    title: '균열 심판자',
    target: 140,
    damageMul: 1.16,
    monsters: [
      ['rift_1', '확률의 도사'],
      ['rift_2', '양면의 문지기'],
      ['rift_3', '균형의 심판관'],
      ['rift_4', '심연의 분열체']
    ]
  }
];

const ALL_MONSTER_IDS = [...new Set(
  HUNT_ACHIEVEMENT_DEFS.flatMap((def) => def.monsters.map(([id]) => id))
)];

const Achievement = {
  unlocked: JSON.parse(localStorage.getItem('achievements')) || {},

  list: [
    ...HUNT_ACHIEVEMENT_DEFS.map((def) => ({
      ...def,
      category: 'hunt',
      check: () => def.monsters.every(([monsterId]) => getKillCount(monsterId) >= def.target)
    })),

    {
      id: 'upgrade_50',
      title: '검 숙련자',
      desc: '+50강 달성',
      category: 'upgrade',
      target: 50,
      damageMul: 1.15,
      check: () => GameData.level >= 50
    },
    {
      id: 'upgrade_100',
      title: '강화 마스터',
      desc: '+100강 달성',
      category: 'upgrade',
      target: 100,
      damageMul: 1.3,
      check: () => GameData.level >= 100
    },
    {
      id: 'upgrade_god',
      title: '강화의 신',
      desc: '1경 달성',
      category: 'upgrade',
      target: 1e16,
      damageMul: 2.0,
      check: () => GameData.level >= 1e16
    },
    {
      id: 'upgrade_jesus',
      title: '예수님',
      desc: '1자 달성',
      category: 'upgrade',
      target: 1e24,
      damageMul: 5.0,
      check: () => GameData.level >= 1e24
    },

    {
      id: 'gold_10m',
      title: '백만장자',
      category: 'gold',
      target: 10_000_000,
      goldMul: 1.1,
      check: () => GameData.totalGold >= 10_000_000
    },
    {
      id: 'gold_100m',
      title: '재벌',
      category: 'gold',
      target: 100_000_000,
      goldMul: 1.2,
      check: () => GameData.totalGold >= 100_000_000
    },
    {
      id: 'gold_100b',
      title: '신화급 부자',
      category: 'gold',
      target: 100_000_000_000,
      goldMul: 1.5,
      check: () => GameData.totalGold >= 100_000_000_000
    },
    {
      id: 'gold_elon',
      title: '만사 무사',
      desc: '1해 골드 달성',
      category: 'gold',
      target: 1e20,
      goldMul: 3.0,
      check: () => GameData.totalGold >= 1e20
    },

    {
      id: 'codex_master',
      title: '몬스터 석사',
      desc: '모든 몬스터 1회 이상 처치',
      category: 'codex',
      allMonsterMinKills: 1,
      check: () => ALL_MONSTER_IDS.every((monsterId) => getKillCount(monsterId) >= 1)
    },
    {
      id: 'codex_doctor',
      title: '몬스터 박사',
      desc: '모든 몬스터 10회 이상 처치',
      category: 'codex',
      allMonsterMinKills: 10,
      check: () => ALL_MONSTER_IDS.every((monsterId) => getKillCount(monsterId) >= 10)
    }
  ],

  allMonsterIds: ALL_MONSTER_IDS,

  save() {
    localStorage.setItem('achievements', JSON.stringify(this.unlocked));
  },

  checkAll() {
    this.list.forEach((ach) => {
      if (!this.unlocked[ach.id] && ach.check()) {
        this.unlocked[ach.id] = true;

        if (ach.damageMul) {
          GameData.achievementDamageMul *= ach.damageMul;
        }
        if (ach.goldMul) {
          GameData.achievementGoldMul *= ach.goldMul;
        }

        GameData.save();
        this.save();

        if (window.showAchievementPopup) {
          showAchievementPopup(`${ach.title} 달성!`);
        }
      }
    });
  }
};

window.Achievement = Achievement;
