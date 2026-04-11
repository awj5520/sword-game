(function initItemDefs(globalScope) {
  const SLOT_ORDER = ['weapon', 'armor', 'rune'];

  const STAGE_GROUPS = [
    { world: 1, area: 'grass', areaLabel: '초원', maxStage: 5 },
    { world: 1, area: 'orc', areaLabel: '오크', maxStage: 5 },
    { world: 1, area: 'dragon', areaLabel: '드래곤', maxStage: 5 },
    { world: 1, area: 'space', areaLabel: '우주', maxStage: 3 },

    { world: 2, area: 'cave', areaLabel: '동굴', maxStage: 5 },
    { world: 2, area: 'grave', areaLabel: '무덤', maxStage: 5 },
    { world: 2, area: 'demon', areaLabel: '악마', maxStage: 5 },
    { world: 2, area: 'hell', areaLabel: '지옥', maxStage: 3 },

    { world: 3, area: 'atlantis', areaLabel: '아틀란티스', maxStage: 5 },
    { world: 3, area: 'underworld', areaLabel: '언더월드', maxStage: 5 },
    { world: 3, area: 'thunder', areaLabel: '천둥', maxStage: 5 },
    { world: 3, area: 'divine', areaLabel: '신계', maxStage: 3 },
    { world: 3, area: 'rift', areaLabel: '운명의 균열', maxStage: 4 }
  ];

  const ICON_BY_SLOT_AND_RARITY = {
    weapon: {
      common: 'images/items/weapon_bronze_blade.svg',
      rare: 'images/items/weapon_crimson_saber.svg',
      epic: 'images/items/weapon_star_lance.svg',
      legendary: 'images/items/weapon_star_lance.svg'
    },
    armor: {
      common: 'images/items/armor_hunter_jacket.svg',
      rare: 'images/items/armor_bone_plate.svg',
      epic: 'images/items/armor_titan_shell.svg',
      legendary: 'images/items/armor_titan_shell.svg'
    },
    rune: {
      common: 'images/items/rune_guard.svg',
      rare: 'images/items/rune_fury.svg',
      epic: 'images/items/rune_abyss.svg',
      legendary: 'images/items/rune_abyss.svg'
    }
  };

  function toStageKey(world, area, stage) {
    return `${Number(world)}:${String(area)}:${Number(stage)}`;
  }

  function buildStageCatalog() {
    const list = [];
    let stageOrder = 0;

    STAGE_GROUPS.forEach((group) => {
      for (let stage = 1; stage <= group.maxStage; stage += 1) {
        stageOrder += 1;
        list.push({
          world: group.world,
          area: group.area,
          areaLabel: group.areaLabel,
          stage,
          maxStage: group.maxStage,
          isBoss: stage === group.maxStage,
          stageOrder,
          stageKey: toStageKey(group.world, group.area, stage)
        });
      }
    });

    return list;
  }

  function getRarity(order, world, isBoss) {
    if (world >= 3 && isBoss) return 'legendary';
    if (isBoss || order >= 40) return 'epic';
    if (order >= 18) return 'rare';
    return 'common';
  }

  function toDamageMultiplier(raw) {
    const value = Math.max(1, Number(raw) || 1);
    return Math.round(value * 1000) / 1000;
  }

  function createStageWeapon(stageInfo) {
    const rarity = getRarity(stageInfo.stageOrder, stageInfo.world, stageInfo.isBoss);
    const damageFlat = Math.floor(8 + stageInfo.stageOrder * 8 + (stageInfo.isBoss ? 30 : 0));
    const damageMul = toDamageMultiplier(
      1 + Math.min(0.2, stageInfo.stageOrder * 0.0018 + (stageInfo.isBoss ? 0.012 : 0))
    );
    return {
      id: `weapon_${stageInfo.world}_${stageInfo.area}_${stageInfo.stage}`,
      slot: 'weapon',
      name: `${stageInfo.areaLabel} ${stageInfo.stage}단계 검`,
      rarity,
      icon: ICON_BY_SLOT_AND_RARITY.weapon[rarity],
      bonus: { damageFlat, damageMul },
      sourceStageKey: stageInfo.stageKey,
      sourceLabel: `${stageInfo.areaLabel} ${stageInfo.stage}단계`,
      stageOrder: stageInfo.stageOrder
    };
  }

  function createStageArmor(stageInfo) {
    const rarity = getRarity(stageInfo.stageOrder, stageInfo.world, stageInfo.isBoss);
    const hpFlat = Math.floor(80 + stageInfo.stageOrder * 110 + (stageInfo.isBoss ? 350 : 0));
    const maybeDamageMul = stageInfo.stageOrder >= 28
      ? toDamageMultiplier(1 + Math.min(0.12, stageInfo.stageOrder * 0.001))
      : 1;

    const bonus = { hpFlat };
    if (maybeDamageMul > 1) {
      bonus.damageMul = maybeDamageMul;
    }

    return {
      id: `armor_${stageInfo.world}_${stageInfo.area}_${stageInfo.stage}`,
      slot: 'armor',
      name: `${stageInfo.areaLabel} ${stageInfo.stage}단계 갑옷`,
      rarity,
      icon: ICON_BY_SLOT_AND_RARITY.armor[rarity],
      bonus,
      sourceStageKey: stageInfo.stageKey,
      sourceLabel: `${stageInfo.areaLabel} ${stageInfo.stage}단계`,
      stageOrder: stageInfo.stageOrder
    };
  }

  function createStageRune(stageInfo) {
    const rarity = getRarity(stageInfo.stageOrder, stageInfo.world, stageInfo.isBoss);
    const damageFlat = Math.floor(3 + stageInfo.stageOrder * 4 + (stageInfo.isBoss ? 18 : 0));
    const hpFlat = Math.floor(55 + stageInfo.stageOrder * 65 + (stageInfo.isBoss ? 220 : 0));
    const damageMul = toDamageMultiplier(
      1 + Math.min(0.25, stageInfo.stageOrder * 0.0022 + (stageInfo.isBoss ? 0.016 : 0))
    );

    return {
      id: `rune_${stageInfo.world}_${stageInfo.area}_${stageInfo.stage}`,
      slot: 'rune',
      name: `${stageInfo.areaLabel} ${stageInfo.stage}단계 룬`,
      rarity,
      icon: ICON_BY_SLOT_AND_RARITY.rune[rarity],
      bonus: { damageFlat, hpFlat, damageMul },
      sourceStageKey: stageInfo.stageKey,
      sourceLabel: `${stageInfo.areaLabel} ${stageInfo.stage}단계`,
      stageOrder: stageInfo.stageOrder
    };
  }

  const STAGE_CATALOG = buildStageCatalog();
  const STAGE_ITEM_IDS = {};
  const generatedItems = [];

  STAGE_CATALOG.forEach((stageInfo) => {
    const weapon = createStageWeapon(stageInfo);
    const armor = createStageArmor(stageInfo);
    const rune = createStageRune(stageInfo);

    generatedItems.push(weapon, armor, rune);
    STAGE_ITEM_IDS[stageInfo.stageKey] = {
      weapon: weapon.id,
      armor: armor.id,
      rune: rune.id
    };
  });

  const ITEM_BY_ID = generatedItems.reduce((acc, item) => {
    acc[item.id] = Object.freeze({ ...item });
    return acc;
  }, {});

  const ITEM_LIST = generatedItems.map((item) => ITEM_BY_ID[item.id]);

  const ITEMS_BY_SLOT = SLOT_ORDER.reduce((acc, slot) => {
    acc[slot] = ITEM_LIST
      .filter((item) => item.slot === slot)
      .sort((a, b) => a.stageOrder - b.stageOrder);
    return acc;
  }, {});

  function getById(id) {
    return ITEM_BY_ID[id] || null;
  }

  function getBySlot(slot) {
    return (ITEMS_BY_SLOT[slot] || []).slice();
  }

  function getStageItems(stageKey) {
    const ids = STAGE_ITEM_IDS[stageKey];
    if (!ids) return null;
    return { ...ids };
  }

  function formatBonus(bonus) {
    if (!bonus || typeof bonus !== 'object') return '효과 없음';
    const chunks = [];
    if (Number.isFinite(Number(bonus.damageFlat)) && Number(bonus.damageFlat) !== 0) {
      chunks.push(`공격력 +${Math.floor(Number(bonus.damageFlat))}`);
    }
    if (Number.isFinite(Number(bonus.hpFlat)) && Number(bonus.hpFlat) !== 0) {
      chunks.push(`최대 HP +${Math.floor(Number(bonus.hpFlat))}`);
    }
    if (Number.isFinite(Number(bonus.damageMul)) && Number(bonus.damageMul) !== 1) {
      const pct = Math.round((Number(bonus.damageMul) - 1) * 100);
      if (pct !== 0) {
        chunks.push(`공격력 +${pct}%`);
      }
    }
    return chunks.length ? chunks.join(', ') : '효과 없음';
  }

  globalScope.ItemDefs = {
    SLOT_ORDER: SLOT_ORDER.slice(),
    ITEM_LIST: ITEM_LIST.slice(),
    STAGE_CATALOG: STAGE_CATALOG.slice(),
    toStageKey,
    getById,
    getBySlot,
    getStageItems,
    formatBonus
  };
})(window);
