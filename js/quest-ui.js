/* =============================================
   QUEST-UI.JS — 일일 퀘스트 UI (quest.html 전용)
   ============================================= */

function fmt(n) {
  return (typeof fmtNum === 'function') ? fmtNum(n) : Number(n).toLocaleString('ko-KR');
}

function potionLabel(potion) {
  if (!potion) return '';
  const names = {
    hpPotionSmall:  'HP 포션(소)',
    hpPotionMedium: 'HP 포션(중)',
    hpPotionLarge:  'HP 포션(대)',
  };
  const name = names[potion.type] || potion.type;
  return ` + ${name} ×${potion.count}`;
}

function renderQuests() {
  const state = DailyQuest.getState();
  const list = document.getElementById('quest-list');
  if (!list) return;

  list.innerHTML = '';

  state.quests.forEach((q, idx) => {
    const progress = Math.min(q.progress, q.target);
    const done = progress >= q.target;
    const pct = Math.floor((progress / q.target) * 100);

    const card = document.createElement('div');
    card.className = 'quest-card' + (done && !q.claimed ? ' done' : '') + (q.claimed ? ' claimed' : '');

    let btnHTML;
    if (q.claimed) {
      btnHTML = `<div class="claim-done">✅ 수령 완료</div>`;
    } else if (done) {
      btnHTML = `<button class="claim-btn active" onclick="handleClaim(${idx})">🎁 보상 수령</button>`;
    } else {
      btnHTML = `<button class="claim-btn" disabled>🔒 미완료</button>`;
    }

    card.innerHTML = `
      <div class="quest-label">${q.label}</div>
      <div class="quest-reward">💰 ${fmt(q.gold)}${potionLabel(q.potion)}</div>
      <div class="quest-progress-bar-wrap">
        <div class="quest-progress-bar">
          <div class="quest-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="quest-progress-text">${progress} / ${q.target}</div>
      </div>
      ${btnHTML}
    `;

    list.appendChild(card);
  });
}

function handleClaim(idx) {
  const ok = DailyQuest.claimQuest(idx);
  if (ok) {
    renderQuests();
  }
}

/* ── 리셋 타이머 ── */
function updateTimer() {
  const el = document.getElementById('quest-reset-timer');
  if (!el) return;

  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const diff = next - now;

  const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

  el.textContent = `리셋까지 ${h}:${m}:${s}`;
}

/* ── 초기화 ── */
renderQuests();
updateTimer();
setInterval(updateTimer, 1000);
