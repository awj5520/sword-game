const elLevel = document.getElementById('enhance-level');
const elDamage = document.getElementById('damage-text');
const elGold = document.getElementById('gold-text');
const elMsg = document.getElementById('message');
const circle = document.getElementById('enhance-circle');
const btnUpgrade = document.getElementById('btn-upgrade');
const elRate = document.getElementById('success-rate');

/* UI 갱신 */
function updateUI() {
    elLevel.innerText = `+${GameData.level}`;
    elDamage.innerText = `공격력: ${GameData.damage}`;
    elGold.innerText = `💰 ${GameData.gold}`;

    const rate = GameData.getSuccessRate();
    elRate.querySelector('span').innerText = `${rate}%`;

    // 확률에 따른 색상
    elRate.classList.remove('low', 'mid');
    if (rate <= 30) {
        elRate.classList.add('low');
    } else if (rate <= 60) {
        elRate.classList.add('mid');
    }
}

/* 강화 버튼 */
btnUpgrade.onclick = () => {
    // 회전 리셋
    circle.classList.remove('spin');
    void circle.offsetWidth;

    const result = GameData.upgrade();

    if (result === 'nogold') {
        elMsg.innerText = '💸 골드 부족!';
        return;
    }

    Sound.playUpgrade(result);
    circle.classList.add('spin');

    if (result === true) {
        elMsg.innerText = '🔥 강화 성공!';
        fireEffect(circle);          // 🔥 불꽃 이펙트
    } else {
        elMsg.innerText = '💥 강화 실패';
    }

    updateUI();
};

updateUI();
