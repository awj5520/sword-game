const monster = {
    maxHP: 100,
    hp: 100,
    baseReward: 50   // 🔥 기본 보상 상향
};

const hpFill = document.getElementById('hp-fill');
const img = document.getElementById('monster');
const log = document.getElementById('log');
const goldText = document.getElementById('gold-text');

function updateHP() {
    hpFill.style.width = `${(monster.hp / monster.maxHP) * 100}%`;
}

function updateGoldUI() {
    goldText.innerText = `💰 ${GameData.gold}`;
}

function showDamage(amount) {
    const dmg = document.createElement('div');
    dmg.className = 'damage-pop';
    dmg.innerText = `-${amount}`;
    document.body.appendChild(dmg);

    dmg.style.left = '50%';
    dmg.style.top = '45%';

    setTimeout(() => dmg.remove(), 600);
}

function getRewardGold() {
    // 💰 보상 공식 (게임 느낌)
    return monster.baseReward
        + GameData.level * 10        // 강화 보너스
        + Math.floor(Math.random() * 20); // 랜덤 보너스
}

img.onclick = () => {
    monster.hp -= GameData.damage;
    showDamage(GameData.damage);

    if (monster.hp <= 0) {
        const reward = getRewardGold();
        GameData.earnGold(reward);

        log.innerText = `🧪 슬라임 처치! 💰 +${reward}`;
        screenShake();

        monster.hp = monster.maxHP;
        updateGoldUI();
    }

    updateHP();
};

updateHP();
updateGoldUI();
