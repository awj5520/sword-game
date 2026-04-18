const codexSummaryEl = document.getElementById('codex-summary');
const codexGroupListEl = document.getElementById('codex-group-list');

const CODEX_REVEAL_KILL_REQUIREMENT = 10;

const CODEX_GROUPS = [
  {
    title: '1세계 - 초원',
    world: 1,
    area: 'grass',
    monsters: [
      { id: 'slime', name: '슬라임', image: 'slime_grass_1.png', stage: 1, boss: false },
      { id: 'slime_helmet', name: '투구 슬라임', image: 'slime_grass_2.png', stage: 2, boss: false },
      { id: 'slime_warrior', name: '전사 슬라임', image: 'slime_grass_3.png', stage: 3, boss: false },
      { id: 'slime_rage', name: '광폭화 슬라임', image: 'slime_grass_4.png', stage: 4, boss: false },
      { id: 'slime_king', name: '슬라임 왕', image: 'slime_grass_5.png', stage: 5, boss: true }
    ]
  },
  {
    title: '1세계 - 오크 부락',
    world: 1,
    area: 'orc',
    monsters: [
      { id: 'orc_1', name: '풋내기 오크', image: 'orc_1.png', stage: 1, boss: false },
      { id: 'orc_2', name: '전사 오크', image: 'orc_2.png', stage: 2, boss: false },
      { id: 'orc_3', name: '광전사 오크', image: 'orc_3.png', stage: 3, boss: false },
      { id: 'orc_4', name: '주술사 오크', image: 'orc_4.png', stage: 4, boss: false },
      { id: 'orc_king', name: '오크 족장', image: 'orc_5.png', stage: 5, boss: true }
    ]
  },
  {
    title: '1세계 - 드래곤 협곡',
    world: 1,
    area: 'dragon',
    monsters: [
      { id: 'dragon_1', name: '새끼 드레이크', image: 'dragon_1.png', stage: 1, boss: false },
      { id: 'dragon_2', name: '불꽃 드레이크', image: 'dragon_2.png', stage: 2, boss: false },
      { id: 'dragon_3', name: '비늘 와이번', image: 'dragon_3.png', stage: 3, boss: false },
      { id: 'dragon_4', name: '다크 드래곤', image: 'dragon_4.png', stage: 4, boss: false },
      { id: 'dragon_king', name: '골드 드래곤', image: 'dragon_5.png', stage: 5, boss: true }
    ]
  },
  {
    title: '1세계 - 우주',
    world: 1,
    area: 'space',
    monsters: [
      { id: 'space_slime', name: '갤럭시 슬라임', image: 'galaxy_slime.png', stage: 1, boss: false },
      { id: 'space_orc', name: '갤럭시 오크', image: 'galaxy_orc.png', stage: 2, boss: false },
      { id: 'space_dragon', name: '갤럭시 드래곤', image: 'galaxy_dragon.png', stage: 3, boss: true }
    ]
  },
  {
    title: '2세계 - 동굴',
    world: 2,
    area: 'cave',
    monsters: [
      { id: 'bat_1', name: '동굴 박쥐', image: 'bat_1.png', stage: 1, boss: false },
      { id: 'bat_2', name: '어둠 박쥐', image: 'bat_2.png', stage: 2, boss: false },
      { id: 'bat_3', name: '흡혈 박쥐', image: 'bat_3.png', stage: 3, boss: false },
      { id: 'bat_4', name: '광폭 박쥐', image: 'bat_4.png', stage: 4, boss: false },
      { id: 'bat_king', name: '박쥐 군주', image: 'bat_boss.png', stage: 5, boss: true }
    ]
  },
  {
    title: '2세계 - 무덤',
    world: 2,
    area: 'grave',
    monsters: [
      { id: 'skeleton_1', name: '해골 병사', image: 'skeleton_1.png', stage: 1, boss: false },
      { id: 'skeleton_2', name: '해골 궁수', image: 'skeleton_2.png', stage: 2, boss: false },
      { id: 'skeleton_3', name: '해골 기사', image: 'skeleton_3.png', stage: 3, boss: false },
      { id: 'skeleton_4', name: '저주받은 해골', image: 'skeleton_4.png', stage: 4, boss: false },
      { id: 'skeleton_king', name: '해골 군주', image: 'skeleton_boss.png', stage: 5, boss: true }
    ]
  },
  {
    title: '2세계 - 악마 성',
    world: 2,
    area: 'demon',
    monsters: [
      { id: 'demon_1', name: '악마 하수인', image: 'demon_1.png', stage: 1, boss: false },
      { id: 'demon_2', name: '악마 기사', image: 'demon_2.png', stage: 2, boss: false },
      { id: 'demon_3', name: '지옥 마법사', image: 'demon_3.png', stage: 3, boss: false },
      { id: 'demon_4', name: '타락한 군주', image: 'demon_4.png', stage: 4, boss: false },
      { id: 'demon_king', name: '마왕', image: 'demon_boss.png', stage: 5, boss: true }
    ]
  },
  {
    title: '2세계 - 마계',
    world: 2,
    area: 'hell',
    monsters: [
      { id: 'sin_greed', name: '탐욕의 망령', image: 'sin_greed.png', stage: 1, boss: false },
      { id: 'sin_envy', name: '질투의 망령', image: 'sin_envy.png', stage: 2, boss: false },
      { id: 'sin_god', name: '분노의 신', image: 'sin_god.png', stage: 3, boss: true }
    ]
  },
  {
    title: '3세계 - 아틀란티스',
    world: 3,
    area: 'atlantis',
    monsters: [
      { id: 'w3_atlantis_1', name: '산호 슬라임', image: 'w3_atlantis_1.png', stage: 1, boss: false },
      { id: 'w3_atlantis_2', name: '심해 해마 기사', image: 'w3_atlantis_2.png', stage: 2, boss: false },
      { id: 'w3_atlantis_3', name: '잠수꾼 망령', image: 'w3_atlantis_3.png', stage: 3, boss: false },
      { id: 'w3_atlantis_4', name: '크라켄', image: 'w3_atlantis_4.png', stage: 4, boss: false },
      { id: 'w3_poseidon', name: '포세이돈', image: 'w3_atlantis_5_poseidon.png', stage: 5, boss: true }
    ]
  },
  {
    title: '3세계 - 언더월드',
    world: 3,
    area: 'underworld',
    monsters: [
      { id: 'w3_underworld_1', name: '길잃은 영혼', image: 'w3_underworld_1.png', stage: 1, boss: false },
      { id: 'w3_underworld_2', name: '지옥 사냥개', image: 'w3_underworld_2.png', stage: 2, boss: false },
      { id: 'w3_underworld_3', name: '사신의 그림자', image: 'w3_underworld_3.png', stage: 3, boss: false },
      { id: 'w3_underworld_4', name: '스틱스 망령', image: 'w3_underworld_4.png', stage: 4, boss: false },
      { id: 'w3_hades', name: '하데스', image: 'w3_underworld_5_hades.png', stage: 5, boss: true }
    ]
  },
  {
    title: '3세계 - 천둥',
    world: 3,
    area: 'thunder',
    monsters: [
      { id: 'w3_thunder_1', name: '구름 정령', image: 'w3_thunder_1.png', stage: 1, boss: false },
      { id: 'w3_thunder_2', name: '번개 박쥐', image: 'w3_thunder_2.png', stage: 2, boss: false },
      { id: 'w3_thunder_3', name: '스톰 나이트', image: 'w3_thunder_3.png', stage: 3, boss: false },
      { id: 'w3_thunder_4', name: '천둥 골렘', image: 'w3_thunder_4.png', stage: 4, boss: false },
      { id: 'w3_zeus', name: '제우스', image: 'w3_thunder_5_zeus.png', stage: 5, boss: true }
    ]
  },
  {
    title: '3세계 - 신계',
    world: 3,
    area: 'divine',
    monsters: [
      { id: 'w3_cronos', name: '크로노스', image: 'w3_divine_1_cronos.png', stage: 1, boss: true },
      { id: 'w3_gaia', name: '가이아', image: 'w3_divine_2_gaia.png', stage: 2, boss: true },
      { id: 'w3_chaos', name: '카오스', image: 'w3_divine_3_chaos.png', stage: 3, boss: true }
    ]
  },
  {
    title: '3세계 - 운명의 균열',
    world: 3,
    area: 'rift',
    monsters: [
      { id: 'rift_1', name: '확률의 도사', image: 'rift_1.png', stage: 1, boss: false },
      { id: 'rift_2', name: '양면의 문지기', image: 'rift_2.png', stage: 2, boss: false },
      { id: 'rift_3', name: '균형의 심판관', image: 'rift_3.png', stage: 3, boss: false },
      { id: 'rift_4', name: '심연의 분열체', image: 'rift_4.png', stage: 4, boss: true }
    ]
  }
];

