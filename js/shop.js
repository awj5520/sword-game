const goldText = document.getElementById('gold-text');
const MAX_HP_POTION_STACK = 20;
const MAX_SKILL_RESET_TICKET_STACK = 99;

const SHOP_ITEM_META = {
  damage: { icon: '⚔', rarity: 'rarity-rare', tag: 'BUFF' },
  gold: { icon: '🪙', rarity: 'rarity-rare', tag: 'BUFF' },
  nodrop: { icon: '🛡', rarity: 'rarity-epic', tag: 'DEFENSE' },
  guarantee: { icon: '🌟', rarity: 'rarity-legend', tag: 'LEGEND' },
  double: { icon: '🜂', rarity: 'rarity-myth', tag: 'MYTH' },
  protect: { icon: '🛡', rarity: 'rarity-epic', tag: 'DEFENSE' },
  hpSmall: { icon: '🧪', rarity: 'rarity-rare', tag: 'POTION' },
  hpMedium: { icon: '🧫', rarity: 'rarity-rare', tag: 'POTION' },
  hpLarge: { icon: '⚗', rarity: 'rarity-epic', tag: 'POTION' },
  antiPoison: { icon: '☠', rarity: 'rarity-rare', tag: 'CURE' },
  antiBleed: { icon: '🩸', rarity: 'rarity-rare', tag: 'CURE' },
  antiBurn: { icon: '🔥', rarity: 'rarity-rare', tag: 'CURE' },
  antiShock: { icon: '⚡', rarity: 'rarity-rare', tag: 'CURE' },
  antiFrost: { icon: '❄', rarity: 'rarity-rare', tag: 'CURE' },
  skillReset: { icon: '📜', rarity: 'rarity-legend', tag: 'UTILITY' }
};

function createShopItem(type, name, desc, price) {
  const meta = SHOP_ITEM_META[type] || { icon: '🧰', rarity: 'rarity-rare', tag: 'ITEM' };
  const item = document.createElement('div');
  item.className = `shop-item ${meta.rarity}`;
  item.dataset.item = type;
  item.onclick = () => buy(type);
  item.innerHTML = `
    <div class="item-icon">${meta.icon}</div>
    <div class="item-left">
      <div class="item-name">${name}</div>
      <div class="item-desc">${desc}</div>
      <div class="item-tag">${meta.tag}</div>
    </div>
    <div class="item-right">
      <div class="item-price">💰 ${Number(price).toLocaleString('ko-KR')}</div>
    </div>
  `;
  return item;
}

function ensureShopItems() {
  const body = document.querySelector('.shop-body');
  if (!body) return;

  const anchor = document.getElementById('double-item');
  const items = [
    { type: 'protect', name: '1회 보호권', desc: '사망 직전 1회 발동, HP 25%로 복귀 (최대 1개 보유)', price: 6000 },
    { type: 'hpSmall', name: 'HP 회복 물약 (소)', desc: '전투 중 수동 사용 / 최대 HP의 8% 회복 / 최대 20개', price: 700 },
    { type: 'hpMedium', name: 'HP 회복 물약 (중)', desc: '전투 중 수동 사용 / 최대 HP의 20% 회복 / 최대 20개', price: 1800 },
    { type: 'hpLarge', name: 'HP 회복 물약 (대)', desc: '전투 중 수동 사용 / 최대 HP의 40% 회복 / 최대 20개', price: 4000 },
    { type: 'antiPoison', name: '중독 무효화 물약', desc: '중독 상태이상 1회 무효화 (자동 발동)', price: 1200 },
    { type: 'antiBleed', name: '출혈 무효화 물약', desc: '출혈 상태이상 1회 무효화 (자동 발동)', price: 1300 },
    { type: 'antiBurn', name: '화상 무효화 물약', desc: '화상 상태이상 1회 무효화 (자동 발동)', price: 1300 },
    { type: 'antiShock', name: '감전 무효화 물약', desc: '감전 상태이상 1회 무효화 (자동 발동)', price: 1400 },
    { type: 'antiFrost', name: '빙결 무효화 물약', desc: '빙결 상태이상 1회 무효화 (자동 발동)', price: 1400 },
    { type: 'skillReset', name: '스킬 초기화권', desc: '배낭에서 장착된 액티브/패시브 스킬 슬롯 초기화', price: 25000 }
  ];

  items.forEach((data) => {
    if (body.querySelector(`[data-item="${data.type}"]`)) return;
    const card = createShopItem(data.type, data.name, data.desc, data.price);
    if (anchor) {
      body.insertBefore(card, anchor);
    } else {
      body.appendChild(card);
    }
  });
}

ensureShopItems();
updateGold();

function updateGold() {
  goldText.innerText = `💰 ${GameData.gold.toLocaleString('ko-KR')}`;
}

function buy(type) {
  const now = Date.now();
  let price = 0;

  switch (type) {
    case 'damage':
      price = 500;
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.damageBuffUntil = now + 10 * 60 * 1000;
      break;

    case 'gold':
      price = 500;
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.goldBuffUntil = now + 10 * 60 * 1000;
      break;

    case 'nodrop':
      price = 800;
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.noDropTicket++;
      break;

    case 'guarantee':
      price = 1200;
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.guaranteeTicket++;
      break;

    case 'protect':
      price = 6000;
      if (GameData.protectTicket >= 1) return;
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.protectTicket = 1;
      GameData.protectActive = false;
      break;

    case 'hpSmall':
      price = 700;
      if ((GameData.hpPotionSmall || 0) >= MAX_HP_POTION_STACK) {
        alert('HP 물약(소)은 최대 20개까지 보유할 수 있습니다.');
        return;
      }
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.hpPotionSmall = Math.min(MAX_HP_POTION_STACK, (GameData.hpPotionSmall || 0) + 1);
      break;

    case 'hpMedium':
      price = 1800;
      if ((GameData.hpPotionMedium || 0) >= MAX_HP_POTION_STACK) {
        alert('HP 물약(중)은 최대 20개까지 보유할 수 있습니다.');
        return;
      }
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.hpPotionMedium = Math.min(MAX_HP_POTION_STACK, (GameData.hpPotionMedium || 0) + 1);
      break;

    case 'hpLarge':
      price = 4000;
      if ((GameData.hpPotionLarge || 0) >= MAX_HP_POTION_STACK) {
        alert('HP 물약(대)은 최대 20개까지 보유할 수 있습니다.');
        return;
      }
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.hpPotionLarge = Math.min(MAX_HP_POTION_STACK, (GameData.hpPotionLarge || 0) + 1);
      break;

    case 'antiPoison':
      price = 1200;
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.antidotePoison++;
      break;

    case 'antiBleed':
      price = 1300;
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.antidoteBleed++;
      break;

    case 'antiBurn':
      price = 1300;
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.antidoteBurn++;
      break;

    case 'antiShock':
      price = 1400;
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.antidoteShock++;
      break;

    case 'antiFrost':
      price = 1400;
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.antidoteFrost++;
      break;

    case 'skillReset':
      price = 25000;
      if ((GameData.skillResetTicket || 0) >= MAX_SKILL_RESET_TICKET_STACK) {
        alert('스킬 초기화권은 최대 99개까지 보유할 수 있습니다.');
        return;
      }
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.skillResetTicket = Math.min(
        MAX_SKILL_RESET_TICKET_STACK,
        (GameData.skillResetTicket || 0) + 1
      );
      break;

    case 'double':
      if (!GameData.unlockDoubleGuarantee) return;
      price = 500000;
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.doubleGuaranteeTicket++;
      break;
  }

  GameData.save();
  updateGold();
}
