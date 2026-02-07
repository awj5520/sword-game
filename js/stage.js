/* =========================
   파라미터
========================= */
const params = new URLSearchParams(location.search);
const world = Number(params.get('world') || 1);
const area = params.get('area') || 'grass';
const stageId = Number(params.get('stage') || 1);

/* =========================
   🔒 2세계 입장 제한
========================= */
if (world === 2 && GameData.level < 100) {
    alert('2세계는 강화 +100 이상 필요합니다!');
    location.href = 'index.html';
}

/* =========================
   🌍 1세계 스테이지 데이터 (기존 그대로)
========================= */
const grassStages = {
    1:{ name:'슬라임', monster:'slime_grass_1.png', hp:100, gold:50, lvl:0, speed:4, achId:'slime' },
    2:{ name:'투구 슬라임', monster:'slime_grass_2.png', hp:130, gold:70, lvl:3, speed:3, achId:'slime_helmet' },
    3:{ name:'전사 슬라임', monster:'slime_grass_3.png', hp:180, gold:100, lvl:6, speed:2.5, achId:'slime_warrior' },
    4:{ name:'광폭화 슬라임', monster:'slime_grass_4.png', hp:260, gold:140, lvl:9, speed:1.8, achId:'slime_rage' },
    5:{ name:'슬라임 왕', monster:'slime_grass_5.png', hp:420, gold:300, lvl:12, speed:2, scale:1.4, achId:'slime_king' }
};

const orcStages = {
    1:{ name:'풋내기 오크', monster:'orc_1.png', hp:520, gold:380, lvl:14, speed:3.2, scale:1.3, offsetY:80, achId:'orc_1' },
    2:{ name:'전사 오크', monster:'orc_2.png', hp:650, gold:420, lvl:16, speed:2.8, achId:'orc_2' },
    3:{ name:'광전사 오크', monster:'orc_3.png', hp:820, gold:500, lvl:18, speed:2.4, achId:'orc_3' },
    4:{ name:'주술사 오크', monster:'orc_4.png', hp:1000, gold:650, lvl:20, speed:2.0, achId:'orc_4' },
    5:{ name:'오크 족장', monster:'orc_5.png', hp:1600, gold:1200, lvl:25, speed:2.6, scale:1.6, achId:'orc_king' }
};

const dragonStages = {
    1:{ name:'새끼 드레이크', monster:'dragon_1.png', hp:2200, gold:1800, lvl:28, speed:3.0, scale:1.2, offsetY:-40, achId:'dragon_1' },
    2:{ name:'불꽃 드레이크', monster:'dragon_2.png', hp:2600, gold:2200, lvl:30, speed:2.6, scale:1.3, offsetY:-60, achId:'dragon_2' },
    3:{ name:'비늘 와이번', monster:'dragon_3.png', hp:3200, gold:2800, lvl:33, speed:2.2, scale:1.4, offsetY:-80, achId:'dragon_3' },
    4:{ name:'다크 드래곤', monster:'dragon_4.png', hp:4000, gold:3600, lvl:36, speed:1.9, scale:1.6, offsetY:-100, achId:'dragon_4' },
    5:{ name:'골드 드래곤', monster:'dragon_5.png', hp:6500, gold:7000, lvl:40, speed:1.5, scale:1.9, offsetY:-120, achId:'dragon_king' }
};

const spaceStages = {
    1:{ name:'갤럭시 슬라임', monster:'galaxy_slime.png', hp:9000, gold:9000, lvl:45, speed:2.4, scale:2.2, offsetY:-80, achId:'space_slime' },
    2:{ name:'갤럭시 오크', monster:'galaxy_orc.png', hp:13000, gold:15000, lvl:48, speed:2.0, scale:2.5, offsetY:-100, achId:'space_orc' },
    3:{ name:'갤럭시 드래곤', monster:'galaxy_dragon.png', hp:22000, gold:30000, lvl:52, speed:1.6, scale:3.0, offsetY:-140, achId:'space_dragon' }
};

/* =========================
   🌌 2세계 스테이지 데이터 (전부 갤럭시 드래곤 이상)
========================= */

/* 🕳️ 동굴 – 박쥐 */
const caveStages = {
    1:{ name:'동굴 박쥐', monster:'bat_1.png', hp:25000, gold:35000, lvl:100, speed:3.5, achId:'bat_1' },
    2:{ name:'어둠 박쥐', monster:'bat_2.png', hp:28000, gold:38000, lvl:102, speed:3.2, achId:'bat_2' },
    3:{ name:'흡혈 박쥐', monster:'bat_3.png', hp:32000, gold:42000, lvl:104, speed:3.0, achId:'bat_3', scale:1.5 },
    4:{ name:'광폭 박쥐', monster:'bat_4.png', hp:36000, gold:46000, lvl:106, speed:2.6, achId:'bat_4', scale:1.7 },
    5:{ name:'박쥐 군주', monster:'bat_boss.png', hp:42000, gold:52000, lvl:108, speed:2.4, scale:2.0, achId:'bat_king' }
};

