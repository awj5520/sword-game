const SLOT_LABELS = {
  weapon: '무기',
  armor: '방어구',
  rune: '룬'
};

let currentEquipSlot = null;

function setTextById(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function ensureProtectInventoryItem() {
  if (document.getElementById('protect-count')) return;
  const body = document.querySelector('.inventory-body');
  if (!body) return;

  const item = document.createElement('div');
  item.className = 'inv-item';
  item.innerHTML = `
    <div class="inv-name">
      1회 보호권
      <span id="protect-count" class="inv-count"></span>
    </div>
    <div id="protect-info" class="inv-info"></div>
    <button id="btn-protect" onclick="toggleProtect()">활성화</button>
  `;

  const guaranteeBtn = document.getElementById('btn-guarantee');
  const guaranteeItem = guaranteeBtn ? guaranteeBtn.closest('.inv-item') : null;
  if (guaranteeItem && guaranteeItem.parentNode) {
    guaranteeItem.parentNode.insertBefore(item, guaranteeItem.nextSibling);
  } else {
    body.insertBefore(item, body.firstChild);
  }
}

function ensureStatusNullifyInventoryItems() {
  if (document.getElementById('anti-poison-count')) return;
  const body = document.querySelector('.inventory-body');
  if (!body) return;

  const anchorBtn = document.getElementById('btn-double');
  const anchorItem = anchorBtn ? anchorBtn.closest('.inv-item') : null;
  const items = [
    { id: 'anti-poison', name: '중독 무효화 물약', desc: '중독 상태이상 1회 자동 무효화' },
    { id: 'anti-bleed', name: '출혈 무효화 물약', desc: '출혈 상태이상 1회 자동 무효화' },
    { id: 'anti-burn', name: '화상 무효화 물약', desc: '화상 상태이상 1회 자동 무효화' },
    { id: 'anti-shock', name: '감전 무효화 물약', desc: '감전 상태이상 1회 자동 무효화' },
    { id: 'anti-frost', name: '빙결 무효화 물약', desc: '빙결 상태이상 1회 자동 무효화' }
  ];

  items.forEach((data) => {
    const item = document.createElement('div');
    item.className = 'inv-item';
    item.innerHTML = `
      <div class="inv-name">
        ${data.name}
        <span id="${data.id}-count" class="inv-count"></span>
      </div>
      <div class="inv-info">${data.desc}</div>
      <div id="${data.id}-info" class="inv-info"></div>
    `;

    if (anchorItem && anchorItem.parentNode) {
      anchorItem.parentNode.insertBefore(item, anchorItem);
    } else {
      body.appendChild(item);
    }
  });
}

function ensureGearUI() {
  const body = document.querySelector('.inventory-body');
  if (!body) return;

  if (!document.getElementById('gear-action-panel')) {
    const panel = document.createElement('div');
    panel.id = 'gear-action-panel';
    panel.className = 'inv-item gear-action-panel';
    panel.innerHTML = `
      <div class="inv-name">장비 세팅</div>
      <div class="gear-action-grid">
        <button class="gear-slot-btn" onclick="openEquipModal('weapon')">
          무기 세팅
          <span id="equip-current-weapon" class="gear-current">미장착</span>
        </button>
        <button class="gear-slot-btn" onclick="openEquipModal('armor')">
          방어구 세팅
          <span id="equip-current-armor" class="gear-current">미장착</span>
        </button>
        <button class="gear-slot-btn" onclick="openEquipModal('rune')">
          룬 세팅
          <span id="equip-current-rune" class="gear-current">미장착</span>
        </button>
      </div>
    `;
    body.appendChild(panel);
  }

  if (!document.getElementById('loot-list-panel')) {
    const panel = document.createElement('div');
    panel.id = 'loot-list-panel';
    panel.className = 'inv-item loot-list-panel';
    panel.innerHTML = `
      <div class="inv-name">획득한 장비/룬</div>
      <div id="loot-grid" class="loot-grid"></div>
    `;
    body.appendChild(panel);
  }
}

function ensureEquipModal() {
  if (document.getElementById('equip-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'equip-modal';
  modal.className = 'equip-modal hidden';
  modal.innerHTML = `
    <div class="equip-modal-card">
      <div class="equip-modal-header">
        <div id="equip-modal-title" class="equip-modal-title">장비 선택</div>
        <button class="equip-close-btn" onclick="closeEquipModal()">닫기</button>
      </div>
      <div id="equip-modal-list" class="equip-modal-list"></div>
    </div>
  `;

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeEquipModal();
    }
  });

  document.body.appendChild(modal);
}

