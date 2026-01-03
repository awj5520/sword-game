// js/effects.js
const Effects = {
  // 파편 생성 (실패/처치 등에 사용 가능)
  createShatter(targetElement) {
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const particleCount = 16;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement("div");
      p.className = "particle";

      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 90;
      const x = Math.cos(angle) * dist + "px";
      const y = Math.sin(angle) * dist + "px";
      const r = (Math.random() * 720) + "deg";

      p.style.left = centerX + "px";
      p.style.top = centerY + "px";
      p.style.setProperty("--x", x);
      p.style.setProperty("--y", y);
      p.style.setProperty("--r", r);
      p.style.animation = "shatter 0.6s ease-out forwards";

      document.body.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    }
  }
};

// ✅ 오디오: 브라우저 자동재생 제한 때문에 "클릭 순간" ctx resume 필요
const Sound = {
  ctx: null,

  ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  // 성공 = 피치가 쭉 올라가는 느낌 / 실패 = 툭 떨어지는 느낌
  playUpgrade(success) {
    try {
      this.ensure();

      const t0 = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";

      // 볼륨 엔벨롭(팍! 하고 사라지게)
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45);

      // 피치(주파수) 엔벨롭
      if (success) {
        // “음악 올라가는 느낌” : 260 -> 980 부드럽게 상승
        osc.frequency.setValueAtTime(260, t0);
        osc.frequency.exponentialRampToValueAtTime(980, t0 + 0.42);
      } else {
        // 실패는 살짝 내려가게
        osc.frequency.setValueAtTime(280, t0);
        osc.frequency.exponentialRampToValueAtTime(160, t0 + 0.22);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t0);
      osc.stop(t0 + 0.48);
    } catch (e) {
      // 오디오 막혀도 게임은 돌아가게 무시
      console.warn("Sound error:", e);
    }
  }
};