const STATUS_EFFECT_LABELS = {
  poison: '중독',
  bleed: '출혈',
  burn: '화상',
  shock: '감전',
  frost: '빙결',
  heavy: '무거움',
  timeStop: '시간 정지',
  chaos: '혼돈',
  boss_slime_bind: '점액 구속',
  boss_orc_fear: '전장의 공포',
  boss_dragon_rend: '용린 파열',
  boss_space_collapse: '중력 붕괴',
  boss_bat_curse: '흡혈 저주',
  boss_skeleton_fracture: '골절',
  boss_demon_brand: '지옥 낙인',
  boss_hell_seal: '신벌 봉인',
  boss_poseidon_pressure: '심해 수압',
  boss_hades_shackle: '망자의 굴레',
  boss_zeus_overload: '과전류',
  boss_chronos_stop: '절대 정지',
  boss_gaia_collapse: '원소 붕괴',
  boss_chaos_entropy: '혼돈 왜곡',
  boss_rift_inverse: '확률 역전'
};

const AREA_STATUS_EFFECT_PROFILE = {
  grass: [{ type: 'poison', chance: 0.05 }],
  orc: [{ type: 'bleed', chance: 0.06 }, { type: 'heavy', chance: 0.05 }],
  dragon: [{ type: 'burn', chance: 0.07 }],
  space: [{ type: 'shock', chance: 0.08 }, { type: 'burn', chance: 0.06 }],
  cave: [{ type: 'bleed', chance: 0.08 }, { type: 'heavy', chance: 0.06 }],
  grave: [{ type: 'poison', chance: 0.10 }, { type: 'bleed', chance: 0.08 }],
  demon: [{ type: 'burn', chance: 0.11 }, { type: 'shock', chance: 0.08 }, { type: 'heavy', chance: 0.07 }],
  hell: [{ type: 'burn', chance: 0.14 }, { type: 'bleed', chance: 0.10 }],
  atlantis: [{ type: 'poison', chance: 0.12 }, { type: 'frost', chance: 0.07 }],
  underworld: [{ type: 'bleed', chance: 0.14 }, { type: 'shock', chance: 0.09 }, { type: 'heavy', chance: 0.09 }],
  thunder: [{ type: 'shock', chance: 0.16 }, { type: 'burn', chance: 0.08 }, { type: 'heavy', chance: 0.05 }],
  divine: [{ type: 'frost', chance: 0.14 }, { type: 'burn', chance: 0.12 }],
  rift: [{ type: 'poison', chance: 0.10 }, { type: 'bleed', chance: 0.10 }, { type: 'shock', chance: 0.08 }, { type: 'heavy', chance: 0.08 }]
};

