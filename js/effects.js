// js/effects.js
const Effects = {
    // 파편 생성 함수
    createShatter: function(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const particleCount = 15; // 파편 개수

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            // 랜덤한 목적지 계산 (사방으로 100~200px)
            const angle = Math.random() * Math.PI * 2;
            const dist = 100 + Math.random() * 100;
            const x = Math.cos(angle) * dist + "px";
            const y = Math.sin(angle) * dist + "px";
            const r = Math.random() * 720 + "deg"; // 회전

            // CSS 변수로 값 전달
            particle.style.setProperty('--x', x);
            particle.style.setProperty('--y', y);
            particle.style.setProperty('--r', r);

            // 초기 위치 설정 (검 중앙)
            particle.style.left = centerX + "px";
            particle.style.top = centerY + "px";
            
            // 애니메이션 적용
            particle.style.animation = "shatter 0.6s ease-out forwards";

            document.body.appendChild(particle);

            // 애니메이션 종료 후 요소 삭제
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        }
    }
};