const elLevel = document.getElementById('enhance-level');
const elDamage = document.getElementById('damage-text');
const elDamageValue = document.getElementById('damage-value');
const elDamageBreakdown = document.getElementById('damage-breakdown');
const elHp = document.getElementById('hp-text');
const elGold = document.getElementById('gold-text');
const elMsg = document.getElementById('message');
const circle = document.getElementById('enhance-circle');
const btnUpgrade = document.getElementById('btn-upgrade');
const elRate = document.getElementById('success-rate');

function fmt(n) {
    return (typeof fmtNum === 'function') ? fmtNum(n) : Number(n).toLocaleString('ko-KR');
}

function buildBreakdownHTML() {
    const bonuses = GameData.getCombatBonuses();
    const now = GameData.now();
    const base = GameData.damage;
    const total = GameData.getCurrentDamage();
    const t = DAMAGE_SCALING_TUNING;

    const achRaw = GameData.achievementDamageMul;
    const hadesRaw = GameData.hadesDamageMul;
    const w3Raw = GameData.world3BossPowerMul;
    const achEff = applySoftCapMultiplier(achRaw, t.achievementSoftCapStart, t.achievementSoftCapSlope);
    const hadesEff = applySoftCapMultiplier(hadesRaw, t.hadesSoftCapStart, t.hadesSoftCapSlope);
    const w3Eff = applySoftCapMultiplier(w3Raw, t.world3SoftCapStart, t.world3SoftCapSlope);

    const rows = [];

    rows.push(`<div class="breakdown-row bd-base"><span class="bd-label">기본 공격력 (레벨×30)</span><span class="bd-value">${fmt(base)}</span></div>`);

    if (bonuses.damageFlat !== 0) {
        rows.push(`<div class="breakdown-row bd-equip"><span class="bd-label">장비 추가 공격력</span><span class="bd-value">+${fmt(bonuses.damageFlat)}</span></div>`);
    }
    if (bonuses.damageMul !== 1) {
        rows.push(`<div class="breakdown-row bd-equip"><span class="bd-label">장비 배율</span><span class="bd-value">×${bonuses.damageMul.toFixed(2)}</span></div>`);
    }
    if (achRaw !== 1) {
        const raw = achRaw > t.achievementSoftCapStart ? `<span class="bd-raw">(누적 ×${achRaw.toFixed(1)})</span>` : '';
        rows.push(`<div class="breakdown-row bd-achiev"><span class="bd-label">업적 배율 ${raw}</span><span class="bd-value">×${achEff.toFixed(2)}</span></div>`);
    }
    if (hadesRaw !== 1) {
        const raw = hadesRaw > t.hadesSoftCapStart ? `<span class="bd-raw">(누적 ×${hadesRaw.toFixed(1)})</span>` : '';
        rows.push(`<div class="breakdown-row bd-hades"><span class="bd-label">하데스 배율 ${raw}</span><span class="bd-value">×${hadesEff.toFixed(2)}</span></div>`);
    }
    if (w3Raw !== 1) {
        const raw = w3Raw > t.world3SoftCapStart ? `<span class="bd-raw">(누적 ×${w3Raw.toFixed(1)})</span>` : '';
        rows.push(`<div class="breakdown-row bd-boss"><span class="bd-label">보스 처치 배율 ${raw}</span><span class="bd-value">×${w3Eff.toFixed(2)}</span></div>`);
    }
    if (GameData.damageBuffUntil > now) {
        rows.push(`<div class="breakdown-row bd-buff"><span class="bd-label">⚡ 강화 버프</span><span class="bd-value">×1.50</span></div>`);
    }

    rows.push('<div class="breakdown-divider"></div>');
    rows.push(`<div class="breakdown-row bd-total"><span class="bd-label">최종 공격력</span><span class="bd-value">${fmt(total)}</span></div>`);

    return rows.join('');
}

function toggleDamageBreakdown() {
    const isOpen = elDamage.classList.toggle('open');
    if (isOpen) {
        elDamageBreakdown.innerHTML = buildBreakdownHTML();
        elDamageBreakdown.style.display = 'flex';
    } else {
        elDamageBreakdown.style.display = 'none';
    }
}

/* UI 갱신 */
function updateUI() {
    elLevel.innerText = `+${GameData.level}`;
    elDamageValue.innerText = fmt(GameData.getCurrentDamage());
    if (elDamage.classList.contains('open')) {
        elDamageBreakdown.innerHTML = buildBreakdownHTML();
    }
    elHp.innerText = `❤️ 체력: ${fmt(GameData.currentHp)} / ${fmt(GameData.getEffectiveMaxHp())}`;
    elGold.innerText = `💰 ${fmt(GameData.gold)}`;

    const rate = GameData.getSuccessRate();
    elRate.querySelector('span').innerText = `${rate}%`;

    // 확률에 따른 색상
    elRate.classList.remove('low', 'mid');
    if (rate <= 30) {
        elRate.classList.add('low');
    } else if (rate <= 60) {
        elRate.classList.add('mid');
    }
}

/* 화면 플래시 */
function flashScreen(type) {
    const el = document.createElement('div');
    el.className = `screen-flash ${type}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

/* 강화 버튼 */
btnUpgrade.onclick = () => {
    // 이전 애니메이션 제거 후 리플로우
    circle.classList.remove('spin', 'circle-success', 'circle-fail');
    elLevel.classList.remove('level-up-anim', 'level-down-anim');
    void circle.offsetWidth;

    const result = GameData.upgrade();

    if (result === 'nogold') {
        elMsg.innerText = '💸 골드 부족!';
        return;
    }

    Sound.playUpgrade(result);
    if (window.DailyQuest) DailyQuest.trackEnhance(result === true);
    updateUI(); // 숫자 먼저 갱신

    if (result === true) {
        elMsg.innerText = '🔥 강화 성공!';
        circle.classList.add('circle-success');
        elLevel.classList.add('level-up-anim');
        fireEffect(circle);
        flashScreen('success');
    } else {
        elMsg.innerText = '💥 강화 실패';
        circle.classList.add('circle-fail');
        elLevel.classList.add('level-down-anim');
        shatterEffect(circle);
        flashScreen('fail');
    }

    // 애니메이션 종료 후 클래스 정리
    setTimeout(() => {
        circle.classList.remove('circle-success', 'circle-fail');
        elLevel.classList.remove('level-up-anim', 'level-down-anim');
    }, 850);
};

updateUI();
