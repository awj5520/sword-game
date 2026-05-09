/* =============================================
   DAILY-QUEST.JS — 일일 퀘스트 모듈
   ============================================= */
window.DailyQuest = (function () {

  /* ── 퀘스트 풀 ── */
  const QUEST_POOL = [
    { id: 'kill_10',      type: 'kills',           target: 10,  label: '몬스터 10마리 처치',  gold: 2000,  potion: null },
    { id: 'kill_30',      type: 'kills',           target: 30,  label: '몬스터 30마리 처치',  gold: 7000,  potion: null },
    { id: 'kill_80',      type: 'kills',           target: 80,  label: '몬스터 80마리 처치',  gold: 22000, potion: { type: 'hpPotionSmall', count: 1 } },
    { id: 'enhance_5',   type: 'enhance_attempt', target: 5,   label: '강화 5회 시도',        gold: 3000,  potion: null },
    { id: 'enhance_15',  type: 'enhance_attempt', target: 15,  label: '강화 15회 시도',       gold: 10000, potion: null },
    { id: 'success_3',   type: 'enhance_success', target: 3,   label: '강화 3회 성공',        gold: 5000,  potion: { type: 'hpPotionSmall', count: 2 } },
    { id: 'success_7',   type: 'enhance_success', target: 7,   label: '강화 7회 성공',        gold: 15000, potion: { type: 'hpPotionMedium', count: 1 } },
    { id: 'dungeon_3',   type: 'dungeon_wave',    target: 3,   label: '던전 3층 클리어',      gold: 8000,  potion: null },
    { id: 'dungeon_7',   type: 'dungeon_wave',    target: 7,   label: '던전 7층 클리어',      gold: 22000, potion: { type: 'hpPotionSmall', count: 1 } },
    { id: 'dungeon_full',type: 'dungeon_wave',    target: 10,  label: '던전 전 층 클리어',    gold: 55000, potion: { type: 'hpPotionLarge', count: 1 } },
  ];

  const STORAGE_KEY = 'dailyQuestState';

  /* ── 날짜 문자열 (YYYY-MM-DD) ── */
  function todayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /* ── 그룹별 랜덤 1개씩 뽑기 ── */
  function pickQuests() {
    const killPool    = QUEST_POOL.filter(q => q.type === 'kills');
    const enhPool     = QUEST_POOL.filter(q => q.type === 'enhance_attempt' || q.type === 'enhance_success');
    const dungPool    = QUEST_POOL.filter(q => q.type === 'dungeon_wave');

    function pick(arr) {
      return { ...arr[Math.floor(Math.random() * arr.length)], progress: 0, claimed: false };
    }

    return [pick(killPool), pick(enhPool), pick(dungPool)];
  }

  /* ── 저장 ── */
  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (window.GameData) {
        GameData.dailyQuestState = state;
      }
    } catch (e) {
      // ignore
    }
  }

  /* ── 상태 로드 or 초기화 ── */
  function loadOrInit() {
    let state = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) {
      state = null;
    }

    const today = todayStr();

    if (!state || state.date !== today) {
      state = {
        date: today,
        quests: pickQuests(),
        kills: 0,
        enhanceAttempts: 0,
        enhanceSuccesses: 0,
        dungeonWaves: 0,
      };
      save(state);
    }

    return state;
  }

  let _state = loadOrInit();

  /* ── 진행도 계산 ── */
  function computeProgress(q) {
    switch (q.type) {
      case 'kills':           return _state.kills;
      case 'enhance_attempt': return _state.enhanceAttempts;
      case 'enhance_success': return _state.enhanceSuccesses;
      case 'dungeon_wave':    return _state.dungeonWaves;
      default:                return 0;
    }
  }

  /* ── 날짜 체크 (매번 호출 시) ── */
  function checkDate() {
    if (_state.date !== todayStr()) {
      _state = loadOrInit();
    }
  }

  /* ── 공개 API ── */

  function trackKill() {
    checkDate();
    _state.kills++;
    save(_state);
  }

  function trackEnhance(success) {
    checkDate();
    _state.enhanceAttempts++;
    if (success) _state.enhanceSuccesses++;
    save(_state);
  }

  function trackDungeonWave(waveNum) {
    checkDate();
    _state.dungeonWaves = Math.max(_state.dungeonWaves, waveNum);
    save(_state);
  }

  function claimQuest(idx) {
    checkDate();
    const q = _state.quests[idx];
    if (!q) return false;

    const progress = computeProgress(q);
    if (progress < q.target) return false;
    if (q.claimed) return false;

    // 보상 지급
    if (window.GameData) {
      GameData.earnGold(q.gold);
      if (q.potion) {
        const key = q.potion.type;
        GameData[key] = (Number(GameData[key]) || 0) + q.potion.count;
      }
      GameData.save();
    }

    q.claimed = true;
    save(_state);
    return true;
  }

  function getState() {
    checkDate();
    // progress 최신화
    _state.quests.forEach(q => {
      q.progress = Math.min(computeProgress(q), q.target);
    });
    return _state;
  }

  return { trackKill, trackEnhance, trackDungeonWave, claimQuest, getState };

})();
