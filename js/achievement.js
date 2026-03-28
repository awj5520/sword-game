const Achievement = {
  unlocked: JSON.parse(localStorage.getItem('achievements')) || {},

  list: [
    /* =========================
       ⚔️ 사냥 업적
    ========================= */
    {
      id: 'slime_slayer',
      title: '슬라임 슬레이어',
      damageMul: 1.1,
      check: () =>
        GameData.killStats.slime >= 20 &&
        GameData.killStats.slime_helmet >= 20 &&
        GameData.killStats.slime_warrior >= 20 &&
        GameData.killStats.slime_rage >= 20 &&
        GameData.killStats.slime_king >= 20
    },
    {
      id: 'orc_conquer',
      title: '오크 부락 점령',
      damageMul: 1.2,
      check: () =>
        GameData.killStats.orc_1 >= 30 &&
        GameData.killStats.orc_2 >= 30 &&
        GameData.killStats.orc_3 >= 30 &&
        GameData.killStats.orc_4 >= 30 &&
        GameData.killStats.orc_king >= 30
    },
    {
      id: 'dragon_master',
      title: '드래곤 마스터',
      damageMul: 1.3,
      check: () =>
        GameData.killStats.dragon_1 >= 40 &&
        GameData.killStats.dragon_2 >= 40 &&
        GameData.killStats.dragon_3 >= 40 &&
        GameData.killStats.dragon_4 >= 40 &&
        GameData.killStats.dragon_king >= 40
    },
    {
      id: 'space_conqueror',
      title: '정복자',
      damageMul: 1.5,
      check: () =>
        GameData.killStats.space_slime >= 50 &&
        GameData.killStats.space_orc >= 50 &&
        GameData.killStats.space_dragon >= 50
    },

    /* =========================
       🔨 강화 업적
    ========================= */
    {
      id: 'upgrade_50',
      title: '검 숙련자',
      desc: '+50강 달성',
      damageMul: 1.15,
      check: () => GameData.level >= 50
    },
    {
      id: 'upgrade_100',
      title: '강화 마스터',
      desc: '+100강 달성',
      damageMul: 1.3,
      check: () => GameData.level >= 100
    },

    /* 🔥 추가된 업적 */
    {
      id: 'upgrade_god',
      title: '🔥 강화의 신',
      desc: '1경 달성',
      damageMul: 2.0,
      check: () => GameData.level >= 1e16
    },

    /* =========================
       💰 골드 업적
    ========================= */
    {
      id: 'gold_10m',
      title: '백만장자',
      goldMul: 1.1,
      check: () => GameData.totalGold >= 10_000_000
    },
    {
      id: 'gold_100m',
      title: '재벌',
      goldMul: 1.2,
      check: () => GameData.totalGold >= 100_000_000
    },
    {
      id: 'gold_100b',
      title: '신화급 부자',
      goldMul: 1.5,
      check: () => GameData.totalGold >= 100_000_000_000
    }
  ],

  save() {
    localStorage.setItem('achievements', JSON.stringify(this.unlocked));
  },

  checkAll() {
    this.list.forEach(a => {
      if (!this.unlocked[a.id] && a.check()) {
        this.unlocked[a.id] = true;

        if (a.damageMul) {
          GameData.achievementDamageMul *= a.damageMul;
        }
        if (a.goldMul) {
          GameData.achievementGoldMul *= a.goldMul;
        }

        GameData.save();
        this.save();

        if (window.showAchievementPopup) {
          showAchievementPopup(`${a.title} 달성!`);
        }
      }
    });
  }
};