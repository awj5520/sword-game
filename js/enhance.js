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

/* 화면 플래시 */
function flashScreen(type) {
    const el = document.createElement('div');
    el.className = `screen-flash ${type}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

/* 강화 버튼 */
btnUpgrade.onclick = () => {
    // 이전 애니메이션 제거 후 리플로우
    circle.classList.remove('spin', 'circle-success', 'circle-fail');
    elLevel.classList.remove('level-up-anim', 'level-down-anim');
    void circle.offsetWidth;

    const result = GameData.upgrade();

    if (result === 'nogold') {
        elMsg.innerText = '💸 골드 부족!';
        return;
    }

    Sound.playUpgrade(result);
    updateUI(); // 숫자 먼저 갱신

    if (result === true) {
        elMsg.innerText = '🔥 강화 성공!';
        circle.classList.add('circle-success');
        elLevel.classList.add('level-up-anim');
        fireEffect(circle);
        flashScreen('success');
    } else {
        elMsg.innerText = '💥 강화 실패';
        circle.classList.add('circle-fail');
        elLevel.classList.add('level-down-anim');
        flashScreen('fail');
    }

    // 애니메이션 종료 후 클래스 정리
    setTimeout(() => {
        circle.classList.remove('circle-success', 'circle-fail');
        elLevel.classList.remove('level-up-anim', 'level-down-anim');
    }, 850);
};

updateUI();