const NORMAL_PATTERN_TARGET_AREAS = [
  'grass',
  'orc',
  'dragon',
  'space',
  'cave',
  'grave',
  'demon',
  'hell',
  'atlantis',
  'underworld',
  'thunder',
  'rift'
];

const AREA_WORLD_MAP = {
  grass: 1,
  orc: 1,
  dragon: 1,
  space: 1,
  cave: 2,
  grave: 2,
  demon: 2,
  hell: 2,
  atlantis: 3,
  underworld: 3,
  thunder: 3,
  rift: 3
};

const AREA_NORMAL_PATTERN_MAX_STAGE = {
  space: 2,
  hell: 2,
  rift: 3
};

const AREA_FORCE_PATTERN_COUNT = {
  space: 3,
  hell: 3,
  rift: 3
};

const NORMAL_PATTERN_STAGE_NAME_MAP = {
  grass: {
    1: ['초원 잎날 찌르기'],
    2: ['이끼 덩굴 감기'],
    3: ['비옥 토양 폭발', '수액 침식 탄환'],
    4: ['자연의 난타', '뿌리 대압착']
  },
  orc: {
    1: ['풋내기 도끼 흠집'],
    2: ['전사의 어깨치기'],
    3: ['광전 참격', '전장의 내려찍기'],
    4: ['붉은 포효 난사', '부족장 전진 강타']
  },
  dragon: {
    1: ['새끼 용 송곳니'],
    2: ['불꽃 비늘 절단'],
    3: ['화염 발톱 폭주', '용린 파편 사격'],
    4: ['다크 브레스 분출', '하늘 꼬리 후려치기']
  },
  space: {
    1: ['성운 잔광 사격', '궤도 파편 산개', '성계 반동 충격'],
    2: ['은하 반전 충돌', '플라즈마 축퇴 포격', '별무리 왜곡 낙하']
  },
  cave: {
    1: ['동굴 박쥐 급습'],
    2: ['어둠 막타 물기'],
    3: ['흡혈 선회 베기', '초음파 균열'],
    4: ['광폭 날개 난타', '암야 낙하 돌진']
  },
  grave: {
    1: ['해골 단검 긁기'],
    2: ['저주 화살 침투'],
    3: ['기사의 뼈창 돌격', '망자의 균열'],
    4: ['사령 분쇄 낫질', '관문 강제 개방']
  },
  demon: {
    1: ['하수인 화염 손톱'],
    2: ['악마 검막 찌르기'],
    3: ['마법진 붕괴 광선', '지옥 불씨 난무'],
    4: ['타락 군주의 강림 베기', '심연 파멸 충격']
  },
  hell: {
    1: ['탐욕 망령 흡수', '공허 갈증 분출', '영혼 파편 폭식'],
    2: ['질투 망령 왜곡', '질식의 그림자 찢기', '불신의 낙하 심판']
  },
  atlantis: {
    1: ['산호 창날 찌르기'],
    2: ['해마 창격 돌파'],
    3: ['잠수꾼 유영 절단', '심해 압력 충돌'],
    4: ['크라켄 촉수 난타', '대해수 굴절 파동']
  },
  underworld: {
    1: ['영혼의 한기 손톱'],
    2: ['지옥견 송곳니 폭발'],
    3: ['사신 그림자 절개', '명계 기류 전단'],
    4: ['스틱스 침잠 압박', '망령 사슬 수축']
  },
  thunder: {
    1: ['구름 파편 타격'],
    2: ['번개 박쥐 전류 물기'],
    3: ['폭풍 기사 전기베기', '낙뢰 분산 사출'],
    4: ['천둥 골렘 대지 방전', '청뢰 중력 강타']
  },
  rift: {
    1: ['확률 붕괴 사격', '주사위 파열탄', '변칙 궤도 낙하'],
    2: ['양면 절단 반전', '거울 경로 충돌', '뒤집힌 인과 강타'],
    3: ['균형 축 붕괴', '판결 편향 탄환', '저울 역류 압쇄']
  }
};

