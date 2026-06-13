/* =============================================
   DUNGEON.JS — 웨이브 던전 전체 로직
   ============================================= */

/* ── 타이밍 상수 ── */
const PLAYER_ATK_INTERVAL = 1000;  // ms (미사용: 플레이어 공격은 수동 전용)
const MONSTER_ATK_INTERVAL = 1000; // ms (사냥터 체감 속도보다 ~1초 빠르게)
const INTER_WAVE_HEAL = 0.35;      // 웨이브 간 35% HP 회복
const ENRAGE_TRIGGER_HP_RATIO = 0.20;

/* =============================================
   고정 몬스터 HP 설계
   ─ 플레이어 능력치와 무관하게 층(wave)으로만 결정.
   ─ 목표: 장비·업적을 풀로 챙긴 +1,000,000강이 100층 보스를 "겨우" 잡는 난이도.
     · +1,000,000강 기본 공격력 = 1,000,000 × 30 = 30,000,000/타 (1초/타)
     · 장비·업적 풀세팅(실전 약 ×8) ≈ 240,000,000/타 → 100층 180억 HP ≈ 75타(약 75초)
     · 순수 기본만으론 100층 600타라 사실상 불가 → 장비·업적 강제
   ─ 곡선: 1층 1500만 → 100층 180억, 층당 약 +6.24% 지수 상승.
     보스층(10의 배수)은 같은 위치 일반몹의 3배(난이도 벽 역할).
============================================= */
const DUNGEON_HP_FLOOR1     = 15_000_000;       // 1층 일반몹 기준 HP
const DUNGEON_HP_TARGET100  = 18_000_000_000;   // 100층 보스 목표 HP
const DUNGEON_BOSS_HP_MUL   = 3.0;             // 보스층 HP 가중
// 1층 일반 → 100층 보스가 목표가 되도록 공비 r 산출
//   FLOOR1 * r^99 * BOSS_MUL = TARGET100
const DUNGEON_HP_RATIO = Math.pow(
  DUNGEON_HP_TARGET100 / (DUNGEON_HP_FLOOR1 * DUNGEON_BOSS_HP_MUL),
  1 / 99
);

/* 층(wave) → 고정 HP. 플레이어 스탯 미사용. */
function getFixedMonsterHp(wave) {
  const w = Math.max(1, Number(wave) || 1);
  const isBoss = (w % 10 === 0);
  let hp = DUNGEON_HP_FLOOR1 * Math.pow(DUNGEON_HP_RATIO, w - 1);
  if (isBoss) hp *= DUNGEON_BOSS_HP_MUL;
  // 보기 좋게 유효숫자 정리
  if (hp >= 1e8)      hp = Math.round(hp / 1e6) * 1e6;
  else if (hp >= 1e6) hp = Math.round(hp / 1e5) * 1e5;
  else                hp = Math.round(hp / 1e4) * 1e4;
  return Math.max(1, Math.floor(hp));
}

const DUNGEON_ZONE_THEMES = [
  '임프',
  '골렘',
  '독충',
  '망령',
  '심연',
  '화염',
  '빙하',
  '번개',
  '암흑',
  '던전'
];

/* 슬롯별 피해 배수 (전 구간 공통) */
const DUNGEON_SLOT_DMG = {
  A: 1.00,
  B1: 1.15, B2: 1.08,
  C1: 1.22, C2: 1.14, C3: 1.12,
  D1: 1.35, D2: 1.28, D3: 1.30,
  ENRAGE: 1.55
};

/* =============================================
   구간별 고유 스킬 정의 (10구간 × 10슬롯 = 100스킬)
   s(확률, '상태이상키', ...) 형태로 상태이상 부여
   ─ 슬롯→층: A=1~3 / B=4~6 / C=7~9 / D·ENRAGE=10(보스)
============================================= */
function s(name, ...statusPairs) {
  const statuses = [];
  for (let i = 0; i < statusPairs.length; i += 2) {
    statuses.push({ type: statusPairs[i], chance: statusPairs[i + 1] });
  }
  return { name, statuses };
}

