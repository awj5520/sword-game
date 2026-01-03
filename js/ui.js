// js/ui.js

// DOM
const elLevel = document.getElementById("sword-level");
const elDamage = document.getElementById("sword-damage");
const elName = document.getElementById("sword-name");
const elChance = document.getElementById("chance-percent");
const elMsg = document.getElementById("message");

const swordWrapper = document.getElementById("sword-wrapper");
const spinner = document.getElementById("enhance-spinner");

const btnUpgrade = document.getElementById("btn-upgrade");
const btnAttack = document.getElementById("btn-attack");

const elMonsterName = document.getElementById("monster-name");
const elMonsterHP = document.getElementById("monster-hp");
const elMonsterImg = document.getElementById("monster-img");

function updateUI() {
  // 방어코드: 혹시 script 순서 꼬이면 바로 티나게
  if (typeof GameData === "undefined") {
    elMsg.textContent = "GameData가 없는데? core.js 로드 순서 확인해봐.";
    elMsg.style.color = "#ff416c";
    return;
  }

  elName.textContent = "연습용 목검";
  elLevel.textContent = `+${GameData.level}`;
  elDamage.textContent = `공격력: ${GameData.damage}`;
  elChance.textContent = `${GameData.getSuccessRate()}%`;

  elMonsterName.textContent = GameData.monster.name;
  elMonsterHP.textContent = `HP: ${GameData.monster.hp} / ${GameData.monster.maxHP}`;
  elMonsterImg.src = GameData.monster.img;
}

function spinOnce(success) {
  if (!spinner) return;

  spinner.classList.remove("spin", "success-rise");
  // 리플로우 트릭(연속 클릭 시 애니 다시 재생)
  void spinner.offsetWidth;

  if (success) spinner.classList.add("success-rise");
  else spinner.classList.add("spin");
}

btnUpgrade.addEventListener("click", () => {
  // 강화 시도
  const success = GameData.upgrade();

  // 사운드: 성공이면 피치 상승
  Sound.playUpgrade(success);

  // 스피너 + 오라
  spinOnce(success);
  swordWrapper.classList.remove("aura-success", "aura-fail");
  void swordWrapper.offsetWidth;

  if (success) {
    swordWrapper.classList.add("aura-success");
    elMsg.textContent = "✨ 강화 성공! 공격력이 올라갔다!";
    elMsg.style.color = "#00c6ff";
  } else {
    swordWrapper.classList.add("aura-fail");
    elMsg.textContent = "💥 강화 실패...";
    elMsg.style.color = "#ff416c";

    // 실패 파편
    Effects.createShatter(swordWrapper);
  }

  updateUI();
});

btnAttack.addEventListener("click", () => {
  const killed = GameData.attackMonster();

  if (killed) {
    elMsg.textContent = "🏆 몬스터 처치! (리스폰)";
    elMsg.style.color = "#00c6ff";
    Effects.createShatter(document.getElementById("monster-img"));

    // 0.35초 뒤 리스폰
    setTimeout(() => {
      GameData.respawnMonster();
      updateUI();
    }, 350);
  } else {
    elMsg.textContent = `⚔️ 공격! (-${GameData.damage})`;
    elMsg.style.color = "#bcd3ff";
  }

  updateUI();
});

// 최초 갱신
updateUI();
