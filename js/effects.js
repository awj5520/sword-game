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
