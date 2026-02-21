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

    /* =========================
       🌠 3세계 증표 표시 (✅ 추가)
       - “보스 처치 수 / 10”으로 증표 개수 계산
       - killStats 키는 stage.js에서 누적 중이어야 함
    ========================= */
    const poseidonKills = GameData.killStats?.w3_poseidon || 0;
    const hadesKills = GameData.killStats?.w3_hades || 0;
    const zeusKills = GameData.killStats?.w3_zeus || 0;

    const atlantisToken = Math.floor(poseidonKills / 10);
    const underworldToken = Math.floor(hadesKills / 10);
    const thunderToken = Math.floor(zeusKills / 10);

    const a = document.getElementById('tok-atlantis');
    const u = document.getElementById('tok-underworld');
    const t = document.getElementById('tok-thunder');

    const ai = document.getElementById('tok-atlantis-info');
    const ui = document.getElementById('tok-underworld-info');
    const ti = document.getElementById('tok-thunder-info');

    if (a) a.innerText = `x${atlantisToken}`;
    if (u) u.innerText = `x${underworldToken}`;
    if (t) t.innerText = `x${thunderToken}`;

    if (ai) ai.innerText = `포세이돈 처치 ${poseidonKills}회 (다음 증표까지 ${10 - (poseidonKills % 10 || 10)}회)`;
    if (ui) ui.innerText = `하데스 처치 ${hadesKills}회 (다음 증표까지 ${10 - (hadesKills % 10 || 10)}회)`;
    if (ti) ti.innerText = `제우스 처치 ${zeusKills}회 (다음 증표까지 ${10 - (zeusKills % 10 || 10)}회)`;
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
// setInterval(refreshUI, 1000);