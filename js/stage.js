// =========================
// 1️⃣ URL 파라미터 읽기 (가장 위)
// =========================
const params = new URLSearchParams(location.search);
const stageId = params.get('stage') || 1;

// =========================
// 2️⃣ 스테이지 데이터
// =========================
const stageData = {
    1: {
        name: '초원 1',
        monsterImage: 'images/monsters/slime_grass_1.png',
        maxHP: 100,
        baseReward: 50,
        requireLevel: 0,
        moveSpeed: 4.5
    },
    2: {
        name: '초원 2',
        monsterImage: 'images/monsters/slime_grass_2.png',
        maxHP: 130,
        baseReward: 70,
        requireLevel: 0,
        moveSpeed: 3.5
    },
    3: {
        name: '초원 3',
        monsterImage: 'images/monsters/slime_grass_3.png',
        maxHP: 180,
        baseReward: 100,
        requireLevel: 0,
        moveSpeed: 2.5
    },

    4: {
    name: '초원 4',
    monsterImage: 'images/monsters/slime_grass_4.png',
    maxHP: 260,
    baseReward: 140,
    requireLevel: 9,
    moveSpeed: 1.8,        // 🔥 기본부터 빠름
    rageSpeed: 1.1,        // 💢 광폭화 시
    rageHPPercent: 0.3     // HP 30% 이하
}

};

// 🔥 여기서 currentStage 확정
const currentStage = stageData[stageId];

// 스테이지 입장 레벨 체크
if (GameData.level < currentStage.requireLevel) {
    alert(
        `입장 불가!\n` +
        `필요 강화 레벨: +${currentStage.requireLevel}`
    );
    location.href = 'hunt.html';
}


// =========================
// 3️⃣ DOM 요소 먼저 가져오기
// =========================
const hpFill = document.getElementById('hp-fill');
const img = document.getElementById('monster');
const log = document.getElementById('log');
const goldText = document.getElementById('gold-text');
const wrapper = document.getElementById('monster-wrapper');

// =========================
// 4️⃣ 몬스터 생성
// =========================
const monster = {
    maxHP: currentStage.maxHP,
    hp: currentStage.maxHP,
    baseReward: currentStage.baseReward
};

// =========================
// 5️⃣ 슬라임 이미지 적용
// =========================
img.src = currentStage.monsterImage;
img.alt = currentStage.name + ' 슬라임';

// =========================
// 슬라임 이동 적용
// =========================
img.style.animationDuration = `${currentStage.moveSpeed}s`;


// =========================
// 6️⃣ 전투 로직
// =========================
let isDead = false;

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

function checkRageMode() {
    if (!currentStage.rageSpeed) return;

    const hpRate = monster.hp / monster.maxHP;

    if (hpRate <= currentStage.rageHPPercent) {
        wrapper.style.animationDuration = `${currentStage.rageSpeed}s`;
        log.innerText = '💢 슬라임이 광폭화했다!';
    }
}

img.onclick = () => {
    if (isDead) return;

    // 데미지
    monster.hp -= GameData.damage;
    if (monster.hp < 0) monster.hp = 0;

    showDamage(GameData.damage);
    updateHP();

    // 🔥 광폭화 체크
    checkRageMode();

    // 💀 처치 체크
    if (monster.hp === 0) {
        isDead = true;

        const reward = getRewardGold();
        GameData.earnGold(reward);
        updateGoldUI();

        log.innerText = `🧪 슬라임 처치! 💰 +${reward}`;
        screenShake();

        setTimeout(() => {
            monster.hp = monster.maxHP;
            updateHP();
            isDead = false;

            // 이동 속도 원래대로
            wrapper.style.animationDuration =
                `${currentStage.moveSpeed}s`;

            log.innerText = '새로운 슬라임 등장!';
        }, 500);
    }
};

// =========================
// 7️⃣ 초기 UI 세팅
// =========================
updateHP();
updateGoldUI();
