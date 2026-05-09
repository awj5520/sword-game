function screenShake() {
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 300);
}

const Sound = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),

    playUpgrade(success) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);

        if (success) {
            osc.frequency.exponentialRampToValueAtTime(
                1000,
                this.ctx.currentTime + 0.4
            );
        }

        osc.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }
};

/* ── 공격 데미지 숫자 팝 ── */
function showAttackDamage(amount, targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 + (Math.random() - 0.5) * 28;
    const cy = rect.top  + rect.height * 0.22;

    const el = document.createElement('div');
    el.className = 'attack-dmg-num';
    el.textContent = `-${(typeof fmtNum === 'function') ? fmtNum(amount) : amount}`;
    el.style.cssText = `left:${cx}px; top:${cy}px;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 920);
}

/* ── 칼 슬래시 이펙트 (공격 모션) ── */
function slashEffect(targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;

    // 굵은 메인 슬래시 + 얇은 서브 슬래시
    const lines = [
        { dy: -10, width: 88, cls: 'slash-thick', delay: 0  },
        { dy:  16, width: 62, cls: '',             delay: 55 },
    ];

    lines.forEach(({ dy, width, cls, delay }) => {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = ['slash-line', cls].filter(Boolean).join(' ');
            el.style.cssText = `left:${cx - width / 2}px; top:${cy + dy}px; width:${width}px;`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 300);
        }, delay);
    });
}

/* ── 황금 빛 폭발 이펙트 (강화 성공) ── */
function fireEffect(target) {
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const r  = Math.max(rect.width, rect.height);

    // 1. 중앙 황금 원형 버스트
    const burst = document.createElement('div');
    burst.className = 'gold-burst';
    burst.style.cssText = `
        left:${cx - r}px; top:${cy - r}px;
        width:${r * 2}px; height:${r * 2}px;
    `;
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 650);

    // 2. 황금 빛줄기 (12방향)
    const RAY_COUNT = 12;
    for (let i = 0; i < RAY_COUNT; i++) {
        const angle    = (i / RAY_COUNT) * 360 + (Math.random() - 0.5) * 12;
        const len      = 55 + Math.random() * 55;
        const dur      = 380 + Math.random() * 120;
        const delay    = Math.random() * 70;

        const ray = document.createElement('div');
        ray.className = 'gold-ray';
        ray.style.cssText = `
            left:${cx}px; top:${cy}px;
            width:${len}px;
            --angle:${angle}deg;
            animation-duration:${dur}ms;
            animation-delay:${delay}ms;
        `;
        document.body.appendChild(ray);
        setTimeout(() => ray.remove(), dur + delay + 50);
    }

    // 3. 황금/흰색 반짝이 파티클
    const SPARK_COLORS = ['#ffffff','#fff8a0','#ffd700','#ffec60','#ffa500','#ffe566'];
    const SPARK_COUNT  = 24;
    for (let i = 0; i < SPARK_COUNT; i++) {
        const angle    = (i / SPARK_COUNT) * Math.PI * 2 + Math.random() * 0.5;
        const speed    = 50 + Math.random() * 70;
        const vx       = Math.cos(angle) * speed;
        const vy       = Math.sin(angle) * speed;
        const sz       = 3 + Math.random() * 5;
        const dur      = 480 + Math.random() * 270;
        const delay    = Math.random() * 90;
        const color    = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];

        const spark = document.createElement('div');
        spark.className = 'gold-spark';
        spark.style.cssText = `
            left:${cx - sz / 2}px; top:${cy - sz / 2}px;
            width:${sz}px; height:${sz}px;
            background:${color};
            --vx:${vx}px; --vy:${vy}px;
            animation-duration:${dur}ms;
            animation-delay:${delay}ms;
        `;
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), dur + delay + 50);
    }
}

/* ── 균열 이펙트 (강화 실패) ── */
function shatterEffect(target) {
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;

    // 1. 균열 라인 (7개, 방사형)
    const CRACK_COUNT = 7;
    for (let i = 0; i < CRACK_COUNT; i++) {
        const angle = (i / CRACK_COUNT) * 360 + (Math.random() - 0.5) * 22;
        const len   = 38 + Math.random() * 52;
        const dur   = 420 + Math.random() * 160;
        const delay = Math.random() * 60;

        const crack = document.createElement('div');
        crack.className = 'crack-line';
        crack.style.cssText = `
            left:${cx}px; top:${cy}px;
            width:${len}px;
            --angle:${angle}deg;
            animation-duration:${dur}ms;
            animation-delay:${delay}ms;
        `;
        document.body.appendChild(crack);
        setTimeout(() => crack.remove(), dur + delay + 50);

        // 균열마다 짧은 가지선 1개
        const branchAngle = angle + (Math.random() - 0.5) * 60;
        const branchLen   = len * (0.3 + Math.random() * 0.35);
        const branchDelay = delay + 40;

        const branch = document.createElement('div');
        branch.className = 'crack-line crack-branch';
        branch.style.cssText = `
            left:${cx}px; top:${cy}px;
            width:${branchLen}px;
            --angle:${branchAngle}deg;
            animation-duration:${dur}ms;
            animation-delay:${branchDelay}ms;
        `;
        document.body.appendChild(branch);
        setTimeout(() => branch.remove(), dur + branchDelay + 50);
    }

    // 2. 잔해 파티클
    const DEBRIS_COUNT  = 14;
    const DEBRIS_COLORS = ['#0a0a0a','#1a1010','#2a1818','#3a0000','#550010'];
    for (let i = 0; i < DEBRIS_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 28 + Math.random() * 48;
        const vx    = Math.cos(angle) * speed;
        const vy    = Math.sin(angle) * speed;
        const w     = 2 + Math.random() * 4;
        const h     = 2 + Math.random() * 4;
        const dur   = 420 + Math.random() * 220;
        const color = DEBRIS_COLORS[Math.floor(Math.random() * DEBRIS_COLORS.length)];

        const debris = document.createElement('div');
        debris.className = 'crack-debris';
        debris.style.cssText = `
            left:${cx - w / 2}px; top:${cy - h / 2}px;
            width:${w}px; height:${h}px;
            background:${color};
            --vx:${vx}px; --vy:${vy}px;
            animation-duration:${dur}ms;
        `;
        document.body.appendChild(debris);
        setTimeout(() => debris.remove(), dur + 50);
    }
}

/* ============================================================
   스킬 이펙트
   ============================================================ */

/* ── 공통 헬퍼: 원형 버스트 ── */
function _spawnBurst(cx, cy, r, color, dur) {
    const el = document.createElement('div');
    el.className = 'sk-burst';
    el.style.cssText = `
        left:${cx - r}px; top:${cy - r}px;
        width:${r * 2}px; height:${r * 2}px;
        background:radial-gradient(circle,${color} 0%,transparent 72%);
        animation-duration:${dur}ms;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), dur + 40);
}