function buildNormalPatternTable() {
  const table = {};
  const clampLocal = (value) => Math.max(0, Math.min(1, Number(value) || 0));
  const fallbackStatuses = ['heavy', 'bleed', 'burn', 'shock', 'poison', 'frost'];

  NORMAL_PATTERN_TARGET_AREAS.forEach((targetArea) => {
    const worldNo = Number(AREA_WORLD_MAP[targetArea] || 1);
    const profile = AREA_STATUS_EFFECT_PROFILE[targetArea] || [];
    const stageNameMap = NORMAL_PATTERN_STAGE_NAME_MAP[targetArea] || {};
    const areaIndex = Math.max(0, NORMAL_PATTERN_TARGET_AREAS.indexOf(targetArea));

    const getStatus = (offset) => {
      if (profile.length > 0) {
        return profile[offset % profile.length]?.type || profile[0].type;
      }
      return fallbackStatuses[(areaIndex + offset) % fallbackStatuses.length];
    };

    const maxNormalStage = Number(AREA_NORMAL_PATTERN_MAX_STAGE[targetArea] || 4);
    for (let stageNo = 1; stageNo <= maxNormalStage; stageNo += 1) {
      const stageKey = `${worldNo}:${targetArea}:${stageNo}`;
      const forcedPatternCount = Number(AREA_FORCE_PATTERN_COUNT[targetArea] || 0);
      const patternCount = forcedPatternCount > 0 ? forcedPatternCount : (stageNo <= 2 ? 1 : 2);
      const stageNames = stageNameMap[stageNo] || [];
      const patterns = [];

      if (patternCount === 1) {
        const name = stageNames[0] || `${targetArea} 단일 기술 ${stageNo}`;
        const primary = getStatus(stageNo - 1);
        patterns.push({
          name,
          weight: 100,
          effects: [{ type: primary, chance: clampLocal(0.45 + stageNo * 0.09 + areaIndex * 0.01) }]
        });
      } else if (patternCount === 2) {
        const firstName = stageNames[0] || `${targetArea} 기술 A ${stageNo}`;
        const secondName = stageNames[1] || `${targetArea} 기술 B ${stageNo}`;
        const primary = getStatus(stageNo - 1);
        const secondary = getStatus(stageNo);
        const tertiary = getStatus(stageNo + 1);

        patterns.push({
          name: firstName,
          weight: 54 - Math.min(6, areaIndex),
          effects: [
            { type: primary, chance: clampLocal(0.58 + stageNo * 0.05) },
            ...(secondary !== primary
              ? [{ type: secondary, chance: clampLocal(0.34 + stageNo * 0.04 + areaIndex * 0.005) }]
              : [])
          ]
        });

        patterns.push({
          name: secondName,
          weight: 46 + Math.min(6, areaIndex),
          effects: [
            { type: tertiary, chance: clampLocal(0.63 + stageNo * 0.045) },
            ...(stageNo >= 4 && tertiary !== 'heavy' ? [{ type: 'heavy', chance: 0.42 }] : [])
          ]
        });
      } else {
        const firstName = stageNames[0] || `${targetArea} 기술 A ${stageNo}`;
        const secondName = stageNames[1] || `${targetArea} 기술 B ${stageNo}`;
        const thirdName = stageNames[2] || `${targetArea} 기술 C ${stageNo}`;
        const primary = getStatus(stageNo - 1);
        const secondary = getStatus(stageNo);
        const tertiary = getStatus(stageNo + 1);
        const quaternary = getStatus(stageNo + 2);

        patterns.push({
          name: firstName,
          weight: 36,
          effects: [
            { type: primary, chance: clampLocal(0.56 + stageNo * 0.05) },
            ...(secondary !== primary
              ? [{ type: secondary, chance: clampLocal(0.32 + stageNo * 0.04) }]
              : [])
          ]
        });

        patterns.push({
          name: secondName,
          weight: 33,
          effects: [
            { type: tertiary, chance: clampLocal(0.62 + stageNo * 0.04) },
            ...(quaternary !== tertiary
              ? [{ type: quaternary, chance: clampLocal(0.28 + stageNo * 0.04) }]
              : [])
          ]
        });

        patterns.push({
          name: thirdName,
          weight: 31,
          effects: [
            { type: quaternary, chance: clampLocal(0.66 + stageNo * 0.03) },
            ...(quaternary !== 'heavy' ? [{ type: 'heavy', chance: 0.4 }] : []),
            ...(secondary !== quaternary ? [{ type: secondary, chance: 0.26 }] : [])
          ]
        });
      }

      table[stageKey] = patterns;
    }
  });

  return table;
}

