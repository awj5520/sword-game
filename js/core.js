// js/core.js
const GameData = {
    level: Number(localStorage.getItem('level')) || 0,
    damage: Number(localStorage.getItem('damage')) || 10,

    getSuccessRate() {
        return Math.max(100 - this.level * 5, 10);
    },

    upgrade() {
        const success = Math.random() * 100 < this.getSuccessRate();
        if (success) {
            this.level++;
            this.damage += 5;
            this.save();
        }
        return success;
    },

    save() {
        localStorage.setItem('level', this.level);
        localStorage.setItem('damage', this.damage);
    }
};
