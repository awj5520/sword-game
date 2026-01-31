const GameData = {
  level: Number(localStorage.getItem('level')) || 0,
  damage: Number(localStorage.getItem('damage')) || 10,
  gold: Number(localStorage.getItem('gold')) || 0,

  damageBuffUntil: Number(localStorage.getItem('damageBuffUntil')) || 0,
  goldBuffUntil: Number(localStorage.getItem('goldBuffUntil')) || 0,

  noDropTicket: Number(localStorage.getItem('noDropTicket')) || 0,
  guaranteeTicket: Number(localStorage.getItem('guaranteeTicket')) || 0,

  noDropActive: localStorage.getItem('noDropActive') === 'true',
  guaranteeActive: localStorage.getItem('guaranteeActive') === 'true',

  // =========================
  // 공용 유틸
  // =========================
  now() {
    return Date.now();
  },

  syncFromStorage() {
    // 다른 화면에서 값이 바뀌었을 수도 있으니 필요할 때 갱신
    this.level = Number(localStorage.getItem('level')) || 0;
    this.damage = Number(localStorage.getItem('damage')) || 10;
    this.gold = Number(localStorage.getItem('gold')) || 0;

    this.damageBuffUntil = Number(localStorage.getItem('damageBuffUntil')) || 0;
    this.goldBuffUntil = Number(localStorage.getItem('goldBuffUntil')) || 0;

    this.noDropTicket = Number(localStorage.getItem('noDropTicket')) || 0;
    this.guaranteeTicket = Number(localStorage.getItem('guaranteeTicket')) || 0;

    this.noDropActive = localStorage.getItem('noDropActive') === 'true';
    this.guaranteeActive = localStorage.getItem('guaranteeActive') === 'true';
  },

  save() {
    localStorage.setItem('level', this.level);
    localStorage.setItem('damage', this.damage);
    localStorage.setItem('gold', this.gold);

    localStorage.setItem('damageBuffUntil', this.damageBuffUntil);
    localStorage.setItem('goldBuffUntil', this.goldBuffUntil);

    localStorage.setItem('noDropTicket', this.noDropTicket);
    localStorage.setItem('guaranteeTicket', this.guaranteeTicket);

    localStorage.setItem('noDropActive', this.noDropActive);
    localStorage.setItem('guaranteeActive', this.guaranteeActive);
  },

  // =========================
  // ✅ 여기부터 “없어서 터지던” 함수들
  // =========================

  // 아까 문제났던 getCurrentDamage()를 정식으로
  getCurrentDamage() {
    // 혹시 다른 페이지에서 강화가 됐으면 반영되게
    // (원치 않으면 이 줄 빼도 됨)
    // this.syncFromStorage();

    let dmg = Number(this.damage) || 0;

    // (선택) 데미지 버프 적용
    if (this.damageBuffUntil > this.now()) {
      dmg = Math.floor(dmg * 1.5); // 예: 50% 증가
    }
    return dmg;
  },

  // earnGold 없어서 터졌던 부분 해결
  earnGold(amount) {
    // this.syncFromStorage(); // 필요하면 켜기
    let g = Number(this.gold) || 0;

    let gain = Number(amount) || 0;

    // (선택) 골드 버프 적용
    if (this.goldBuffUntil > this.now()) {
      gain = Math.floor(gain * 1.5); // 예: 50% 증가
    }

    g += gain;
    this.gold = g;
    this.save();
    return gain; // 실제로 얻은 골드 반환
  },

  // =========================
  // 강화 로직
  // =========================
  getSuccessRate() {
    if (this.guaranteeActive) return 100;

    if (this.level < 10) return 100;
    if (this.level < 30) return Math.max(95 - (this.level - 10) * 1.0, 75);
    if (this.level < 60) return Math.max(75 - (this.level - 30) * 0.67, 55);
    if (this.level < 100) return Math.max(55 - (this.level - 60) * 0.5, 35);
    if (this.level < 200) return Math.max(35 - (this.level - 100) * 0.15, 20);
    return 20;
  },

  upgrade() {
    const rate = this.getSuccessRate();
    const success = Math.random() * 100 < rate;

    if (success) {
      this.level++;
      this.damage += 5;

      // ⭐ 100% 강화권 소모
      if (this.guaranteeActive) {
        this.guaranteeTicket = Math.max(0, this.guaranteeTicket - 1);
        this.guaranteeActive = false;
      }
    } else {
      // 🛡️ 하락 방지권 발동
      if (this.noDropActive) {
        this.noDropTicket = Math.max(0, this.noDropTicket - 1);
        this.noDropActive = false;
      } else {
        if (this.level > 100) this.level--;
        else this.level = Math.max(0, this.level - 1);
      }
    }

    this.save();
    return success;
  }
};
