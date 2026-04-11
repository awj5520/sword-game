const goldText = document.getElementById('gold-text');

function createShopItem(type, name, desc, price) {
  const item = document.createElement('div');
  item.className = 'shop-item';
  item.dataset.item = type;
  item.onclick = () => buy(type);
  item.innerHTML = `
    <div class="item-left">
      <div class="item-name">${name}</div>
      <div class="item-desc">${desc}</div>
    </div>
    <div class="item-right">
      <div class="item-price">💰 ${price}</div>
    </div>
  `;
  return item;
}

function ensureShopItems() {
  const body = document.querySelector('.shop-body');
  if (!body) return;

  const anchor = document.getElementById('double-item');
  const items = [
    { type: 'protect', name: '1회 보호권', desc: '사망 시 1회 발동, HP 1/4로 복귀 (최대 1개 보유)', price: 6000 },
    { type: 'hpSmall', name: 'HP 회복 물약 (소)', desc: '최대 HP의 20% 회복', price: 700 },
    { type: 'hpMedium', name: 'HP 회복 물약 (중)', desc: '최대 HP의 50% 회복', price: 1800 },
    { type: 'hpLarge', name: 'HP 회복 물약 (대)', desc: '최대 HP의 100% 회복', price: 4000 },
    { type: 'antiPoison', name: '중독 무효화 물약', desc: '중독 상태이상 1회 무효화 (자동 발동)', price: 1200 },
    { type: 'antiBleed', name: '출혈 무효화 물약', desc: '출혈 상태이상 1회 무효화 (자동 발동)', price: 1300 },
    { type: 'antiBurn', name: '화상 무효화 물약', desc: '화상 상태이상 1회 무효화 (자동 발동)', price: 1300 },
    { type: 'antiShock', name: '감전 무효화 물약', desc: '감전 상태이상 1회 무효화 (자동 발동)', price: 1400 },
    { type: 'antiFrost', name: '빙결 무효화 물약', desc: '빙결 상태이상 1회 무효화 (자동 발동)', price: 1400 }
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
  goldText.innerText = `💰 ${GameData.gold}`;
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
      {
        const maxHpForShop =
          typeof GameData.getEffectiveMaxHp === 'function' ? GameData.getEffectiveMaxHp() : GameData.maxHp;
        if (GameData.currentHp >= maxHpForShop) return;
      }
      if (GameData.gold < price) return;
      GameData.gold -= price;
      {
        const maxHpForShop =
          typeof GameData.getEffectiveMaxHp === 'function' ? GameData.getEffectiveMaxHp() : GameData.maxHp;
        GameData.heal(Math.max(1, Math.floor(maxHpForShop * 0.2)));
      }
      break;

    case 'hpMedium':
      price = 1800;
      {
        const maxHpForShop =
          typeof GameData.getEffectiveMaxHp === 'function' ? GameData.getEffectiveMaxHp() : GameData.maxHp;
        if (GameData.currentHp >= maxHpForShop) return;
      }
      if (GameData.gold < price) return;
      GameData.gold -= price;
      {
        const maxHpForShop =
          typeof GameData.getEffectiveMaxHp === 'function' ? GameData.getEffectiveMaxHp() : GameData.maxHp;
        GameData.heal(Math.max(1, Math.floor(maxHpForShop * 0.5)));
      }
      break;

    case 'hpLarge':
      price = 4000;
      {
        const maxHpForShop =
          typeof GameData.getEffectiveMaxHp === 'function' ? GameData.getEffectiveMaxHp() : GameData.maxHp;
        if (GameData.currentHp >= maxHpForShop) return;
      }
      if (GameData.gold < price) return;
      GameData.gold -= price;
      {
        const maxHpForShop =
          typeof GameData.getEffectiveMaxHp === 'function' ? GameData.getEffectiveMaxHp() : GameData.maxHp;
        GameData.heal(maxHpForShop);
      }
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

    /* ✅ 200% 강화권 (제우스 100회 해금) */
    case 'double':
      if (!GameData.unlockDoubleGuarantee) return;
      price = 500000; // 원하면 가격 바꾸면 됨
      if (GameData.gold < price) return;
      GameData.gold -= price;
      GameData.doubleGuaranteeTicket++;
      break;
  }

  GameData.save();
  updateGold();
}