function getOwnedCount(itemId) {
  return typeof GameData.getItemCount === 'function' ? GameData.getItemCount(itemId) : 0;
}

function getCurrentEquippedId(slot) {
  const equipped = GameData.equippedItems || {};
  return equipped[slot] || null;
}

function renderLootGrid() {
  const grid = document.getElementById('loot-grid');
  if (!grid) return;

  if (!window.ItemDefs || !Array.isArray(ItemDefs.ITEM_LIST)) {
    grid.innerHTML = `<div class="loot-empty">아이템 데이터를 불러오는 중입니다.</div>`;
    return;
  }

  const ownedItems = ItemDefs.ITEM_LIST
    .map((item) => ({ item, count: getOwnedCount(item.id) }))
    .filter(({ count }) => count > 0);

  if (!ownedItems.length) {
    grid.innerHTML = `<div class="loot-empty">아직 드랍된 장비/룬이 없습니다.</div>`;
    return;
  }

  grid.innerHTML = ownedItems
    .map(({ item, count }) => `
      <div class="loot-card">
        <img class="loot-icon" src="${item.icon}" alt="${item.name}">
        <div class="loot-meta">
          <div class="loot-name">${item.name}</div>
          <div class="loot-count">${item.sourceLabel || ''}</div>
          <div class="loot-bonus">${ItemDefs.formatBonus(item.bonus)}</div>
          <div class="loot-count">보유 x${count}</div>
        </div>
      </div>
    `)
    .join('');
}

function renderEquippedSummary() {
  const equipped = typeof GameData.ensureEquippedItems === 'function'
    ? GameData.ensureEquippedItems()
    : (GameData.equippedItems || {});

  ['weapon', 'armor', 'rune'].forEach((slot) => {
    const item = window.ItemDefs?.getById?.(equipped[slot] || null);
    setTextById(`equip-current-${slot}`, item ? item.name : '미장착');
  });
}

function renderEquipModalList(slot) {
  const listEl = document.getElementById('equip-modal-list');
  const titleEl = document.getElementById('equip-modal-title');
  if (!listEl || !titleEl) return;

  const slotLabel = SLOT_LABELS[slot] || slot;
  titleEl.innerText = `${slotLabel} 장착 선택`;

  if (!window.ItemDefs || typeof ItemDefs.getBySlot !== 'function') {
    listEl.innerHTML = `<div class="equip-empty">아이템 데이터를 불러오지 못했습니다.</div>`;
    return;
  }

  const equippedId = getCurrentEquippedId(slot);
  const items = ItemDefs.getBySlot(slot).filter(
    (item) => getOwnedCount(item.id) > 0 || item.id === equippedId
  );

  if (!items.length) {
    listEl.innerHTML = `<div class="equip-empty">보유 중인 ${slotLabel} 아이템이 없습니다.</div>`;
    return;
  }

  const rows = [];
  rows.push(`
    <div class="equip-row">
      <div class="equip-main">
        <div class="equip-name">장착 해제</div>
        <div class="equip-bonus">현재 슬롯을 비웁니다.</div>
      </div>
      <button class="equip-apply-btn" onclick="equipItem('${slot}', '')">해제</button>
    </div>
  `);

  items.forEach((item) => {
    const count = getOwnedCount(item.id);
    const isEquipped = equippedId === item.id;
    const canEquip = count > 0 || isEquipped;
    rows.push(`
      <div class="equip-row">
        <img class="equip-icon" src="${item.icon}" alt="${item.name}">
        <div class="equip-main">
          <div class="equip-name">${item.name}${isEquipped ? ' (장착 중)' : ''}</div>
          <div class="equip-bonus">${ItemDefs.formatBonus(item.bonus)}</div>
          <div class="equip-count">${item.sourceLabel || ''}</div>
          <div class="equip-count">보유 x${count}</div>
        </div>
        <button class="equip-apply-btn" ${canEquip ? '' : 'disabled'} onclick="equipItem('${slot}', '${item.id}')">
          장착
        </button>
      </div>
    `);
  });

  listEl.innerHTML = rows.join('');
}

function openEquipModal(slot) {
  currentEquipSlot = slot;
  const modal = document.getElementById('equip-modal');
  if (!modal) return;
  renderEquipModalList(slot);
  modal.classList.remove('hidden');
}