const NORMAL_PATTERN_TABLE = buildNormalPatternTable();

const BOSS_PATTERN_TABLE = {
  '1:grass:5': [
    { name: '점액 강타', weight: 40, damageMul: 1.35, effects: [{ type: 'heavy', chance: 0.6 }] },
    { name: '산성 분출', weight: 35, damageMul: 0.95, effects: [{ type: 'poison', chance: 1 }] },
    { name: '왕의 압착', weight: 25, damageMul: 1.75, effects: [{ type: 'bleed', chance: 1 }, { type: 'heavy', chance: 1 }] }
  ],
  '1:orc:5': [
    { name: '족장 내려찍기', weight: 36, damageMul: 1.4, effects: [{ type: 'heavy', chance: 1 }] },
    { name: '전장의 절개', weight: 34, damageMul: 1.1, effects: [{ type: 'bleed', chance: 1 }, { type: 'heavy', chance: 0.6 }] },
    { name: '포효 진동파', weight: 30, damageMul: 1.2, effects: [{ type: 'shock', chance: 0.7 }] }
  ],
  '1:dragon:5': [
    { name: '용의 발톱', weight: 34, damageMul: 1.45, effects: [{ type: 'heavy', chance: 0.7 }] },
    { name: '화염 숨결', weight: 36, damageMul: 1.15, effects: [{ type: 'burn', chance: 1 }] },
    { name: '분쇄 꼬리치기', weight: 30, damageMul: 1.8, effects: [{ type: 'bleed', chance: 0.8 }, { type: 'heavy', chance: 1 }] }
  ],
  '1:space:3': [
    { name: '중력 파동', weight: 33, damageMul: 1.5, effects: [{ type: 'frost', chance: 0.6 }] },
    { name: '플라즈마 과충전', weight: 34, damageMul: 1.2, effects: [{ type: 'shock', chance: 1 }] },
    { name: '항성 폭발', weight: 33, damageMul: 1.9, effects: [{ type: 'burn', chance: 1 }] }
  ],
  '2:cave:5': [
    { name: '흡혈 급습', weight: 34, damageMul: 1.35, effects: [{ type: 'bleed', chance: 0.8 }, { type: 'heavy', chance: 0.5 }] },
    { name: '암흑 박쥐 떼', weight: 36, damageMul: 1.1, effects: [{ type: 'poison', chance: 1 }] },
    { name: '밤의 절단', weight: 30, damageMul: 1.75, effects: [{ type: 'bleed', chance: 1 }, { type: 'heavy', chance: 0.8 }] }
  ],
  '2:grave:5': [
    { name: '저주의 손아귀', weight: 34, damageMul: 1.3, effects: [{ type: 'frost', chance: 0.8 }, { type: 'heavy', chance: 0.8 }] },
    { name: '부패의 숨결', weight: 34, damageMul: 1.1, effects: [{ type: 'poison', chance: 1 }] },
    { name: '뼈의 폭풍', weight: 32, damageMul: 1.85, effects: [{ type: 'bleed', chance: 1 }, { type: 'heavy', chance: 1 }] }
  ],
  '2:demon:5': [
    { name: '지옥 난타', weight: 32, damageMul: 1.45, effects: [{ type: 'burn', chance: 0.7 }, { type: 'heavy', chance: 0.8 }] },
    { name: '마력 방전', weight: 34, damageMul: 1.2, effects: [{ type: 'shock', chance: 1 }] },
    { name: '멸망의 불길', weight: 34, damageMul: 1.95, effects: [{ type: 'burn', chance: 1 }, { type: 'heavy', chance: 0.9 }] }
  ],
  '2:hell:3': [
    { name: '분노의 징벌', weight: 30, damageMul: 1.55, effects: [{ type: 'bleed', chance: 0.8 }] },
    { name: '죄악의 화염', weight: 35, damageMul: 1.25, effects: [{ type: 'burn', chance: 1 }] },
    { name: '신벌의 낙뢰', weight: 35, damageMul: 2.1, effects: [{ type: 'shock', chance: 1 }] }
  ],
  '3:atlantis:5': [
    { name: '해왕의 창격', weight: 32, damageMul: 1.55, effects: [{ type: 'bleed', chance: 0.8 }, { type: 'heavy', chance: 0.7 }] },
    { name: '심해 독수', weight: 33, damageMul: 1.2, effects: [{ type: 'poison', chance: 1 }] },
    { name: '파멸의 해일', weight: 35, damageMul: 2.0, effects: [{ type: 'frost', chance: 1 }, { type: 'heavy', chance: 1 }] }
  ],
  '3:underworld:5': [
    { name: '명계 베기', weight: 33, damageMul: 1.6, effects: [{ type: 'bleed', chance: 1 }, { type: 'heavy', chance: 0.7 }] },
    { name: '망령 침식', weight: 34, damageMul: 1.2, effects: [{ type: 'poison', chance: 1 }] },
    { name: '죽음의 속박', weight: 33, damageMul: 2.05, effects: [{ type: 'shock', chance: 1 }, { type: 'heavy', chance: 1 }] }
  ],
  '3:thunder:5': [
    { name: '천둥 강타', weight: 33, damageMul: 1.6, effects: [{ type: 'shock', chance: 1 }, { type: 'heavy', chance: 0.65 }] },
    { name: '번개 사슬', weight: 34, damageMul: 1.25, effects: [{ type: 'shock', chance: 1 }, { type: 'burn', chance: 0.6 }] },
    { name: '신의 심판', weight: 33, damageMul: 2.15, effects: [{ type: 'burn', chance: 1 }, { type: 'heavy', chance: 1 }] }
  ],
  '3:divine:1': [
    { name: '시간의 낫', weight: 30, damageMul: 1.6, effects: [] },
    { name: '연대기 붕괴', weight: 35, damageMul: 1.25, effects: [{ type: 'timeStop', chance: 1 }] },
    { name: '시간 정지', weight: 35, damageMul: 1.9, effects: [{ type: 'timeStop', chance: 1 }] }
  ],
  '3:divine:2': [
    { name: '대지의 심판', weight: 34, damageMul: 1.45, effects: [{ type: 'burn', chance: 1 }, { type: 'shock', chance: 1 }, { type: 'frost', chance: 1 }] },
    { name: '원소 융해', weight: 33, damageMul: 1.3, effects: [{ type: 'burn', chance: 1 }, { type: 'shock', chance: 1 }, { type: 'frost', chance: 1 }] },
    { name: '생명의 역류', weight: 33, damageMul: 1.85, effects: [{ type: 'burn', chance: 1 }, { type: 'shock', chance: 1 }, { type: 'frost', chance: 1 }] }
  ],
  '3:divine:3': [
    { name: '혼돈 파동', weight: 34, damageMul: 1.5, effects: [{ type: 'chaos', chance: 1 }] },
    { name: '무질서의 장막', weight: 33, damageMul: 1.25, effects: [{ type: 'chaos', chance: 1 }] },
    { name: '카오스 붕괴', weight: 33, damageMul: 2.2, effects: [{ type: 'chaos', chance: 1 }] }
  ],
  '3:rift:4': [
    { name: '확률 붕괴', weight: 33, damageMul: 1.6, effects: [{ type: 'poison', chance: 1 }, { type: 'heavy', chance: 0.8 }] },
    { name: '운명 절단', weight: 33, damageMul: 1.45, effects: [{ type: 'bleed', chance: 1 }, { type: 'heavy', chance: 0.7 }] },
    { name: '카오스 붕괴', weight: 34, damageMul: 2.2, effects: [{ type: 'shock', chance: 1 }, { type: 'burn', chance: 1 }, { type: 'heavy', chance: 1 }] }
  ]
};

