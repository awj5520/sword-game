/* =============================================
   DUNGEON-CODEX.JS — 웨이브 던전 도감
   ─ 몬스터 도감과 동일한 구조 (codex-* 클래스 재사용)
   ─ 해금 기준: localStorage 'dungeonBestWave' (최고 도달 층)
     · 어떤 몬스터가 처음 등장하는 층까지 도달했으면 공개
   ─ 데이터는 dungeon.js의 ZONE_DEFS / 구간 스킬을 자체 복사(읽기 전용)
   ============================================= */

const dungeonCodexSummaryEl = document.getElementById('codex-summary');
const dungeonCodexGroupListEl = document.getElementById('codex-group-list');

/* =============================================
   구간 정의 (dungeon.js ZONE_DEFS 미러)
   ─ 구간당 몬스터 4종 (mob1 / mob2 / mob3 / boss)
============================================= */
const DUNGEON_CODEX_ZONES = [
  {
    name: '1구간 · 동굴 임프',
    monsters: [
      { name: '동굴 임프',     img: 'images/dungeon/zone1_mob1.png' },
      { name: '어둠 임프',     img: 'images/dungeon/zone1_mob2.png' },
      { name: '맹독 임프',     img: 'images/dungeon/zone1_mob3.png' },
      { name: '임프 군주',     img: 'images/dungeon/zone1_boss.png' }
    ]
  },
  {
    name: '2구간 · 골렘',
    monsters: [
      { name: '돌 골렘',       img: 'images/dungeon/zone2_mob1.png' },
      { name: '철 골렘',       img: 'images/dungeon/zone2_mob2.png' },
      { name: '어둠의 골렘',   img: 'images/dungeon/zone2_mob3.png' },
      { name: '골렘 군주',     img: 'images/dungeon/zone2_boss.png' }
    ]
  },
  {
    name: '3구간 · 독충',
    monsters: [
      { name: '독 벌레',       img: 'images/dungeon/zone3_mob1.png' },
      { name: '갑각 독충',     img: 'images/dungeon/zone3_mob2.png' },
      { name: '거대 독충',     img: 'images/dungeon/zone3_mob3.png' },
      { name: '독충 여왕',     img: 'images/dungeon/zone3_boss.png' }
    ]
  },
  {
    name: '4구간 · 망령',
    monsters: [
      { name: '망령 병사',     img: 'images/dungeon/zone4_mob1.png' },
      { name: '망령 기사',     img: 'images/dungeon/zone4_mob2.png' },
      { name: '저주받은 망령', img: 'images/dungeon/zone4_mob3.png' },
      { name: '망령 군주',     img: 'images/dungeon/zone4_boss.png' }
    ]
  },
  {
    name: '5구간 · 심연',
    monsters: [
      { name: '어비스 정찰자', img: 'images/dungeon/zone5_mob1.png' },
      { name: '어비스 전사',   img: 'images/dungeon/zone5_mob2.png' },
      { name: '어비스 군주',   img: 'images/dungeon/zone5_mob3.png' },
      { name: '어비스 감시자', img: 'images/dungeon/zone5_boss.png' }
    ]
  },
  {
    name: '6구간 · 화염',
    monsters: [
      { name: '화염 임프',     img: 'images/dungeon/zone6_mob1.png' },
      { name: '화염 마귀',     img: 'images/dungeon/zone6_mob2.png' },
      { name: '불꽃 군주',     img: 'images/dungeon/zone6_mob3.png' },
      { name: '화염 왕',       img: 'images/dungeon/zone6_boss.png' }
    ]
  },
  {
    name: '7구간 · 빙하',
    monsters: [
      { name: '빙하 정령',     img: 'images/dungeon/zone7_mob1.png' },
      { name: '서리 기사',     img: 'images/dungeon/zone7_mob2.png' },
      { name: '얼음 거인',     img: 'images/dungeon/zone7_mob3.png' },
      { name: '서리 군주',     img: 'images/dungeon/zone7_boss.png' }
    ]
  },
  {
    name: '8구간 · 번개',
    monsters: [
      { name: '번개 정령',     img: 'images/dungeon/zone8_mob1.png' },
      { name: '폭풍 기사',     img: 'images/dungeon/zone8_mob2.png' },
      { name: '번개 마법사',   img: 'images/dungeon/zone8_mob3.png' },
      { name: '뇌신',         img: 'images/dungeon/zone8_boss.png' }
    ]
  },
  {
    name: '9구간 · 암흑',
    monsters: [
      { name: '심연의 그림자', img: 'images/dungeon/zone9_mob1.png' },
      { name: '어둠의 포식자', img: 'images/dungeon/zone9_mob2.png' },
      { name: '공허의 군주',   img: 'images/dungeon/zone9_mob3.png' },
      { name: '암흑 군주',     img: 'images/dungeon/zone9_boss.png' }
    ]
  },
  {
    name: '10구간 · 던전 군주',
    monsters: [
      { name: '던전 수호자',   img: 'images/dungeon/zone10_mob1.png' },
      { name: '던전 기사',     img: 'images/dungeon/zone10_mob2.png' },
      { name: '던전 마법사',   img: 'images/dungeon/zone10_mob3.png' },
      { name: '던전 군주',     img: 'images/dungeon/zone10_boss.png' }
    ]
  }
];

