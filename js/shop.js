const goldText = document.getElementById('gold-text');
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