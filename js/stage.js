const monster = {
    maxHP: 100,
    hp: 100,
    baseReward: 50
};

const hpFill = document.getElementById('hp-fill');
const img = document.getElementById('monster');
const log = document.getElementById('log');
const goldText = document.getElementById('gold-text');

let isDead = false; // 🔒 중복 클릭 방지

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
    return monster.baseReward
        + GameData.level * 10
        + Math.floor(Math.random() * 20);
}

img.onclick = () => {
    if (isDead) return;

    monster.hp -= GameData.damage;
    if (monster.hp < 0) monster.hp = 0;

    showDamage(GameData.damage);
    updateHP(); // 🔥 먼저 HP 감소를 화면에 보여줌

    if (monster.hp === 0) {
        isDead = true;

        const reward = getRewardGold();
        GameData.earnGold(reward);
        updateGoldUI();

        log.innerText = `🧪 슬라임 처치! 💰 +${reward}`;
        screenShake();

        // ⏳ 잠깐 기다렸다가 리스폰
        setTimeout(() => {
            monster.hp = monster.maxHP;
            updateHP();       // 🔥 HP바가 다시 차오르는 연출
            isDead = false;
            log.innerText = '새로운 슬라임 등장!';
        }, 500); // ← 이 숫자 조절하면 연출 속도 바뀜
    }
};

updateHP();
updateGoldUI();