const DUNGEON_ZONE_SKILLS = [
  /* 1구간 · 동굴 임프 */
  {
    A:  s('할퀴기'),
    B1: s('그림자 발톱', 'bleed', 0.35),
    B2: s('어둠의 정수', 'poison', 0.35, 'heavy', 0.25),
    C1: s('독니 연타', 'poison', 0.45, 'imp_hex', 0.30),
    C2: s('부패의 손길', 'imp_hex', 0.40, 'heavy', 0.30),
    C3: s('비웃는 절규', 'shock', 0.40),
    D1: s('군주의 조롱', 'imp_hex', 0.55, 'bleed', 0.40),
    D2: s('저주의 표식', 'imp_hex', 0.50, 'heavy', 0.40),
    D3: s('어둠 분출', 'poison', 0.55, 'shock', 0.35),
    ENRAGE: s('광란의 저주', 'imp_hex', 0.70, 'bleed', 0.50, 'heavy', 0.40)
  },
  /* 2구간 · 골렘 */
  {
    A:  s('바위 주먹'),
    B1: s('강철 내려치기', 'heavy', 0.40),
    B2: s('진동 강타', 'golem_quake', 0.30),
    C1: s('흑철 연타', 'heavy', 0.45, 'bleed', 0.30),
    C2: s('대지 균열', 'golem_quake', 0.35, 'heavy', 0.35),
    C3: s('압쇄', 'heavy', 0.50),
    D1: s('군주의 분쇄', 'golem_quake', 0.45, 'heavy', 0.45),
    D2: s('지각 붕괴', 'golem_quake', 0.40, 'bleed', 0.40),
    D3: s('절대 압력', 'heavy', 0.60),
    ENRAGE: s('파멸의 일격', 'golem_quake', 0.55, 'heavy', 0.55)
  },
  /* 3구간 · 독충 */
  {
    A:  s('독침'),
    B1: s('갑각 강타', 'poison', 0.40),
    B2: s('산성 분비', 'venom_corrode', 0.35),
    C1: s('맹독 분사', 'venom_corrode', 0.40, 'heavy', 0.30),
    C2: s('부식의 턱', 'poison', 0.50, 'shock', 0.30),
    C3: s('독무 살포', 'venom_corrode', 0.35, 'heavy', 0.35),
    D1: s('여왕의 맹독', 'venom_corrode', 0.55, 'heavy', 0.40),
    D2: s('부패의 알', 'venom_corrode', 0.50, 'shock', 0.40),
    D3: s('산성 해일', 'venom_corrode', 0.50, 'heavy', 0.45),
    ENRAGE: s('맹독 폭주', 'venom_corrode', 0.75, 'shock', 0.50, 'heavy', 0.50)
  },
  /* 4구간 · 망령 */
  {
    A:  s('영혼 베기'),
    B1: s('망자의 검', 'bleed', 0.35),
    B2: s('한기의 일격', 'frost', 0.35),
    C1: s('영혼 흡수', 'wraith_drain', 0.40, 'bleed', 0.35),
    C2: s('절망의 손길', 'frost', 0.40, 'heavy', 0.30),
    C3: s('저주의 사슬', 'wraith_drain', 0.35, 'shock', 0.35),
    D1: s('군주의 흡혈', 'wraith_drain', 0.55, 'bleed', 0.45),
    D2: s('영혼 약탈', 'wraith_drain', 0.50, 'frost', 0.40),
    D3: s('죽음의 손길', 'wraith_drain', 0.50, 'heavy', 0.45),
    ENRAGE: s('영혼 포식', 'wraith_drain', 0.75, 'bleed', 0.50, 'frost', 0.45)
  },
  /* 5구간 · 심연 */
  {
    A:  s('심연의 발톱'),
    B1: s('어비스 강타', 'heavy', 0.35),
    B2: s('공허 가르기', 'bleed', 0.35),
    C1: s('침묵의 일격', 'abyss_silence', 0.30, 'heavy', 0.30),
    C2: s('심연 분출', 'shock', 0.40, 'heavy', 0.35),
    C3: s('공허 잠식', 'frost', 0.40, 'bleed', 0.30),
    D1: s('감시자의 봉인', 'abyss_silence', 0.45, 'heavy', 0.40),
    D2: s('심연의 응시', 'shock', 0.55, 'frost', 0.40),
    D3: s('무의 강타', 'abyss_silence', 0.40, 'bleed', 0.45),
    ENRAGE: s('절대 침묵', 'abyss_silence', 0.55, 'heavy', 0.50, 'shock', 0.45)
  },
  /* 6구간 · 화염 */
  {
    A:  s('불씨 던지기'),
    B1: s('화염 발톱', 'burn', 0.40),
    B2: s('작열 강타', 'inferno_brand', 0.35),
    C1: s('업화 분출', 'inferno_brand', 0.40, 'shock', 0.30),
    C2: s('용암 강타', 'burn', 0.45, 'heavy', 0.30),
    C3: s('화염 회오리', 'inferno_brand', 0.35, 'shock', 0.35),
    D1: s('왕의 업화', 'inferno_brand', 0.55, 'shock', 0.40),
    D2: s('멸화의 숨결', 'burn', 0.60, 'heavy', 0.40),
    D3: s('작열 낙인', 'inferno_brand', 0.50, 'shock', 0.45),
    ENRAGE: s('종말의 불길', 'inferno_brand', 0.75, 'shock', 0.50, 'heavy', 0.45)
  },
  /* 7구간 · 빙하 */
  {
    A:  s('얼음 파편'),
    B1: s('서리 칼날', 'frost', 0.40),
    B2: s('한파 강타', 'permafrost', 0.30),
    C1: s('빙하 내려치기', 'permafrost', 0.35, 'heavy', 0.35),
    C2: s('동결의 손아귀', 'frost', 0.45, 'shock', 0.35),
    C3: s('눈보라', 'permafrost', 0.35, 'bleed', 0.30),
    D1: s('군주의 빙결', 'permafrost', 0.45, 'heavy', 0.45),
    D2: s('절대 영도', 'permafrost', 0.50, 'shock', 0.40),
    D3: s('빙하 붕괴', 'frost', 0.55, 'bleed', 0.45),
    ENRAGE: s('영원한 빙하기', 'permafrost', 0.70, 'shock', 0.50, 'heavy', 0.50)
  },
  /* 8구간 · 번개 */
  {
    A:  s('정전기 방출'),
    B1: s('번개 베기', 'shock', 0.40),
    B2: s('뇌격 강타', 'overload', 0.30),
    C1: s('연쇄 번개', 'overload', 0.40, 'shock', 0.35),
    C2: s('감전 폭발', 'shock', 0.50, 'heavy', 0.30),
    C3: s('폭풍 소환', 'overload', 0.35, 'bleed', 0.30),
    D1: s('뇌신의 강림', 'overload', 0.50, 'shock', 0.45),
    D2: s('천벌의 번개', 'overload', 0.45, 'heavy', 0.40),
    D3: s('폭뢰', 'shock', 0.60, 'bleed', 0.40),
    ENRAGE: s('신벌의 낙뢰', 'overload', 0.70, 'shock', 0.55, 'heavy', 0.45)
  },
  /* 9구간 · 암흑 */
  {
    A:  s('그림자 일격'),
    B1: s('포식자의 송곳니', 'bleed', 0.35),
    B2: s('암흑 침식', 'heavy', 0.35),
    C1: s('공허 반사', 'void_reflect', 0.35, 'bleed', 0.30),
    C2: s('어둠 분출', 'shock', 0.45, 'heavy', 0.35),
    C3: s('절망의 장막', 'frost', 0.45, 'bleed', 0.30),
    D1: s('군주의 반전', 'void_reflect', 0.50, 'heavy', 0.45),
    D2: s('공허 붕괴', 'void_reflect', 0.45, 'shock', 0.50),
    D3: s('심연 잠식', 'frost', 0.55, 'bleed', 0.45),
    ENRAGE: s('절대 공허', 'void_reflect', 0.70, 'bleed', 0.50, 'heavy', 0.50)
  },
  /* 10구간 · 던전 군주 */
  {
    A:  s('수호자의 강타'),
    B1: s('기사의 베기', 'bleed', 0.40),
    B2: s('충성의 일격', 'heavy', 0.35),
    C1: s('비전 폭발', 'sovereign_doom', 0.35, 'shock', 0.35),
    C2: s('봉인의 사슬', 'sovereign_doom', 0.40, 'heavy', 0.35),
    C3: s('마력 과부하', 'burn', 0.45, 'shock', 0.35),
    D1: s('군주의 심판', 'sovereign_doom', 0.55, 'bleed', 0.45),
    D2: s('절대 군림', 'sovereign_doom', 0.50, 'heavy', 0.50),
    D3: s('파멸 선고', 'sovereign_doom', 0.50, 'shock', 0.50),
    ENRAGE: s('최후의 심판', 'sovereign_doom', 0.80, 'bleed', 0.55, 'heavy', 0.50)
  }
];