function closeEquipModal() {
  const modal = document.getElementById('equip-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  currentEquipSlot = null;
}

function equipItem(slot, itemId) {
  if (typeof GameData.setEquippedItem !== 'function') return;
  const ok = GameData.setEquippedItem(slot, itemId || null, true);
  if (!ok) {
    alert('장착할 수 없는 아이템입니다.');
    return;
  }
  refreshUI();
  if (currentEquipSlot) {
    renderEquipModalList(currentEquipSlot);
  }
}

function refreshUI() {
  const now = Date.now();

  setTextById('damage-buff', GameData.damageBuffUntil > now ? '활성화됨 (데미지 버프)' : '비활성화');
  setTextById('gold-buff', GameData.goldBuffUntil > now ? '활성화됨 (골드 버프)' : '비활성화');

  const nCount = document.getElementById('nodrop-count');
  const nInfo = document.getElementById('nodrop-info');
  const nBtn = document.getElementById('btn-nodrop');
  if (nCount && nInfo && nBtn) {
    nCount.innerText = `x${GameData.noDropTicket || 0}`;
    if (GameData.noDropActive && GameData.noDropTicket > 0) {
      nInfo.innerText = '활성화됨';
      nBtn.innerText = '비활성화';
      nBtn.disabled = false;
    } else if (GameData.noDropTicket > 0) {
      nInfo.innerText = '비활성 상태';
      nBtn.innerText = '활성화';
      nBtn.disabled = false;
    } else {
      nInfo.innerText = '수량 없음';
      nBtn.innerText = '활성화 (불가)';
      nBtn.disabled = true;
    }
  }

  const gCount = document.getElementById('guarantee-count');
  const gInfo = document.getElementById('guarantee-info');
  const gBtn = document.getElementById('btn-guarantee');
  if (gCount && gInfo && gBtn) {
    gCount.innerText = `x${GameData.guaranteeTicket || 0}`;
    if (GameData.guaranteeActive && GameData.guaranteeTicket > 0) {
      gInfo.innerText = '활성화됨 (100%)';
      gBtn.innerText = '비활성화';
      gBtn.disabled = false;
    } else if (GameData.guaranteeTicket > 0) {
      gInfo.innerText = '비활성 상태';
      gBtn.innerText = '활성화';
      gBtn.disabled = false;
    } else {
      gInfo.innerText = '수량 없음';
      gBtn.innerText = '활성화 (불가)';
      gBtn.disabled = true;
    }
  }

  const pCount = document.getElementById('protect-count');
  const pInfo = document.getElementById('protect-info');
  const pBtn = document.getElementById('btn-protect');
  if (pCount && pInfo && pBtn) {
    pCount.innerText = `x${GameData.protectTicket || 0}`;
    if (GameData.protectActive && GameData.protectTicket > 0) {
      pInfo.innerText = '활성화됨 (사망 1회 보호)';
      pBtn.innerText = '비활성화';
      pBtn.disabled = false;
    } else if (GameData.protectTicket > 0) {
      pInfo.innerText = '비활성 상태';
      pBtn.innerText = '활성화';
      pBtn.disabled = false;
    } else {
      pInfo.innerText = '수량 없음';
      pBtn.innerText = '활성화 (불가)';
      pBtn.disabled = true;
    }
  }

  const dCount = document.getElementById('double-count');
  const dInfo = document.getElementById('double-info');
  const dBtn = document.getElementById('btn-double');
  if (dCount && dInfo && dBtn) {
    dCount.innerText = `x${GameData.doubleGuaranteeTicket || 0}`;
    if (GameData.doubleGuaranteeActive && GameData.doubleGuaranteeTicket > 0) {
      dInfo.innerText = '활성화됨 (+2 강화)';
      dBtn.innerText = '비활성화';
      dBtn.disabled = false;
    } else if (GameData.doubleGuaranteeTicket > 0) {
      dInfo.innerText = '비활성 상태';
      dBtn.innerText = '활성화';
      dBtn.disabled = false;
    } else {
      dInfo.innerText = '수량 없음';
      dBtn.innerText = '활성화 (불가)';
      dBtn.disabled = true;
    }
  }

  const statusPotionItems = [
    { countId: 'anti-poison-count', infoId: 'anti-poison-info', value: GameData.antidotePoison || 0 },
    { countId: 'anti-bleed-count', infoId: 'anti-bleed-info', value: GameData.antidoteBleed || 0 },
    { countId: 'anti-burn-count', infoId: 'anti-burn-info', value: GameData.antidoteBurn || 0 },
    { countId: 'anti-shock-count', infoId: 'anti-shock-info', value: GameData.antidoteShock || 0 },
    { countId: 'anti-frost-count', infoId: 'anti-frost-info', value: GameData.antidoteFrost || 0 }
  ];

  statusPotionItems.forEach((item) => {
    const countEl = document.getElementById(item.countId);
    const infoEl = document.getElementById(item.infoId);
    if (!countEl || !infoEl) return;
    countEl.innerText = `x${item.value}`;
    infoEl.innerText = item.value > 0 ? '보유 중 (자동 발동)' : '수량 없음';
  });

  setTextById('tok-atlantis', `x${GameData.atlantisToken || 0}`);
  setTextById('tok-underworld', `x${GameData.underworldToken || 0}`);
  setTextById('tok-thunder', `x${GameData.thunderToken || 0}`);

  const fateItems = [
    { key: 'fateDice', id: 'fd' },
    { key: 'dualSeal', id: 'ds' },
    { key: 'fateScale', id: 'fs' },
    { key: 'chaosSeal', id: 'cs' }
  ];

  fateItems.forEach((item) => {
    const count = GameData[`${item.key}Ticket`] || 0;
    const active = !!GameData[`${item.key}Active`];
    const countEl = document.getElementById(`${item.id}-count`);
    const infoEl = document.getElementById(`${item.id}-info`);
    const btnEl = document.getElementById(`btn-${item.id}`);
    if (!countEl || !infoEl || !btnEl) return;

    countEl.innerText = `x${count}`;
    if (active && count > 0) {
      infoEl.innerText = '활성화됨';
      btnEl.innerText = '비활성화';
      btnEl.disabled = false;
    } else if (count > 0) {
      infoEl.innerText = '비활성 상태';
      btnEl.innerText = '활성화';
      btnEl.disabled = false;
    } else {
      infoEl.innerText = '수량 없음';
      btnEl.innerText = '활성화 (불가)';
      btnEl.disabled = true;
    }
  });

  renderLootGrid();
  renderEquippedSummary();
}

function toggleNoDrop() {
  if ((GameData.noDropTicket || 0) <= 0) {
    refreshUI();
    return;
  }
  GameData.noDropActive = !GameData.noDropActive;
  GameData.save();
  refreshUI();
}

function toggleGuarantee() {
  if (GameData.getActiveFateType()) {
    alert('운명 아이템 사용 중에는 불가합니다.');
    return;
  }
  GameData.guaranteeActive = !GameData.guaranteeActive;
  if (GameData.guaranteeActive) GameData.doubleGuaranteeActive = false;
  GameData.save();
  refreshUI();
}

function toggleProtect() {
  if ((GameData.protectTicket || 0) <= 0) {
    refreshUI();
    return;
  }
  GameData.protectActive = !GameData.protectActive;
  GameData.save();
  refreshUI();
}

function toggleDouble() {
  if (GameData.getActiveFateType()) {
    alert('운명 아이템 사용 중에는 불가합니다.');
    return;
  }
  GameData.doubleGuaranteeActive = !GameData.doubleGuaranteeActive;
  if (GameData.doubleGuaranteeActive) GameData.guaranteeActive = false;
  GameData.save();
  refreshUI();
}

function toggleFate(type) {
  const map = {
    dice: 'fateDice',
    dual: 'dualSeal',
    scale: 'fateScale',
    chaos: 'chaosSeal'
  };
  const key = map[type];
  if (!key) return;

  if (GameData.guaranteeActive || GameData.doubleGuaranteeActive) {
    alert('강화권 사용 중에는 불가합니다.');
    return;
  }

  if (GameData[`${key}Active`]) {
    GameData[`${key}Active`] = false;
  } else {
    GameData.fateDiceActive = false;
    GameData.dualSealActive = false;
    GameData.fateScaleActive = false;
    GameData.chaosSealActive = false;
    GameData[`${key}Active`] = true;
  }

  GameData.save();
  refreshUI();
}

ensureProtectInventoryItem();
ensureStatusNullifyInventoryItems();
ensureGearUI();
ensureEquipModal();
refreshUI();
