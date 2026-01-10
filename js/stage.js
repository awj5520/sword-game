// =========================
// URL 파라미터
// =========================
const params = new URLSearchParams(location.search);
const stageId = Number(params.get('stage') || 1);

// =========================
// 스테이지 데이터
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
        requireLevel: 3,
        moveSpeed: 3.5
    },
    3: {
        name: '초원 3',
        monsterImage: 'images/monsters/slime_grass_3.png',
        maxHP: 180,
        baseReward: 100,
        requireLevel: 6,
        moveSpeed: 2.5
    },
    4: {
        name: '초원 4',
        monsterImage: 'images/monsters/slime_grass_4.png',
        maxHP: 260,
        baseReward: 140,
        requireLevel: 9,
        moveSpeed: 1.8,
        rageSpeed: 1.2,
        rageHPPercent: 0.3
    },
    5: {
        name: '초원 5 (슬라임 왕)',
        monsterImage: 'images/monsters/slime_grass_5.png',
        maxHP: 420,
        baseReward: 300,
        requireLevel: 12,
        moveSpeed: 2.8,
        rageSpeed: 1.6,
        rageSpeed2: 1.0,
        rageHPPercent: 0.5,
        rageHPPercent2: 0.2,
        scale: 1.4          // 👑 보스 크기
    }
};

const currentStage = stageData[stageId];

// 입장 제한
if (GameData.level < currentStage.requireLevel) {
    alert(`입장 불가! 필요 강화 레벨: +${currentStage.requireLevel}`);
    location.href = 'hunt.html';
}

// =========================
// DOM
// =========================
const hpFill = document.getElementById('hp-fill');
const img = document.getElementById('monster');
const wrapper = document.getElementById('monster-wrapper');
const log = document.getElementById('log');
const goldText = document.getElementById('gold-text');

// =========================
// 몬스터
// =========================
const monster = {
    maxHP: currentStage.maxHP,
    hp: currentStage.maxHP,
    baseReward: currentStage.baseReward
};

// 이미지 & 이동
img.src = currentStage.monsterImage;
img.alt = currentStage.name;
wrapper.style.animationDuration = `${currentStage.moveSpeed}s`;

// 👑 보스 크기 적용
const baseScale = currentStage.scale || 1;
img.style.transform = `scale(${baseScale})`;

let isDead = false;
let ragePhase = 0;

// =========================
// UI
// =========================
function updateHP() {
    hpFill.style.width = `${(monster.hp / monster.maxHP) * 100}%`;
}

function updateGoldUI() {
    goldText.innerText = `💰 ${GameData.gold}`;
}

function getRewardGold() {
    return monster.baseReward + GameData.level * 10;
}

// =========================
// 광폭화
// =========================
function checkRageMode() {
    const rate = monster.hp / monster.maxHP;

    if (
        currentStage.rageSpeed2 &&
        rate <= currentStage.rageHPPercent2 &&
        ragePhase < 2
    ) {
        ragePhase = 2;
        wrapper.style.animationDuration = `${currentStage.rageSpeed2}s`;
        log.innerText = '👑💢 슬라임 왕이 폭주했다!';
        return;
    }

    if (
        currentStage.rageSpeed &&
        rate <= currentStage.rageHPPercent &&
        ragePhase < 1
    ) {
        ragePhase = 1;
        wrapper.style.animationDuration = `${currentStage.rageSpeed}s`;
        log.innerText = '💢 슬라임이 광폭화했다!';
    }
}

// =========================
// 공격
// =========================
img.onclick = () => {
    if (isDead) return;

    // 클릭 피드백 (보스 대응)
    img.style.transform = `scale(${baseScale * 0.92})`;
    setTimeout(() => {
        img.style.transform = `scale(${baseScale})`;
    }, 80);

    monster.hp -= GameData.damage;
    if (monster.hp < 0) monster.hp = 0;

    updateHP();
    checkRageMode();

    if (monster.hp === 0) {
        isDead = true;

        const reward = getRewardGold();
        GameData.earnGold(reward);
        updateGoldUI();

        log.innerText = `👑 처치 성공! 💰 +${reward}`;
        screenShake();

        setTimeout(() => {
            monster.hp = monster.maxHP;
            updateHP();
            isDead = false;
            ragePhase = 0;
            wrapper.style.animationDuration = `${currentStage.moveSpeed}s`;
            img.style.transform = `scale(${baseScale})`;
            log.innerText = '새로운 슬라임 등장!';
        }, 900);
    }
};

// 초기 UI
updateHP();
updateGoldUI();
