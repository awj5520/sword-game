// js/core.js
const GameData = {
  level: 0,
  damage: 10,

  monster: {
    name: "슬라임",
    maxHP: 100,
    hp: 100,
    // 너가 이미지 넣으면 여기만 바꾸면 됨
    img: "images/monsters/slime.png"
  },

  // 레벨 오를수록 확률 떨어지게 (최저 10%)
  getSuccessRate() {
    return Math.max(100 - this.level * 5, 10);
  },

  // 성공 시 레벨 +1, 공격력 증가
  upgrade() {
    const rate = this.getSuccessRate();
    const success = Math.random() * 100 < rate;

    if (success) {
      this.level += 1;
      this.damage += 5;
    }
    return success;
  },

  // 공격: 데미지 만큼 몬스터 HP 감소
  attackMonster() {
    this.monster.hp -= this.damage;

    if (this.monster.hp <= 0) {
      this.monster.hp = 0;
      return true; // 처치
    }
    return false;
  },

  // 몬스터 리스폰(간단 버전)
  respawnMonster() {
    this.monster.hp = this.monster.maxHP;
  }
};