/* 스킬에 key/damageMul/fxClass 부착해서 최종 스킬북 생성 */
function getStatusFxClass(statuses) {
  const types = (statuses || []).map((e) => e.type);
  if (types.some((t) => ['poison', 'venom_corrode'].includes(t))) return 'd-skill-fx-poison';
  if (types.some((t) => ['burn', 'inferno_brand'].includes(t))) return 'd-skill-fx-burn';
  if (types.length > 0) return 'd-skill-fx-heavy';
  return 'd-skill-fx-basic';
}

const DUNGEON_ZONE_SKILL_BOOKS = DUNGEON_ZONE_SKILLS.map((zone) => {
  const book = {};
  Object.keys(zone).forEach((slot) => {
    const def = zone[slot];
    book[slot] = {
      key: slot,
      name: def.name,
      damageMul: DUNGEON_SLOT_DMG[slot] || 1.0,
      statuses: def.statuses || [],
      fxClass: getStatusFxClass(def.statuses)
    };
  });
  return book;
});

const DUNGEON_STATUS_DEFS = {
  /* ── 일반 상태이상 6종 ── */
  poison: { label: '중독', icon: '🟢', durationMs: 10000, dotRatio: 0.015 },
  bleed:  { label: '출혈', icon: '🩸', durationMs: 12000, dotRatio: 0.025 },
  burn:   { label: '화상', icon: '🔥', durationMs: 9000,  dotRatio: 0.020 },
  shock:  { label: '감전', icon: '⚡', durationMs: 8000,  incomingMul: 1.20 },
  frost:  { label: '빙결', icon: '❄️', durationMs: 7000,  outgoingMul: 0.65 },
  heavy:  { label: '무거움', icon: '🪨', durationMs: 9000, outgoingMul: 0.55, incomingMul: 1.10 },

  /* ── 구간 고유 상태이상 10종 ── */
  imp_hex:        { label: '임프의 저주', icon: '😈', durationMs: 9000,  incomingMul: 1.15, dotRatio: 0.010 },
  golem_quake:    { label: '지진 충격',   icon: '🌋', durationMs: 9000,  incomingMul: 1.25, blockNextAttack: true },
  venom_corrode:  { label: '맹독 부식',   icon: '☠️', durationMs: 10000, dotRatio: 0.030 },
  wraith_drain:   { label: '영혼 흡수',   icon: '👻', durationMs: 9000,  lifestealRatio: 0.25 },
  abyss_silence:  { label: '심연의 침묵', icon: '🔇', durationMs: 7000,  blockNextAttack: true },
  inferno_brand:  { label: '업화 낙인',   icon: '🔆', durationMs: 9000,  dotRatio: 0.020, incomingMul: 1.12 },
  permafrost:     { label: '영구동토',     icon: '🧊', durationMs: 8000,  outgoingMul: 0.45 },
  overload:       { label: '과부하',       icon: '🔌', durationMs: 8000,  incomingMul: 1.30 },
  void_reflect:   { label: '공허 반사',   icon: '🌀', durationMs: 8000,  reflectChance: 0.35, reflectRatio: 0.08 },
  sovereign_doom: { label: '군주의 심판', icon: '👑', durationMs: 10000, dotRatio: 0.015, outgoingMul: 0.80, incomingMul: 1.15 }
};

/* DOT(지속피해)를 가진 상태이상 키 목록 — 정산용 */
const DUNGEON_DOT_STATUS_KEYS = Object.keys(DUNGEON_STATUS_DEFS)
  .filter((k) => Number(DUNGEON_STATUS_DEFS[k].dotRatio) > 0);

