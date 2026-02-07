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

    /* =========================
       🛡️ 하락 방지권 (지속 ON)
    ========================= */
    // ✅ 수량 0이면 자동으로 OFF (상태 보정)
    if (GameData.noDropTicket <= 0) {
        GameData.noDropTicket = 0;
        if (GameData.noDropActive) {
            GameData.noDropActive = false;
            GameData.save();
        }
    }

    document.getElementById('nodrop-count').innerText = `x${GameData.noDropTicket}`;

    const ndInfo = document.getElementById('nodrop-info');
    const ndBtn = document.getElementById('btn-nodrop');

    if (GameData.noDropActive && GameData.noDropTicket > 0) {
        ndInfo.innerText = '🟢 활성화됨 (수량 남는 동안 계속 적용)';
        ndBtn.innerText = '비활성화';
        ndBtn.disabled = false;
    } else {
        if (GameData.noDropTicket > 0) {
            ndInfo.innerText = '❌ 비활성 상태 (눌러서 활성화 가능)';
            ndBtn.innerText = '활성화';
            ndBtn.disabled = false;
        } else {
            ndInfo.innerText = '❌ 수량 없음';
            ndBtn.innerText = '활성화(불가)';
            ndBtn.disabled = true;
        }
    }

    /* =========================
       ⭐ 100% 강화권 (지속 ON)
    ========================= */
    // ✅ 수량 0이면 자동으로 OFF (상태 보정)
    if (GameData.guaranteeTicket <= 0) {
        GameData.guaranteeTicket = 0;
        if (GameData.guaranteeActive) {
            GameData.guaranteeActive = false;
            GameData.save();
        }
    }

    document.getElementById('guarantee-count').innerText = `x${GameData.guaranteeTicket}`;

    const gInfo = document.getElementById('guarantee-info');
    const gBtn = document.getElementById('btn-guarantee');

    if (GameData.guaranteeActive && GameData.guaranteeTicket > 0) {
        gInfo.innerText = '🟢 활성화됨 (수량 남는 동안 계속 100%)';
        gBtn.innerText = '비활성화';
        gBtn.disabled = false;
    } else {
        if (GameData.guaranteeTicket > 0) {
            gInfo.innerText = '❌ 비활성 상태 (눌러서 활성화 가능)';
            gBtn.innerText = '활성화';
            gBtn.disabled = false;
        } else {
            gInfo.innerText = '❌ 수량 없음';
            gBtn.innerText = '활성화(불가)';
            gBtn.disabled = true;
        }
    }
}

/* ✅ 하락 방지권: 수량이 있을 때만 ON 가능, OFF는 언제든 가능 */
function toggleNoDrop() {
    // ON -> OFF
    if (GameData.noDropActive) {
        GameData.noDropActive = false;
        GameData.save();
        refreshUI();
        return;
    }

    // OFF -> ON (수량 체크)
    if (GameData.noDropTicket > 0) {
        GameData.noDropActive = true;
        GameData.save();
    }
    refreshUI();
}

/* ✅ 100% 강화권: 수량이 있을 때만 ON 가능, OFF는 언제든 가능 */
function toggleGuarantee() {
    // ON -> OFF
    if (GameData.guaranteeActive) {
        GameData.guaranteeActive = false;
        GameData.save();
        refreshUI();
        return;
    }

    // OFF -> ON (수량 체크)
    if (GameData.guaranteeTicket > 0) {
        GameData.guaranteeActive = true;
        GameData.save();
    }
    refreshUI();
}

refreshUI();

// (선택) 배낭 화면에서 분 타이머가 계속 줄어드는 게 보이게 하려면
// setInterval(refreshUI, 1000);
