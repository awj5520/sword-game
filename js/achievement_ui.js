const huntList = document.getElementById('hunt-achievement-list');
const goldList = document.getElementById('gold-achievement-list');
const upgradeList = document.getElementById('upgrade-achievement-list');

/* =========================
   사냥 업적
========================= */
const HUNT_ACH = [
  { id:'slime_slayer', title:'슬라임 슬레이어', target:20, monsters:[
    ['slime','슬라임'],['slime_helmet','투구 슬라임'],
    ['slime_warrior','전사 슬라임'],['slime_rage','광폭화 슬라임'],
    ['slime_king','슬라임 왕']
  ]},
  { id:'orc_conquer', title:'오크 부락 점령', target:30, monsters:[
    ['orc_1','풋내기 오크'],['orc_2','전사 오크'],
    ['orc_3','광전사 오크'],['orc_4','주술사 오크'],
    ['orc_king','오크 족장']
  ]},
  { id:'dragon_master', title:'드래곤 마스터', target:40, monsters:[
    ['dragon_1','새끼 드레이크'],['dragon_2','불꽃 드레이크'],
    ['dragon_3','비늘 와이번'],['dragon_4','다크 드래곤'],
    ['dragon_king','골드 드래곤']
  ]},
  { id:'space_conqueror', title:'정복자', target:50, monsters:[
    ['space_slime','갤럭시 슬라임'],
    ['space_orc','갤럭시 오크'],
    ['space_dragon','갤럭시 드래곤']
  ]}
];

/* =========================
   강화 업적 (🔥 신규)
========================= */
const UPGRADE_ACH = [
  { id:'upgrade_50', title:'검 숙련자', target:50 },
  { id:'upgrade_100', title:'강화 마스터', target:100 }
];

/* =========================
   골드 업적
========================= */
const GOLD_ACH = [
  { id:'gold_10m', title:'백만장자', target:10_000_000 },
  { id:'gold_100m', title:'재벌', target:100_000_000 },
  { id:'gold_100b', title:'신화급 부자', target:100_000_000_000 }
];

/* =========================
   렌더링
========================= */
renderHunt();
renderUpgrade();
renderGold();

/* -------- 사냥 -------- */
function renderHunt() {
  huntList.innerHTML = '';
  HUNT_ACH.forEach(ach=>{
    const done = Achievement.unlocked[ach.id];
    const card = makeCard(ach.title, done);

    ach.monsters.forEach(([k,n])=>{
      const left = Math.max(0, ach.target - (GameData.killStats[k]||0));
      addLine(card, `${n}: ${left===0?'완료':left+'마리 남음'}`);
    });

    huntList.appendChild(card);
  });
}

/* -------- 강화 -------- */
function renderUpgrade() {
  upgradeList.innerHTML = '';
  UPGRADE_ACH.forEach(ach=>{
    const done = Achievement.unlocked[ach.id];
    const card = makeCard(ach.title, done);

    const left = Math.max(0, ach.target - GameData.level);
    addLine(card, left===0 ? '완료' : `+${left}강 남음`);

    upgradeList.appendChild(card);
  });
}
function renderHunt() {
  huntList.innerHTML = '';
  HUNT_ACH.forEach(ach => {
    const done = Achievement.unlocked[ach.id];
    const card = makeCard(ach.title, done);

    // 업적을 완료했을 경우 'done' 클래스 추가
    if (done) {
      card.classList.add('done');
    }

    // 진행 상태 추가
    ach.monsters.forEach(([k, n]) => {
      const left = Math.max(0, ach.target - (GameData.killStats[k] || 0));
      addLine(card, `${n}: ${left === 0 ? '완료' : left + '마리 남음'}`);
    });

    huntList.appendChild(card);
  });
}

/* -------- 골드 -------- */
function renderGold() {
  goldList.innerHTML = '';
  GOLD_ACH.forEach(ach=>{
    const done = Achievement.unlocked[ach.id];
    const card = makeCard(ach.title, done);

    const left = Math.max(0, ach.target - GameData.totalGold);
    addLine(card, left===0?'완료':`${left.toLocaleString()} 골드 남음`);

    goldList.appendChild(card);
  });
}

/* =========================
   공용 UI
========================= */
function makeCard(title, done){
  const card = document.createElement('div');
  card.className = 'ach-card'+(done?' done':'');
  const t = document.createElement('div');
  t.className = 'ach-title';
  t.innerText = title+(done?' ✅':'');
  card.appendChild(t);
  return card;
}
function addLine(card,text){
  const l = document.createElement('div');
  l.className = 'ach-progress';
  l.innerText = text;
  card.appendChild(l);
}
