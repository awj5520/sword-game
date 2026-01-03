// [js/core.js]

const GameData = {
    level: 0,
    gold: 1000, // 시작 골드
    minSuccessRate: 5,
    
    // 레벨별 강화 비용 계산 (예: 레벨이 높을수록 비싸짐)
    getUpgradeCost: function() {
        return (this.level + 1) * 100;
    },

    getSwordName: function() {
        if (this.level >= 30) return "🌌 신을 멸하는 신검";
        if (this.level >= 20) return "🔥 드래곤 슬레이어";
        if (this.level >= 10) return "✨ 빛나는 명검";
        return "🪵 연습용 목검";
    },

    getSuccessRate: function() {
        return Math.max(100 - (this.level * 3), this.minSuccessRate);
    },

    // 골드 획득 (사냥)
    hunt: function() {
        const earned = Math.floor(Math.random() * 100) + 50; // 50~150 골드 랜덤 획득
        this.gold += earned;
        return earned;
    },

    tryUpgrade: function() {
        const cost = this.getUpgradeCost();

        // 골드 부족 체크
        if (this.gold < cost) {
            return { success: false, msg: "골드가 부족합니다!", error: "LACK_GOLD" };
        }

        this.gold -= cost; // 비용 차감
        const rate = this.getSuccessRate();
        const isSuccess = Math.random() * 100 < rate;

        if (isSuccess) {
            this.level++;
            return { success: true, msg: "강화 성공! ✨" };
        } else {
            if (this.level >= 5) {
                this.level = 0;
                return { success: false, msg: "파괴되었습니다! 😱" };
            }
            return { success: false, msg: "강화 실패..." };
        }
    }
};