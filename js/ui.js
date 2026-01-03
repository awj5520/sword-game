// [js/ui.js] - 모든 UI 및 이벤트 통합 관리

// 1. DOM 요소 참조
const elName = document.getElementById('sword-name');
const elLevel = document.getElementById('sword-level');
const elChance = document.getElementById('chance-percent');
const elGold = document.getElementById('gold-display');
const elCost = document.getElementById('upgrade-cost');
const elMessage = document.getElementById('message');

const btnUpgrade = document.getElementById('btn-upgrade');
const btnHunt = document.getElementById('btn-hunt');
const swordWrapper = document.getElementById('sword-wrapper');

/**
 * 화면의 모든 정보를 갱신하는 함수
 */
function updateScreen() {
    const currentLevel = GameData.level;
    
    // 텍스트 정보 업데이트
    elLevel.innerText = `+${currentLevel}`;
    elName.innerText = GameData.getSwordName();
    elChance.innerText = `${GameData.getSuccessRate()}%`;
    elGold.innerText = GameData.gold.toLocaleString();
    elCost.innerText = `${GameData.getUpgradeCost()}G`;

    // 레벨별 시각적 스타일 변화
    if (currentLevel >= 10) {
        // 10강 이상: 황금색 테마
        elLevel.style.color = "#f1c40f";
        elName.style.color = "#f1c40f";
        elName.style.fontWeight = "bold";
        swordWrapper.style.boxShadow = "0 0 30px #f1c40f";
    } else if (currentLevel >= 5) {
        // 5강 이상: 붉은색 강조 (파괴 위험 구간)
        elLevel.style.color = "#e74c3c";
        elName.style.color = "white";
        elName.style.fontWeight = "normal";
        swordWrapper.style.boxShadow = "none";
    } else {
        // 기본 상태
        elLevel.style.color = "white";
        elName.style.color = "#bbb";
        elName.style.fontWeight = "normal";
        swordWrapper.style.boxShadow = "none";
    }
}

/**
 * 강화하기 버튼 클릭 이벤트
 */
btnUpgrade.addEventListener('click', () => {
    // 애니메이션 초기화 (리플로우 트리거)
    swordWrapper.classList.remove('aura-success', 'aura-fail');
    void swordWrapper.offsetWidth; 

    // 로직 실행 (core.js)
    const result = GameData.tryUpgrade();

    // 골드 부족 처리
    if (result.error === "LACK_GOLD") {
        elMessage.innerText = result.msg;
        elMessage.style.color = "#e74c3c";
        return;
    }

    // 결과 연출 분기
    if (result.success) {
        // 성공 시: 오라 부여
        swordWrapper.classList.add('aura-success');
        elMessage.style.color = "#00d4ff";
    } else {
        // 실패 시: 오라 부여 + 파편 효과(effects.js)
        swordWrapper.classList.add('aura-fail');
        elMessage.style.color = "#ff4b2b";
        
        if (typeof Effects !== 'undefined') {
            Effects.createShatter(swordWrapper);
        }

        // 실패 오라는 잠깐 보여주고 제거
        setTimeout(() => {
            swordWrapper.classList.remove('aura-fail');
        }, 500);
    }

    elMessage.innerText = result.msg;
    updateScreen();
});

/**
 * 사냥하기 버튼 클릭 이벤트
 */
btnHunt.addEventListener('click', () => {
    const earned = GameData.hunt();
    
    elMessage.innerText = `${earned} 골드를 얻었습니다! 💰`;
    elMessage.style.color = "#f1c40f";
    
    // 버튼 클릭 시 가벼운 흔들림 효과 (선택 사항)
    btnHunt.style.transform = "scale(0.95)";
    setTimeout(() => btnHunt.style.transform = "scale(1)", 100);

    updateScreen();
});

// 초기 화면 실행
updateScreen();