const BOSS_UNIQUE_STATUS_BY_STAGE = {
  '1:grass:5': 'boss_slime_bind',
  '1:orc:5': 'boss_orc_fear',
  '1:dragon:5': 'boss_dragon_rend',
  '1:space:3': 'boss_space_collapse',
  '2:cave:5': 'boss_bat_curse',
  '2:grave:5': 'boss_skeleton_fracture',
  '2:demon:5': 'boss_demon_brand',
  '2:hell:3': 'boss_hell_seal',
  '3:atlantis:5': 'boss_poseidon_pressure',
  '3:underworld:5': 'boss_hades_shackle',
  '3:thunder:5': 'boss_zeus_overload',
  '3:divine:1': 'boss_chronos_stop',
  '3:divine:2': 'boss_gaia_collapse',
  '3:divine:3': 'boss_chaos_entropy',
  '3:rift:4': 'boss_rift_inverse'
};

function injectBossUniqueStatusToStrongestPatterns(patternTable, uniqueByStage) {
  Object.keys(uniqueByStage).forEach((stageKey) => {
    const uniqueType = uniqueByStage[stageKey];
    const patterns = patternTable[stageKey];
    if (!Array.isArray(patterns) || patterns.length === 0) return;

    let strongestIndex = 0;
    let strongestDamage = -Infinity;
    patterns.forEach((pattern, index) => {
      const damageMul = Number(pattern.damageMul) || 0;
      if (damageMul > strongestDamage) {
        strongestDamage = damageMul;
        strongestIndex = index;
      }
    });

    patterns.forEach((pattern, index) => {
      const effects = Array.isArray(pattern.effects) ? pattern.effects : [];
      pattern.effects = effects.filter((effect) => effect?.type !== uniqueType);
      if (index === strongestIndex) {
        pattern.effects.push({ type: uniqueType, chance: 1 });
      }
    });
  });
}