/* =============================================
   구간 정의 (ZONE_DEFS)
   ─ 10층마다 1구간, 구간당 몬스터 4종
     · mob1 : 1~3층
     · mob2 : 4~6층
     · mob3 : 7~9층
     · boss : 10층 (10배수)
   ─ bg    : 구간 전체 배경 이미지 (공통)
============================================= */
const ZONE_DEFS = [
  {
    name: '동굴 임프 구간',
    bg:   'images/dungeon/bg_zone1.png',
    monsters: [
      { name: '동굴 임프',     img: 'images/dungeon/zone1_mob1.png' },
      { name: '어둠 임프',     img: 'images/dungeon/zone1_mob2.png' },
      { name: '맹독 임프',     img: 'images/dungeon/zone1_mob3.png' },
      { name: '👑 임프 군주',  img: 'images/dungeon/zone1_boss.png' },
    ]
  },
  {
    name: '골렘 구간',
    bg:   'images/dungeon/bg_zone2.png',
    monsters: [
      { name: '돌 골렘',       img: 'images/dungeon/zone2_mob1.png' },
      { name: '철 골렘',       img: 'images/dungeon/zone2_mob2.png' },
      { name: '어둠의 골렘',   img: 'images/dungeon/zone2_mob3.png' },
      { name: '👑 골렘 군주',  img: 'images/dungeon/zone2_boss.png' },
    ]
  },
  {
    name: '독충 구간',
    bg:   'images/dungeon/bg_zone3.png',
    monsters: [
      { name: '독 벌레',       img: 'images/dungeon/zone3_mob1.png' },
      { name: '갑각 독충',     img: 'images/dungeon/zone3_mob2.png' },
      { name: '거대 독충',     img: 'images/dungeon/zone3_mob3.png' },
      { name: '👑 독충 여왕',  img: 'images/dungeon/zone3_boss.png' },
    ]
  },
  {
    name: '망령 구간',
    bg:   'images/dungeon/bg_zone4.png',
    monsters: [
      { name: '망령 병사',     img: 'images/dungeon/zone4_mob1.png' },
      { name: '망령 기사',     img: 'images/dungeon/zone4_mob2.png' },
      { name: '저주받은 망령', img: 'images/dungeon/zone4_mob3.png' },
      { name: '👑 망령 군주',  img: 'images/dungeon/zone4_boss.png' },
    ]
  },
  {
    name: '심연 구간',
    bg:   'images/dungeon/bg_zone5.png',
    monsters: [
      { name: '어비스 정찰자', img: 'images/dungeon/zone5_mob1.png' },
      { name: '어비스 전사',   img: 'images/dungeon/zone5_mob2.png' },
      { name: '어비스 군주',   img: 'images/dungeon/zone5_mob3.png' },
      { name: '👑 어비스 감시자', img: 'images/dungeon/zone5_boss.png' },
    ]
  },
  {
    name: '화염 구간',
    bg:   'images/dungeon/bg_zone6.png',
    monsters: [
      { name: '화염 임프',     img: 'images/dungeon/zone6_mob1.png' },
      { name: '화염 마귀',     img: 'images/dungeon/zone6_mob2.png' },
      { name: '불꽃 군주',     img: 'images/dungeon/zone6_mob3.png' },
      { name: '👑 화염 왕',    img: 'images/dungeon/zone6_boss.png' },
    ]
  },
  {
    name: '빙하 구간',
    bg:   'images/dungeon/bg_zone7.png',
    monsters: [
      { name: '빙하 정령',     img: 'images/dungeon/zone7_mob1.png' },
      { name: '서리 기사',     img: 'images/dungeon/zone7_mob2.png' },
      { name: '얼음 거인',     img: 'images/dungeon/zone7_mob3.png' },
      { name: '👑 서리 군주',  img: 'images/dungeon/zone7_boss.png' },
    ]
  },
  {
    name: '번개 구간',
    bg:   'images/dungeon/bg_zone8.png',
    monsters: [
      { name: '번개 정령',     img: 'images/dungeon/zone8_mob1.png' },
      { name: '폭풍 기사',     img: 'images/dungeon/zone8_mob2.png' },
      { name: '번개 마법사',   img: 'images/dungeon/zone8_mob3.png' },
      { name: '👑 뇌신',       img: 'images/dungeon/zone8_boss.png' },
    ]
  },
  {
    name: '암흑 구간',
    bg:   'images/dungeon/bg_zone9.png',
    monsters: [
      { name: '심연의 그림자', img: 'images/dungeon/zone9_mob1.png' },
      { name: '어둠의 포식자', img: 'images/dungeon/zone9_mob2.png' },
      { name: '공허의 군주',   img: 'images/dungeon/zone9_mob3.png' },
      { name: '👑 암흑 군주',  img: 'images/dungeon/zone9_boss.png' },
    ]
  },
  {
    name: '던전 군주 구간',
    bg:   'images/dungeon/bg_zone10.png',
    monsters: [
      { name: '던전 수호자',   img: 'images/dungeon/zone10_mob1.png' },
      { name: '던전 기사',     img: 'images/dungeon/zone10_mob2.png' },
      { name: '던전 마법사',   img: 'images/dungeon/zone10_mob3.png' },
      { name: '👑 던전 군주',  img: 'images/dungeon/zone10_boss.png' },
    ]
  },
];

/* 전체 층수 = 구간 수 × 10 */
const DUNGEON_WAVE_COUNT = ZONE_DEFS.length * 10;

/* ── 웨이브 정보 계산 ── */
function getWaveInfo(wave) {
  const zoneIdx    = Math.floor((wave - 1) / 10);          // 0-based 구간 번호
  const posInZone  = ((wave - 1) % 10) + 1;                // 구간 내 위치 (1~10)
  const isBoss     = (posInZone === 10);
  const zone       = ZONE_DEFS[Math.min(zoneIdx, ZONE_DEFS.length - 1)];

  // mob 인덱스: 1~3층→0, 4~6층→1, 7~9층→2, 10층→3(보스)
  const monsterIdx = isBoss ? 3 : Math.min(2, Math.floor((posInZone - 1) / 3));
  const monster    = zone.monsters[monsterIdx];

  // 스탯 스케일링 (구간마다 1.5배 성장)
  const zoneMul  = Math.pow(1.5, zoneIdx);
  const posMul   = isBoss ? 8.0 : (1.0 + (posInZone - 1) * 0.28);
  const fixedHp  = getFixedMonsterHp(wave);   // 플레이어 무관 고정 HP
  const dmgRatio = Math.min(0.30, 0.03 + zoneIdx * 0.015 + (isBoss ? 0.04 : 0));
  const goldMult = Math.max(1, Math.round((5 + zoneIdx * 8) * (isBoss ? 6 : 1)));

  return { zone, monster, isBoss, fixedHp, dmgRatio, goldMult };
}

