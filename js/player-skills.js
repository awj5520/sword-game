(function initPlayerSkillsModule() {
  const SKILL_SLOT_COUNT = 3;

  function getGameData() {
    if (typeof GameData !== 'undefined') return GameData;
    if (typeof window !== 'undefined' && window.GameData) return window.GameData;
    return null;
  }

  const ACTIVE_SKILLS = [
    {
      id: 'active_piercing_thrust',
      name: '관통 찌르기',
      unlockLevel: 100,
      cooldownSec: 5,
      damageMultiplier: 1.9,
      hitCount: 1,
      description: '기본 공격력 비례 관통 일격'
    },
    {
      id: 'active_steel_combo',
      name: '강철 연격',
      unlockLevel: 300,
      cooldownSec: 7,
      damageMultiplier: 1.35,
      hitCount: 2,
      description: '기본 공격력 비례 2연속 타격'
    },
    {
      id: 'active_rift_smash',
      name: '균열 강타',
      unlockLevel: 700,
      cooldownSec: 8,
      damageMultiplier: 2.4,
      hitCount: 1,
      description: '기본 공격력 비례 균열 타격'
    },
    {
      id: 'active_bloodline_sever',
      name: '혈맥 절단',
      unlockLevel: 1500,
      cooldownSec: 10,
      damageMultiplier: 2.8,
      hitCount: 1,
      description: '기본 공격력 비례 고위력 절단'
    },
    {
      id: 'active_survival_slash',
      name: '생환 베기',
      unlockLevel: 3000,
      cooldownSec: 11,
      damageMultiplier: 1.55,
      hitCount: 3,
      description: '기본 공격력 비례 연속 생환 참격'
    },
    {
      id: 'active_laceration_burst',
      name: '열상 폭발',
      unlockLevel: 6000,
      cooldownSec: 12,
      damageMultiplier: 3.3,
      hitCount: 1,
      description: '기본 공격력 비례 열상 폭발'
    },
    {
      id: 'active_overcurrent_break',
      name: '과전류 파쇄',
      unlockLevel: 12000,
      cooldownSec: 13,
      damageMultiplier: 1.9,
      hitCount: 2,
      description: '기본 공격력 비례 과전류 연타'
    },
    {
      id: 'active_frost_shatter',
      name: '빙쇄 참격',
      unlockLevel: 20000,
      cooldownSec: 14,
      damageMultiplier: 3.8,
      hitCount: 1,
      description: '기본 공격력 비례 빙결 파쇄'
    },
    {
      id: 'active_focus_flurry',
      name: '집중 난무',
      unlockLevel: 35000,
      cooldownSec: 15,
      damageMultiplier: 1.35,
      hitCount: 4,
      description: '기본 공격력 비례 집중 난무 4연타'
    },
    {
      id: 'active_judgement_drop',
      name: '심판 낙하',
      unlockLevel: 50000,
      cooldownSec: 17,
      damageMultiplier: 4.8,
      hitCount: 1,
      description: '기본 공격력 비례 심판 일격'
    },
    {
      id: 'active_spacetime_split',
      name: '시공 분단',
      unlockLevel: 70000,
      cooldownSec: 19,
      damageMultiplier: 2.6,
      hitCount: 2,
      description: '기본 공격력 비례 시공 분할 2타'
    },
    {
      id: 'active_final_slaughter',
      name: '종결 참식',
      unlockLevel: 100000,
      cooldownSec: 21,
      damageMultiplier: 6.2,
      hitCount: 2,
      description: '기본 공격력 비례 종결 참식 2연격'
    }
  ];

  const PASSIVE_SKILLS = [
    {
      id: 'passive_battle_breath',
      name: '전투 호흡',
      unlockLevel: 200,
      effects: { cooldownReduction: 0.06 },
      description: '스킬 쿨타임 -6%'
    },
    {
      id: 'passive_hard_skin',
      name: '강인한 피부',
      unlockLevel: 500,
      effects: { maxHpMul: 1.15 },
      description: '최대 HP +15%'
    },
    {
      id: 'passive_critical_instinct',
      name: '치명 본능',
      unlockLevel: 1000,
      effects: { damageMul: 1.12 },
      description: '기본 공격력 +12%'
    },
    {
      id: 'passive_regen_pulse',
      name: '재생 맥동',
      unlockLevel: 2500,
      effects: { maxHpMul: 1.08, dotDamageTakenMul: 0.95 },
      description: '최대 HP +8%, 지속피해 -5%'
    },
    {
      id: 'passive_burn_resist',
      name: '화상 저항',
      unlockLevel: 5000,
      effects: { statusResistChance: 0.05 },
      description: '상태이상 저항 +5%'
    },
    {
      id: 'passive_shock_resist',
      name: '감전 저항',
      unlockLevel: 10000,
      effects: { statusResistChance: 0.06 },
      description: '상태이상 저항 +6%'
    },
    {
      id: 'passive_frost_resist',
      name: '빙결 저항',
      unlockLevel: 18000,
      effects: { statusResistChance: 0.07 },
      description: '상태이상 저항 +7%'
    },
    {
      id: 'passive_bleed_suppression',
      name: '출혈 억제',
      unlockLevel: 30000,
      effects: { dotDamageTakenMul: 0.9 },
      description: '지속피해 -10%'
    },
    {
      id: 'passive_poison_suppression',
      name: '중독 억제',
      unlockLevel: 45000,
      effects: { dotDamageTakenMul: 0.88 },
      description: '지속피해 -12%'
    },
    {
      id: 'passive_weight_adapt',
      name: '무게 적응',
      unlockLevel: 60000,
      effects: { statusResistChance: 0.08, cooldownReduction: 0.04 },
      description: '상태이상 저항 +8%, 쿨타임 -4%'
    },
    {
      id: 'passive_counter_stance',
      name: '반격 태세',
      unlockLevel: 80000,
      effects: { damageMul: 1.1, skillDamageMul: 1.1 },
      description: '기본/스킬 피해 +10%'
    },
    {
      id: 'passive_iron_will',
      name: '불굴 의지',
      unlockLevel: 100000,
      effects: { maxHpMul: 1.16, statusResistChance: 0.1, dotDamageTakenMul: 0.85 },
      description: '최대 HP +16%, 상태이상 저항 +10%, 지속피해 -15%'
    }
  ];

  const ACTIVE_ID_SET = new Set(ACTIVE_SKILLS.map((skill) => skill.id));
  const PASSIVE_ID_SET = new Set(PASSIVE_SKILLS.map((skill) => skill.id));

  function toNumericLevel(value) {
    if (Number.isFinite(Number(value))) return Math.max(0, Number(value));
    const raw = String(value ?? '').trim();
    if (!raw) return 0;
    const cleaned = raw.replace(/[^\d-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  function readCurrentLevel() {
    const gd = getGameData();
    if (gd && gd.level != null) {
      return toNumericLevel(gd.level);
    }
    try {
      return toNumericLevel(localStorage.getItem('level'));
    } catch {
      return 0;
    }
  }

  function normalizeSkillSlots(raw, allowedSet) {
    const arr = Array.isArray(raw) ? raw.slice(0, SKILL_SLOT_COUNT) : [];
    while (arr.length < SKILL_SLOT_COUNT) arr.push(null);
    return arr.map((id) => (typeof id === 'string' && allowedSet.has(id) ? id : null));
  }

  function ensureGameDataSkillState() {
    const gd = getGameData();
    if (!gd) return;

    gd.equippedActiveSkills = normalizeSkillSlots(
      gd.equippedActiveSkills,
      ACTIVE_ID_SET
    );
    gd.equippedPassiveSkills = normalizeSkillSlots(
      gd.equippedPassiveSkills,
      PASSIVE_ID_SET
    );

    if (!Number.isFinite(Number(gd.skillResetTicket))) {
      gd.skillResetTicket = 0;
    }
    gd.skillResetTicket = Math.max(0, Math.floor(Number(gd.skillResetTicket) || 0));
  }

  function getSkillsByType(type) {
    return type === 'active' ? ACTIVE_SKILLS : PASSIVE_SKILLS;
  }

  function getIdSetByType(type) {
    return type === 'active' ? ACTIVE_ID_SET : PASSIVE_ID_SET;
  }

  function getSkillById(type, id) {
    if (!id || typeof id !== 'string') return null;
    return getSkillsByType(type).find((skill) => skill.id === id) || null;
  }

  function getUnlockedSkills(type, level = readCurrentLevel()) {
    const currentLevel = toNumericLevel(level);
    return getSkillsByType(type).filter((skill) => currentLevel >= skill.unlockLevel);
  }

  function isUnlocked(skill, level = readCurrentLevel()) {
    if (!skill) return false;
    return toNumericLevel(level) >= Number(skill.unlockLevel || 0);
  }

  function getEquippedSkillIds(type) {
    ensureGameDataSkillState();
    const gd = getGameData();
    if (!gd) return [null, null, null];
    return type === 'active'
      ? gd.equippedActiveSkills.slice(0, SKILL_SLOT_COUNT)
      : gd.equippedPassiveSkills.slice(0, SKILL_SLOT_COUNT);
  }

  function getEquippedSkills(type) {
    return getEquippedSkillIds(type)
      .map((id) => getSkillById(type, id))
      .filter(Boolean);
  }

  function equipSkill(type, slotIndex, skillId) {
    ensureGameDataSkillState();
    const gd = getGameData();
    if (!gd) return false;
    const index = Number(slotIndex);
    if (!Number.isInteger(index) || index < 0 || index >= SKILL_SLOT_COUNT) return false;

    const key = type === 'active' ? 'equippedActiveSkills' : 'equippedPassiveSkills';
    const idSet = getIdSetByType(type);
    const list = gd[key].slice(0, SKILL_SLOT_COUNT);

    if (skillId == null || skillId === '') {
      list[index] = null;
      gd[key] = list;
      gd.save();
      return true;
    }

    if (typeof skillId !== 'string' || !idSet.has(skillId)) return false;
    const def = getSkillById(type, skillId);
    if (!isUnlocked(def)) return false;

    const duplicateIndex = list.findIndex((id) => id === skillId);
    if (duplicateIndex >= 0) {
      list[duplicateIndex] = null;
    }

    list[index] = skillId;
    gd[key] = list;
    gd.save();
    return true;
  }

  function clearAllEquippedSkills(save = true) {
    ensureGameDataSkillState();
    const gd = getGameData();
    if (!gd) return;
    gd.equippedActiveSkills = [null, null, null];
    gd.equippedPassiveSkills = [null, null, null];
    if (save) gd.save();
  }

  function getPassiveTotals(passiveSkills = getEquippedSkills('passive')) {
    const totals = {
      damageMul: 1,
      skillDamageMul: 1,
      maxHpMul: 1,
      statusResistChance: 0,
      dotDamageTakenMul: 1,
      cooldownReduction: 0
    };

    passiveSkills.forEach((skill) => {
      const fx = skill?.effects || {};
      if (Number.isFinite(Number(fx.damageMul)) && Number(fx.damageMul) > 0) {
        totals.damageMul *= Number(fx.damageMul);
      }
      if (Number.isFinite(Number(fx.skillDamageMul)) && Number(fx.skillDamageMul) > 0) {
        totals.skillDamageMul *= Number(fx.skillDamageMul);
      }
      if (Number.isFinite(Number(fx.maxHpMul)) && Number(fx.maxHpMul) > 0) {
        totals.maxHpMul *= Number(fx.maxHpMul);
      }
      if (Number.isFinite(Number(fx.dotDamageTakenMul)) && Number(fx.dotDamageTakenMul) > 0) {
        totals.dotDamageTakenMul *= Number(fx.dotDamageTakenMul);
      }
      if (Number.isFinite(Number(fx.statusResistChance))) {
        totals.statusResistChance += Number(fx.statusResistChance);
      }
      if (Number.isFinite(Number(fx.cooldownReduction))) {
        totals.cooldownReduction += Number(fx.cooldownReduction);
      }
    });

    totals.statusResistChance = Math.max(0, Math.min(0.75, totals.statusResistChance));
    totals.cooldownReduction = Math.max(0, Math.min(0.6, totals.cooldownReduction));
    totals.damageMul = Math.max(0.1, totals.damageMul);
    totals.skillDamageMul = Math.max(0.1, totals.skillDamageMul);
    totals.maxHpMul = Math.max(0.1, totals.maxHpMul);
    totals.dotDamageTakenMul = Math.max(0.05, totals.dotDamageTakenMul);

    return totals;
  }

  window.PlayerSkills = {
    SKILL_SLOT_COUNT,
    ACTIVE_SKILLS,
    PASSIVE_SKILLS,
    ensureGameData: ensureGameDataSkillState,
    getSkillById,
    getUnlockedSkills,
    getEquippedSkillIds,
    getEquippedSkills,
    equipSkill,
    clearAllEquippedSkills,
    getPassiveTotals,
    isUnlocked
  };

  ensureGameDataSkillState();
})();
