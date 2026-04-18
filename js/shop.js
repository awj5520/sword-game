const goldText = document.getElementById('gold-text');
const MAX_HP_POTION_STACK = 20;

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
    { type: 'hpSmall', name: 'HP 회복 물약 (소)', desc: '전투 중 수동 사용 / 최대 20개', price: 700 },
    { type: 'hpMedium', name: 'HP 회복 물약 (중)', desc: '전투 중 수동 사용 / 최대 20개', price: 1800 },
    { type: 'hpLarge', name: 'HP 회복 물약 (대)', desc: '전투 중 수동 사용 / 최대 20개', price: 4000 },
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
