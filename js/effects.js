function screenShake() {
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 300);
}

const Sound = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),

    playUpgrade(success) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);

        if (success) {
            osc.frequency.exponentialRampToValueAtTime(
                1000,
                this.ctx.currentTime + 0.4
            );
        }

        osc.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }
};

/* ── 폭죽 이펙트 (강화 성공) ── */
function fireEffect(target) {
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;

    const COLORS = ['#f0c000','#ffd84d','#ff5500','#00cc88','#4488ff','#cc44ff','#ff4488','#ffffff'];

    // 폭죽 발사체 3발 — 약간 다른 위치에서 터짐
    const bursts = [
        { ox: 0,   oy: 0,   delay: 0   },
        { ox: -30, oy: -20, delay: 80  },
        { ox:  30, oy: -10, delay: 140 },
    ];

    bursts.forEach(({ ox, oy, delay }) => {
        setTimeout(() => {
            const count = 14 + Math.floor(Math.random() * 8);
            for (let i = 0; i < count; i++) {
                const p = document.createElement('div');
                p.className = 'firework-particle';

                const angle    = (i / count) * Math.PI * 2 + Math.random() * 0.4;
                const speed    = 55 + Math.random() * 55;
                const gravity  = 80 + Math.random() * 60;   // 아래로 끌리는 거리
                const color    = COLORS[Math.floor(Math.random() * COLORS.length)];
                const size     = 4 + Math.random() * 5;
                const duration = 550 + Math.random() * 250;

                p.style.cssText = `
                    left:${cx + ox}px; top:${cy + oy}px;
                    width:${size}px; height:${size}px;
                    background:${color};
                    --vx:${Math.cos(angle) * speed}px;
                    --vy:${Math.sin(angle) * speed}px;
                    --gravity:${gravity}px;
                    animation-duration:${duration}ms;
                `;

                document.body.appendChild(p);
                setTimeout(() => p.remove(), duration + 50);
            }
        }, delay);
    });
}

/* ── 칼 파편 이펙트 (강화 실패) ── */
function shatterEffect(target) {
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;

    const SHARD_COLORS = ['#aaaaaa','#888888','#cccccc','#ff4444','#cc2222','#666666'];

    const count = 16;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'shard-particle';

        // 파편은 길쭉한 모양, 각도가 제각각
        const angle   = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
        const speed   = 40 + Math.random() * 60;
        const spin    = (Math.random() - 0.5) * 720;   // 회전 각도(deg)
        const w       = 3 + Math.random() * 4;
        const h       = 8 + Math.random() * 14;         // 길쭉하게
        const color   = SHARD_COLORS[Math.floor(Math.random() * SHARD_COLORS.length)];
        const duration = 500 + Math.random() * 300;
        const gravity  = 90 + Math.random() * 70;

        p.style.cssText = `
            left:${cx}px; top:${cy}px;
            width:${w}px; height:${h}px;
            background:${color};
            --vx:${Math.cos(angle) * speed}px;
            --vy:${Math.sin(angle) * speed}px;
            --spin:${spin}deg;
            --gravity:${gravity}px;
            animation-duration:${duration}ms;
        `;

        document.body.appendChild(p);
        setTimeout(() => p.remove(), duration + 50);
    }
}