function clampZoneIndex(zoneIdx) {
  return Math.max(0, Math.min(zoneIdx, DUNGEON_ZONE_SKILL_BOOKS.length - 1));
}

function pickRandom(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx];
}

function getSkillPoolByPosInZone(posInZone, skillBook) {
  if (posInZone >= 1 && posInZone <= 3) return [skillBook.A];
  if (posInZone >= 4 && posInZone <= 6) return [skillBook.B1, skillBook.B2];
  if (posInZone >= 7 && posInZone <= 9) return [skillBook.C1, skillBook.C2, skillBook.C3];
  return [skillBook.D1, skillBook.D2, skillBook.D3];
}

function selectMonsterSkillForWave(wave, currentHp, maxHp) {
  const zoneIdx = clampZoneIndex(Math.floor((wave - 1) / 10));
  const posInZone = ((wave - 1) % 10) + 1;
  const skillBook = DUNGEON_ZONE_SKILL_BOOKS[zoneIdx];
  const pool = [...getSkillPoolByPosInZone(posInZone, skillBook)];

  if (posInZone === 10 && maxHp > 0 && currentHp / maxHp <= ENRAGE_TRIGGER_HP_RATIO) {
    pool.push(skillBook.ENRAGE);
  }

  return pickRandom(pool) || { key: 'BASIC', name: '기본 공격', damageMul: 1.0, statuses: [] };
}

/* ── 로컬 상태 ── */
let dungeonActive = false;
let currentWave = 0;
let monsterMaxHp = 0;
let monsterHp = 0;
let monsterDmg = 0;
let playerHp = 0;
let playerMaxHp = 0;
let playerDmg = 0;
let atkTimer = null;
let monsterAtkTimer = null;
let totalGoldEarned = 0;
let dungeonStatusEffects = {};
let dungeonSkillFxTimer = null;
let pendingAttackBlocks = 0;   // 공격 차단(지진 충격/심연의 침묵) 누적

const dungeonFieldEl = document.getElementById('dungeon-field');
const dungeonMonsterAreaEl = document.getElementById('d-monster-area');
const dungeonSkillFxTextEl = document.createElement('div');
dungeonSkillFxTextEl.className = 'd-skill-fx-text';
if (dungeonMonsterAreaEl) {
  dungeonMonsterAreaEl.appendChild(dungeonSkillFxTextEl);
}

/* ── 포맷 ── */
function dfmt(n) {
  return (typeof fmtNum === 'function') ? fmtNum(n) : Number(n).toLocaleString('ko-KR');
}

function resetDungeonStatusEffects() {
  dungeonStatusEffects = {};
  pendingAttackBlocks = 0;
}

function cleanupDungeonStatusEffects() {
  const now = Date.now();
  Object.keys(dungeonStatusEffects).forEach((type) => {
    const expiresAt = Number(dungeonStatusEffects[type]) || 0;
    if (expiresAt <= now) {
      delete dungeonStatusEffects[type];
    }
  });
}

function hasDungeonStatus(type) {
  cleanupDungeonStatusEffects();
  const expiresAt = Number(dungeonStatusEffects[type]) || 0;
  return expiresAt > Date.now();
}

function applyDungeonStatus(type, durationMs) {
  if (!DUNGEON_STATUS_DEFS[type]) return false;
  const safeDurationMs = Math.max(0, Math.floor(Number(durationMs) || 0));
  if (safeDurationMs <= 0) return false;

  const now = Date.now();
  const nextUntil = now + safeDurationMs;
  const currentUntil = Number(dungeonStatusEffects[type]) || 0;
  dungeonStatusEffects[type] = Math.max(currentUntil, nextUntil);
  return true;
}

/* 받는 피해 배수 — incomingMul을 가진 모든 활성 상태이상 곱연산 */
function getPlayerIncomingStatusMul() {
  let mult = 1;
  Object.keys(DUNGEON_STATUS_DEFS).forEach((type) => {
    const def = DUNGEON_STATUS_DEFS[type];
    if (Number.isFinite(def.incomingMul) && hasDungeonStatus(type)) {
      mult *= Number(def.incomingMul);
    }
  });
  return Math.max(0.01, mult);
}

/* 주는 피해 배수 — outgoingMul을 가진 모든 활성 상태이상 곱연산 */
function getPlayerOutgoingStatusMul() {
  let mult = 1;
  Object.keys(DUNGEON_STATUS_DEFS).forEach((type) => {
    const def = DUNGEON_STATUS_DEFS[type];
    if (Number.isFinite(def.outgoingMul) && hasDungeonStatus(type)) {
      mult *= Number(def.outgoingMul);
    }
  });
  return Math.max(0.01, mult);
}

/* 영혼 흡수(흡혈) — 몬스터가 가한 피해의 일부를 회복시킬 비율 */
function getMonsterLifestealRatio() {
  let ratio = 0;
  Object.keys(DUNGEON_STATUS_DEFS).forEach((type) => {
    const def = DUNGEON_STATUS_DEFS[type];
    if (Number.isFinite(def.lifestealRatio) && hasDungeonStatus(type)) {
      ratio += Number(def.lifestealRatio);
    }
  });
  return Math.max(0, ratio);
}