injectBossUniqueStatusToStrongestPatterns(BOSS_PATTERN_TABLE, BOSS_UNIQUE_STATUS_BY_STAGE);

function toSafeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, Math.floor(num)) : 0;
}

function formatNumber(value) {
  return toSafeNumber(value).toLocaleString('ko-KR');
}

function getKillCount(killStats, monsterId) {
  return toSafeNumber(killStats[monsterId]);
}

function getStatusLabel(type) {
  return STATUS_EFFECT_LABELS[type] || type;
}

function getStageKey(monster) {
  return `${monster.world}:${monster.area}:${monster.stage}`;
}

function getMonsterPatternInfo(monster) {
  const stageKey = getStageKey(monster);
  const patternList = monster.boss
    ? BOSS_PATTERN_TABLE[stageKey]
    : NORMAL_PATTERN_TABLE[stageKey];

  if (!Array.isArray(patternList) || patternList.length === 0) return null;

  const skillRows = patternList.map((pattern) => {
    const uniqueStatuses = [...new Set(
      (Array.isArray(pattern.effects) ? pattern.effects : [])
        .map((effect) => effect?.type)
        .filter(Boolean)
        .map(getStatusLabel)
    )];
    return { name: pattern.name, statuses: uniqueStatuses };
  });

  const allStatuses = [...new Set(skillRows.flatMap((row) => row.statuses))];
  return { skillRows, allStatuses };
}