/* 🪦 무덤 – 해골 */
const graveStages = {
    1:{ name:'해골 병사', monster:'skeleton_1.png', hp:45000, gold:60000, lvl:110, speed:2.4, achId:'skeleton_1' , scale:1.7 },
    2:{ name:'해골 궁수', monster:'skeleton_2.png', hp:50000, gold:65000, lvl:112, speed:2.2, achId:'skeleton_2' , scale:1.7},
    3:{ name:'해골 기사', monster:'skeleton_3.png', hp:56000, gold:72000, lvl:114, speed:2.0, achId:'skeleton_3' , scale:1.7},
    4:{ name:'저주받은 해골', monster:'skeleton_4.png', hp:62000, gold:80000, lvl:116, speed:1.8, achId:'skeleton_4' , scale:1.7},
    5:{ name:'해골 군주', monster:'skeleton_boss.png', hp:70000, gold:90000, lvl:118, speed:1.6, scale:2.0, achId:'skeleton_king' }
};

/* 🏰 악마성 */
const demonStages = {
    1:{ name:'악마 하수인', monster:'demon_1.png', hp:80000, gold:100000, lvl:120, speed:2.2, achId:'demon_1' , scale:1.7 },
    2:{ name:'악마 기사', monster:'demon_2.png', hp:90000, gold:120000, lvl:122, speed:2.0, achId:'demon_2' , scale:1.7},
    3:{ name:'지옥 마법사', monster:'demon_3.png', hp:105000, gold:140000, lvl:124, speed:1.8, achId:'demon_3' , scale:2.0},
    4:{ name:'타락한 군주', monster:'demon_4.png', hp:120000, gold:160000, lvl:126, speed:1.6, achId:'demon_4' , scale:2.1},
    5:{ name:'마왕', monster:'demon_boss.png', hp:150000, gold:200000, lvl:128, speed:1.4, scale:2.4, achId:'demon_king' }
};

/* 🔥 마계 – 최종 구간 */
const hellStages = {
    1:{ name:'탐욕의 망령', monster:'sin_greed.png', hp:200000, gold:260000, lvl:130, speed:1.8, scale:2.4, achId:'sin_greed' },
    2:{ name:'질투의 망령', monster:'sin_envy.png', hp:260000, gold:340000, lvl:132, speed:1.7, scale:2.9, achId:'sin_envy' },
    3:{ name:'👑 분노의 신', monster:'sin_god.png', hp:350000, gold:500000, lvl:140, speed:1.3, scale:2.5, achId:'sin_god' }
};

/* =========================
   지역 매핑
========================= */
const areaStages =
    world === 1
        ? {
            grass: grassStages,
            orc: orcStages,
            dragon: dragonStages,
            space: spaceStages
        }
        : {
            cave: caveStages,
            grave: graveStages,
            demon: demonStages,
            hell: hellStages
        };

const data = areaStages[area]?.[stageId];
if (!data) {
    alert('존재하지 않는 스테이지입니다.');
    location.href = 'hunt.html';
}

/* =========================
   강화 조건 입장 제한
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

/* =========================
   몬스터 세팅
========================= */
img.src = `images/monsters/${data.monster}`;
img.alt = data.name;
img.style.transform = `scale(${data.scale || 1})`;
img.style.marginTop = data.offsetY
    ? `${200 + data.offsetY}px`
    : '200px';

wrap.style.animationDuration = `${data.speed}s`;

/* =========================
   상태
========================= */
let hp = data.hp;
let dead = false;

/* =========================
   UI 초기화
========================= */
log.innerText = `${data.name} 등장!`;
goldText.innerText = `💰 ${GameData.gold}`;
damageText.innerText = `공격력: ${GameData.getCurrentDamage()}`;

function updateHP() {
    hpFill.style.width = `${(hp / data.hp) * 100}%`;
}

/* =========================
   공격 처리
========================= */
img.onclick = () => {
    if (dead) return;

    hp -= GameData.getCurrentDamage();
    if (hp < 0) hp = 0;
    updateHP();

    img.classList.add('hit');
    setTimeout(() => img.classList.remove('hit'), 120);

    if (hp === 0) {
        dead = true;

        img.style.pointerEvents = 'none';
        img.style.opacity = '0.3';

        /* 💰 골드 */
        GameData.earnGold(data.gold);
        goldText.innerText = `💰 ${GameData.gold}`;

        /* 🏆 업적 카운트 */
        if (GameData.killStats[data.achId] !== undefined) {
            GameData.killStats[data.achId]++;
        }
        GameData.save();
        if (window.Achievement) Achievement.checkAll();

        log.innerText = `${data.name} 처치!`;

        setTimeout(() => {
            hp = data.hp;
            updateHP();
            dead = false;

            img.style.opacity = '1';
            img.style.pointerEvents = 'auto';

            log.innerText = `${data.name} 등장!`;
        }, 1200);
    }
};

updateHP();
