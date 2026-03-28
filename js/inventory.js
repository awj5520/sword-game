function refreshUI() {
    const now = Date.now();

    /* ⚔️ 데미지 */
    document.getElementById('damage-buff').innerText =
        GameData.damageBuffUntil > now ? '🟢 사용 중' : '❌ 사용 중 아님';

    /* 💰 골드 */
    document.getElementById('gold-buff').innerText =
        GameData.goldBuffUntil > now ? '🟢 사용 중' : '❌ 사용 중 아님';

    /* =========================
       ⭐ 100% 강화권
    ========================= */
    const gCount = document.getElementById('guarantee-count');
    const gInfo = document.getElementById('guarantee-info');
    const gBtn = document.getElementById('btn-guarantee');

    gCount.innerText = `x${GameData.guaranteeTicket}`;

    if (GameData.guaranteeActive && GameData.guaranteeTicket > 0) {
        gInfo.innerText = '🟢 활성화됨 (100%)';
        gBtn.innerText = '비활성화';
        gBtn.disabled = false;
    } else {
        if (GameData.guaranteeTicket > 0) {
            gInfo.innerText = '❌ 비활성 상태';
            gBtn.innerText = '활성화';
            gBtn.disabled = false;
        } else {
            gInfo.innerText = '❌ 수량 없음';
            gBtn.innerText = '활성화(불가)';
            gBtn.disabled = true;
        }
    }

    /* =========================
       💥 200% 강화권
    ========================= */
    const dCount = document.getElementById('double-count');
    const dInfo = document.getElementById('double-info');
    const dBtn = document.getElementById('btn-double');

    dCount.innerText = `x${GameData.doubleGuaranteeTicket}`;

    if (GameData.doubleGuaranteeActive && GameData.doubleGuaranteeTicket > 0) {
        dInfo.innerText = '🟢 활성화됨 (+2)';
        dBtn.innerText = '비활성화';
        dBtn.disabled = false;
    } else {
        if (GameData.doubleGuaranteeTicket > 0) {
            dInfo.innerText = '❌ 비활성 상태';
            dBtn.innerText = '활성화';
            dBtn.disabled = false;
        } else {
            dInfo.innerText = '❌ 수량 없음';
            dBtn.innerText = '활성화(불가)';
            dBtn.disabled = true;
        }
    }

    /* =========================
       🌠 증표
    ========================= */
    document.getElementById('tok-atlantis').innerText =
        `x${GameData.atlantisToken}`;
    document.getElementById('tok-underworld').innerText =
        `x${GameData.underworldToken}`;
    document.getElementById('tok-thunder').innerText =
        `x${GameData.thunderToken}`;

    /* =========================
       🎲 운명 아이템
    ========================= */
    const items = [
        { key:'fateDice', id:'fd' },
        { key:'dualSeal', id:'ds' },
        { key:'fateScale', id:'fs' },
        { key:'chaosSeal', id:'cs' }
    ];

    items.forEach(item => {
        const count = GameData[item.key+'Ticket'] || 0;
        const active = GameData[item.key+'Active'];

        const c = document.getElementById(item.id+'-count');
        const i = document.getElementById(item.id+'-info');
        const b = document.getElementById('btn-'+item.id);

        c.innerText = `x${count}`;

        if (active && count > 0) {
            i.innerText = '🟢 활성화됨';
            b.innerText = '비활성화';
            b.disabled = false;
        } else {
            if (count > 0) {
                i.innerText = '❌ 비활성 상태';
                b.innerText = '활성화';
                b.disabled = false;
            } else {
                i.innerText = '❌ 수량 없음';
                b.innerText = '활성화(불가)';
                b.disabled = true;
            }
        }
    });
}

/* =========================
   ⭐ 100%
========================= */
function toggleGuarantee() {
    if (GameData.getActiveFateType()) {
        alert('운명 아이템 사용 중에는 불가');
        return;
    }

    GameData.guaranteeActive = !GameData.guaranteeActive;
    GameData.doubleGuaranteeActive = false;

    GameData.save();
    refreshUI();
}

/* =========================
   💥 200%
========================= */
function toggleDouble() {
    if (GameData.getActiveFateType()) {
        alert('운명 아이템 사용 중에는 불가');
        return;
    }

    GameData.doubleGuaranteeActive = !GameData.doubleGuaranteeActive;
    GameData.guaranteeActive = false;

    GameData.save();
    refreshUI();
}

/* =========================
   🎲 운명 (🔥 핵심 수정)
========================= */
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
        alert('강화권 사용 중에는 불가');
        return;
    }

    if (GameData[key+'Active']) {
        GameData[key+'Active'] = false;
    } else {
        GameData.fateDiceActive = false;
        GameData.dualSealActive = false;
        GameData.fateScaleActive = false;
        GameData.chaosSealActive = false;

        GameData[key+'Active'] = true;
    }

    GameData.save();
    refreshUI();
}

refreshUI();