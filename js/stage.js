/* =========================
   파라미터
========================= */
const params = new URLSearchParams(location.search);
const world = Number(params.get('world') || 1);
const area = params.get('area') || 'grass';
const stageId = Number(params.get('stage') || 1);

// Stage monster damage table
// key format: "world:area:stage"
// example: "1:grass:1": 3
const STAGE_MONSTER_DAMAGE = {
  // World 1
  "1:grass:1": 4,
  "1:grass:2": 5,
  "1:grass:3": 6,
  "1:grass:4": 7,
  "1:grass:5": 8,
  "1:orc:1": 6,
  "1:orc:2": 7,
  "1:orc:3": 8,
  "1:orc:4": 9,
  "1:orc:5": 10,
  "1:dragon:1": 8,
  "1:dragon:2": 9,
  "1:dragon:3": 10,
  "1:dragon:4": 11,
  "1:dragon:5": 12,
  "1:space:1": 10,
  "1:space:2": 11,
  "1:space:3": 13,

  // World 2
  "2:cave:1": 14,
  "2:cave:2": 15,
  "2:cave:3": 16,
  "2:cave:4": 17,
  "2:cave:5": 18,
  "2:grave:1": 16,
  "2:grave:2": 17,
  "2:grave:3": 18,
  "2:grave:4": 20,
  "2:grave:5": 22,
  "2:demon:1": 20,
  "2:demon:2": 22,
  "2:demon:3": 24,
  "2:demon:4": 26,
  "2:demon:5": 28,
  "2:hell:1": 26,
  "2:hell:2": 28,
  "2:hell:3": 32,

  // World 3
  "3:atlantis:1": 30,
  "3:atlantis:2": 33,
  "3:atlantis:3": 36,
  "3:atlantis:4": 39,
  "3:atlantis:5": 42,
  "3:underworld:1": 34,
  "3:underworld:2": 37,
  "3:underworld:3": 41,
  "3:underworld:4": 45,
  "3:underworld:5": 50,
  "3:thunder:1": 36,
  "3:thunder:2": 40,
  "3:thunder:3": 44,
  "3:thunder:4": 49,
  "3:thunder:5": 54,
  "3:divine:1": 48,
  "3:divine:2": 56,
  "3:divine:3": 64,
  "3:rift:1": 52,
  "3:rift:2": 58,
  "3:rift:3": 66,
  "3:rift:4": 75
};

// 상태이상 정의
const STATUS_EFFECT_LIBRARY = {
  poison: { label: '중독', durationMs: 12000, tickMs: 1000, damageRatio: 0.009, minDamage: 1 },
  bleed: { label: '출혈', durationMs: 15000, tickMs: 3000, damageRatio: 0.045, minDamage: 2 },
  burn: { label: '화상', durationMs: 10000, tickMs: 2000, damageRatio: 0.022, minDamage: 2 },
  shock: { label: '감전', durationMs: 8000, incomingDamageMul: 1.2 },
  frost: { label: '빙결', durationMs: 7000, outgoingDamageMul: 0.65 },
  heavy: { label: '무거움', durationMs: 9000, outgoingDamageMul: 0.55, incomingDamageMul: 1.1 },
  timeStop: { label: '시간 정지', durationMs: 1000, blockPlayerAttack: true },
  chaos: { label: '혼돈', durationMs: 1000, playerHitChance: 0.5 },

  // 보스 고유 상태이상: 각 보스 strongest 패턴에서만 발동
  boss_slime_bind: { label: '점액 구속', durationMs: 8000, outgoingDamageMul: 0.75 },
  boss_orc_fear: { label: '전장의 공포', durationMs: 7000, playerHitChanceMul: 0.65 },
  boss_dragon_rend: { label: '용린 파열', durationMs: 10000, tickMs: 2000, damageRatio: 0.012, minDamage: 4 },
  boss_space_collapse: { label: '중력 붕괴', durationMs: 6000, outgoingDamageMul: 0.6, incomingDamageMul: 1.12 },
  boss_bat_curse: { label: '흡혈 저주', durationMs: 9000, lifeStealToMonsterRatio: 0.22 },
  boss_skeleton_fracture: { label: '골절', durationMs: 9000, incomingDamageMul: 1.25 },
  boss_demon_brand: { label: '지옥 낙인', durationMs: 12000, tickMs: 3000, damageRatio: 0.02, minDamage: 6 },
  boss_hell_seal: { label: '신벌 봉인', durationMs: 6500, blockPlayerAttack: true },
  boss_poseidon_pressure: { label: '심해 수압', durationMs: 9000, outgoingDamageMul: 0.7, playerHitChanceMul: 0.85 },
  boss_hades_shackle: { label: '망자의 굴레', durationMs: 10000, selfDamageOnAttackChance: 0.35, selfDamageOnAttackRatio: 0.08, selfDamageOnAttackMin: 5 },
  boss_zeus_overload: { label: '과전류', durationMs: 8000, attackDelayChance: 0.4, attackDelayMs: 1200 },
  boss_chronos_stop: { label: '절대 정지', durationMs: 1000, blockPlayerAttack: true },
  boss_gaia_collapse: { label: '원소 붕괴', durationMs: 9000, applyExtraStatuses: ['burn', 'shock', 'frost'] },
  boss_chaos_entropy: { label: '혼돈 왜곡', durationMs: 1000, playerHitChance: 0.5 },
  boss_rift_inverse: { label: '확률 역전', durationMs: 7000, invertDamageChance: 0.5, invertDamageZeroChance: 0.5 }
};

const STATUS_NULLIFY_POTION_MAP = {
  poison: 'antidotePoison',
  bleed: 'antidoteBleed',
  burn: 'antidoteBurn',
  shock: 'antidoteShock',
  frost: 'antidoteFrost'
};

// 지역 기본 상태이상 확률 (필요 시 여기 숫자만 조절)
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

// 스테이지별 상태이상 확률 오버라이드 (원하는 키만 추가/수정)
// key 예시: "1:grass:1"
const STAGE_STATUS_EFFECT_OVERRIDES = {
  "1:grass:5": [{ type: 'poison', chance: 0.22 }, { type: 'bleed', chance: 0.16 }, { type: 'heavy', chance: 0.12 }],
  "1:orc:5": [{ type: 'bleed', chance: 0.24 }, { type: 'shock', chance: 0.14 }, { type: 'heavy', chance: 0.20 }],
  "1:dragon:5": [{ type: 'burn', chance: 0.26 }, { type: 'bleed', chance: 0.16 }, { type: 'heavy', chance: 0.14 }],
  "1:space:3": [{ type: 'shock', chance: 0.28 }, { type: 'burn', chance: 0.20 }, { type: 'heavy', chance: 0.12 }],
  "2:cave:5": [{ type: 'bleed', chance: 0.25 }, { type: 'poison', chance: 0.18 }, { type: 'heavy', chance: 0.14 }],
  "2:grave:5": [{ type: 'poison', chance: 0.28 }, { type: 'bleed', chance: 0.24 }, { type: 'heavy', chance: 0.16 }],
  "2:demon:5": [{ type: 'burn', chance: 0.30 }, { type: 'shock', chance: 0.20 }, { type: 'heavy', chance: 0.20 }],
  "2:hell:3": [{ type: 'burn', chance: 0.34 }, { type: 'bleed', chance: 0.26 }, { type: 'heavy', chance: 0.18 }],
  "3:atlantis:5": [{ type: 'poison', chance: 0.34 }, { type: 'frost', chance: 0.24 }, { type: 'heavy', chance: 0.16 }],
  "3:underworld:5": [{ type: 'bleed', chance: 0.36 }, { type: 'shock', chance: 0.24 }, { type: 'heavy', chance: 0.22 }],
  "3:thunder:5": [{ type: 'shock', chance: 0.40 }, { type: 'burn', chance: 0.24 }, { type: 'heavy', chance: 0.18 }],
  "3:divine:1": [],
  "3:divine:2": [],
  "3:divine:3": [],
  "3:rift:4": [{ type: 'poison', chance: 0.30 }, { type: 'bleed', chance: 0.30 }, { type: 'shock', chance: 0.26 }, { type: 'heavy', chance: 0.24 }]
};

