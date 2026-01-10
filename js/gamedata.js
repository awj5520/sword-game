const GameData = {
    level: Number(localStorage.getItem('level')) || 0,
    damage: Number(localStorage.getItem('damage')) || 10,
    gold: Number(localStorage.getItem('gold')) || 0,

    save() {
        localStorage.setItem('level', this.level);
        localStorage.setItem('damage', this.damage);
        localStorage.setItem('gold', this.gold);
    },

    getUpgradeCost() {
        return 50 + this.level * 30;
    },

    // 강화 확률 올린 상태임
    getSuccessRate() {
        // return Math.max(100 - this.level * 5, 10);
        return Math.max(100, 10);
    },

    upgrade() {
        const cost = this.getUpgradeCost();
        if (this.gold < cost) return 'nogold';

        this.gold -= cost;

        const success = Math.random() * 100 < this.getSuccessRate();
        if (success) {
            this.level++;
            this.damage += 5;
        }

        this.save();
        return success;
    },

    earnGold(amount) {
        this.gold += amount;
        this.save();
    }
};
