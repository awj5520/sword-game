const elLevel = document.getElementById('enhance-level');
const elDamage = document.getElementById('damage-text');
const elGold = document.getElementById('gold-text');
const elMsg = document.getElementById('message');
const circle = document.getElementById('enhance-circle');
const btnUpgrade = document.getElementById('btn-upgrade');

function updateUI() {
    elLevel.innerText = `+${GameData.level}`;
    elDamage.innerText = `공격력: ${GameData.damage}`;
    elGold.innerText = `💰 ${GameData.gold}`;
}

btnUpgrade.onclick = () => {
    circle.classList.remove('spin');
    void circle.offsetWidth;

    const result = GameData.upgrade();

    if (result === 'nogold') {
        elMsg.innerText = '💸 골드 부족!';
        return;
    }

    Sound.playUpgrade(result);
    circle.classList.add('spin');
    circle.classList.toggle('success', result);

    elMsg.innerText = result ? '✨ 강화 성공!' : '💥 강화 실패';
    updateUI();
};

updateUI();