// 일반 몬스터 패턴(요청 반영):
// - 1~2 스테이지: 스킬 1개
// - 3~4 스테이지: 스킬 2개
// - 적용 지역: 5스테이지 지역 + 3스테이지 지역(space/hell) + 균열 일반몹(rift 1~3)
//   (divine는 이번 단계에서 제외)
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
          damageMul: Number((1 + stageNo * 0.09 + areaIndex * 0.01).toFixed(2)),
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
          damageMul: Number((1 + stageNo * 0.1 + areaIndex * 0.01).toFixed(2)),
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
          damageMul: Number((1 + stageNo * 0.12 + areaIndex * 0.012).toFixed(2)),
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
          damageMul: Number((1 + stageNo * 0.1 + areaIndex * 0.01).toFixed(2)),
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
          damageMul: Number((1 + stageNo * 0.12 + areaIndex * 0.012).toFixed(2)),
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
          damageMul: Number((1 + stageNo * 0.15 + areaIndex * 0.015).toFixed(2)),
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

// 보스 패턴: 각 보스 스테이지마다 독립 패턴
const BOSS_PATTERN_TABLE = {
  "1:grass:5": [
    { name: '점액 강타', weight: 40, damageMul: 1.35, effects: [{ type: 'heavy', chance: 0.6 }] },
    { name: '산성 분출', weight: 35, damageMul: 0.95, effects: [{ type: 'poison', chance: 1 }] },
    { name: '왕의 압착', weight: 25, damageMul: 1.75, effects: [{ type: 'bleed', chance: 1 }, { type: 'heavy', chance: 1 }] }
  ],
  "1:orc:5": [
    { name: '족장 내려찍기', weight: 36, damageMul: 1.4, effects: [{ type: 'heavy', chance: 1 }] },
    { name: '전장의 절개', weight: 34, damageMul: 1.1, effects: [{ type: 'bleed', chance: 1 }, { type: 'heavy', chance: 0.6 }] },
    { name: '포효 진동파', weight: 30, damageMul: 1.2, effects: [{ type: 'shock', chance: 0.7 }] }
  ],
  "1:dragon:5": [
    { name: '용의 발톱', weight: 34, damageMul: 1.45, effects: [{ type: 'heavy', chance: 0.7 }] },
    { name: '화염 숨결', weight: 36, damageMul: 1.15, effects: [{ type: 'burn', chance: 1 }] },
    { name: '분쇄 꼬리치기', weight: 30, damageMul: 1.8, effects: [{ type: 'bleed', chance: 0.8 }, { type: 'heavy', chance: 1 }] }
  ],
  "1:space:3": [
    { name: '중력 파동', weight: 33, damageMul: 1.5, effects: [{ type: 'frost', chance: 0.6 }] },
    { name: '플라즈마 과충전', weight: 34, damageMul: 1.2, effects: [{ type: 'shock', chance: 1 }] },
    { name: '항성 폭발', weight: 33, damageMul: 1.9, effects: [{ type: 'burn', chance: 1 }] }
  ],
  "2:cave:5": [
    { name: '흡혈 급습', weight: 34, damageMul: 1.35, effects: [{ type: 'bleed', chance: 0.8 }, { type: 'heavy', chance: 0.5 }] },
    { name: '암흑 박쥐 떼', weight: 36, damageMul: 1.1, effects: [{ type: 'poison', chance: 1 }] },
    { name: '밤의 절단', weight: 30, damageMul: 1.75, effects: [{ type: 'bleed', chance: 1 }, { type: 'heavy', chance: 0.8 }] }
  ],
  "2:grave:5": [
    { name: '저주의 손아귀', weight: 34, damageMul: 1.3, effects: [{ type: 'frost', chance: 0.8 }, { type: 'heavy', chance: 0.8 }] },
    { name: '부패의 숨결', weight: 34, damageMul: 1.1, effects: [{ type: 'poison', chance: 1 }] },
    { name: '뼈의 폭풍', weight: 32, damageMul: 1.85, effects: [{ type: 'bleed', chance: 1 }, { type: 'heavy', chance: 1 }] }
  ],
  "2:demon:5": [
    { name: '지옥 난타', weight: 32, damageMul: 1.45, effects: [{ type: 'burn', chance: 0.7 }, { type: 'heavy', chance: 0.8 }] },
    { name: '마력 방전', weight: 34, damageMul: 1.2, effects: [{ type: 'shock', chance: 1 }] },
    { name: '멸망의 불길', weight: 34, damageMul: 1.95, effects: [{ type: 'burn', chance: 1 }, { type: 'heavy', chance: 0.9 }] }
  ],
  "2:hell:3": [
    { name: '분노의 징벌', weight: 30, damageMul: 1.55, effects: [{ type: 'bleed', chance: 0.8 }] },
    { name: '죄악의 화염', weight: 35, damageMul: 1.25, effects: [{ type: 'burn', chance: 1 }] },
    { name: '신벌의 낙뢰', weight: 35, damageMul: 2.1, effects: [{ type: 'shock', chance: 1 }] }
  ],
  "3:atlantis:5": [
    { name: '해왕의 창격', weight: 32, damageMul: 1.55, effects: [{ type: 'bleed', chance: 0.8 }, { type: 'heavy', chance: 0.7 }] },
    { name: '심해 독수', weight: 33, damageMul: 1.2, effects: [{ type: 'poison', chance: 1 }] },
    { name: '파멸의 해일', weight: 35, damageMul: 2.0, effects: [{ type: 'frost', chance: 1 }, { type: 'heavy', chance: 1 }] }
  ],
  "3:underworld:5": [
    { name: '명계 베기', weight: 33, damageMul: 1.6, effects: [{ type: 'bleed', chance: 1 }, { type: 'heavy', chance: 0.7 }] },
    { name: '망령 침식', weight: 34, damageMul: 1.2, effects: [{ type: 'poison', chance: 1 }] },
    { name: '죽음의 속박', weight: 33, damageMul: 2.05, effects: [{ type: 'shock', chance: 1 }, { type: 'heavy', chance: 1 }] }
  ],
  "3:thunder:5": [
    { name: '천둥 강타', weight: 33, damageMul: 1.6, effects: [{ type: 'shock', chance: 1 }, { type: 'heavy', chance: 0.65 }] },
    { name: '번개 사슬', weight: 34, damageMul: 1.25, effects: [{ type: 'shock', chance: 1 }, { type: 'burn', chance: 0.6 }] },
    { name: '신의 심판', weight: 33, damageMul: 2.15, effects: [{ type: 'burn', chance: 1 }, { type: 'heavy', chance: 1 }] }
  ],
  "3:divine:1": [
    { name: '시간의 낫', weight: 30, damageMul: 1.6, effects: [] },
    { name: '연대기 붕괴', weight: 35, damageMul: 1.25, effects: [{ type: 'timeStop', chance: 1 }] },
    { name: '시간 정지', weight: 35, damageMul: 1.9, effects: [{ type: 'timeStop', chance: 1 }] }
  ],
  "3:divine:2": [
    { name: '대지의 심판', weight: 34, damageMul: 1.45, effects: [{ type: 'burn', chance: 1 }, { type: 'shock', chance: 1 }, { type: 'frost', chance: 1 }] },
    { name: '원소 융해', weight: 33, damageMul: 1.3, effects: [{ type: 'burn', chance: 1 }, { type: 'shock', chance: 1 }, { type: 'frost', chance: 1 }] },
    { name: '생명의 역류', weight: 33, damageMul: 1.85, effects: [{ type: 'burn', chance: 1 }, { type: 'shock', chance: 1 }, { type: 'frost', chance: 1 }] }
  ],
  "3:divine:3": [
    { name: '혼돈 파동', weight: 34, damageMul: 1.5, effects: [{ type: 'chaos', chance: 1 }] },
    { name: '무질서의 장막', weight: 33, damageMul: 1.25, effects: [{ type: 'chaos', chance: 1 }] },
    { name: '카오스 붕괴', weight: 33, damageMul: 2.2, effects: [{ type: 'chaos', chance: 1 }] }
  ],
  "3:rift:4": [
    { name: '확률 붕괴', weight: 33, damageMul: 1.6, effects: [{ type: 'poison', chance: 1 }, { type: 'heavy', chance: 0.8 }] },
    { name: '운명 절단', weight: 33, damageMul: 1.45, effects: [{ type: 'bleed', chance: 1 }, { type: 'heavy', chance: 0.7 }] },
    { name: '카오스 붕괴', weight: 34, damageMul: 2.2, effects: [{ type: 'shock', chance: 1 }, { type: 'burn', chance: 1 }, { type: 'heavy', chance: 1 }] }
  ]
};

