const GameData = {
  /* =========================
     기본 스탯
  ========================= */
  level: Number(localStorage.getItem('level')) || 0,
  damage: Number(localStorage.getItem('damage')) || 10,
  gold: Number(localStorage.getItem('gold')) || 0,

  /* =========================
     ❤️ 플레이어 HP
  ========================= */
  maxHp: Number(localStorage.getItem('maxHp')) || 100,
  currentHp: Number(localStorage.getItem('currentHp')) || 100,

  /* =========================
     🏆 업적 배율
  ========================= */
  achievementDamageMul: Number(localStorage.getItem('achievementDamageMul')) || 1.0,
  achievementGoldMul: Number(localStorage.getItem('achievementGoldMul')) || 1.0,

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
     💥 200% 강화권
  ========================= */
  doubleGuaranteeTicket: Number(localStorage.getItem('doubleGuaranteeTicket')) || 0,
  doubleGuaranteeActive: localStorage.getItem('doubleGuaranteeActive') === 'true',
  unlockDoubleGuarantee: localStorage.getItem('unlockDoubleGuarantee') === 'true',

  /* =========================
     🌠 월드3 보상
  ========================= */
  poseidonGoldMul: Number(localStorage.getItem('poseidonGoldMul')) || 1.0,
  hadesDamageMul: Number(localStorage.getItem('hadesDamageMul')) || 1.0,
  world3BossPowerMul: Number(localStorage.getItem('world3BossPowerMul')) || 1.0,

  atlantisToken: Number(localStorage.getItem('atlantisToken')) || 0,
  underworldToken: Number(localStorage.getItem('underworldToken')) || 0,
  thunderToken: Number(localStorage.getItem('thunderToken')) || 0,

  /* =========================
     🎲 운명 아이템
  ========================= */
  fateDiceTicket: Number(localStorage.getItem('fateDiceTicket')) || 0,
  dualSealTicket: Number(localStorage.getItem('dualSealTicket')) || 0,
  fateScaleTicket: Number(localStorage.getItem('fateScaleTicket')) || 0,
  chaosSealTicket: Number(localStorage.getItem('chaosSealTicket')) || 0,

  fateDiceActive: localStorage.getItem('fateDiceActive') === 'true',
  dualSealActive: localStorage.getItem('dualSealActive') === 'true',
  fateScaleActive: localStorage.getItem('fateScaleActive') === 'true',
  chaosSealActive: localStorage.getItem('chaosSealActive') === 'true',

  /* 운명의 저울 실패 보정 */
  fateScalePity: localStorage.getItem('fateScalePity') === 'true',

  /* =========================
     기록
  ========================= */
  totalGold: Number(localStorage.getItem('totalGold')) || 0,
  killStats: JSON.parse(localStorage.getItem('killStats')) || {},

  now() {
    return Date.now();
  },

  /* =========================
     ❤️ HP 처리
  ========================= */
  takeDamage(amount) {
    const dmg = Math.max(0, Number(amount) || 0);
    this.currentHp = Math.max(0, this.currentHp - dmg);
    this.save();
  },

  healFull() {
    this.currentHp = this.maxHp;
    this.save();
  },

  isDead() {
    return this.currentHp <= 0;
  },

  /* =========================
     공격력 계산
  ========================= */
  getCurrentDamage() {
    let dmg = this.damage;

    dmg *= this.achievementDamageMul;
    dmg *= this.hadesDamageMul;
    dmg *= this.world3BossPowerMul;

    if (this.damageBuffUntil > this.now()) {
      dmg *= 1.5;
    }

    return Math.max(1, Math.floor(dmg));
  },

  /* =========================
     골드 획득
  ========================= */
  earnGold(baseGold) {
    let g = Number(baseGold) || 0;

    g *= this.achievementGoldMul;
    g *= this.poseidonGoldMul;

    if (this.goldBuffUntil > this.now()) {
      g *= 2;
    }

    g = Math.floor(g);
    this.gold += g;
    this.totalGold += g;
    return g;
  },

  /* =========================
     저장
  ========================= */
  save() {
    localStorage.setItem('level', this.level);
    localStorage.setItem('damage', this.damage);
    localStorage.setItem('gold', this.gold);

    localStorage.setItem('maxHp', this.maxHp);
    localStorage.setItem('currentHp', this.currentHp);

    localStorage.setItem('achievementDamageMul', this.achievementDamageMul);
    localStorage.setItem('achievementGoldMul', this.achievementGoldMul);

    localStorage.setItem('damageBuffUntil', this.damageBuffUntil);
    localStorage.setItem('goldBuffUntil', this.goldBuffUntil);

    localStorage.setItem('noDropTicket', this.noDropTicket);
    localStorage.setItem('guaranteeTicket', this.guaranteeTicket);
    localStorage.setItem('noDropActive', this.noDropActive);
    localStorage.setItem('guaranteeActive', this.guaranteeActive);

    localStorage.setItem('doubleGuaranteeTicket', this.doubleGuaranteeTicket);
    localStorage.setItem('doubleGuaranteeActive', this.doubleGuaranteeActive);
    localStorage.setItem('unlockDoubleGuarantee', this.unlockDoubleGuarantee);

    localStorage.setItem('poseidonGoldMul', this.poseidonGoldMul);
    localStorage.setItem('hadesDamageMul', this.hadesDamageMul);
    localStorage.setItem('world3BossPowerMul', this.world3BossPowerMul);

    localStorage.setItem('atlantisToken', this.atlantisToken);
    localStorage.setItem('underworldToken', this.underworldToken);
    localStorage.setItem('thunderToken', this.thunderToken);

    localStorage.setItem('fateDiceTicket', this.fateDiceTicket);
    localStorage.setItem('dualSealTicket', this.dualSealTicket);
    localStorage.setItem('fateScaleTicket', this.fateScaleTicket);
    localStorage.setItem('chaosSealTicket', this.chaosSealTicket);

    localStorage.setItem('fateDiceActive', this.fateDiceActive);
    localStorage.setItem('dualSealActive', this.dualSealActive);
    localStorage.setItem('fateScaleActive', this.fateScaleActive);
    localStorage.setItem('chaosSealActive', this.chaosSealActive);

    localStorage.setItem('fateScalePity', this.fateScalePity);

    localStorage.setItem('totalGold', this.totalGold);
    localStorage.setItem('killStats', JSON.stringify(this.killStats));
  },

  /* =========================
     운명 아이템 상태
  ========================= */
  getActiveFateType() {
    if (this.fateDiceActive && this.fateDiceTicket > 0) return 'dice';
    if (this.dualSealActive && this.dualSealTicket > 0) return 'dual';
    if (this.fateScaleActive && this.fateScaleTicket > 0) return 'scale';
    if (this.chaosSealActive && this.chaosSealTicket > 0) return 'chaos';
    return null;
  },

  /* =========================
     강화 확률
  ========================= */
  getSuccessRate() {
    if (this.fateScalePity) return 100;
    if (this.doubleGuaranteeActive && this.doubleGuaranteeTicket > 0) return 100;
    if (this.guaranteeActive && this.guaranteeTicket > 0) return 100;

    if (this.level < 10) return 100;
    if (this.level < 30) return Math.max(95 - (this.level - 10), 75);
    if (this.level < 60) return Math.max(75 - (this.level - 30) * 0.67, 55);
    if (this.level < 100) return Math.max(55 - (this.level - 60) * 0.5, 35);
    if (this.level < 200) return Math.max(35 - (this.level - 100) * 0.15, 20);
    return 20;
  },

  /* =========================
     강화
     - 성공 시 HP +5
     - 200% 강화권: +2강, 공격력 +10
     - 일반/100%: +1강, 공격력 +5
     - 운명 아이템은 레벨 변환 우선
  ========================= */
  upgrade() {
    const startLevel = this.level;
    const fateType = this.getActiveFateType();

    const rate = this.getSuccessRate();
    let success = this.fateScalePity
      ? true
      : (Math.random() * 100 < rate);

    if (this.fateScalePity) {
      this.fateScalePity = false;
    }

    const isDouble =
      this.doubleGuaranteeActive && this.doubleGuaranteeTicket > 0;
    const isGuarantee =
      this.guaranteeActive && this.guaranteeTicket > 0;

    if (!fateType) {
      if (success) {
        if (isDouble) {
          this.damage += 10;
          this.level += 2;

          this.doubleGuaranteeTicket--;
          if (this.doubleGuaranteeTicket <= 0) {
            this.doubleGuaranteeTicket = 0;
            this.doubleGuaranteeActive = false;
          }
        } else {
          this.damage += 5;
          this.level += 1;

          if (isGuarantee) {
            this.guaranteeTicket--;
            if (this.guaranteeTicket <= 0) {
              this.guaranteeTicket = 0;
              this.guaranteeActive = false;
            }
          }
        }

        this.maxHp += 5;
        this.currentHp += 5;
      } else {
        if (this.noDropActive && this.noDropTicket > 0) {
          this.noDropTicket--;
          if (this.noDropTicket <= 0) {
            this.noDropTicket = 0;
            this.noDropActive = false;
          }
        } else {
          this.level = Math.max(0, this.level - 1);
        }
      }
    }

    if (fateType) {
      if (success) {
        if (isDouble) {
          this.damage += 10;
          this.doubleGuaranteeTicket--;
          if (this.doubleGuaranteeTicket <= 0) {
            this.doubleGuaranteeTicket = 0;
            this.doubleGuaranteeActive = false;
          }
        } else {
          this.damage += 5;
          if (isGuarantee) {
            this.guaranteeTicket--;
            if (this.guaranteeTicket <= 0) {
              this.guaranteeTicket = 0;
              this.guaranteeActive = false;
            }
          }
        }

        this.maxHp += 5;
        this.currentHp += 5;
      }

      if (fateType === 'dice') {
        this.level = success ? startLevel * 2 : Math.floor(startLevel / 2);
        this.fateDiceTicket--;
        if (this.fateDiceTicket <= 0) {
          this.fateDiceTicket = 0;
          this.fateDiceActive = false;
        }
      }

      if (fateType === 'dual') {
        this.level = success
          ? startLevel * 2
          : Math.max(Math.floor(startLevel / 2), Math.floor(startLevel * 0.7));
        this.dualSealTicket--;
        if (this.dualSealTicket <= 0) {
          this.dualSealTicket = 0;
          this.dualSealActive = false;
        }
      }

      if (fateType === 'scale') {
        this.level = success ? startLevel * 2 : Math.floor(startLevel / 2);
        if (!success) {
          this.fateScalePity = true;
        }
        this.fateScaleTicket--;
        if (this.fateScaleTicket <= 0) {
          this.fateScaleTicket = 0;
          this.fateScaleActive = false;
        }
      }

      if (fateType === 'chaos') {
        this.level = success ? startLevel * 3 : Math.floor(startLevel / 3);
        this.chaosSealTicket--;
        if (this.chaosSealTicket <= 0) {
          this.chaosSealTicket = 0;
          this.chaosSealActive = false;
        }
      }
    }

    this.save();
    if (window.Achievement) Achievement.checkAll();
    return success;
  },

  /* =========================
     월드3 보스 보상
  ========================= */
  onBossKilled(id) {
    const kills = this.killStats[id] || 0;

    if (kills > 0 && kills % 10 === 0) {
      if (id === 'w3_poseidon') this.atlantisToken++;
      if (id === 'w3_hades') this.underworldToken++;
      if (id === 'w3_zeus') this.thunderToken++;
      this.world3BossPowerMul *= 1.05;
    }

    if (id === 'w3_poseidon' && kills >= 100 && this.poseidonGoldMul < 1.5) {
      this.poseidonGoldMul = 1.5;
    }

    if (id === 'w3_hades' && kills >= 100 && this.hadesDamageMul < 2.0) {
      this.hadesDamageMul = 2.0;
    }

    if (id === 'w3_zeus' && kills >= 100 && !this.unlockDoubleGuarantee) {
      this.unlockDoubleGuarantee = true;
    }

    this.save();
  }
};