/* ── 공통 헬퍼: 파티클 ── */
function _spawnParticles(cx, cy, count, colors, speedMin, speedMax, sizeMin, sizeMax, durMin, durMax, cls) {
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        const speed = speedMin + Math.random() * (speedMax - speedMin);
        const sz    = sizeMin  + Math.random() * (sizeMax  - sizeMin);
        const dur   = durMin   + Math.random() * (durMax   - durMin);
        const color = colors[Math.floor(Math.random() * colors.length)];
        const p = document.createElement('div');
        p.className = cls;
        p.style.cssText = `
            left:${cx - sz/2}px; top:${cy - sz/2}px;
            width:${sz}px; height:${sz}px;
            background:${color};
            --vx:${Math.cos(angle)*speed}px;
            --vy:${Math.sin(angle)*speed}px;
            animation-duration:${dur}ms;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), dur + 40);
    }
}

/* ──────────────────────────────────────────
   관통형 — thrustSkillEffect
   수평 빛선이 화면을 가로질러 꿰뚫음
────────────────────────────────────────── */
function thrustSkillEffect(target, color) {
    const rect = target.getBoundingClientRect();
    const cy   = rect.top + rect.height / 2;
    const cx   = rect.left + rect.width  / 2;

    // 빛선 2개 (약간 Y 차이)
    [-8, 8].forEach((dy, i) => {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'sk-thrust-line';
            el.style.cssText = `
                top:${cy + dy}px;
                --color:${color};
                animation-delay:${i * 45}ms;
            `;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 450);
        }, i * 45);
    });

    // 임팩트 버스트
    setTimeout(() => _spawnBurst(cx, cy, 55, color + 'bb', 380), 120);

    // 파티클 (앞으로 날아가는)
    for (let i = 0; i < 10; i++) {
        const angle = (Math.random() - 0.5) * 0.9;
        const speed = 60 + Math.random() * 50;
        const dur   = 320 + Math.random() * 150;
        const sz    = 3 + Math.random() * 4;
        const p = document.createElement('div');
        p.className = 'sk-particle-dot';
        p.style.cssText = `
            left:${cx}px; top:${cy + (Math.random()-0.5)*30}px;
            width:${sz}px; height:${sz}px;
            background:${color};
            --vx:${Math.cos(angle)*speed}px;
            --vy:${Math.sin(angle)*speed}px;
            animation-duration:${dur}ms;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), dur + 40);
    }
}

/* ──────────────────────────────────────────
   연격형 — slashComboSkillEffect
   N타 시차 슬래시 (색상 지정)
────────────────────────────────────────── */
function slashComboSkillEffect(target, color, count) {
    const rect = target.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const gap  = count <= 2 ? 120 : count <= 3 ? 100 : 75;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            // 메인 슬래시
            const dy    = (i % 2 === 0 ? -1 : 1) * (10 + i * 5);
            const width = 75 + Math.random() * 30;
            const el = document.createElement('div');
            el.className = 'sk-slash-combo';
            el.style.cssText = `
                left:${cx - width/2}px; top:${cy + dy}px;
                width:${width}px;
                --color:${color};
            `;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 280);

            // 타격마다 작은 임팩트 버스트
            _spawnBurst(cx + (Math.random()-0.5)*20, cy + dy, 28, color + '99', 250);
        }, i * gap);
    }
}

