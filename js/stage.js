const params = new URLSearchParams(location.search);
const area = params.get('area') || 'grass';
const stageId = Number(params.get('stage') || 1);

/* =========================
   스테이지 데이터
========================= */

const grassStages = {
    1:{ name:'초원 1', monster:'slime_grass_1.png', hp:100, gold:50, lvl:0, speed:4 },
    2:{ name:'초원 2', monster:'slime_grass_2.png', hp:130, gold:70, lvl:3, speed:3 },
    3:{ name:'초원 3', monster:'slime_grass_3.png', hp:180, gold:100, lvl:6, speed:2.5 },
    4:{ name:'초원 4', monster:'slime_grass_4.png', hp:260, gold:140, lvl:9, speed:1.8 },
    5:{ name:'슬라임 왕', monster:'slime_grass_boss.png', hp:420, gold:300, lvl:12, speed:2, scale:1.4 }
};

const orcStages = {
    1:{ name:'풋내기 오크', monster:'orc_1.png', hp:520, gold:380, lvl:14, speed:3.2, scale:1.3, offsetY:80 },
    2:{ name:'전사 오크', monster:'orc_2.png', hp:650, gold:420, lvl:16, speed:2.8 },
    3:{ name:'광전사 오크', monster:'orc_3.png', hp:820, gold:500, lvl:18, speed:2.4 },
    4:{ name:'주술사 오크', monster:'orc_4.png', hp:1000, gold:650, lvl:20, speed:2.0 },
    5:{ name:'오크 족장', monster:'orc_5.png', hp:1600, gold:1200, lvl:25, speed:2.6, scale:1.6 }
};

const dragonStages = {
    1:{ name:'새끼 드레이크', monster:'dragon_1.png', hp:2200, gold:1800, lvl:28, speed:3.0, scale:1.2, offsetY:-40 },
    2:{ name:'불꽃 드레이크', monster:'dragon_2.png', hp:2600, gold:2200, lvl:30, speed:2.6, scale:1.3, offsetY:-60 },
    3:{ name:'비늘 와이번', monster:'dragon_3.png', hp:3200, gold:2800, lvl:33, speed:2.2, scale:1.4, offsetY:-80 },
    4:{ name:'다크 드래곤', monster:'dragon_4.png', hp:4000, gold:3600, lvl:36, speed:1.9, scale:1.6, offsetY:-100 },
    5:{ name:'골드 드래곤', monster:'dragon_5.png', hp:6500, gold:7000, lvl:40, speed:1.5, scale:1.9, offsetY:-120 }
};

/* 🌌 우주 (3 스테이지만) */
const spaceStages = {
    1:{
        name:'갤럭시 슬라임',
        monster:'galaxy_slime.png',
        hp:9000,
        gold:9000,
        lvl:45,
        speed:2.4,
        scale:2.2,
        offsetY:-80
    },
    2:{
        name:'갤럭시 오크',
        monster:'galaxy_orc.png',
        hp:13000,
        gold:15000,
        lvl:48,
        speed:2.0,
        scale:2.5,
        offsetY:-100
    },
    3:{
        name:'갤럭시 드래곤',
        monster:'galaxy_dragon.png',
        hp:22000,
        gold:30000,
        lvl:52,
        speed:1.6,
        scale:3.0,
        offsetY:-140
    }
};

const areaStages = {
    grass: grassStages,
    orc: orcStages,
    dragon: dragonStages,
    space: spaceStages
};

const data = areaStages[area][stageId];

/* =========================
   입장 제한
========================= */

if (GameData.level < data.lvl) {
    alert(`입장 불가! 필요 강화 +${data.lvl}`);
    location.href = 'hunt.html';
}

/* =========================
   DOM
========================= */

const stageEl = document.getElementById('stage');
const img = document.getElementById('monster');
const wrap = document.getElementById('monster-wrapper');
const hpFill = document.getElementById('hp-fill');
const log = document.getElementById('log');
const goldText = document.getElementById('gold-text');
const damageText = document.getElementById('damage-text');

stageEl.classList.add(area);

/* 몬스터 세팅 */
img.src = `images/monsters/${data.monster}`;
img.alt = data.name;
img.style.transform = `scale(${data.scale || 1})`;
img.style.marginTop = data.offsetY
    ? `${200 + data.offsetY}px`
    : '200px';

wrap.style.animationDuration = `${data.speed}s`;

let hp = data.hp;
let dead = false;

/* UI 초기화 */
log.innerText = `${data.name} 등장!`;
goldText.innerText = `💰 ${GameData.gold}`;
damageText.innerText = `공격력: ${GameData.damage}`;

function updateHP() {
    hpFill.style.width = `${(hp / data.hp) * 100}%`;
}

/* 공격 */
img.onclick = () => {
    if (dead) return;

    hp -= GameData.damage;
    if (hp < 0) hp = 0;
    updateHP();

    if (hp === 0) {
        dead = true;
        GameData.earnGold(data.gold);
        goldText.innerText = `💰 ${GameData.gold}`;
        log.innerText = `${data.name} 처치!`;

        setTimeout(() => {
            hp = data.hp;
            updateHP();
            dead = false;
            log.innerText = `${data.name} 등장!`;
        }, 1200);
    }
};

updateHP();