function buildDetailContent(monster, killCount) {
  const detailRoot = document.createElement('div');
  detailRoot.className = 'codex-detail-inner';

  if (killCount < CODEX_REVEAL_KILL_REQUIREMENT) {
    const remain = Math.max(0, CODEX_REVEAL_KILL_REQUIREMENT - killCount);
    const lockText = document.createElement('div');
    lockText.className = 'codex-detail-lock';
    lockText.innerText = `기술 공개까지 ${formatNumber(remain)}회 남음 (${formatNumber(killCount)} / ${formatNumber(CODEX_REVEAL_KILL_REQUIREMENT)})`;
    detailRoot.appendChild(lockText);
    return detailRoot;
  }

  const patternInfo = getMonsterPatternInfo(monster);
  if (!patternInfo) {
    const emptyText = document.createElement('div');
    emptyText.className = 'codex-detail-empty';
    emptyText.innerText = '표시할 기술 데이터가 없습니다.';
    detailRoot.appendChild(emptyText);
    return detailRoot;
  }

  const skillTitle = document.createElement('div');
  skillTitle.className = 'codex-detail-title';
  skillTitle.innerText = '기술';
  detailRoot.appendChild(skillTitle);

  const skillList = document.createElement('ul');
  skillList.className = 'codex-detail-list';
  patternInfo.skillRows.forEach((row) => {
    const item = document.createElement('li');
    const statusText = row.statuses.length > 0 ? row.statuses.join(', ') : '상태이상 없음';
    item.innerText = `${row.name} · ${statusText}`;
    skillList.appendChild(item);
  });
  detailRoot.appendChild(skillList);

  const statusTitle = document.createElement('div');
  statusTitle.className = 'codex-detail-title';
  statusTitle.innerText = '부여 상태이상';
  detailRoot.appendChild(statusTitle);

  if (patternInfo.allStatuses.length > 0) {
    const chipWrap = document.createElement('div');
    chipWrap.className = 'codex-status-chips';
    patternInfo.allStatuses.forEach((status) => {
      const chip = document.createElement('span');
      chip.className = 'codex-status-chip';
      chip.innerText = status;
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

function createCodexCard(monster, killCount) {
  const unlocked = killCount > 0;
  const card = document.createElement('div');
  card.className = `codex-card ${unlocked ? 'unlocked' : 'locked'}`;

  const thumb = document.createElement('img');
  thumb.className = `codex-thumb ${unlocked ? 'clickable' : ''}`;
  thumb.src = `images/monsters/${monster.image}`;
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
  metaEl.innerText = `스테이지 ${monster.stage}`;
  main.appendChild(metaEl);

  if (unlocked) {
    const hintEl = document.createElement('div');
    hintEl.className = 'codex-meta codex-meta-sub';
    if (killCount >= CODEX_REVEAL_KILL_REQUIREMENT) {
      hintEl.innerText = '이미지를 눌러 기술/상태이상 보기';
    } else {
      hintEl.innerText = `기술 공개: ${formatNumber(CODEX_REVEAL_KILL_REQUIREMENT)}회 처치 필요`;
    }
    main.appendChild(hintEl);
  }

  card.appendChild(main);

  const right = document.createElement('div');
  right.className = 'codex-right';

  if (monster.boss) {
    const bossEl = document.createElement('div');
    bossEl.className = 'codex-boss';
    bossEl.innerText = 'BOSS';
    right.appendChild(bossEl);
  }

  const killEl = document.createElement('div');
  killEl.className = 'codex-kill';
  killEl.innerText = unlocked ? `${formatNumber(killCount)}회` : '미해금';
  right.appendChild(killEl);

  card.appendChild(right);

  const detailEl = document.createElement('div');
  detailEl.className = 'codex-detail';
  detailEl.hidden = true;
  detailEl.appendChild(buildDetailContent(monster, killCount));
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

function renderCodex() {
  const killStats = GameData.killStats || {};
  const allMonsters = CODEX_GROUPS.flatMap((group) => group.monsters);

  const discoveredCount = allMonsters.reduce((sum, monster) => {
    return sum + (getKillCount(killStats, monster.id) > 0 ? 1 : 0);
  }, 0);
  const bossTotal = allMonsters.filter((monster) => monster.boss).length;
  const bossDiscovered = allMonsters.reduce((sum, monster) => {
    if (!monster.boss) return sum;
    return sum + (getKillCount(killStats, monster.id) > 0 ? 1 : 0);
  }, 0);

  codexSummaryEl.innerText =
    `해금 ${formatNumber(discoveredCount)} / ${formatNumber(allMonsters.length)} | ` +
    `보스 ${formatNumber(bossDiscovered)} / ${formatNumber(bossTotal)}`;

  codexGroupListEl.innerHTML = '';

  CODEX_GROUPS.forEach((group) => {
    const groupEl = document.createElement('section');
    groupEl.className = 'codex-group';

    const groupHead = document.createElement('div');
    groupHead.className = 'codex-group-head';

    const titleEl = document.createElement('div');
    titleEl.className = 'codex-group-title';
    titleEl.innerText = group.title;
    groupHead.appendChild(titleEl);

    const unlockedInGroup = group.monsters.reduce((sum, monster) => {
      return sum + (getKillCount(killStats, monster.id) > 0 ? 1 : 0);
    }, 0);

    const progressEl = document.createElement('div');
    progressEl.className = 'codex-group-progress';
    progressEl.innerText = `${formatNumber(unlockedInGroup)} / ${formatNumber(group.monsters.length)}`;
    groupHead.appendChild(progressEl);

    groupEl.appendChild(groupHead);

    const cardListEl = document.createElement('div');
    cardListEl.className = 'codex-card-list';

    group.monsters.forEach((monster) => {
      const killCount = getKillCount(killStats, monster.id);
      const stageMonster = { ...monster, world: group.world, area: group.area };
      cardListEl.appendChild(createCodexCard(stageMonster, killCount));
    });

    groupEl.appendChild(cardListEl);
    codexGroupListEl.appendChild(groupEl);
  });
}

renderCodex();
