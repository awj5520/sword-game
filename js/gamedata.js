const GameData = {
  /* =========================
     기본 스탯
  ========================= */
  level: Number(localStorage.getItem('level')) || 0,
  damage: Number(localStorage.getItem('damage')) || 10,
  gold: Number(localStorage.getItem('gold')) || 0,

  /* =========================
     🏆 업적 배율
  ========================= */
  achievementDamageMul:
    Number(localStorage.getItem('achievementDamageMul')) || 1.0,

  achievementGoldMul:
    Number(localStorage.getItem('achievementGoldMul')) || 1.0,

  /* =========================
     버프 / 아이템
  ========================= */
  damageBuffUntil: Number(localStorage.getItem('damageBuffUntil')) || 0,
  goldBuffUntil: Number(localStorage.getItem('goldBuffUntil')) || 0,

  noDropTicket: Number(localStorage.getItem('noDropTicket')) || 0,
  guaranteeTicket: Number(localStorage.getItem('guaranteeTicket')) || 0,

  noDropActive: localStorage.getItem('noDropActive') === 'true',
  guaranteeActive: localStorage.getItem('guaranteeActive') === 'true',

  /* =========================
     업적용 데이터
  ========================= */
  totalGold: Number(localStorage.getItem('totalGold')) || 0,

  killStats: JSON.parse(localStorage.getItem('killStats')) || {
    slime: 0,
    slime_helmet: 0,
    slime_warrior: 0,
    slime_rage: 0,
    slime_king: 0,

    orc_1: 0,
    orc_2: 0,
    orc_3: 0,
    orc_4: 0,
    orc_king: 0,

    dragon_1: 0,
    dragon_2: 0,
    dragon_3: 0,
    dragon_4: 0,
    dragon_king: 0,

    space_slime: 0,
    space_orc: 0,
    space_dragon: 0
  },

  now() {
    return Date.now();
  },

  save() {
    localStorage.setItem('level', this.level);
    localStorage.setItem('damage', this.damage);
    localStorage.setItem('gold', this.gold);

    localStorage.setItem('achievementDamageMul', this.achievementDamageMul);
    localStorage.setItem('achievementGoldMul', this.achievementGoldMul);

    localStorage.setItem('damageBuffUntil', this.damageBuffUntil);
    localStorage.setItem('goldBuffUntil', this.goldBuffUntil);

    localStorage.setItem('noDropTicket', this.noDropTicket);
    localStorage.setItem('guaranteeTicket', this.guaranteeTicket);

    localStorage.setItem('noDropActive', this.noDropActive);
    localStorage.setItem('guaranteeActive', this.guaranteeActive);

    localStorage.setItem('totalGold', this.totalGold);
    localStorage.setItem('killStats', JSON.stringify(this.killStats));
  },

  /* =========================
     데미지 계산
  ========================= */
  getCurrentDamage() {
    let dmg = this.damage;
    dmg *= this.achievementDamageMul;

    if (this.damageBuffUntil > this.now()) {
      dmg *= 1.5;
    }

    return Math.floor(dmg);
  },

  /* =========================
     💰 골드 획득
  ========================= */
  earnGold(amount) {
    let gain = amount;

    gain *= this.achievementGoldMul;

    if (this.goldBuffUntil > this.now()) {
      gain *= 1.5;
    }

    gain = Math.floor(gain);

    this.gold += gain;
    this.totalGold += gain;

    this.save();

    if (window.Achievement) Achievement.checkAll();

    return gain;
  },

  /* =========================
     강화 확률
  ========================= */
  getSuccessRate() {
    if (this.guaranteeActive) return 100;

    if (this.level < 10) return 100;
    if (this.level < 30) return Math.max(95 - (this.level - 10), 75);
    if (this.level < 60) return Math.max(75 - (this.level - 30) * 0.67, 55);
    if (this.level < 100) return Math.max(55 - (this.level - 60) * 0.5, 35);
    if (this.level < 200) return Math.max(35 - (this.level - 100) * 0.15, 20);
    return 20;
  },

  /* =========================
     🔨 강화 (🔥 수정 핵심)
  ========================= */
  upgrade() {
    const rate = this.getSuccessRate();
    const success = Math.random() * 100 < rate;

    if (success) {
      this.level++;
      this.damage += 5;

      // ✅ 100% 강화권 소모
      if (this.guaranteeActive) {
        this.guaranteeTicket = Math.max(0, this.guaranteeTicket - 1);
        this.guaranteeActive = false;
      }
    } else {
      if (this.noDropActive) {
        // ✅ 하락 방지권 소모
        this.noDropTicket = Math.max(0, this.noDropTicket - 1);
        this.noDropActive = false;
      } else {
        this.level = Math.max(0, this.level - 1);
      }
    }

    this.save();

    if (window.Achievement) Achievement.checkAll();

    return success;
  }
};
