function refreshUI() {
    const now = Date.now();

    /* ⚔️ 데미지 2배 물약 */
    const dmg = document.getElementById('damage-buff');
    if (GameData.damageBuffUntil > now) {
        const min = Math.ceil((GameData.damageBuffUntil - now) / 60000);
        dmg.innerText = `🟢 사용 중 (${min}분 남음)`;
    } else {
        dmg.innerText = '❌ 사용 중 아님';
    }

    /* 💰 골드 2배 물약 */
    const gold = document.getElementById('gold-buff');
    if (GameData.goldBuffUntil > now) {
        const min = Math.ceil((GameData.goldBuffUntil - now) / 60000);
        gold.innerText = `🟢 사용 중 (${min}분 남음)`;
    } else {
        gold.innerText = '❌ 사용 중 아님';
    }

    /* 🛡️ 하락 방지권 */
    document.getElementById('nodrop-count').innerText =
        `x${GameData.noDropTicket}`;

    const ndInfo = document.getElementById('nodrop-info');
    const ndBtn = document.getElementById('btn-nodrop');

    if (GameData.noDropActive) {
        ndInfo.innerText = '🟢 활성화됨 (다음 실패 보호)';
        ndBtn.innerText = '비활성화';
    } else {
        ndInfo.innerText = '❌ 비활성 상태';
        ndBtn.innerText = '활성화';
    }

    /* ⭐ 100% 강화권 */
    document.getElementById('guarantee-count').innerText =
        `x${GameData.guaranteeTicket}`;

    const gInfo = document.getElementById('guarantee-info');
    const gBtn = document.getElementById('btn-guarantee');

    if (GameData.guaranteeActive) {
        gInfo.innerText = '🟢 활성화됨 (다음 강화 100%)';
        gBtn.innerText = '비활성화';
    } else {
        gInfo.innerText = '❌ 비활성 상태';
        gBtn.innerText = '활성화';
    }
}

function toggleNoDrop() {
    GameData.noDropActive = !GameData.noDropActive;
    GameData.save();
    refreshUI();
}

function toggleGuarantee() {
    GameData.guaranteeActive = !GameData.guaranteeActive;
    GameData.save();
    refreshUI();
}

refreshUI();
