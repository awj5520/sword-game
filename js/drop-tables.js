(function initDropTables(globalScope) {
  const BOSS_STAGE_BY_AREA = {
    space: 3,
    hell: 3,
    divine: 3,
    rift: 4
  };

  function clampChance(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
  }

  function isBossStage(area, stageId) {
    const bossStage = Number(BOSS_STAGE_BY_AREA[String(area)] || 5);
    return Number(stageId) === bossStage;
  }

  function getBaseDropRates(worldNo, isBoss) {
    const table = {
      1: { weapon: 0.2, armor: 0.18, rune: 0.12 },
      2: { weapon: 0.24, armor: 0.22, rune: 0.16 },
      3: { weapon: 0.28, armor: 0.26, rune: 0.2 }
    };
    const row = table[worldNo] || table[1];
    if (!isBoss) return { ...row };

    return {
      weapon: clampChance(row.weapon + 0.35),
      armor: clampChance(row.armor + 0.32),
      rune: clampChance(row.rune + 0.28)
    };
  }

  function applyStageRateScale(baseRate, stageId) {
    const stageNo = Math.max(1, Number(stageId) || 1);
    const scaled = baseRate * (1 + (stageNo - 1) * 0.05);
    return clampChance(scaled);
  }

  function pickRandom(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)] || null;
  }

  function rollStageDrops({ world, area, stageId, isBoss } = {}) {
    if (!globalScope.ItemDefs || typeof globalScope.ItemDefs.getStageItems !== 'function') {
      return [];
    }

    const worldNo = Number(world) || 1;
    const stageNo = Math.max(1, Number(stageId) || 1);
    const stageKey = typeof globalScope.ItemDefs.toStageKey === 'function'
      ? globalScope.ItemDefs.toStageKey(worldNo, area, stageNo)
      : `${worldNo}:${String(area)}:${stageNo}`;
    const stageItems = globalScope.ItemDefs.getStageItems(stageKey);
    if (!stageItems) return [];

    const boss = typeof isBoss === 'boolean' ? isBoss : isBossStage(area, stageNo);
    const base = getBaseDropRates(worldNo, boss);
    const rates = {
      weapon: applyStageRateScale(base.weapon, stageNo),
      armor: applyStageRateScale(base.armor, stageNo),
      rune: applyStageRateScale(base.rune, stageNo)
    };

    const droppedIds = [];
    if (Math.random() < rates.weapon) droppedIds.push(stageItems.weapon);
    if (Math.random() < rates.armor) droppedIds.push(stageItems.armor);
    if (Math.random() < rates.rune) droppedIds.push(stageItems.rune);

    if (!droppedIds.length && boss) {
      const guaranteed = pickRandom([stageItems.weapon, stageItems.armor, stageItems.rune]);
      if (guaranteed) droppedIds.push(guaranteed);
    }

    return droppedIds;
  }

  globalScope.DropTables = {
    isBossStage,
    rollStageDrops
  };
})(window);
