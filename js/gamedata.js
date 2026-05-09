// 운명 아이템 성공 확률 보정값 (%p)
// 예) 10이면 기본 확률에서 +10%p, -5이면 -5%p
// 이 값만 바꾸면 운명 아이템 강화 성공확률을 직접 조정할 수 있습니다.
const FATE_SUCCESS_RATE_BONUS = {
  dice: 5,
  dual: 10,
  scale: 10,
  chaos: 10,
};

const DAMAGE_SCALING_TUNING = {
  // Soft cap: below start => linear, above start => slope 비율만큼 감소
  achievementSoftCapStart: 2.0,
  achievementSoftCapSlope: 0.05,   // 0.10→0.05: 2x 이상 구간에서 획득량 95% 감소
  world3SoftCapStart: 1.2,         // 1.3→1.2: 소프트캡 시작점 낮춤
  world3SoftCapSlope: 0.15,        // 0.25→0.15: 더 강한 감소
  hadesSoftCapStart: 1.1,          // 1.15→1.1
  hadesSoftCapSlope: 0.20,         // 0.25→0.20

  // World 3 보스 처치 배율 (10킬마다 누적)
  world3BossGrowthPerMilestone: 1.02, // 1.03→1.02: 성장 속도 완화
  world3BossHardCap: 2.0              // 2.6→2.0: 상한선 낮춤
};

/* ── 한국식 숫자 단위 포맷 (전역) ── */
window.fmtNum = function(n) {
  const v = Number(n) || 0;
  if (!isFinite(v)) return '∞';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  const fmt1 = (x) => {
    const rounded = x >= 100 ? Math.round(x) : Math.round(x * 10) / 10;
    return (rounded % 1 === 0)
      ? rounded.toLocaleString('ko-KR')
      : rounded.toFixed(1);
  };
  if (abs >= 1e24) return sign + fmt1(abs / 1e24) + '자';
  if (abs >= 1e20) return sign + fmt1(abs / 1e20) + '해';
  if (abs >= 1e16) return sign + fmt1(abs / 1e16) + '경';
  if (abs >= 1e12) return sign + fmt1(abs / 1e12) + '조';
  if (abs >= 1e8)  return sign + fmt1(abs / 1e8)  + '억';
  if (abs >= 1e4)  return sign + fmt1(abs / 1e4)  + '만';
  return sign + Math.floor(abs).toLocaleString('ko-KR');
};

function applySoftCapMultiplier(raw, capStart, slope) {
  const value = Math.max(1, Number(raw) || 1);
  const start = Math.max(1, Number(capStart) || 1);
  const gainSlope = Math.max(0, Math.min(1, Number(slope) || 0));
  if (value <= start) return value;
  return start + (value - start) * gainSlope;
}