// 보스 패턴 발동 주기(ms): 값이 작을수록 더 빠름
const BOSS_PATTERN_INTERVAL_MS = {
  "1:grass:5": 3000,
  "1:orc:5": 2800,
  "1:dragon:5": 2600,
  "1:space:3": 2400,
  "2:cave:5": 2300,
  "2:grave:5": 2200,
  "2:demon:5": 2100,
  "2:hell:3": 2000,
  "3:atlantis:5": 1850,
  "3:underworld:5": 1750,
  "3:thunder:5": 1650,
  "3:divine:1": 1600,
  "3:divine:2": 1500,
  "3:divine:3": 1400,
  "3:rift:4": 1600
};

const BOSS_UNIQUE_STATUS_BY_STAGE = {
  "1:grass:5": "boss_slime_bind",
  "1:orc:5": "boss_orc_fear",
  "1:dragon:5": "boss_dragon_rend",
  "1:space:3": "boss_space_collapse",
  "2:cave:5": "boss_bat_curse",
  "2:grave:5": "boss_skeleton_fracture",
  "2:demon:5": "boss_demon_brand",
  "2:hell:3": "boss_hell_seal",
  "3:atlantis:5": "boss_poseidon_pressure",
  "3:underworld:5": "boss_hades_shackle",
  "3:thunder:5": "boss_zeus_overload",
  "3:divine:1": "boss_chronos_stop",
  "3:divine:2": "boss_gaia_collapse",
  "3:divine:3": "boss_chaos_entropy",
  "3:rift:4": "boss_rift_inverse"
};

const BOSS_UNIQUE_STATUS_TYPES = new Set(Object.values(BOSS_UNIQUE_STATUS_BY_STAGE));

function injectBossUniqueStatusToStrongestPatterns(patternTable, uniqueByStage) {
  Object.keys(uniqueByStage).forEach((stageKey) => {
    const uniqueType = uniqueByStage[stageKey];
    const patterns = patternTable[stageKey];
    if (!Array.isArray(patterns) || patterns.length === 0) return;

    let strongestIdx = 0;
    let strongestDamageMul = -Infinity;
    patterns.forEach((pattern, idx) => {
      const dmgMul = Number(pattern.damageMul) || 0;
      if (dmgMul > strongestDamageMul) {
        strongestDamageMul = dmgMul;
        strongestIdx = idx;
      }
    });

    patterns.forEach((pattern, idx) => {
      const currentEffects = Array.isArray(pattern.effects) ? pattern.effects : [];
      pattern.effects = currentEffects.filter((effect) => !BOSS_UNIQUE_STATUS_TYPES.has(effect?.type));
      if (idx === strongestIdx) {
        pattern.effects.push({ type: uniqueType, chance: 1 });
      }
    });
  });
}

injectBossUniqueStatusToStrongestPatterns(BOSS_PATTERN_TABLE, BOSS_UNIQUE_STATUS_BY_STAGE);

