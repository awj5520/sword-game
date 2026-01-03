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

function fireEffect(target) {
    const rect = target.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'fire-particle';

        // 방향 랜덤
        const angle = Math.random() * Math.PI * 2;
        const distance = 60 + Math.random() * 40;

        p.style.left = `${centerX}px`;
        p.style.top = `${centerY}px`;
        p.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
        p.style.setProperty('--y', `${Math.sin(angle) * distance}px`);

        document.body.appendChild(p);

        setTimeout(() => p.remove(), 600);
    }
}

