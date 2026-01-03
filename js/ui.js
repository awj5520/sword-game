const screenMain = document.getElementById('screen-main');
const screenField = document.getElementById('screen-field');

const elLevel = document.getElementById('sword-level');
const elDamage = document.getElementById('sword-damage');
const elMsg = document.getElementById('message');
const spinner = document.getElementById('enhance-spinner');

const elSlimeHP = document.getElementById('slime-hp');
const slime = document.getElementById('slime');

document.getElementById('btn-upgrade').onclick = () => {
    spinner.classList.add('spin');

    const success = GameData.upgrade();
    Sound.playUpgrade(success);

    setTimeout(() => {
        spinner.classList.remove('spin');
        elMsg.innerText = success ? '✨ 강화 성공!' : '💥 강화 실패';
        updateUI();
    }, 600);
};

document.getElementById('btn-field').onclick = () => {
    screenMain.classList.remove('active');
    screenField.classList.add('active');
};

document.getElementById('btn-back').onclick = () => {
    screenField.classList.remove('active');
    screenMain.classList.add('active');
};

slime.onclick = () => {
    const killed = GameData.attackSlime();
    elMsg.innerText = killed ? '슬라임 처치!' : '슬라임 공격!';
    updateUI();
};

function updateUI() {
    elLevel.innerText = `+${GameData.level}`;
    elDamage.innerText = `공격력: ${GameData.damage}`;
    elSlimeHP.innerText = `HP: ${GameData.slime.hp}`;
}

updateUI();