/* =============================================
   상태이상 라벨 (dungeon.js DUNGEON_STATUS_DEFS 미러)
============================================= */
const DUNGEON_CODEX_STATUS_LABELS = {
  poison: '중독',
  bleed: '출혈',
  burn: '화상',
  shock: '감전',
  frost: '빙결',
  heavy: '무거움',
  imp_hex: '임프의 저주',
  golem_quake: '지진 충격',
  venom_corrode: '맹독 부식',
  wraith_drain: '영혼 흡수',
  abyss_silence: '심연의 침묵',
  inferno_brand: '업화 낙인',
  permafrost: '영구동토',
  overload: '과부하',
  void_reflect: '공허 반사',
  sovereign_doom: '군주의 심판'
};

/* =============================================
   구간 스킬 (dungeon.js DUNGEON_ZONE_SKILLS 미러)
   ─ 슬롯→층: A=1~3 / B=4~6 / C=7~9 / D·ENRAGE=10(보스)
============================================= */
function sk(name, ...pairs) {
  const statuses = [];
  for (let i = 0; i < pairs.length; i += 2) {
    statuses.push({ type: pairs[i], chance: pairs[i + 1] });
  }
  return { name, statuses };
}

const DUNGEON_CODEX_SKILLS = [
  { /* 1 임프 */
    A: sk('할퀴기'),
    B1: sk('그림자 발톱', 'bleed', 0.35), B2: sk('어둠의 정수', 'poison', 0.35, 'heavy', 0.25),
    C1: sk('독니 연타', 'poison', 0.45, 'imp_hex', 0.30), C2: sk('부패의 손길', 'imp_hex', 0.40, 'heavy', 0.30), C3: sk('비웃는 절규', 'shock', 0.40),
    D1: sk('군주의 조롱', 'imp_hex', 0.55, 'bleed', 0.40), D2: sk('저주의 표식', 'imp_hex', 0.50, 'heavy', 0.40), D3: sk('어둠 분출', 'poison', 0.55, 'shock', 0.35),
    ENRAGE: sk('광란의 저주', 'imp_hex', 0.70, 'bleed', 0.50, 'heavy', 0.40)
  },
  { /* 2 골렘 */
    A: sk('바위 주먹'),
    B1: sk('강철 내려치기', 'heavy', 0.40), B2: sk('진동 강타', 'golem_quake', 0.30),
    C1: sk('흑철 연타', 'heavy', 0.45, 'bleed', 0.30), C2: sk('대지 균열', 'golem_quake', 0.35, 'heavy', 0.35), C3: sk('압쇄', 'heavy', 0.50),
    D1: sk('군주의 분쇄', 'golem_quake', 0.45, 'heavy', 0.45), D2: sk('지각 붕괴', 'golem_quake', 0.40, 'bleed', 0.40), D3: sk('절대 압력', 'heavy', 0.60),
    ENRAGE: sk('파멸의 일격', 'golem_quake', 0.55, 'heavy', 0.55)
  },
  { /* 3 독충 */
    A: sk('독침'),
    B1: sk('갑각 강타', 'poison', 0.40), B2: sk('산성 분비', 'venom_corrode', 0.35),
    C1: sk('맹독 분사', 'venom_corrode', 0.40, 'heavy', 0.30), C2: sk('부식의 턱', 'poison', 0.50, 'shock', 0.30), C3: sk('독무 살포', 'venom_corrode', 0.35, 'heavy', 0.35),
    D1: sk('여왕의 맹독', 'venom_corrode', 0.55, 'heavy', 0.40), D2: sk('부패의 알', 'venom_corrode', 0.50, 'shock', 0.40), D3: sk('산성 해일', 'venom_corrode', 0.50, 'heavy', 0.45),
    ENRAGE: sk('맹독 폭주', 'venom_corrode', 0.75, 'shock', 0.50, 'heavy', 0.50)
  },
  { /* 4 망령 */
    A: sk('영혼 베기'),
    B1: sk('망자의 검', 'bleed', 0.35), B2: sk('한기의 일격', 'frost', 0.35),
    C1: sk('영혼 흡수', 'wraith_drain', 0.40, 'bleed', 0.35), C2: sk('절망의 손길', 'frost', 0.40, 'heavy', 0.30), C3: sk('저주의 사슬', 'wraith_drain', 0.35, 'shock', 0.35),
    D1: sk('군주의 흡혈', 'wraith_drain', 0.55, 'bleed', 0.45), D2: sk('영혼 약탈', 'wraith_drain', 0.50, 'frost', 0.40), D3: sk('죽음의 손길', 'wraith_drain', 0.50, 'heavy', 0.45),
    ENRAGE: sk('영혼 포식', 'wraith_drain', 0.75, 'bleed', 0.50, 'frost', 0.45)
  },
  { /* 5 심연 */
    A: sk('심연의 발톱'),
    B1: sk('어비스 강타', 'heavy', 0.35), B2: sk('공허 가르기', 'bleed', 0.35),
    C1: sk('침묵의 일격', 'abyss_silence', 0.30, 'heavy', 0.30), C2: sk('심연 분출', 'shock', 0.40, 'heavy', 0.35), C3: sk('공허 잠식', 'frost', 0.40, 'bleed', 0.30),
    D1: sk('감시자의 봉인', 'abyss_silence', 0.45, 'heavy', 0.40), D2: sk('심연의 응시', 'shock', 0.55, 'frost', 0.40), D3: sk('무의 강타', 'abyss_silence', 0.40, 'bleed', 0.45),
    ENRAGE: sk('절대 침묵', 'abyss_silence', 0.55, 'heavy', 0.50, 'shock', 0.45)
  },
  { /* 6 화염 */
    A: sk('불씨 던지기'),
    B1: sk('화염 발톱', 'burn', 0.40), B2: sk('작열 강타', 'inferno_brand', 0.35),
    C1: sk('업화 분출', 'inferno_brand', 0.40, 'shock', 0.30), C2: sk('용암 강타', 'burn', 0.45, 'heavy', 0.30), C3: sk('화염 회오리', 'inferno_brand', 0.35, 'shock', 0.35),
    D1: sk('왕의 업화', 'inferno_brand', 0.55, 'shock', 0.40), D2: sk('멸화의 숨결', 'burn', 0.60, 'heavy', 0.40), D3: sk('작열 낙인', 'inferno_brand', 0.50, 'shock', 0.45),
    ENRAGE: sk('종말의 불길', 'inferno_brand', 0.75, 'shock', 0.50, 'heavy', 0.45)
  },
  { /* 7 빙하 */
    A: sk('얼음 파편'),
    B1: sk('서리 칼날', 'frost', 0.40), B2: sk('한파 강타', 'permafrost', 0.30),
    C1: sk('빙하 내려치기', 'permafrost', 0.35, 'heavy', 0.35), C2: sk('동결의 손아귀', 'frost', 0.45, 'shock', 0.35), C3: sk('눈보라', 'permafrost', 0.35, 'bleed', 0.30),
    D1: sk('군주의 빙결', 'permafrost', 0.45, 'heavy', 0.45), D2: sk('절대 영도', 'permafrost', 0.50, 'shock', 0.40), D3: sk('빙하 붕괴', 'frost', 0.55, 'bleed', 0.45),
    ENRAGE: sk('영원한 빙하기', 'permafrost', 0.70, 'shock', 0.50, 'heavy', 0.50)
  },
  { /* 8 번개 */
    A: sk('정전기 방출'),
    B1: sk('번개 베기', 'shock', 0.40), B2: sk('뇌격 강타', 'overload', 0.30),
    C1: sk('연쇄 번개', 'overload', 0.40, 'shock', 0.35), C2: sk('감전 폭발', 'shock', 0.50, 'heavy', 0.30), C3: sk('폭풍 소환', 'overload', 0.35, 'bleed', 0.30),
    D1: sk('뇌신의 강림', 'overload', 0.50, 'shock', 0.45), D2: sk('천벌의 번개', 'overload', 0.45, 'heavy', 0.40), D3: sk('폭뢰', 'shock', 0.60, 'bleed', 0.40),
    ENRAGE: sk('신벌의 낙뢰', 'overload', 0.70, 'shock', 0.55, 'heavy', 0.45)
  },
  { /* 9 암흑 */
    A: sk('그림자 일격'),
    B1: sk('포식자의 송곳니', 'bleed', 0.35), B2: sk('암흑 침식', 'heavy', 0.35),
    C1: sk('공허 반사', 'void_reflect', 0.35, 'bleed', 0.30), C2: sk('어둠 분출', 'shock', 0.45, 'heavy', 0.35), C3: sk('절망의 장막', 'frost', 0.45, 'bleed', 0.30),
    D1: sk('군주의 반전', 'void_reflect', 0.50, 'heavy', 0.45), D2: sk('공허 붕괴', 'void_reflect', 0.45, 'shock', 0.50), D3: sk('심연 잠식', 'frost', 0.55, 'bleed', 0.45),
    ENRAGE: sk('절대 공허', 'void_reflect', 0.70, 'bleed', 0.50, 'heavy', 0.50)
  },
  { /* 10 던전 군주 */
    A: sk('수호자의 강타'),
    B1: sk('기사의 베기', 'bleed', 0.40), B2: sk('충성의 일격', 'heavy', 0.35),
    C1: sk('비전 폭발', 'sovereign_doom', 0.35, 'shock', 0.35), C2: sk('봉인의 사슬', 'sovereign_doom', 0.40, 'heavy', 0.35), C3: sk('마력 과부하', 'burn', 0.45, 'shock', 0.35),
    D1: sk('군주의 심판', 'sovereign_doom', 0.55, 'bleed', 0.45), D2: sk('절대 군림', 'sovereign_doom', 0.50, 'heavy', 0.50), D3: sk('파멸 선고', 'sovereign_doom', 0.50, 'shock', 0.50),
    ENRAGE: sk('최후의 심판', 'sovereign_doom', 0.80, 'bleed', 0.55, 'heavy', 0.50)
  }
];

