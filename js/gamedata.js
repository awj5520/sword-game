const GameData = {
  /* =========================
     기본 스탯
  ========================= */
  level: Number(localStorage.getItem('level')) || 0,
  damage: Number(localStorage.getItem('damage')) || 10,
  gold: Number(localStorage.getItem('gold')) || 0,

  /* =========================
     🏆 업적 배율(기존)
  ========================= */
  achievementDamageMul:
    Number(localStorage.getItem('achievementDamageMul')) || 1.0,

  achievementGoldMul:
    Number(localStorage.getItem('achievementGoldMul')) || 1.0,

  /* =========================
     버프 / 아이템(기존)
  ========================= */
  damageBuffUntil: Number(localStorage.getItem('damageBuffUntil')) || 0,
  goldBuffUntil: Number(localStorage.getItem('goldBuffUntil')) || 0,

  noDropTicket: Number(localStorage.getItem('noDropTicket')) || 0,
  guaranteeTicket: Number(localStorage.getItem('guaranteeTicket')) || 0,

  noDropActive: localStorage.getItem('noDropActive') === 'true',
  guaranteeActive: localStorage.getItem('guaranteeActive') === 'true',

  /* =========================
     🔥 200% 강화권(✅ 신규)
     - 성공 100% + 강화가 +2
  ========================= */
  doubleGuaranteeTicket: Number(localStorage.getItem('doubleGuaranteeTicket')) || 0,
  doubleGuaranteeActive: localStorage.getItem('doubleGuaranteeActive') === 'true',

  /* 제우스 100회 보상: 상점에 200% 강화권 해금 */
  unlockDoubleGuarantee: localStorage.getItem('unlockDoubleGuarantee') === 'true',

  /* =========================
     🌠 월드3 영구 보상(✅ 신규)
  ========================= */
  // 포세이돈 100회: 골드 영구 1.5배
  poseidonGoldMul: Number(localStorage.getItem('poseidonGoldMul')) || 1.0,
  // 하데스 100회: 데미지 영구 2배
  hadesDamageMul: Number(localStorage.getItem('hadesDamageMul')) || 1.0,

  // 증표/강해짐 시스템: (아틀란티스/저승/천둥의 성) 보스 10회마다 영구 데미지 강화
  world3BossPowerMul: Number(localStorage.getItem('world3BossPowerMul')) || 1.0,

  // “증표” 카운트(표시용)
  atlantisToken: Number(localStorage.getItem('atlantisToken')) || 0,
  underworldToken: Number(localStorage.getItem('underworldToken')) || 0,
  thunderToken: Number(localStorage.getItem('thunderToken')) || 0,

  /* =========================
     업적/기록 데이터(기존)
  ========================= */
  totalGold: Number(localStorage.getItem('totalGold')) || 0,
  killStats: JSON.parse(localStorage.getItem('killStats')) || {},

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

    /* ✅ 200% 강화권 저장 */
    localStorage.setItem('doubleGuaranteeTicket', this.doubleGuaranteeTicket);
    localStorage.setItem('doubleGuaranteeActive', this.doubleGuaranteeActive);
    localStorage.setItem('unlockDoubleGuarantee', this.unlockDoubleGuarantee);

    /* ✅ 월드3 영구 보상 저장 */
    localStorage.setItem('poseidonGoldMul', this.poseidonGoldMul);
    localStorage.setItem('hadesDamageMul', this.hadesDamageMul);
    localStorage.setItem('world3BossPowerMul', this.world3BossPowerMul);
    localStorage.setItem('atlantisToken', this.atlantisToken);
    localStorage.setItem('underworldToken', this.underworldToken);
    localStorage.setItem('thunderToken', this.thunderToken);

    localStorage.setItem('totalGold', this.totalGold);
    localStorage.setItem('killStats', JSON.stringify(this.killStats));
  },

  /* =========================
     데미지 계산
  ========================= */
  getCurrentDamage() {
    let dmg = this.damage;

    // 기존 업적 배율
    dmg *= this.achievementDamageMul;

    // ✅ 월드3: 보스 10회 보상 누적(영구)
    dmg *= this.world3BossPowerMul;

    // ✅ 하데스 100회 보상(영구 2배)
    dmg *= this.hadesDamageMul;

    // 기존 물약(원본 유지: 1.5배로 돼있었음)
    if (this.damageBuffUntil > this.now()) {
      dmg *= 1.5;
    }

    return Math.floor(dmg);
  },

  /* =========================
     💰 골드 획득
  ========================= */
  earnGold(baseGold) {
    let g = Number(baseGold) || 0;

    // 기존 업적 배율
    g *= this.achievementGoldMul;

    // ✅ 포세이돈 100회 보상(영구 1.5배)
    g *= this.poseidonGoldMul;

    // 기존 물약 2배
    if (this.goldBuffUntil > this.now()) {
      g *= 2;
    }

    g = Math.floor(g);

    this.gold += g;
    this.totalGold += g;

    return g;
  },

  /* =========================
     강화 확률
  ========================= */
  getSuccessRate() {
    // ✅ 200% 강화권이 최우선
    if (this.doubleGuaranteeActive && this.doubleGuaranteeTicket > 0) return 100;
    // ✅ 100% 강화권
    if (this.guaranteeActive && this.guaranteeTicket > 0) return 100;

    if (this.level < 10) return 100;
    if (this.level < 30) return Math.max(95 - (this.level - 10), 75);
    if (this.level < 60) return Math.max(75 - (this.level - 30) * 0.67, 55);
    if (this.level < 100) return Math.max(55 - (this.level - 60) * 0.5, 35);
    if (this.level < 200) return Math.max(35 - (this.level - 100) * 0.15, 20);
    return 20;
  },

  /* =========================
     🔨 강화
     - 200% 강화권: 성공 100% + level +2 (한번에 2강)
     - 100% 강화권: 성공 100% + level +1
     - 하락 방지권: 실패 시 하락 방지
  ========================= */
  upgrade() {
    const rate = this.getSuccessRate();
    const success = Math.random() * 100 < rate;

    if (success) {
      // ✅ 200% 강화권이 켜져있으면 +2
      if (this.doubleGuaranteeActive && this.doubleGuaranteeTicket > 0) {
        this.level += 2;
        this.damage += 10; // 기존 +1당 damage+5였으니 2배

        this.doubleGuaranteeTicket--;
        if (this.doubleGuaranteeTicket <= 0) {
          this.doubleGuaranteeTicket = 0;
          this.doubleGuaranteeActive = false;
        }
      }
      // ✅ 아니면 100% 강화권(또는 일반 성공) +1
      else {
        this.level += 1;
        this.damage += 5;

        if (this.guaranteeActive && this.guaranteeTicket > 0) {
          this.guaranteeTicket--;
          if (this.guaranteeTicket <= 0) {
            this.guaranteeTicket = 0;
            this.guaranteeActive = false;
          }
        }
      }
    } else {
      // 실패
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

    this.save();
    if (window.Achievement) Achievement.checkAll();
    return success;
  },

  /* =========================
     🌠 월드3 보스 처치 보상 처리(✅ 신규)
     - 보스 10회: “증표” 1개 지급 + 영구 데미지 강화(누적)
     - 포세이돈 100회: 골드 영구 1.5배
     - 하데스 100회: 데미지 영구 2배
     - 제우스 100회: 200% 강화권 상점 해금
  ========================= */
  onBossKilled(achId) {
    // 3세계 보스 achId 기준
    const isPoseidon = achId === 'w3_poseidon';
    const isHades = achId === 'w3_hades';
    const isZeus = achId === 'w3_zeus';

    if (!isPoseidon && !isHades && !isZeus) return;

    const kills = this.killStats[achId] || 0;

    // ✅ 10회마다: 증표 + 영구 강화(누적)
    // 강화량은 원하는대로 바꿀 수 있음(현재: 10회마다 데미지 5% 증가)
    if (kills > 0 && kills % 10 === 0) {
      if (isPoseidon) this.atlantisToken++;
      if (isHades) this.underworldToken++;
      if (isZeus) this.thunderToken++;

      this.world3BossPowerMul *= 1.05;
    }

    // ✅ 100회 보상
    if (isPoseidon && kills >= 100 && this.poseidonGoldMul < 1.5) {
      this.poseidonGoldMul = 1.5;
    }

    if (isHades && kills >= 100 && this.hadesDamageMul < 2.0) {
      this.hadesDamageMul = 2.0;
    }

    if (isZeus && kills >= 100 && !this.unlockDoubleGuarantee) {
      this.unlockDoubleGuarantee = true;
    }

    this.save();
  }
};