/* 공허 반사 — 플레이어가 공격할 때 자해 발생 여부/비율 계산 */
function rollPlayerReflectRatio() {
  let ratio = 0;
  Object.keys(DUNGEON_STATUS_DEFS).forEach((type) => {
    const def = DUNGEON_STATUS_DEFS[type];
    if (!Number.isFinite(def.reflectChance)) return;
    if (!hasDungeonStatus(type)) return;
    if (Math.random() < Number(def.reflectChance)) {
      ratio += Number(def.reflectRatio) || 0;
    }
  });
  return Math.max(0, ratio);
}

/* DOT 정산 — dotRatio를 가진 모든 활성 상태이상 합산 */
function applyDungeonDotDamage() {
  let totalDot = 0;
  const labels = [];

  DUNGEON_DOT_STATUS_KEYS.forEach((type) => {
    if (!hasDungeonStatus(type)) return;
    const def = DUNGEON_STATUS_DEFS[type];
    const dotRatio = Math.max(0, Number(def.dotRatio) || 0);
    const dotDamage = Math.max(1, Math.floor(playerMaxHp * dotRatio));
    totalDot += dotDamage;
    labels.push(`${def.icon || ''}${def.label} -${dfmt(dotDamage)}`);
  });

  if (totalDot > 0) {
    playerHp -= totalDot;
  }

  return { totalDot, labels };
}

function tryApplySkillStatuses(skill) {
  const applied = [];
  const entries = Array.isArray(skill?.statuses) ? skill.statuses : [];

  entries.forEach((entry) => {
    const type = entry.type;
    const def = DUNGEON_STATUS_DEFS[type];
    if (!def) return;

    const chance = Math.max(0, Math.min(1, Number(entry.chance) || 0));
    if (Math.random() >= chance) return;

    if (applyDungeonStatus(type, def.durationMs)) {
      applied.push(`${def.icon || ''}${def.label}`);
      // 공격 차단형 — 다음 플레이어 공격 1회 봉쇄(중첩 1회까지)
      if (def.blockNextAttack) {
        pendingAttackBlocks = Math.min(1, pendingAttackBlocks + 1);
      }
    }
  });

  return applied;
}

/* ── UI 요소 ── */
function el(id) { return document.getElementById(id); }

function getDungeonSkillFxClass(skill) {
  const key = String(skill?.key || '');
  const statuses = Array.isArray(skill?.statuses) ? skill.statuses : [];
  const statusTypes = statuses.map((entry) => entry.type);

  if (key === 'ENRAGE') return 'd-skill-fx-enrage';
  if (statusTypes.includes('poison')) return 'd-skill-fx-poison';
  if (statusTypes.includes('burn')) return 'd-skill-fx-burn';
  if (statusTypes.includes('vulnerable')) return 'd-skill-fx-heavy';
  if (statusTypes.includes('weaken')) return 'd-skill-fx-heavy';
  if ((Number(skill?.damageMul) || 1) >= 1.4) return 'd-skill-fx-heavy';
  return 'd-skill-fx-basic';
}

function clearDungeonSkillEffectVisual() {
  if (dungeonFieldEl) {
    dungeonFieldEl.classList.remove(
      'd-skill-fx-active',
      'd-skill-fx-basic',
      'd-skill-fx-heavy',
      'd-skill-fx-poison',
      'd-skill-fx-burn',
      'd-skill-fx-enrage'
    );
  }

  const monsterImg = el('d-monster-img');
  if (monsterImg) {
    monsterImg.classList.remove('d-monster-img--skill-strike');
  }

  dungeonSkillFxTextEl.classList.remove('show');
  dungeonSkillFxTextEl.textContent = '';

  if (dungeonSkillFxTimer) {
    clearTimeout(dungeonSkillFxTimer);
    dungeonSkillFxTimer = null;
  }
}

function playDungeonSkillEffect(skill) {
  if (!skill || !dungeonFieldEl) return;

  clearDungeonSkillEffectVisual();

  const visualClass = getDungeonSkillFxClass(skill);
  dungeonFieldEl.classList.add('d-skill-fx-active', visualClass);

  const monsterImg = el('d-monster-img');
  if (monsterImg) {
    monsterImg.classList.add('d-monster-img--skill-strike');
  }

  dungeonSkillFxTextEl.textContent = `⚠ ${skill.name || '특수 기술'}`;
  void dungeonSkillFxTextEl.offsetWidth;
  dungeonSkillFxTextEl.classList.add('show');

  dungeonSkillFxTimer = setTimeout(() => {
    clearDungeonSkillEffectVisual();
  }, 700);
}

function showPanel(id) {
  const isBattle = (id === 'd-battle-screen');

  // 전투 레이아웃 (몬스터 영역 + UI)
  el('d-battle-layout').style.display = isBattle ? 'flex' : 'none';

  // 비전투 패널들
  ['d-start-screen', 'd-wave-clear-screen', 'd-fail-screen', 'd-complete-screen']
    .forEach(p => { el(p).style.display = p === id ? '' : 'none'; });
}

/* ── 플레이어 HP 바 갱신 ── */
function updatePlayerHpBar() {
  const pct = playerMaxHp > 0 ? Math.max(0, playerHp / playerMaxHp) : 0;
  const fill = el('d-hp-fill');
  fill.style.width = (pct * 100).toFixed(1) + '%';

  // 색상: 빨강 → 노랑 → 초록
  if (pct > 0.5) {
    fill.style.background = 'var(--px-green)';
  } else if (pct > 0.25) {
    fill.style.background = 'var(--px-gold)';
  } else {
    fill.style.background = 'var(--px-red)';
  }

  el('d-hp-text').textContent = `${dfmt(Math.max(0, Math.ceil(playerHp)))} / ${dfmt(playerMaxHp)}`;
}

