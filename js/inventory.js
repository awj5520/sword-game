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
    { id: 'anti-poison', name: '중독 무효화 물약', desc: '중독 1회 자동 무효화' },
    { id: 'anti-bleed', name: '출혈 무효화 물약', desc: '출혈 1회 자동 무효화' },
    { id: 'anti-burn', name: '화상 무효화 물약', desc: '화상 1회 자동 무효화' },
    { id: 'anti-shock', name: '감전 무효화 물약', desc: '감전 1회 자동 무효화' },
    { id: 'anti-frost', name: '빙결 무효화 물약', desc: '빙결 1회 자동 무효화' }
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

function refreshUI() {
  const now = Date.now();

  document.getElementById('damage-buff').innerText =
    GameData.damageBuffUntil > now ? '활성화됨 (데미지 버프)' : '비활성화';
  document.getElementById('gold-buff').innerText =
    GameData.goldBuffUntil > now ? '활성화됨 (골드 버프)' : '비활성화';

  const nCount = document.getElementById('nodrop-count');
  const nInfo = document.getElementById('nodrop-info');
  const nBtn = document.getElementById('btn-nodrop');
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

  const gCount = document.getElementById('guarantee-count');
  const gInfo = document.getElementById('guarantee-info');
  const gBtn = document.getElementById('btn-guarantee');
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
  dCount.innerText = `x${GameData.doubleGuaranteeTicket || 0}`;
  if (GameData.doubleGuaranteeActive && GameData.doubleGuaranteeTicket > 0) {
    dInfo.innerText = '활성화됨 (+2 레벨)';
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

  document.getElementById('tok-atlantis').innerText = `x${GameData.atlantisToken || 0}`;
  document.getElementById('tok-underworld').innerText = `x${GameData.underworldToken || 0}`;
  document.getElementById('tok-thunder').innerText = `x${GameData.thunderToken || 0}`;

  const items = [
    { key: 'fateDice', id: 'fd' },
    { key: 'dualSeal', id: 'ds' },
    { key: 'fateScale', id: 'fs' },
    { key: 'chaosSeal', id: 'cs' }
  ];

  items.forEach((item) => {
    const count = GameData[`${item.key}Ticket`] || 0;
    const active = !!GameData[`${item.key}Active`];
    const countEl = document.getElementById(`${item.id}-count`);
    const infoEl = document.getElementById(`${item.id}-info`);
    const btnEl = document.getElementById(`btn-${item.id}`);

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
  if (GameData.guaranteeActive) {
    GameData.doubleGuaranteeActive = false;
  }
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
  if (GameData.doubleGuaranteeActive) {
    GameData.guaranteeActive = false;
  }
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
refreshUI();