/* ──────────────────────────────────────────
   폭발형 — burstSkillEffect
   원형 버스트 + 파티클 (색상 지정)
────────────────────────────────────────── */
function burstSkillEffect(target, colorMain, colorSpark, particleCount, burstScale) {
    const rect = target.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const r    = Math.max(rect.width, rect.height) * (burstScale || 0.9);

    // 메인 버스트 (2단)
    _spawnBurst(cx, cy, r * 0.5, colorMain + 'dd', 300);
    setTimeout(() => _spawnBurst(cx, cy, r, colorMain + '88', 450), 60);

    // 링 파티클
    _spawnParticles(
        cx, cy,
        particleCount || 18,
        [colorSpark, colorMain, '#ffffff'],
        40, 90, 3, 8, 400, 650,
        'sk-particle-dot'
    );
}

/* ──────────────────────────────────────────
   전기형 — electricSkillEffect
   스파크 + 번개 갈래
────────────────────────────────────────── */
function electricSkillEffect(target) {
    const rect = target.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;

    // 전기 번개 갈래 (방사형 선)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 360 + (Math.random() - 0.5) * 25;
        const len   = 40 + Math.random() * 45;
        const dur   = 280 + Math.random() * 120;
        const el = document.createElement('div');
        el.className = 'sk-electric-bolt';
        el.style.cssText = `
            left:${cx}px; top:${cy}px;
            width:${len}px;
            --angle:${angle}deg;
            animation-duration:${dur}ms;
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), dur + 40);
    }

    // 전기 중앙 플래시
    _spawnBurst(cx, cy, 60, 'rgba(255,220,0,0.75)', 300);

    // 스파크 파티클
    _spawnParticles(cx, cy, 16, ['#ffdd00','#ffee88','#ffffff','#ff9900'], 35, 75, 2, 5, 250, 420, 'sk-particle-dot');
}

/* ──────────────────────────────────────────
   낙하형 — dropSkillEffect
   위에서 황금빛 기둥이 내리꽂힘
────────────────────────────────────────── */
function dropSkillEffect(target, color) {
    const rect = target.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;

    // 낙하 기둥 (화면 위 → 몬스터)
    const col = document.createElement('div');
    col.className = 'sk-drop-column';
    col.style.cssText = `
        left:${cx - 30}px;
        bottom:${window.innerHeight - cy}px;
        --color:${color};
    `;
    document.body.appendChild(col);
    setTimeout(() => col.remove(), 550);

    // 착지 임팩트 (조금 딜레이)
    setTimeout(() => {
        _spawnBurst(cx, cy, 75, color + 'bb', 420);
        _spawnBurst(cx, cy, 45, '#ffffffcc', 280);
        _spawnParticles(cx, cy, 20, [color, '#ffffff', '#fffaaa'], 45, 95, 3, 7, 380, 600, 'sk-particle-dot');
    }, 220);
}

/* ──────────────────────────────────────────
   스킬 매핑 테이블 + 진입점
────────────────────────────────────────── */
const SKILL_EFFECT_MAP = {
    // 관통형
    'active_piercing_thrust':   (t) => thrustSkillEffect(t, '#4488ff'),

    // 연격형
    'active_steel_combo':       (t) => slashComboSkillEffect(t, '#cccccc', 2),
    'active_survival_slash':    (t) => slashComboSkillEffect(t, '#00cc66', 3),
    'active_focus_flurry':      (t) => slashComboSkillEffect(t, '#ffffff', 4),

    // 폭발형
    'active_rift_smash':        (t) => burstSkillEffect(t, '#9944ff', '#cc88ff', 18, 1.0),
    'active_bloodline_sever':   (t) => burstSkillEffect(t, '#cc0022', '#ff4466', 14, 0.85),
    'active_laceration_burst':  (t) => burstSkillEffect(t, '#ff5500', '#ffaa00', 20, 1.1),
    'active_frost_shatter':     (t) => burstSkillEffect(t, '#66ccff', '#aaeeff', 20, 1.1),
    'active_spacetime_split':   (t) => burstSkillEffect(t, '#220044', '#9900cc', 16, 1.2),
    'active_final_slaughter':   (t) => burstSkillEffect(t, '#550000', '#ff1122', 22, 1.3),

    // 전기형
    'active_overcurrent_break': (t) => electricSkillEffect(t),

    // 낙하형
    'active_judgement_drop':    (t) => dropSkillEffect(t, '#ffdd00'),
};

function playSkillEffect(skillId, targetEl) {
    const fn = SKILL_EFFECT_MAP[skillId];
    if (fn) fn(targetEl);
}