/* 몬스터 인덱스(0~3) → 등장 층 슬롯 묶음 */
const MONSTER_SLOT_KEYS = [
  ['A'],                 // mob1 : 1~3층
  ['B1', 'B2'],          // mob2 : 4~6층
  ['C1', 'C2', 'C3'],    // mob3 : 7~9층
  ['D1', 'D2', 'D3', 'ENRAGE'] // boss : 10층
];

/* =============================================
   유틸
============================================= */
function toSafeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, Math.floor(num)) : 0;
}

function formatNumber(value) {
  return toSafeNumber(value).toLocaleString('ko-KR');
}

function getBestWave() {
  return toSafeNumber(localStorage.getItem('dungeonBestWave'));
}

/* 구간 인덱스(0~9), 몬스터 인덱스(0~3) → 첫 등장 층 */
function getFirstAppearWave(zoneIdx, monsterIdx) {
  const base = zoneIdx * 10;
  const offsets = [1, 4, 7, 10]; // mob1, mob2, mob3, boss
  return base + offsets[monsterIdx];
}

/* 등장 층 범위 텍스트 */
function getAppearRangeText(zoneIdx, monsterIdx) {
  const base = zoneIdx * 10;
  const ranges = [
    `${base + 1}~${base + 3}층`,
    `${base + 4}~${base + 6}층`,
    `${base + 7}~${base + 9}층`,
    `${base + 10}층 (보스)`
  ];
  return ranges[monsterIdx];
}