function clampChance(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function getStageStatusEffects(stageKey, currentArea, currentStage) {
  const override = STAGE_STATUS_EFFECT_OVERRIDES[stageKey];
  if (Array.isArray(override)) return override;

  const profile = AREA_STATUS_EFFECT_PROFILE[currentArea] || [];
  const stageScale = 1 + Math.max(0, Number(currentStage) - 1) * 0.1;

  return profile.map((entry) => ({
    type: entry.type,
    chance: clampChance((Number(entry.chance) || 0) * stageScale)
  }));
}

function pickWeightedPattern(patterns) {
  const total = patterns.reduce((sum, p) => sum + Math.max(0, Number(p.weight) || 0), 0);
  if (total <= 0) return patterns[0];

  let roll = Math.random() * total;
  for (const pattern of patterns) {
    roll -= Math.max(0, Number(pattern.weight) || 0);
    if (roll <= 0) return pattern;
  }
  return patterns[patterns.length - 1];
}



/* =========================
   🔒 월드 입장 제한
========================= */
if (world === 2 && GameData.level < 300) {
  alert('2세계는 강화 +300 이상 필요합니다!');
  location.href = 'index.html';
}

if (world === 3 && GameData.level < 700) {
  alert('3세계는 강화 +700 이상 필요합니다!');
  location.href = 'index.html';
}

/* =========================
   🌍 1세계 스테이지 데이터
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
   🌌 2세계 스테이지 데이터
========================= */
const caveStages = {
  1:{ name:'동굴 박쥐', monster:'bat_1.png', hp:25000, gold:35000, lvl:100, speed:3.5, achId:'bat_1' },
  2:{ name:'어둠 박쥐', monster:'bat_2.png', hp:28000, gold:38000, lvl:102, speed:3.2, achId:'bat_2' },
  3:{ name:'흡혈 박쥐', monster:'bat_3.png', hp:32000, gold:42000, lvl:104, speed:3.0, achId:'bat_3', scale:1.5 },
  4:{ name:'광폭 박쥐', monster:'bat_4.png', hp:36000, gold:46000, lvl:106, speed:2.6, achId:'bat_4', scale:1.7 },
  5:{ name:'박쥐 군주', monster:'bat_boss.png', hp:42000, gold:52000, lvl:108, speed:2.4, scale:2.0, achId:'bat_king' }
};

const graveStages = {
  1:{ name:'해골 병사', monster:'skeleton_1.png', hp:45000, gold:60000, lvl:110, speed:2.4, achId:'skeleton_1' , scale:1.7 },
  2:{ name:'해골 궁수', monster:'skeleton_2.png', hp:50000, gold:65000, lvl:112, speed:2.2, achId:'skeleton_2' , scale:1.7},
  3:{ name:'해골 기사', monster:'skeleton_3.png', hp:56000, gold:72000, lvl:114, speed:2.0, achId:'skeleton_3' , scale:1.7},
  4:{ name:'저주받은 해골', monster:'skeleton_4.png', hp:62000, gold:80000, lvl:116, speed:1.8, achId:'skeleton_4' , scale:1.7},
  5:{ name:'해골 군주', monster:'skeleton_boss.png', hp:70000, gold:90000, lvl:118, speed:1.6, scale:2.0, achId:'skeleton_king' }
};

const demonStages = {
  1:{ name:'악마 하수인', monster:'demon_1.png', hp:80000, gold:100000, lvl:120, speed:2.2, achId:'demon_1' , scale:1.7 },
  2:{ name:'악마 기사', monster:'demon_2.png', hp:90000, gold:120000, lvl:122, speed:2.0, achId:'demon_2' , scale:1.7},
  3:{ name:'지옥 마법사', monster:'demon_3.png', hp:105000, gold:140000, lvl:124, speed:1.8, achId:'demon_3' , scale:2.0},
  4:{ name:'타락한 군주', monster:'demon_4.png', hp:120000, gold:160000, lvl:126, speed:1.6, achId:'demon_4' , scale:2.1},
  5:{ name:'마왕', monster:'demon_boss.png', hp:150000, gold:200000, lvl:128, speed:1.4, scale:2.4, achId:'demon_king' }
};

const hellStages = {
  1:{ name:'탐욕의 망령', monster:'sin_greed.png', hp:200000, gold:260000, lvl:130, speed:1.8, scale:2.4, achId:'sin_greed' },
  2:{ name:'질투의 망령', monster:'sin_envy.png', hp:260000, gold:340000, lvl:132, speed:1.7, scale:2.9, achId:'sin_envy' },
  3:{ name:'👑 분노의 신', monster:'sin_god.png', hp:350000, gold:500000, lvl:140, speed:1.3, scale:2.5, achId:'sin_god' }
};

/* =========================
   🌠 3세계 스테이지 데이터
========================= */
const atlantisStages = {
  1:{ name:'산호 슬라임', monster:'w3_atlantis_1.png', hp:520000,  gold:650000,  lvl:200, speed:2.6, achId:'w3_atlantis_1' },
  2:{ name:'심해 해마 기사', monster:'w3_atlantis_2.png', hp:620000,  gold:780000,  lvl:205, speed:2.4, scale:1.7, achId:'w3_atlantis_2' },
  3:{ name:'잠수꾼 망령', monster:'w3_atlantis_3.png', hp:760000,  gold:950000,  lvl:210, speed:2.2, scale:1.8, achId:'w3_atlantis_3' },
  4:{ name:'크라켄', monster:'w3_atlantis_4.png', hp:980000,  gold:1250000, lvl:215, speed:2.0, scale:2.6, achId:'w3_atlantis_4' },
  5:{ name:'👑 포세이돈', monster:'w3_atlantis_5_poseidon.png', hp:1450000, gold:2000000, lvl:220, speed:1.5, scale:2.4, achId:'w3_poseidon' }
};

const underworldStages = {
  1:{ name:'길잃은 영혼', monster:'w3_underworld_1.png', hp:540000,  gold:680000,  lvl:200, speed:3.0, scale:1.6, achId:'w3_underworld_1' },
  2:{ name:'지옥 사냥개', monster:'w3_underworld_2.png', hp:670000,  gold:820000,  lvl:206, speed:2.4, scale:2.6, achId:'w3_underworld_2' },
  3:{ name:'사신의 그림자', monster:'w3_underworld_3.png', hp:820000,  gold:1050000, lvl:212, speed:2.1, scale:2.0, achId:'w3_underworld_3' },
  4:{ name:'스틱스 망령', monster:'w3_underworld_4.png', hp:1050000, gold:1350000, lvl:218, speed:1.9, scale:2.9, achId:'w3_underworld_4' },
  5:{ name:'👑 하데스', monster:'w3_underworld_5_hades.png', hp:1550000, gold:2200000, lvl:225, speed:1.7, scale:1.8, achId:'w3_hades' }
};

const thunderStages = {
  1:{ name:'구름 정령', monster:'w3_thunder_1.png', hp:560000,  gold:700000,  lvl:200, speed:2.6, achId:'w3_thunder_1' },
  2:{ name:'번개 박쥐', monster:'w3_thunder_2.png', hp:700000,  gold:860000,  lvl:207, speed:2.3, achId:'w3_thunder_2' },
  3:{ name:'스톰 나이트', monster:'w3_thunder_3.png', hp:860000,  gold:1100000, lvl:214, speed:2.1, scale:2.4, achId:'w3_thunder_3' },
  4:{ name:'천둥 골렘', monster:'w3_thunder_4.png', hp:1100000, gold:1450000, lvl:221, speed:1.85, scale:2.7, achId:'w3_thunder_4' },
  5:{ name:'👑 제우스', monster:'w3_thunder_5_zeus.png', hp:1650000, gold:2400000, lvl:230, speed:1.65, scale:2.5, achId:'w3_zeus' }
};

const divineStages = {
  1:{ name:'크로노스', monster:'w3_divine_1_cronos.png', hp:1400000, gold:2600000, lvl:235, speed:100.0, scale:5.5, offsetY:100, achId:'w3_cronos' },
  2:{ name:'가이아', monster:'w3_divine_2_gaia.png', hp:1850000, gold:3200000, lvl:245, speed:100.0, scale:5.2, offsetY:100, achId:'w3_gaia' },
  3:{ name:'카오스', monster:'w3_divine_3_chaos.png', hp:2400000, gold:4200000, lvl:255, speed:100.0, scale:5.3, offsetY:100, achId:'w3_chaos' }
};

/* =========================
   🎲 운명의 균열 (✅ 추가)
   - 드랍 확률:
     운명의 주사위 10%
     양면의 인장 6%
     운명의 저울 3%
     카오스 인장 1%
========================= */
const riftStages = {
  1:{ name:'🎲 확률의 도사', monster:'rift_1.png', hp:900000, gold:1500000, lvl:230, speed:2.0, scale:4.0, achId:'rift_1', drop:'dice', dropRate:0.13, bg:'bg_rift_1.png' },
  2:{ name:'🌓 양면의 문지기', monster:'rift_2.png', hp:1100000, gold:1800000, lvl:235, speed:1.9, scale:3.5, achId:'rift_2', drop:'dual', dropRate:0.10, bg:'bg_rift_2.png' },
  3:{ name:'⚖️ 균형의 심판관', monster:'rift_3.png', hp:1300000, gold:2200000, lvl:240, speed:1.8, scale:2.4, achId:'rift_3', drop:'scale', dropRate:0.05, bg:'bg_rift_3.png' },
  4:{ name:'🌀 심연의 분열체', monster:'rift_4.png', hp:1600000, gold:2800000, lvl:250, speed:1.7, scale:2.6, achId:'rift_4', drop:'chaos', dropRate:0.03, bg:'bg_rift_4.png' }
};

const STAGE_LEVEL_GAP = 10;
const STAGE_HP_MULTIPLIER = 5;

function applyStageLevelGapAndHp(stageMap, levelGap, hpMultiplier) {
  const stageNums = Object.keys(stageMap)
    .map((key) => Number(key))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (!stageNums.length) return;

  const baseLevel = Math.max(0, Number(stageMap[stageNums[0]]?.lvl) || 0);

  stageNums.forEach((stageNum, index) => {
    const stageData = stageMap[stageNum];
    if (!stageData) return;

    stageData.lvl = baseLevel + index * levelGap;
    stageData.hp = Math.max(1, Math.floor((Number(stageData.hp) || 1) * hpMultiplier));
  });
}

[
  grassStages,
  orcStages,
  dragonStages,
  spaceStages,
  caveStages,
  graveStages,
  demonStages,
  hellStages,
  atlantisStages,
  underworldStages,
  thunderStages,
  divineStages,
  riftStages
].forEach((stageMap) => {
  applyStageLevelGapAndHp(stageMap, STAGE_LEVEL_GAP, STAGE_HP_MULTIPLIER);
});

/* =========================
   지역 매핑
========================= */
const areaStages =
  world === 1
    ? { grass: grassStages, orc: orcStages, dragon: dragonStages, space: spaceStages }
    : world === 2
    ? { cave: caveStages, grave: graveStages, demon: demonStages, hell: hellStages }
    : {
        atlantis: atlantisStages,
        underworld: underworldStages,
        thunder: thunderStages,
        divine: divineStages,
        rift: riftStages // ✅ 추가
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
const playerHpFill = document.getElementById('player-hp-fill');
const playerHpText = document.getElementById('player-hp-text');
const playerStatusEl = document.querySelector('.player-status');
const monsterHpFill = document.getElementById('monster-hp-fill');
const monsterHpText = document.getElementById('monster-hp-text');
const log = document.getElementById('log');
const goldText = document.getElementById('gold-text');
const damageText = document.getElementById('damage-text');
const potionSmallBtn = document.getElementById('btn-potion-small');
const potionMediumBtn = document.getElementById('btn-potion-medium');
const potionLargeBtn = document.getElementById('btn-potion-large');
const potionSmallCountEl = document.getElementById('potion-count-small');
const potionMediumCountEl = document.getElementById('potion-count-medium');
const potionLargeCountEl = document.getElementById('potion-count-large');
const playerStatusEffectsEl = document.createElement('div');
const playerHpBarEl = playerStatusEl ? playerStatusEl.querySelector('.hp-bar') : null;
const patternFxTextEl = document.createElement('div');

stageEl.classList.add(area);

playerStatusEffectsEl.className = 'status-effects';
if (playerStatusEl) {
  if (playerHpBarEl) {
    playerStatusEl.insertBefore(playerStatusEffectsEl, playerHpBarEl);
  } else {
    playerStatusEl.appendChild(playerStatusEffectsEl);
  }
}

patternFxTextEl.className = 'pattern-fx-text';
stageEl.appendChild(patternFxTextEl);

/* ✅ 운명의 균열은 스테이지별 배경을 JS로 직접 적용 */
if (area === 'rift' && data.bg) {
  stageEl.style.background = `url("images/backgrounds/${data.bg}") center / cover no-repeat`;
}

/* =========================
   몬스터 세팅
========================= */
img.src = `images/monsters/${data.monster}`;
img.alt = data.name;
img.style.transform = `scale(${data.scale || 1})`;
img.style.marginTop = data.offsetY ? `${200 + data.offsetY}px` : '200px';

wrap.style.animationDuration = `${data.speed}s`;

/* =========================
   상태
========================= */
let hp = data.hp;
let dead = false;
let playerDead = false;
let monsterAttackTimer = null;
let statusEffectTimer = null;
let patternEffectTimer = null;
let lowHpWarned = false;
const activeStatusEffects = {};
const battleStats = {
  startedAt: Date.now(),
  damageTakenTotal: 0,
  damageTakenByHit: 0,
  damageTakenByDot: 0,
  monsterHitCount: 0,
  dotHitCount: 0,
  statusAppliedCount: 0,
  statusBlockedCount: 0,
  antidoteUsedCount: 0,
  playerAttackAttempts: 0,
  playerAttackHits: 0,
  playerAttackMisses: 0,
  playerAttackBlockedByTimeStop: 0,
  monsterKillCount: 0
};
let battleSessionCommitted = false;
let shouldPersistBattleStats = true;
let playerAttackLockUntil = 0;

const DEFAULT_MONSTER_ATTACK_INTERVAL_MS = 5000;
const LOW_HP_WARNING_RATIO = 0.2;
const HP_POTION_MAX_STACK = 20;
const HP_POTION_KEY_MAP = {
  small: 'hpPotionSmall',
  medium: 'hpPotionMedium',
  large: 'hpPotionLarge'
};
const HP_POTION_HEAL_RATIO_MAP = {
  small: 0.2,
  medium: 0.5,
  large: 1
};
const defaultMonsterAttackDamage = Math.max(1, Math.ceil((data.lvl + 1) / 40));
const stageDamageKey = `${world}:${area}:${stageId}`;
const stageStatusEffectPool = getStageStatusEffects(stageDamageKey, area, stageId);
const stageBossPatterns = BOSS_PATTERN_TABLE[stageDamageKey] || null;
const stageNormalPatterns = NORMAL_PATTERN_TABLE[stageDamageKey] || null;
const configuredBossPatternIntervalMs = Number(BOSS_PATTERN_INTERVAL_MS[stageDamageKey]);
const monsterAttackIntervalMs =
  stageBossPatterns && Number.isFinite(configuredBossPatternIntervalMs) && configuredBossPatternIntervalMs > 0
    ? Math.floor(configuredBossPatternIntervalMs)
    : DEFAULT_MONSTER_ATTACK_INTERVAL_MS;
const configuredMonsterAttackDamage = Number(STAGE_MONSTER_DAMAGE[stageDamageKey]);
const monsterAttackDamage =
  (Number.isFinite(configuredMonsterAttackDamage) && configuredMonsterAttackDamage > 0)
    ? Math.floor(configuredMonsterAttackDamage)
    : (Number.isFinite(Number(data.atk)) && Number(data.atk) > 0)
    ? Math.floor(Number(data.atk))
    : defaultMonsterAttackDamage;

/* =========================
   UI 초기화
========================= */
log.innerText = `${data.name} 등장!`;
goldText.innerText = `💰 ${GameData.gold}`;
damageText.innerText = `공격력: ${GameData.getCurrentDamage()}`;

if (GameData.currentHp <= 0) {
  GameData.healFull();
} else {
  const maxHpForBattle =
    typeof GameData.getEffectiveMaxHp === 'function'
      ? GameData.getEffectiveMaxHp()
      : GameData.maxHp;
  if (GameData.currentHp > maxHpForBattle) {
    GameData.currentHp = maxHpForBattle;
    GameData.save();
  }
}
if (GameData.currentHp < 0) {
  GameData.currentHp = 0;
  GameData.save();
}
if (GameData.protectTicket <= 0 && GameData.protectActive) {
  GameData.protectActive = false;
  GameData.save();
}

['hpPotionSmall', 'hpPotionMedium', 'hpPotionLarge'].forEach((key) => {
  const value = Math.max(0, Math.floor(Number(GameData[key]) || 0));
  const clamped = Math.min(HP_POTION_MAX_STACK, value);
  if (clamped !== value) {
    GameData[key] = clamped;
    GameData.save();
  }
});

function updateMonsterHP() {
  const ratio = data.hp > 0 ? (hp / data.hp) * 100 : 0;
  monsterHpFill.style.width = `${Math.max(0, Math.min(100, ratio))}%`;
  monsterHpText.innerText = `몬스터 HP ${hp} / ${data.hp}`;
}

function updatePlayerHP() {
  const maxHpForBattle =
    typeof GameData.getEffectiveMaxHp === 'function'
      ? GameData.getEffectiveMaxHp()
      : GameData.maxHp;
  const ratio = maxHpForBattle > 0 ? (GameData.currentHp / maxHpForBattle) * 100 : 0;
  playerHpFill.style.width = `${Math.max(0, Math.min(100, ratio))}%`;
  playerHpText.innerText = `유저 HP ${GameData.currentHp} / ${maxHpForBattle}`;

  const isLowHp = ratio <= LOW_HP_WARNING_RATIO;
  if (playerStatusEl) {
    playerStatusEl.classList.toggle('is-low-hp', isLowHp);
  }

  if (!playerDead && isLowHp && !lowHpWarned) {
    lowHpWarned = true;
    log.innerText = '⚠️ HP가 위험합니다! 회복 또는 보호권을 확인하세요.';
    if (typeof screenShake === 'function') {
      screenShake();
    }
  } else if (!isLowHp) {
    lowHpWarned = false;
  }

  refreshBattlePotionUI();
}

function getPotionCount(type) {
  const key = HP_POTION_KEY_MAP[type];
  if (!key) return 0;
  return Math.max(0, Math.floor(Number(GameData[key]) || 0));
}

function refreshBattlePotionUI() {
  const maxHpForBattle =
    typeof GameData.getEffectiveMaxHp === 'function'
      ? GameData.getEffectiveMaxHp()
      : GameData.maxHp;
  const hpIsFull = GameData.currentHp >= maxHpForBattle;
  const unavailable = playerDead || dead;

  const smallCount = getPotionCount('small');
  const mediumCount = getPotionCount('medium');
  const largeCount = getPotionCount('large');

  if (potionSmallCountEl) potionSmallCountEl.innerText = `x${smallCount}`;
  if (potionMediumCountEl) potionMediumCountEl.innerText = `x${mediumCount}`;
  if (potionLargeCountEl) potionLargeCountEl.innerText = `x${largeCount}`;

  if (potionSmallBtn) {
    potionSmallBtn.disabled = unavailable || hpIsFull || smallCount <= 0;
  }
  if (potionMediumBtn) {
    potionMediumBtn.disabled = unavailable || hpIsFull || mediumCount <= 0;
  }
  if (potionLargeBtn) {
    potionLargeBtn.disabled = unavailable || hpIsFull || largeCount <= 0;
  }
}

function useHpPotion(type) {
  const key = HP_POTION_KEY_MAP[type];
  const healRatio = Number(HP_POTION_HEAL_RATIO_MAP[type]);
  if (!key || !Number.isFinite(healRatio)) return;
  if (playerDead || dead) return;

  const currentCount = getPotionCount(type);
  if (currentCount <= 0) {
    refreshBattlePotionUI();
    return;
  }

  const maxHpForBattle =
    typeof GameData.getEffectiveMaxHp === 'function'
      ? GameData.getEffectiveMaxHp()
      : GameData.maxHp;
  if (GameData.currentHp >= maxHpForBattle) {
    log.innerText = 'HP가 이미 가득합니다.';
    refreshBattlePotionUI();
    return;
  }

  const healAmount = Math.max(1, Math.floor(maxHpForBattle * healRatio));
  const beforeHp = GameData.currentHp;
  GameData[key] = Math.max(0, currentCount - 1);
  GameData.heal(healAmount);
  const recovered = Math.max(0, GameData.currentHp - beforeHp);

  const labels = { small: 'HP 물약(소)', medium: 'HP 물약(중)', large: 'HP 물약(대)' };
  log.innerText = `${labels[type]} 사용! +${recovered} HP`;

  updatePlayerHP();
}

function hasBattleSessionActivity() {
  return (
    battleStats.playerAttackAttempts > 0 ||
    battleStats.damageTakenTotal > 0 ||
    battleStats.monsterKillCount > 0 ||
    battleStats.statusAppliedCount > 0 ||
    battleStats.statusBlockedCount > 0
  );
}

function persistBattleStatsSession() {
  if (battleSessionCommitted || !shouldPersistBattleStats) return;
  if (typeof GameData.addBattleStat !== 'function' || typeof GameData.addBattleDuration !== 'function') return;
  if (!hasBattleSessionActivity()) {
    battleSessionCommitted = true;
    return;
  }

  const statsKeys = Object.keys(battleStats).filter((key) => key !== 'startedAt');
  statsKeys.forEach((key) => {
    const value = Number(battleStats[key]) || 0;
    if (value > 0) {
      GameData.addBattleStat(key, value, false);
    }
  });

  GameData.addBattleCount(false);
  GameData.addBattleDuration(Date.now() - battleStats.startedAt, false);
  GameData.save();
  battleSessionCommitted = true;
}

function renderBattleStatsPanel() {
  // 전투 화면 실시간 통계 패널 제거: 통계 페이지에서 조회
}

function getStatusRemainingSec(effectState) {
  return Math.max(1, Math.ceil((effectState.expiresAt - Date.now()) / 1000));
}

function renderStatusEffects() {
  if (!playerStatusEffectsEl) return;

  const effectKeys = Object.keys(activeStatusEffects);
  if (!effectKeys.length) {
    playerStatusEffectsEl.innerHTML = '';
    playerStatusEffectsEl.style.display = 'none';
    return;
  }

  const sortedEffects = effectKeys.sort((a, b) => {
    const aBoss = BOSS_UNIQUE_STATUS_TYPES.has(a);
    const bBoss = BOSS_UNIQUE_STATUS_TYPES.has(b);
    if (aBoss !== bBoss) return aBoss ? -1 : 1;
    return a.localeCompare(b);
  });

  playerStatusEffectsEl.style.display = 'flex';
  playerStatusEffectsEl.innerHTML = sortedEffects
    .map((type) => {
      const def = STATUS_EFFECT_LIBRARY[type];
      const state = activeStatusEffects[type];
      if (!def || !state) return '';
      const sec = getStatusRemainingSec(state);
      const isBossUnique = BOSS_UNIQUE_STATUS_TYPES.has(type);
      const extraClass = isBossUnique ? ' status-boss-unique' : '';
      const prefix = isBossUnique ? '★ ' : '';
      return `<span class="status-chip status-${type}${extraClass}">${prefix}${def.label} ${sec}s</span>`;
    })
    .join('');
}

function clearAllStatusEffects() {
  Object.keys(activeStatusEffects).forEach((type) => {
    delete activeStatusEffects[type];
  });
  renderStatusEffects();
}

function applyStatusEffect(type) {
  const def = STATUS_EFFECT_LIBRARY[type];
  if (!def) return false;

  const now = Date.now();
  const current = activeStatusEffects[type];
  const potionKey = STATUS_NULLIFY_POTION_MAP[type];

  if (!current && potionKey && (GameData[potionKey] || 0) > 0) {
    GameData[potionKey]--;
    GameData.save();
    battleStats.statusBlockedCount++;
    battleStats.antidoteUsedCount++;
    renderBattleStatsPanel();
    return 'blocked';
  }

  if (current) {
    current.expiresAt = Math.max(current.expiresAt, now + def.durationMs);
    if (def.tickMs > 0 && !current.nextTickAt) {
      current.nextTickAt = now + def.tickMs;
    }
    renderStatusEffects();
    return 'refresh';
  } else {
    activeStatusEffects[type] = {
      appliedAt: now,
      expiresAt: now + def.durationMs,
      nextTickAt: def.tickMs > 0 ? now + def.tickMs : 0
    };

    // 일부 보스 고유 상태는 적용 시 추가 상태이상을 동시에 건다.
    if (Array.isArray(def.applyExtraStatuses)) {
      def.applyExtraStatuses.forEach((extraType) => {
        if (extraType !== type) {
          applyStatusEffect(extraType);
        }
      });
    }

    battleStats.statusAppliedCount++;
    renderBattleStatsPanel();
    renderStatusEffects();
    return 'new';
  }
}

function removeExpiredStatusEffects() {
  const now = Date.now();
  let changed = false;

  Object.keys(activeStatusEffects).forEach((type) => {
    const state = activeStatusEffects[type];
    if (!state) return;
    if (now >= state.expiresAt) {
      delete activeStatusEffects[type];
      changed = true;
    }
  });

  if (changed) {
    renderStatusEffects();
  }
}

function getIncomingDamageMultiplier() {
  let mult = 1;
  Object.keys(activeStatusEffects).forEach((type) => {
    const def = STATUS_EFFECT_LIBRARY[type];
    if (!def) return;
    if (Number.isFinite(def.incomingDamageMul)) {
      mult *= Math.max(0, Number(def.incomingDamageMul));
    }
  });
  return mult;
}

function getOutgoingDamageMultiplier() {
  let mult = 1;
  Object.keys(activeStatusEffects).forEach((type) => {
    const def = STATUS_EFFECT_LIBRARY[type];
    if (!def) return;
    if (Number.isFinite(def.outgoingDamageMul)) {
      mult *= Math.max(0, Number(def.outgoingDamageMul));
    }
  });
  return mult;
}

function getBlockingStatusInfo() {
  const blockingType = Object.keys(activeStatusEffects).find((type) => {
    const def = STATUS_EFFECT_LIBRARY[type];
    return !!def?.blockPlayerAttack;
  });
  if (!blockingType) return null;

  return {
    type: blockingType,
    def: STATUS_EFFECT_LIBRARY[blockingType],
    state: activeStatusEffects[blockingType]
  };
}

function getPlayerHitChance() {
  let chance = 1;
  Object.keys(activeStatusEffects).forEach((type) => {
    const def = STATUS_EFFECT_LIBRARY[type];
    if (!def) return;

    if (Number.isFinite(def.playerHitChance)) {
      chance *= clampChance(def.playerHitChance);
    }
    if (Number.isFinite(def.playerHitChanceMul)) {
      chance *= Math.max(0, Number(def.playerHitChanceMul));
    }
  });
  return clampChance(chance);
}

function applyBossRiftInverseDamage(baseDamage) {
  let damage = Math.max(0, Math.floor(baseDamage));
  let note = '';

  Object.keys(activeStatusEffects).forEach((type) => {
    const def = STATUS_EFFECT_LIBRARY[type];
    if (!def || !Number.isFinite(def.invertDamageChance)) return;

    const invertChance = clampChance(def.invertDamageChance);
    if (Math.random() >= invertChance) return;

    const zeroChance = clampChance(Number(def.invertDamageZeroChance) || 0.5);
    if (Math.random() < zeroChance) {
      damage = 0;
      note = `${def.label} 발동: 이번 공격 피해가 0이 됩니다.`;
    } else {
      damage = Math.max(1, Math.floor(damage * 2));
      note = `${def.label} 발동: 이번 공격 피해가 2배가 됩니다.`;
    }
  });

  return { damage, note };
}

function getMonsterHealFromPlayerAttack(playerDamage) {
  let totalRatio = 0;
  Object.keys(activeStatusEffects).forEach((type) => {
    const def = STATUS_EFFECT_LIBRARY[type];
    if (!def || !Number.isFinite(def.lifeStealToMonsterRatio)) return;
    totalRatio += Math.max(0, Number(def.lifeStealToMonsterRatio));
  });
  const ratio = Math.max(0, Math.min(0.95, totalRatio));
  return Math.max(0, Math.floor(playerDamage * ratio));
}

function getSelfDamageOnPlayerAttack() {
  let totalDamage = 0;
  Object.keys(activeStatusEffects).forEach((type) => {
    const def = STATUS_EFFECT_LIBRARY[type];
    if (!def) return;
    if (!Number.isFinite(def.selfDamageOnAttackChance) || !Number.isFinite(def.selfDamageOnAttackRatio)) return;

    if (Math.random() >= clampChance(def.selfDamageOnAttackChance)) return;
    const hpForStatus =
      typeof GameData.getEffectiveMaxHp === 'function' ? GameData.getEffectiveMaxHp() : GameData.maxHp;
    const ratioDmg = Math.floor(hpForStatus * Math.max(0, Number(def.selfDamageOnAttackRatio)));
    const minDmg = Math.max(1, Math.floor(Number(def.selfDamageOnAttackMin) || 1));
    totalDamage += Math.max(minDmg, ratioDmg);
  });
  return totalDamage;
}

function applyAttackDelayFromStatus() {
  let lockMs = 0;
  Object.keys(activeStatusEffects).forEach((type) => {
    const def = STATUS_EFFECT_LIBRARY[type];
    if (!def) return;
    if (!Number.isFinite(def.attackDelayChance) || !Number.isFinite(def.attackDelayMs)) return;

    if (Math.random() < clampChance(def.attackDelayChance)) {
      lockMs = Math.max(lockMs, Math.max(0, Math.floor(def.attackDelayMs)));
    }
  });

  if (lockMs > 0) {
    playerAttackLockUntil = Math.max(playerAttackLockUntil, Date.now() + lockMs);
  }
  return lockMs;
}

function getStatusTickDamage(type) {
  const def = STATUS_EFFECT_LIBRARY[type];
  if (!def) return 0;
  const hpForStatus =
    typeof GameData.getEffectiveMaxHp === 'function' ? GameData.getEffectiveMaxHp() : GameData.maxHp;
  const ratioDamage = Math.floor(hpForStatus * (def.damageRatio || 0));
  return Math.max(def.minDamage || 1, ratioDamage);
}

function applyDamageToPlayer(amount, reasonText, sourceType = 'hit') {
  if (playerDead) return false;
  const finalDamage = Math.max(1, Math.floor(amount));

  battleStats.damageTakenTotal += finalDamage;
  if (sourceType === 'dot') {
    battleStats.damageTakenByDot += finalDamage;
    battleStats.dotHitCount++;
  } else {
    battleStats.damageTakenByHit += finalDamage;
    battleStats.monsterHitCount++;
  }
  renderBattleStatsPanel();

  GameData.takeDamage(finalDamage);
  updatePlayerHP();

  if (GameData.isDead()) {
    if (tryUseProtectTicket()) {
      if (reasonText) {
        log.innerText = `${reasonText} -${finalDamage} HP (보호권 발동)`;
      }
      return false;
    }
    handlePlayerDefeat();
    return true;
  }

  if (reasonText) {
    log.innerText = `${reasonText} -${finalDamage} HP`;
  }
  return false;
}

function processStatusEffectTicks() {
  if (playerDead) return;

  const now = Date.now();
  for (const type of Object.keys(activeStatusEffects)) {
    const state = activeStatusEffects[type];
    const def = STATUS_EFFECT_LIBRARY[type];
    if (!state || !def || !def.tickMs) continue;

    if (now < state.nextTickAt) continue;

    const tickDamage = getStatusTickDamage(type);
    while (state.nextTickAt <= now) {
      state.nextTickAt += def.tickMs;
    }

    const died = applyDamageToPlayer(tickDamage, `${def.label} 지속 피해`, 'dot');
    if (died) return;
  }

  removeExpiredStatusEffects();
  renderStatusEffects();
}

function stopStatusEffectLoop() {
  if (!statusEffectTimer) return;
  clearInterval(statusEffectTimer);
  statusEffectTimer = null;
}

function startStatusEffectLoop() {
  stopStatusEffectLoop();
  statusEffectTimer = setInterval(processStatusEffectTicks, 250);
}

function rollEffectsByChance(effectEntries) {
  const rolled = [];
  (effectEntries || []).forEach((entry) => {
    const type = entry.type;
    const chance = clampChance(entry.chance);
    if (!STATUS_EFFECT_LIBRARY[type]) return;
    if (Math.random() < chance) {
      rolled.push(type);
    }
  });
  return rolled;
}

function buildBossPatternAttack() {
  const hasBossPatterns = Array.isArray(stageBossPatterns) && stageBossPatterns.length > 0;
  const hasNormalPatterns = Array.isArray(stageNormalPatterns) && stageNormalPatterns.length > 0;

  if (!hasBossPatterns && !hasNormalPatterns) {
    return {
      attackName: '기본 공격',
      damageMul: 1,
      statusEffects: []
    };
  }

  const sourcePatterns = hasBossPatterns ? stageBossPatterns : stageNormalPatterns;
  const chosen = pickWeightedPattern(sourcePatterns);
  return {
    attackName: chosen.name || (hasBossPatterns ? '보스 패턴' : '특수 기술'),
    damageMul: Number(chosen.damageMul) || 1,
    statusEffects: rollEffectsByChance(chosen.effects)
  };
}

function getBossPatternVisualClass(attackPlan) {
  const effects = attackPlan.statusEffects || [];
  if (effects.some((type) => BOSS_UNIQUE_STATUS_TYPES.has(type))) return 'pattern-fx-unique';
  if (effects.includes('timeStop')) return 'pattern-fx-time-stop';
  if (effects.includes('chaos')) return 'pattern-fx-chaos';
  if (effects.includes('heavy')) return 'pattern-fx-heavy';
  if (effects.includes('burn')) return 'pattern-fx-burn';
  if (effects.includes('shock')) return 'pattern-fx-shock';
  if (effects.includes('frost')) return 'pattern-fx-frost';
  if (effects.includes('poison')) return 'pattern-fx-poison';
  if (effects.includes('bleed')) return 'pattern-fx-bleed';
  if ((Number(attackPlan.damageMul) || 1) >= 1.8) return 'pattern-fx-heavy';
  return 'pattern-fx-basic';
}

function clearBossPatternEffectVisual() {
  const classes = [
    'pattern-fx-active',
    'pattern-fx-basic',
    'pattern-fx-unique',
    'pattern-fx-heavy',
    'pattern-fx-poison',
    'pattern-fx-bleed',
    'pattern-fx-burn',
    'pattern-fx-shock',
    'pattern-fx-frost',
    'pattern-fx-time-stop',
    'pattern-fx-chaos'
  ];
  stageEl.classList.remove(...classes);
  img.classList.remove('boss-strike');
  patternFxTextEl.classList.remove('show');
  patternFxTextEl.innerText = '';
  if (patternEffectTimer) {
    clearTimeout(patternEffectTimer);
    patternEffectTimer = null;
  }
}

function playBossPatternEffect(attackPlan) {
  const hasBossPatterns = Array.isArray(stageBossPatterns) && stageBossPatterns.length > 0;
  const hasNormalPatterns = Array.isArray(stageNormalPatterns) && stageNormalPatterns.length > 0;
  if ((!hasBossPatterns && !hasNormalPatterns) || !attackPlan) return;

  clearBossPatternEffectVisual();

  const visualClass = getBossPatternVisualClass(attackPlan);
  stageEl.classList.add('pattern-fx-active', visualClass);
  img.classList.add('boss-strike');

  patternFxTextEl.innerText = `⚠ ${attackPlan.attackName}`;
  void patternFxTextEl.offsetWidth;
  patternFxTextEl.classList.add('show');

  patternEffectTimer = setTimeout(() => {
    clearBossPatternEffectVisual();
  }, 700);
}

function applyMonsterStatusEffects(effectTypes) {
  if (!Array.isArray(effectTypes) || effectTypes.length === 0) {
    return { applied: [], blocked: [] };
  }

  const unique = Array.from(new Set(effectTypes));
  const applied = [];
  const blocked = [];
  unique.forEach((type) => {
    const result = applyStatusEffect(type);
    if (result === 'new') {
      applied.push(STATUS_EFFECT_LIBRARY[type].label);
    } else if (result === 'blocked') {
      blocked.push(STATUS_EFFECT_LIBRARY[type].label);
    }
  });
  return { applied, blocked };
}

function tryUseProtectTicket() {
  if (!(GameData.protectActive && GameData.protectTicket > 0)) return false;

  const maxHpForBattle =
    typeof GameData.getEffectiveMaxHp === 'function' ? GameData.getEffectiveMaxHp() : GameData.maxHp;
  const recoverHp = Math.max(1, Math.floor(maxHpForBattle / 4));
  GameData.protectTicket = 0;
  GameData.protectActive = false;
  GameData.currentHp = recoverHp;
  GameData.save();
  updatePlayerHP();

  log.innerText = `🛡️ 보호권 발동! HP ${recoverHp}로 복귀했습니다.`;
  return true;
}

function handlePlayerDefeat() {
  if (playerDead) return;
  playerDead = true;
  dead = true;
  shouldPersistBattleStats = false;
  battleSessionCommitted = true;
  img.style.pointerEvents = 'none';
  stopMonsterAutoAttack();
  stopStatusEffectLoop();
  clearBossPatternEffectVisual();
  clearAllStatusEffects();
  log.innerText = '사망했습니다. 데이터를 초기화합니다...';

  setTimeout(() => {
    if (typeof GameData.resetAllProgress === 'function') {
      GameData.resetAllProgress();
    }
    alert('유저가 사망하여 강화/골드/인벤토리/업적이 초기화되었습니다.');
    location.href = 'index.html';
  }, 600);
}

function runMonsterAutoAttack() {
  if (dead || playerDead || hp === 0) return;

  const attackPlan = buildBossPatternAttack();
  playBossPatternEffect(attackPlan);
  const stageRolledEffects = rollEffectsByChance(stageStatusEffectPool);
  const incomingMult = getIncomingDamageMultiplier();
  const finalDamage = Math.max(
    1,
    Math.floor(monsterAttackDamage * attackPlan.damageMul * incomingMult)
  );

  const died = applyDamageToPlayer(
    finalDamage,
    `${data.name}의 ${attackPlan.attackName}`,
    'hit'
  );
  if (died) return;

  const statusResult = applyMonsterStatusEffects([
    ...attackPlan.statusEffects,
    ...stageRolledEffects
  ]);

  const messageParts = [`${data.name}의 ${attackPlan.attackName}! -${finalDamage} HP`];
  if (statusResult.applied.length > 0) {
    messageParts.push(`상태이상: ${statusResult.applied.join(', ')}`);
  }
  if (statusResult.blocked.length > 0) {
    messageParts.push(`무효화: ${statusResult.blocked.join(', ')}`);
  }
  log.innerText = messageParts.join(' | ');
}

function stopMonsterAutoAttack() {
  if (!monsterAttackTimer) return;
  clearInterval(monsterAttackTimer);
  monsterAttackTimer = null;
}

function startMonsterAutoAttack() {
  stopMonsterAutoAttack();
  monsterAttackTimer = setInterval(runMonsterAutoAttack, monsterAttackIntervalMs);
}

function tryDropRiftItem() {
  if (area !== 'rift') return null;
  if (!data.drop || !data.dropRate) return null;

  if (Math.random() >= data.dropRate) return null;

  if (data.drop === 'dice') {
    GameData.fateDiceTicket++;
    return '🎲 운명의 주사위';
  }
  if (data.drop === 'dual') {
    GameData.dualSealTicket++;
    return '🌓 양면의 인장';
  }
  if (data.drop === 'scale') {
    GameData.fateScaleTicket++;
    return '⚖️ 운명의 저울';
  }
  if (data.drop === 'chaos') {
    GameData.chaosSealTicket++;
    return '🌀 카오스 인장';
  }
  return null;
}

function tryDropEquipmentAndRuneItems() {
  if (!window.DropTables || !window.ItemDefs) return [];
  if (typeof GameData.addLootItem !== 'function') return [];

  const droppedIds = DropTables.rollStageDrops({
    world,
    area,
    stageId,
    isBoss: !!stageBossPatterns
  });
  if (!Array.isArray(droppedIds) || droppedIds.length === 0) return [];

  const droppedNames = [];
  droppedIds.forEach((itemId) => {
    const itemDef = ItemDefs.getById(itemId);
    if (!itemDef) return;
    GameData.addLootItem(itemId, 1, false);
    droppedNames.push(itemDef.name);
  });
  return droppedNames;
}

/* =========================
   공격 처리
========================= */
img.onclick = () => {
  if (dead || playerDead) return;
  battleStats.playerAttackAttempts++;

  const now = Date.now();
  if (now < playerAttackLockUntil) {
    const remainSec = Math.max(1, Math.ceil((playerAttackLockUntil - now) / 1000));
    log.innerText = `⚡ 상태이상 영향으로 ${remainSec}초 동안 공격이 지연됩니다.`;
    return;
  }

  const blockingStatus = getBlockingStatusInfo();
  if (blockingStatus) {
    battleStats.playerAttackBlockedByTimeStop++;
    renderBattleStatsPanel();
    const remainSec = blockingStatus.state
      ? getStatusRemainingSec(blockingStatus.state)
      : Math.max(1, Math.ceil((Number(blockingStatus.def?.durationMs) || 0) / 1000));
    log.innerText = `⏳ ${blockingStatus.def.label} 상태입니다. ${remainSec}초 동안 공격할 수 없습니다.`;
    if (typeof screenShake === 'function') {
      screenShake();
    }
    return;
  }

  if (Math.random() > getPlayerHitChance()) {
    battleStats.playerAttackMisses++;
    renderBattleStatsPanel();
    img.classList.add('hit');
    setTimeout(() => img.classList.remove('hit'), 120);
    log.innerText = '🌀 상태이상 영향으로 공격이 빗나갔습니다.';
    return;
  }

  battleStats.playerAttackHits++;
  renderBattleStatsPanel();

  const basePlayerDamage = Math.max(
    1,
    Math.floor(GameData.getCurrentDamage() * getOutgoingDamageMultiplier())
  );
  const variedDamage = applyBossRiftInverseDamage(basePlayerDamage);
  const playerDamage = Math.max(0, Math.floor(variedDamage.damage));

  hp -= playerDamage;
  if (hp < 0) hp = 0;
  const monsterHeal = hp > 0 ? getMonsterHealFromPlayerAttack(playerDamage) : 0;
  if (monsterHeal > 0) {
    hp = Math.min(data.hp, hp + monsterHeal);
  }
  updateMonsterHP();

  img.classList.add('hit');
  setTimeout(() => img.classList.remove('hit'), 120);

  const selfDamage = getSelfDamageOnPlayerAttack();
  if (selfDamage > 0) {
    const diedBySelfDamage = applyDamageToPlayer(selfDamage, '망자의 굴레 반동', 'dot');
    if (diedBySelfDamage) return;
  }

  const lockMs = applyAttackDelayFromStatus();

  if (hp === 0) {
    dead = true;
    battleStats.monsterKillCount++;
    renderBattleStatsPanel();
    clearBossPatternEffectVisual();

    img.style.pointerEvents = 'none';
    img.style.opacity = '0.3';

    const earned = GameData.earnGold(data.gold);
    goldText.innerText = `💰 ${GameData.gold}`;

    // ✅ 킬 카운트 누적
    GameData.killStats[data.achId] = (GameData.killStats[data.achId] || 0) + 1;

    // ✅ 월드3 보스 보상
    if (typeof GameData.onBossKilled === 'function') {
      GameData.onBossKilled(data.achId);
    }

    // ✅ 운명의 균열 드랍
    const dropName = tryDropRiftItem();
    const battleLootNames = tryDropEquipmentAndRuneItems();

    GameData.save();
    if (window.Achievement) Achievement.checkAll();

    const rewardParts = [`${data.name} 처치! +${earned}G`];
    if (dropName) rewardParts.push(`🎁 ${dropName}`);
    if (battleLootNames.length > 0) {
      rewardParts.push(`장비/룬 드랍: ${battleLootNames.join(', ')}`);
    }
    log.innerText = rewardParts.join(' | ');
    if (variedDamage.note) {
      log.innerText += ` | ${variedDamage.note}`;
    }

    setTimeout(() => {
      hp = data.hp;
      updateMonsterHP();
      dead = false;

      img.style.opacity = '1';
      img.style.pointerEvents = 'auto';

      log.innerText = `${data.name} 등장!`;
    }, 1200);
    return;
  }

  const messageParts = [`${data.name}에게 ${playerDamage} 피해`];
  if (monsterHeal > 0) {
    messageParts.push(`보스 흡혈 +${monsterHeal} HP`);
  }
  if (selfDamage > 0) {
    messageParts.push(`반동 -${selfDamage} HP`);
  }
  if (lockMs > 0) {
    messageParts.push(`행동 지연 ${Math.max(1, Math.ceil(lockMs / 1000))}초`);
  }
  if (variedDamage.note) {
    messageParts.push(variedDamage.note);
  }
  log.innerText = messageParts.join(' | ');
};


/* =========================
   🎨 몬스터 & 배경 표시 (🔥 핵심)
========================= */
const monsterImg = document.getElementById('monster-img');
const stageBg = document.getElementById('stage-bg');

function renderStage() {

  /* 몬스터 이미지 */
  if (monsterImg && data.monster) {
    monsterImg.src = `img/monsters/${data.monster}`;
  }

  /* 배경 */
  if (stageBg) {
    if (data.bg) {
      stageBg.style.backgroundImage = `url(img/bg/${data.bg})`;
    } else {
      // 기본 배경 (area 기준)
      stageBg.style.backgroundImage = `url(img/bg/${area}.png)`;
    }
  }
}

renderStage();
updateMonsterHP();
updatePlayerHP();
renderStatusEffects();
startMonsterAutoAttack();
startStatusEffectLoop();

window.addEventListener('beforeunload', () => {
  persistBattleStatsSession();
  stopMonsterAutoAttack();
  stopStatusEffectLoop();
  clearBossPatternEffectVisual();
});