/* ── 몬스터 HP 바 갱신 ── */
function updateMonsterHpBar() {
  const pct = monsterMaxHp > 0 ? Math.max(0, monsterHp / monsterMaxHp) : 0;
  el('d-monster-hp-fill').style.width = (pct * 100).toFixed(1) + '%';
  el('d-monster-hp-text').textContent = `${dfmt(Math.max(0, Math.ceil(monsterHp)))} / ${dfmt(monsterMaxHp)}`;
}

/* ── 포션 UI 갱신 ── */
function dungeonUpdatePotionUI() {
  el('dp-small').textContent  = 'x' + (GameData.hpPotionSmall  || 0);
  el('dp-medium').textContent = 'x' + (GameData.hpPotionMedium || 0);
  el('dp-large').textContent  = 'x' + (GameData.hpPotionLarge  || 0);
}

/* ── 배지 갱신 ── */
function updateWaveBadge() {
  if (currentWave > 0) {
    const zoneIdx = Math.floor((currentWave - 1) / 10) + 1;
    el('d-wave-badge').textContent = `구간 ${zoneIdx}  |  WAVE ${currentWave} / ${DUNGEON_WAVE_COUNT}`;
  } else {
    el('d-wave-badge').textContent = `WAVE 0 / ${DUNGEON_WAVE_COUNT}`;
  }
}

/* ── 베스트 웨이브 ── */
function getBestWave() {
  return Number(localStorage.getItem('dungeonBestWave')) || 0;
}

function saveBestWave(wave) {
  const best = getBestWave();
  if (wave > best) {
    localStorage.setItem('dungeonBestWave', wave);
  }
}

/* ── 인터벌 정지 ── */
function clearTimers() {
  if (atkTimer)        { clearInterval(atkTimer);        atkTimer = null; }
  if (monsterAtkTimer) { clearInterval(monsterAtkTimer); monsterAtkTimer = null; }
}

/* ── 던전 시작 ── */
function startDungeon() {
  playerDmg    = GameData.getCurrentDamage();
  playerMaxHp  = GameData.getEffectiveMaxHp();
  playerHp     = Math.max(1, Math.min(GameData.currentHp, playerMaxHp));
  totalGoldEarned = 0;
  currentWave  = 0;
  dungeonActive = true;
  resetDungeonStatusEffects();
  clearDungeonSkillEffectVisual();

  updatePlayerHpBar();
  dungeonUpdatePotionUI();
  nextWave();
}

/* ── 다음 웨이브 ── */
function nextWave() {
  clearTimers();
  currentWave++;
  updateWaveBadge();
  resetDungeonStatusEffects();
  clearDungeonSkillEffectVisual();

  const info = getWaveInfo(currentWave);
  monsterMaxHp = info.fixedHp;                                  // 고정 HP (플레이어 스탯 무관)
  monsterHp    = monsterMaxHp;
  monsterDmg   = Math.max(1, Math.floor(playerMaxHp * info.dmgRatio));

  el('d-monster-name').textContent = `[${currentWave}층] ${info.monster.name}`;
  el('d-log').textContent = '전투 시작!';

  // 몬스터 이미지 + 배경 교체
  const monsterImg = el('d-monster-img');
  monsterImg.src = info.monster.img;
  monsterImg.classList.remove('d-monster-img--hit');
  monsterImg.classList.remove('d-monster-img--skill-strike');
  el('d-bg-img').src = info.zone.bg;

  updateMonsterHpBar();
  showPanel('d-battle-screen');

  // 플레이어 공격은 수동(공격 버튼)으로만 — 자동 공격 타이머 없음
  monsterAtkTimer = setInterval(monsterAttack, MONSTER_ATK_INTERVAL);
}

/* ── 플레이어 공격 ── */
function playerAttack() {
  if (!dungeonActive) return;

  // 공격 차단(지진 충격/심연의 침묵): 다음 공격 1회 봉쇄
  if (pendingAttackBlocks > 0) {
    pendingAttackBlocks--;
    el('d-log').textContent = '🚫 공격 봉쇄! (상태이상)';
    return;
  }

  const outgoingMul = getPlayerOutgoingStatusMul();
  const finalPlayerDamage = Math.max(1, Math.floor(playerDmg * outgoingMul));
  monsterHp -= finalPlayerDamage;
  const slowed = outgoingMul < 1;
  el('d-log').textContent = slowed
    ? `⚔ ${dfmt(finalPlayerDamage)} 피해! (약화)`
    : `⚔ ${dfmt(finalPlayerDamage)} 피해!`;
  updateMonsterHpBar();

  // 몬스터 피격 모션
  const img = el('d-monster-img');
  img.classList.remove('d-monster-img--hit');
  void img.offsetWidth; // reflow
  img.classList.add('d-monster-img--hit');

  // 공허 반사 — 가한 피해의 일부를 플레이어가 자해
  const reflectRatio = rollPlayerReflectRatio();
  if (reflectRatio > 0) {
    const selfDmg = Math.max(1, Math.floor(finalPlayerDamage * reflectRatio));
    playerHp -= selfDmg;
    updatePlayerHpBar();
    el('d-log').textContent += ` | 🌀반사 -${dfmt(selfDmg)}`;
    if (playerHp <= 0) {
      playerHp = 0;
      updatePlayerHpBar();
      dungeonFail();
      return;
    }
  }

  if (monsterHp <= 0) {
    monsterHp = 0;
    waveCleared();
  }
}