function statusLabel(type) {
  return DUNGEON_CODEX_STATUS_LABELS[type] || type;
}

/* =============================================
   상세 패널 (해금 시 클릭하면 표시)
============================================= */
function buildDetailContent(zoneIdx, monsterIdx) {
  const detailRoot = document.createElement('div');
  detailRoot.className = 'codex-detail-inner';

  const skillBook = DUNGEON_CODEX_SKILLS[zoneIdx];
  const slotKeys = MONSTER_SLOT_KEYS[monsterIdx] || [];

  const skillTitle = document.createElement('div');
  skillTitle.className = 'codex-detail-title';
  skillTitle.innerText = '기술';
  detailRoot.appendChild(skillTitle);

  const skillList = document.createElement('ul');
  skillList.className = 'codex-detail-list';

  const allStatusKeys = new Set();

  slotKeys.forEach((slot) => {
    const skill = skillBook[slot];
    if (!skill) return;
    const item = document.createElement('li');
    const statusText = skill.statuses.length > 0
      ? skill.statuses.map((s) => `${statusLabel(s.type)} ${Math.round(s.chance * 100)}%`).join(', ')
      : '상태이상 없음';
    item.innerText = `${skill.name} · ${statusText}`;
    skillList.appendChild(item);
    skill.statuses.forEach((s) => allStatusKeys.add(s.type));
  });

  detailRoot.appendChild(skillList);

  const statusTitle = document.createElement('div');
  statusTitle.className = 'codex-detail-title';
  statusTitle.innerText = '부여 상태이상';
  detailRoot.appendChild(statusTitle);

  if (allStatusKeys.size > 0) {
    const chipWrap = document.createElement('div');
    chipWrap.className = 'codex-status-chips';
    allStatusKeys.forEach((type) => {
      const chip = document.createElement('span');
      chip.className = 'codex-status-chip';
      chip.innerText = statusLabel(type);
      chipWrap.appendChild(chip);
    });
    detailRoot.appendChild(chipWrap);
  } else {
    const emptyStatus = document.createElement('div');
    emptyStatus.className = 'codex-detail-empty';
    emptyStatus.innerText = '없음';
    detailRoot.appendChild(emptyStatus);
  }

  return detailRoot;
}