const DEFAULT_BATTLE_STATS = {
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

const DEFAULT_EQUIPPED_ITEMS = {
  weapon: null,
  armor: null,
  rune: null
};

const DEFAULT_SKILL_SLOTS = [null, null, null];

function normalizeBattleStats(raw) {
  const normalized = { ...DEFAULT_BATTLE_STATS };
  if (!raw || typeof raw !== 'object') return normalized;

  Object.keys(DEFAULT_BATTLE_STATS).forEach((key) => {
    const value = Number(raw[key]);
    normalized[key] = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  });
  return normalized;
}

function normalizeLootInventory(raw) {
  const normalized = {};
  if (!raw || typeof raw !== 'object') return normalized;

  Object.keys(raw).forEach((id) => {
    const count = Number(raw[id]);
    if (Number.isFinite(count) && count > 0) {
      normalized[id] = Math.floor(count);
    }
  });
  return normalized;
}

function normalizeEquippedItems(raw) {
  const normalized = { ...DEFAULT_EQUIPPED_ITEMS };
  if (!raw || typeof raw !== 'object') return normalized;

  Object.keys(DEFAULT_EQUIPPED_ITEMS).forEach((slot) => {
    const value = raw[slot];
    normalized[slot] = typeof value === 'string' && value.trim() ? value : null;
  });
  return normalized;
}

function normalizeSkillSlots(raw) {
  const base = Array.isArray(raw) ? raw.slice(0, DEFAULT_SKILL_SLOTS.length) : [];
  while (base.length < DEFAULT_SKILL_SLOTS.length) base.push(null);
  return base.map((value) => (typeof value === 'string' && value.trim() ? value : null));
}

const GameData = {
  /* =========================
     기본 스탯
  ========================= */
  level: Number(localStorage.getItem('level')) || 0,
  damage: (() => {
    const lv = Number(localStorage.getItem('level')) || 0;
    return Math.max(1, lv * 30);
  })(),
  gold: Number(localStorage.getItem('gold')) || 0,

  /* =========================
     ❤️ 플레이어 HP
  ========================= */
  maxHp: (() => {
    const lv = Number(localStorage.getItem('level')) || 0;
    return 210 + lv * 10;
  })(),
  currentHp: (() => {
    const lv = Number(localStorage.getItem('level')) || 0;
    const maxHp = 210 + lv * 10;
    const saved = Number(localStorage.getItem('currentHp'));
    return Number.isFinite(saved) && saved > 0 ? Math.min(saved, maxHp) : maxHp;
  })(),

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
  protectTicket: Number(localStorage.getItem('protectTicket')) || 0,
  antidotePoison: Number(localStorage.getItem('antidotePoison')) || 0,
  antidoteBleed: Number(localStorage.getItem('antidoteBleed')) || 0,
  antidoteBurn: Number(localStorage.getItem('antidoteBurn')) || 0,
  antidoteShock: Number(localStorage.getItem('antidoteShock')) || 0,
  antidoteFrost: Number(localStorage.getItem('antidoteFrost')) || 0,
  hpPotionSmall: Number(localStorage.getItem('hpPotionSmall')) || 0,
  hpPotionMedium: Number(localStorage.getItem('hpPotionMedium')) || 0,
  hpPotionLarge: Number(localStorage.getItem('hpPotionLarge')) || 0,

  noDropActive: localStorage.getItem('noDropActive') === 'true',
  guaranteeActive: localStorage.getItem('guaranteeActive') === 'true',
  protectActive: localStorage.getItem('protectActive') === 'true',

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
  battleStats: (() => {
    try {
      return normalizeBattleStats(JSON.parse(localStorage.getItem('battleStats') || '{}'));
    } catch {
      return normalizeBattleStats();
    }
  })(),
  lootInventory: (() => {
    try {
      return normalizeLootInventory(JSON.parse(localStorage.getItem('lootInventory') || '{}'));
    } catch {
      return normalizeLootInventory();
    }
  })(),
  equippedItems: (() => {
    try {
      return normalizeEquippedItems(JSON.parse(localStorage.getItem('equippedItems') || '{}'));
    } catch {
      return normalizeEquippedItems();
    }
  })(),
  equippedActiveSkills: (() => {
    try {
      return normalizeSkillSlots(JSON.parse(localStorage.getItem('equippedActiveSkills') || '[]'));
    } catch {
      return normalizeSkillSlots();
    }
  })(),
  equippedPassiveSkills: (() => {
    try {
      return normalizeSkillSlots(JSON.parse(localStorage.getItem('equippedPassiveSkills') || '[]'));
    } catch {
      return normalizeSkillSlots();
    }
  })(),
  skillResetTicket: Number(localStorage.getItem('skillResetTicket')) || 0,
  dailyQuestState: (() => {
    try { return JSON.parse(localStorage.getItem('dailyQuestState') || 'null'); } catch { return null; }
  })(),

  now() {
    return Date.now();
  },

  ensureLootInventory() {
    this.lootInventory = normalizeLootInventory(this.lootInventory);
    return this.lootInventory;
  },

  ensureEquippedItems() {
    this.equippedItems = normalizeEquippedItems(this.equippedItems);
    return this.equippedItems;
  },

  ensureSkillLoadout() {
    this.equippedActiveSkills = normalizeSkillSlots(this.equippedActiveSkills);
    this.equippedPassiveSkills = normalizeSkillSlots(this.equippedPassiveSkills);
    this.skillResetTicket = Math.max(0, Math.floor(Number(this.skillResetTicket) || 0));
    return {
      active: this.equippedActiveSkills,
      passive: this.equippedPassiveSkills
    };
  },

  getItemCount(itemId) {
    if (!itemId) return 0;
    const inventory = this.ensureLootInventory();
    return Number(inventory[itemId]) || 0;
  },

  addLootItem(itemId, amount = 1, autoSave = true) {
    if (!itemId) return 0;
    const count = Math.max(1, Math.floor(Number(amount) || 1));
    const inventory = this.ensureLootInventory();
    inventory[itemId] = (Number(inventory[itemId]) || 0) + count;
    if (autoSave) this.save();
    return inventory[itemId];
  },

  setEquippedItem(slot, itemId, autoSave = true) {
    const equipped = this.ensureEquippedItems();
    if (!(slot in equipped)) return false;

    if (itemId == null || itemId === '') {
      equipped[slot] = null;
      if (autoSave) this.save();
      return true;
    }

    if (this.getItemCount(itemId) <= 0) return false;

    const itemDef = window.ItemDefs?.getById?.(itemId);
    if (!itemDef || itemDef.slot !== slot) return false;

    equipped[slot] = itemId;
    if (autoSave) this.save();
    return true;
  },

  getCombatBonuses() {
    const total = {
      damageFlat: 0,
      hpFlat: 0,
      damageMul: 1
    };

    const equipped = this.ensureEquippedItems();
    Object.values(equipped).forEach((itemId) => {
      if (!itemId) return;
      const itemDef = window.ItemDefs?.getById?.(itemId);
      if (!itemDef || !itemDef.bonus) return;

      const bonus = itemDef.bonus;
      if (Number.isFinite(Number(bonus.damageFlat))) {
        total.damageFlat += Number(bonus.damageFlat);
      }
      if (Number.isFinite(Number(bonus.hpFlat))) {
        total.hpFlat += Number(bonus.hpFlat);
      }
      if (Number.isFinite(Number(bonus.damageMul)) && Number(bonus.damageMul) > 0) {
        total.damageMul *= Number(bonus.damageMul);
      }
    });

    total.damageFlat = Math.floor(total.damageFlat);
    total.hpFlat = Math.floor(total.hpFlat);
    return total;
  },

  getEffectiveMaxHp() {
    const bonuses = this.getCombatBonuses();
    return Math.max(1, Math.floor((Number(this.maxHp) || 1) + bonuses.hpFlat));
  },

  clampCurrentHpToMax() {
    const hp = Math.max(0, Number(this.currentHp) || 0);
    this.currentHp = Math.min(hp, this.getEffectiveMaxHp());
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
    this.currentHp = this.getEffectiveMaxHp();
    this.save();
  },

  heal(amount) {
    const value = Math.max(0, Number(amount) || 0);
    this.currentHp = Math.min(this.getEffectiveMaxHp(), this.currentHp + value);
    this.save();
  },

  isDead() {
    return this.currentHp <= 0;
  },

  ensureBattleStats() {
    this.battleStats = normalizeBattleStats(this.battleStats);
    return this.battleStats;
  },

  addBattleStat(key, amount = 1, autoSave = true) {
    if (!(key in DEFAULT_BATTLE_STATS)) return;
    const delta = Math.max(0, Math.floor(Number(amount) || 0));
    if (delta <= 0) return;

    const stats = this.ensureBattleStats();
    stats[key] += delta;
    if (autoSave) this.save();
  },

  addBattleDuration(ms, autoSave = true) {
    const sec = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
    if (sec <= 0) return;
    this.addBattleStat('totalBattleSeconds', sec, false);
    if (autoSave) this.save();
  },

  addBattleCount(autoSave = true) {
    this.addBattleStat('totalBattles', 1, false);
    if (autoSave) this.save();
  },

  /* =========================
     공격력 계산
  ========================= */
  getCurrentDamage() {
    const bonuses = this.getCombatBonuses();
    let dmg = this.damage + bonuses.damageFlat;
    dmg *= bonuses.damageMul;

    const achievementMul = applySoftCapMultiplier(
      this.achievementDamageMul,
      DAMAGE_SCALING_TUNING.achievementSoftCapStart,
      DAMAGE_SCALING_TUNING.achievementSoftCapSlope
    );
    const hadesMul = applySoftCapMultiplier(
      this.hadesDamageMul,
      DAMAGE_SCALING_TUNING.hadesSoftCapStart,
      DAMAGE_SCALING_TUNING.hadesSoftCapSlope
    );
    const world3Mul = applySoftCapMultiplier(
      this.world3BossPowerMul,
      DAMAGE_SCALING_TUNING.world3SoftCapStart,
      DAMAGE_SCALING_TUNING.world3SoftCapSlope
    );

    dmg *= achievementMul;
    dmg *= hadesMul;
    dmg *= world3Mul;

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
    this.ensureLootInventory();
    this.ensureEquippedItems();
    this.ensureSkillLoadout();
    this.clampCurrentHpToMax();
    this.hpPotionSmall = Math.min(20, Math.max(0, Math.floor(Number(this.hpPotionSmall) || 0)));
    this.hpPotionMedium = Math.min(20, Math.max(0, Math.floor(Number(this.hpPotionMedium) || 0)));
    this.hpPotionLarge = Math.min(20, Math.max(0, Math.floor(Number(this.hpPotionLarge) || 0)));

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
    localStorage.setItem('protectTicket', this.protectTicket);
    localStorage.setItem('antidotePoison', this.antidotePoison);
    localStorage.setItem('antidoteBleed', this.antidoteBleed);
    localStorage.setItem('antidoteBurn', this.antidoteBurn);
    localStorage.setItem('antidoteShock', this.antidoteShock);
    localStorage.setItem('antidoteFrost', this.antidoteFrost);
    localStorage.setItem('hpPotionSmall', this.hpPotionSmall);
    localStorage.setItem('hpPotionMedium', this.hpPotionMedium);
    localStorage.setItem('hpPotionLarge', this.hpPotionLarge);
    localStorage.setItem('noDropActive', this.noDropActive);
    localStorage.setItem('guaranteeActive', this.guaranteeActive);
    localStorage.setItem('protectActive', this.protectActive);

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
    localStorage.setItem('battleStats', JSON.stringify(this.ensureBattleStats()));
    localStorage.setItem('lootInventory', JSON.stringify(this.lootInventory));
    localStorage.setItem('equippedItems', JSON.stringify(this.equippedItems));
    localStorage.setItem('equippedActiveSkills', JSON.stringify(this.equippedActiveSkills));
    localStorage.setItem('equippedPassiveSkills', JSON.stringify(this.equippedPassiveSkills));
    localStorage.setItem('skillResetTicket', this.skillResetTicket);
    if (this.dailyQuestState !== undefined) {
      localStorage.setItem('dailyQuestState', JSON.stringify(this.dailyQuestState));
    }
  },

  resetAllProgress() {
    Object.assign(this, {
      level: 0,
      damage: 1,
      gold: 0,
      maxHp: 210,
      currentHp: 210,
      achievementDamageMul: 1.0,
      achievementGoldMul: 1.0,
      damageBuffUntil: 0,
      goldBuffUntil: 0,
      noDropTicket: 0,
      guaranteeTicket: 0,
      protectTicket: 0,
      antidotePoison: 0,
      antidoteBleed: 0,
      antidoteBurn: 0,
      antidoteShock: 0,
      antidoteFrost: 0,
      hpPotionSmall: 0,
      hpPotionMedium: 0,
      hpPotionLarge: 0,
      noDropActive: false,
      guaranteeActive: false,
      protectActive: false,
      doubleGuaranteeTicket: 0,
      doubleGuaranteeActive: false,
      unlockDoubleGuarantee: false,
      poseidonGoldMul: 1.0,
      hadesDamageMul: 1.0,
      world3BossPowerMul: 1.0,
      atlantisToken: 0,
      underworldToken: 0,
      thunderToken: 0,
      fateDiceTicket: 0,
      dualSealTicket: 0,
      fateScaleTicket: 0,
      chaosSealTicket: 0,
      fateDiceActive: false,
      dualSealActive: false,
      fateScaleActive: false,
      chaosSealActive: false,
      fateScalePity: false,
      totalGold: 0,
      killStats: {},
      battleStats: normalizeBattleStats(),
      lootInventory: {},
      equippedItems: normalizeEquippedItems(),
      equippedActiveSkills: normalizeSkillSlots(),
      equippedPassiveSkills: normalizeSkillSlots(),
      skillResetTicket: 0
    });

    localStorage.removeItem('achievements');
    this.save();
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

  getBaseSuccessRate() {
    if (this.level < 10)  return 100;
    if (this.level < 30)  return Math.max(95 - (this.level - 10), 75);
    if (this.level < 60)  return Math.max(75 - (this.level - 30) * 0.67, 55);
    if (this.level < 100) return Math.max(55 - (this.level - 60) * 0.5, 35);
    if (this.level < 200) return Math.max(35 - (this.level - 100) * 0.15, 20);
    return 20;
  },

  /* =========================
     강화 확률
  ========================= */
  getSuccessRate(fateType = this.getActiveFateType()) {
    if (this.fateScalePity) return 100;
    if (this.doubleGuaranteeActive && this.doubleGuaranteeTicket > 0) return 100;
    if (this.guaranteeActive && this.guaranteeTicket > 0) return 100;

    let rate = this.getBaseSuccessRate();
    const bonus = Number(FATE_SUCCESS_RATE_BONUS[fateType] || 0);
    rate += bonus;
   

    return Math.max(1, Math.min(100, Math.round(rate)));
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

    const rate = this.getSuccessRate(fateType);
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
          this.level += 2;
          this.doubleGuaranteeTicket--;
          if (this.doubleGuaranteeTicket <= 0) {
            this.doubleGuaranteeTicket = 0;
            this.doubleGuaranteeActive = false;
          }
        } else {
          this.level += 1;
          if (isGuarantee) {
            this.guaranteeTicket--;
            if (this.guaranteeTicket <= 0) {
              this.guaranteeTicket = 0;
              this.guaranteeActive = false;
            }
          }
        }
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
      let fateNextLevel = startLevel;

      if (success) {
        if (isDouble) {
          this.doubleGuaranteeTicket--;
          if (this.doubleGuaranteeTicket <= 0) {
            this.doubleGuaranteeTicket = 0;
            this.doubleGuaranteeActive = false;
          }
        } else {
          if (isGuarantee) {
            this.guaranteeTicket--;
            if (this.guaranteeTicket <= 0) {
              this.guaranteeTicket = 0;
              this.guaranteeActive = false;
            }
          }
        }
      }

      if (fateType === 'dice') {
        fateNextLevel = success ? startLevel * 2 : Math.floor(startLevel / 2);
        this.fateDiceTicket--;
        if (this.fateDiceTicket <= 0) {
          this.fateDiceTicket = 0;
          this.fateDiceActive = false;
        }
      }

      if (fateType === 'dual') {
        fateNextLevel = success
          ? startLevel * 2
          : Math.max(Math.floor(startLevel / 2), Math.floor(startLevel * 0.7));
        this.dualSealTicket--;
        if (this.dualSealTicket <= 0) {
          this.dualSealTicket = 0;
          this.dualSealActive = false;
        }
      }

      if (fateType === 'scale') {
        fateNextLevel = success ? startLevel * 2 : Math.floor(startLevel / 2);
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
        fateNextLevel = success ? startLevel * 3 : Math.floor(startLevel / 3);
        this.chaosSealTicket--;
        if (this.chaosSealTicket <= 0) {
          this.chaosSealTicket = 0;
          this.chaosSealActive = false;
        }
      }

      this.level = Math.max(0, Math.floor(Number(fateNextLevel) || 0));
    }

    // 레벨 기반 스탯 재계산
    this.damage = Math.max(1, this.level * 30);
    this.maxHp = 210 + this.level * 10;
    this.clampCurrentHpToMax();

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
      this.world3BossPowerMul = Math.min(
        DAMAGE_SCALING_TUNING.world3BossHardCap,
        this.world3BossPowerMul * DAMAGE_SCALING_TUNING.world3BossGrowthPerMilestone
      );
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

if (typeof window !== 'undefined') {
  window.GameData = GameData;
}