/* ── 몬스터 공격 ── */
function monsterAttack() {
  if (!dungeonActive) return;

  const skill = selectMonsterSkillForWave(currentWave, monsterHp, monsterMaxHp);
  playDungeonSkillEffect(skill);
  const dotResult = applyDungeonDotDamage();
  if (playerHp <= 0) {
    playerHp = 0;
    updatePlayerHpBar();
    dungeonFail();
    return;
  }

  const incomingMul = getPlayerIncomingStatusMul();
  const finalMonsterDamage = Math.max(
    1,
    Math.floor(monsterDmg * (Number(skill.damageMul) || 1) * incomingMul)
  );
  playerHp -= finalMonsterDamage;
  const appliedStatuses = tryApplySkillStatuses(skill);

  // 영혼 흡수(흡혈) — 몬스터가 가한 피해의 일부를 회복
  let healedAmt = 0;
  const lifesteal = getMonsterLifestealRatio();
  if (lifesteal > 0 && monsterHp > 0) {
    healedAmt = Math.floor(finalMonsterDamage * lifesteal);
    if (healedAmt > 0) {
      monsterHp = Math.min(monsterMaxHp, monsterHp + healedAmt);
      updateMonsterHpBar();
    }
  }

  const logs = [`💥 ${skill.name} -${dfmt(finalMonsterDamage)} HP`];
  if (dotResult.labels.length > 0) {
    logs.push(`지속피해: ${dotResult.labels.join(', ')}`);
  }
  if (healedAmt > 0) {
    logs.push(`👻몬스터 회복 +${dfmt(healedAmt)}`);
  }
  if (appliedStatuses.length > 0) {
    logs.push(`상태이상: ${appliedStatuses.join(', ')}`);
  }
  el('d-log').textContent = logs.join(' | ');
  updatePlayerHpBar();

  if (playerHp <= 0) {
    playerHp = 0;
    updatePlayerHpBar();
    dungeonFail();
  }
}

/* ── 웨이브 클리어 ── */
function waveCleared() {
  clearTimers();
  dungeonActive = false;
  clearDungeonSkillEffectVisual();

  // 골드 지급
  const goldBase = GameData.level * getWaveInfo(currentWave).goldMult;
  const earned = GameData.earnGold(goldBase);
  totalGoldEarned += earned;
  GameData.save();

  // 퀘스트 훅
  if (window.DailyQuest) DailyQuest.trackDungeonWave(currentWave);

  // 베스트 저장
  saveBestWave(currentWave);

  if (currentWave >= DUNGEON_WAVE_COUNT) {
    // 완전 클리어
    syncHpToGameData();
    dungeonComplete();
    return;
  }

  // 웨이브 간 HP 회복
  const healAmt = Math.floor(playerMaxHp * INTER_WAVE_HEAL);
  playerHp = Math.min(playerMaxHp, playerHp + healAmt);
  updatePlayerHpBar();

  // 클리어 화면
  el('d-clear-title').textContent = `${currentWave}층 클리어!`;
  el('d-clear-reward').textContent = `💰 +${dfmt(earned)} 골드 획득`;
  el('d-heal-info').textContent = `❤ HP +${dfmt(healAmt)} 회복`;
  showPanel('d-wave-clear-screen');
}

/* ── 다음 웨이브 버튼 ── */
function goNextWave() {
  dungeonActive = true;
  nextWave();
}

/* ── 던전 실패 ── */
function dungeonFail() {
  clearTimers();
  dungeonActive = false;
  clearDungeonSkillEffectVisual();
  syncHpToGameData();

  el('d-fail-info').innerHTML =
    `${currentWave - 1}층까지 클리어<br>💰 총 ${dfmt(totalGoldEarned)} 골드 획득`;
  showPanel('d-fail-screen');
}

/* ── 완전 클리어 ── */
function dungeonComplete() {
  clearDungeonSkillEffectVisual();
  el('d-complete-info').innerHTML =
    `모든 ${DUNGEON_WAVE_COUNT}층 정복!<br>💰 총 ${dfmt(totalGoldEarned)} 골드 획득`;
  showPanel('d-complete-screen');
}

/* ── HP 동기화 ── */
function syncHpToGameData() {
  GameData.currentHp = Math.max(0, Math.ceil(playerHp));
  GameData.save();
}

/* ── 포션 사용 ── */
function dungeonUsePotion(size) {
  if (!dungeonActive) return;

  let healAmt = 0;
  if (size === 'small') {
    if (!GameData.hpPotionSmall) return;
    GameData.hpPotionSmall--;
    healAmt = Math.floor(playerMaxHp * 0.25);
  } else if (size === 'medium') {
    if (!GameData.hpPotionMedium) return;
    GameData.hpPotionMedium--;
    healAmt = Math.floor(playerMaxHp * 0.50);
  } else if (size === 'large') {
    if (!GameData.hpPotionLarge) return;
    GameData.hpPotionLarge--;
    healAmt = playerMaxHp; // 풀충
  }

  playerHp = Math.min(playerMaxHp, playerHp + healAmt);
  updatePlayerHpBar();
  GameData.save();
  dungeonUpdatePotionUI();

  el('d-log').textContent = `🧪 HP +${dfmt(healAmt)} 회복!`;
}

/* ── 이벤트 바인딩 ── */
document.getElementById('d-start-btn').addEventListener('click', startDungeon);

document.getElementById('d-manual-attack').addEventListener('click', function () {
  if (!dungeonActive) return;
  playerAttack();
});

document.getElementById('d-next-wave-btn').addEventListener('click', goNextWave);

document.getElementById('d-retry-btn').addEventListener('click', function () {
  showPanel('d-start-screen');
  dungeonActive = false;
  currentWave = 0;
  updateWaveBadge();
  updateBestWaveDisplay();
});

document.getElementById('d-done-btn').addEventListener('click', function () {
  showPanel('d-start-screen');
  dungeonActive = false;
  currentWave = 0;
  updateWaveBadge();
  updateBestWaveDisplay();
});

/* ── 베스트 표시 ── */
function updateBestWaveDisplay() {
  const best = getBestWave();
  el('d-best-wave').textContent = best > 0 ? `최고 기록: ${best}층` : '';
}

/* ── 초기화 ── */
dungeonUpdatePotionUI();
updateBestWaveDisplay();