/* =============================================
   카드 생성
============================================= */
function createCodexCard(zoneIdx, monsterIdx, monster, bestWave) {
  const firstWave = getFirstAppearWave(zoneIdx, monsterIdx);
  const unlocked = bestWave >= firstWave;
  const isBoss = (monsterIdx === 3);

  const card = document.createElement('div');
  card.className = `codex-card ${unlocked ? 'unlocked' : 'locked'}`;

  const thumb = document.createElement('img');
  thumb.className = `codex-thumb ${unlocked ? 'clickable' : ''}`;
  thumb.src = monster.img;
  thumb.alt = unlocked ? monster.name : '잠금된 몬스터';
  if (unlocked) {
    thumb.setAttribute('role', 'button');
    thumb.tabIndex = 0;
    thumb.title = '클릭 시 기술/상태이상 보기';
  }
  card.appendChild(thumb);

  const main = document.createElement('div');
  main.className = 'codex-main';

  const nameEl = document.createElement('div');
  nameEl.className = 'codex-name';
  nameEl.innerText = unlocked ? monster.name : '???';
  main.appendChild(nameEl);

  const metaEl = document.createElement('div');
  metaEl.className = 'codex-meta';
  metaEl.innerText = getAppearRangeText(zoneIdx, monsterIdx);
  main.appendChild(metaEl);

  if (unlocked) {
    const hintEl = document.createElement('div');
    hintEl.className = 'codex-meta codex-meta-sub';
    hintEl.innerText = '이미지를 눌러 기술/상태이상 보기';
    main.appendChild(hintEl);
  } else {
    const hintEl = document.createElement('div');
    hintEl.className = 'codex-meta codex-meta-sub';
    hintEl.innerText = `${firstWave}층 도달 시 해금`;
    main.appendChild(hintEl);
  }

  card.appendChild(main);

  const right = document.createElement('div');
  right.className = 'codex-right';

  if (isBoss) {
    const bossEl = document.createElement('div');
    bossEl.className = 'codex-boss';
    bossEl.innerText = 'BOSS';
    right.appendChild(bossEl);
  }

  const stateEl = document.createElement('div');
  stateEl.className = 'codex-kill';
  stateEl.innerText = unlocked ? '해금' : '미해금';
  right.appendChild(stateEl);

  card.appendChild(right);

  const detailEl = document.createElement('div');
  detailEl.className = 'codex-detail';
  detailEl.hidden = true;
  detailEl.appendChild(buildDetailContent(zoneIdx, monsterIdx));
  card.appendChild(detailEl);

  if (unlocked) {
    const toggleDetail = () => {
      const willOpen = detailEl.hidden;
      detailEl.hidden = !willOpen;
      card.classList.toggle('detail-open', willOpen);
    };
    thumb.addEventListener('click', toggleDetail);
    thumb.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleDetail();
    });
  }

  return card;
}

/* =============================================
   전체 렌더링
============================================= */
function renderDungeonCodex() {
  const bestWave = getBestWave();

  const allMonsters = DUNGEON_CODEX_ZONES.flatMap((zone, zoneIdx) =>
    zone.monsters.map((monster, monsterIdx) => ({ zoneIdx, monsterIdx, monster }))
  );

  const discoveredCount = allMonsters.reduce((sum, m) => {
    return sum + (bestWave >= getFirstAppearWave(m.zoneIdx, m.monsterIdx) ? 1 : 0);
  }, 0);

  const bossTotal = DUNGEON_CODEX_ZONES.length; // 구간당 보스 1
  const bossDiscovered = DUNGEON_CODEX_ZONES.reduce((sum, zone, zoneIdx) => {
    return sum + (bestWave >= getFirstAppearWave(zoneIdx, 3) ? 1 : 0);
  }, 0);

  if (dungeonCodexSummaryEl) {
    dungeonCodexSummaryEl.innerText =
      `해금 ${formatNumber(discoveredCount)} / ${formatNumber(allMonsters.length)} | ` +
      `보스 ${formatNumber(bossDiscovered)} / ${formatNumber(bossTotal)} | ` +
      `최고 ${formatNumber(bestWave)}층`;
  }

  dungeonCodexGroupListEl.innerHTML = '';

  DUNGEON_CODEX_ZONES.forEach((zone, zoneIdx) => {
    const groupEl = document.createElement('section');
    groupEl.className = 'codex-group';

    const groupHead = document.createElement('div');
    groupHead.className = 'codex-group-head';

    const titleEl = document.createElement('div');
    titleEl.className = 'codex-group-title';
    titleEl.innerText = zone.name;
    groupHead.appendChild(titleEl);

    const unlockedInZone = zone.monsters.reduce((sum, _m, monsterIdx) => {
      return sum + (bestWave >= getFirstAppearWave(zoneIdx, monsterIdx) ? 1 : 0);
    }, 0);

    const progressEl = document.createElement('div');
    progressEl.className = 'codex-group-progress';
    progressEl.innerText = `${formatNumber(unlockedInZone)} / ${formatNumber(zone.monsters.length)}`;
    groupHead.appendChild(progressEl);

    groupEl.appendChild(groupHead);

    const cardListEl = document.createElement('div');
    cardListEl.className = 'codex-card-list';

    zone.monsters.forEach((monster, monsterIdx) => {
      cardListEl.appendChild(createCodexCard(zoneIdx, monsterIdx, monster, bestWave));
    });

    groupEl.appendChild(cardListEl);
    dungeonCodexGroupListEl.appendChild(groupEl);
  });
}

renderDungeonCodex();