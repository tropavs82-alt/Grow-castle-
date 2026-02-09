const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let wave = 1;
let gold = 200;

let heroes = [];
let archers = [];
let enemies = [];
let goldEffects = [];
let hitEffects = [];

// =================== BOTÕES ===================
const buyHeroBtn = { x: 600, y: 280, w: 180, h: 40, color: "#4CAF50", text: "Comprar Heroi" };
const upHeroBtn  = { x: 600, y: 330, w: 180, h: 40, color: "#2196F3", text: "Upgrade Heroi" };
const buyArchBtn = { x: 600, y: 380, w: 180, h: 40, color: "#FF9800", text: "Comprar Arqueiro" };

// =================== INIMIGOS ===================
function getEnemyType() {
    let baseHP, goldReward, color;
    if (wave < 10) { baseHP = 60; goldReward = 25; color = "#ff4d4d"; }
    else if (wave < 30) { baseHP = 140; goldReward = 75; color = "#ffd11a"; }
    else { 
        baseHP = 260 + (wave - 30) * 20;
        goldReward = 150 + (wave - 30) * 25;
        color = "#333333"; 
    }
    return { hp: baseHP, speed: 0.5, gold: goldReward, color: color };
}

function spawnWave() {
    enemies = [];
    const e = getEnemyType();
    const startY = 120;
    const spacing = 45;
    for (let i = 0; i < 5; i++) {
        enemies.push({
            x: 600,
            y: startY + i * spacing,
            hp: e.hp,
            maxHp: e.hp,
            speed: e.speed,
            gold: e.gold,
            color: e.color
        });
    }
}

// =================== HERÓIS E ARQUEIROS ===================
function buyHero() {
    if (gold >= 50 && heroes.length < 6) {
        gold -= 50;
        heroes.push({
            x: 160,
            y: 120 + heroes.length * 40,
            damage: 15,
            atkSpeed: 40,
            timer: 0,
            level: 1
        });
    }
    repositionHeroes();
}

function upgradeHero() {
    if (!heroes.length || gold < 80) return;
    gold -= 80;
    heroes.forEach(h => {
        h.level++;
        h.damage += 3;
        h.atkSpeed = Math.max(20, h.atkSpeed - 2);
    });
}

function buyArcher() {
    if (gold >= 40 && archers.length < 10) {
        gold -= 40;
        archers.push({
            x: 120,
            y: 120 + archers.length * 22,
            damage: 6,
            atkSpeed: 35,
            timer: 0
        });
    }
    repositionArchers();
}

// =================== REPOSICIONAMENTO ===================
function repositionHeroes() {
    heroes.forEach((h, i) => {
        h.y = 120 + i * 40;
    });
}

function repositionArchers() {
    archers.forEach((a, i) => {
        a.y = 120 + i * 22;
    });
}

// =================== CLIQUE NOS BOTÕES ===================
canvas.addEventListener("click", e => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;

    [buyHeroBtn, upHeroBtn, buyArchBtn].forEach(btn => {
        if (mx > btn.x && mx < btn.x + btn.w &&
            my > btn.y && my < btn.y + btn.h) {
            if (btn === buyHeroBtn) buyHero();
            if (btn === upHeroBtn) upgradeHero();
            if (btn === buyArchBtn) buyArcher();
        }
    });
});

// =================== SPAWN INICIAL ===================
spawnWave();

// =================== ATUALIZAÇÃO ===================
function update() {
    enemies.forEach(e => e.x -= e.speed);

    heroes.forEach(h => {
        h.timer++;
        if (h.timer >= h.atkSpeed) {
            h.timer = 0;
            enemies.forEach(e => {
                e.hp -= h.damage;
                hitEffects.push({ x: e.x, y: e.y, timer: 15 });
            });
        }
    });

    archers.forEach(a => {
        a.timer++;
        if (a.timer >= a.atkSpeed && enemies.length) {
            a.timer = 0;
            enemies[0].hp -= a.damage;
            hitEffects.push({ x: enemies[0].x, y: enemies[0].y, timer: 15 });
        }
    });

    enemies = enemies.filter(e => {
        if (e.hp <= 0) {
            gold += e.gold;
            goldEffects.push({ x: e.x, y: e.y, value: e.gold, timer: 50 });
            return false;
        }
        return true;
    });

    if (enemies.length === 0) {
        wave++;
        spawnWave();
    }

    goldEffects.forEach(g => g.timer--);
    goldEffects = goldEffects.filter(g => g.timer > 0);

    hitEffects.forEach(h => h.timer--);
    hitEffects = hitEffects.filter(h => h.timer > 0);
}

// =================== DESENHO ===================
function draw() {
    // fundo gradiente
    const grad = ctx.createLinearGradient(0,0,0,canvas.height);
    grad.addColorStop(0,"#1e1e2f");
    grad.addColorStop(1,"#111122");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // castelo
    ctx.fillStyle = "#6666cc";
    ctx.fillRect(50, 100, 80, 200);
    ctx.strokeStyle = "#3333aa";
    ctx.strokeRect(50, 100, 80, 200);

    // barra de progresso da wave
    const waveProgress = 1 - enemies.length / 5;
    ctx.fillStyle = "#00ccff";
    ctx.fillRect(150, 60, waveProgress * 450, 10);
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(150, 60, 450, 10);

    // inimigos
    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, 30, 30);
        ctx.fillStyle = "#00cc00";
        ctx.fillRect(e.x, e.y - 6, (e.hp / e.maxHp) * 30, 4);
        ctx.strokeStyle = "black";
        ctx.strokeRect(e.x, e.y - 6, 30, 4);
    });

    // efeitos de hit
    hitEffects.forEach(h => {
        ctx.strokeStyle = "yellow";
        ctx.beginPath();
        ctx.arc(h.x + 15, h.y + 15, 10, 0, Math.PI * 2);
        ctx.stroke();
    });

    // heróis
    heroes.forEach(h => {
        ctx.fillStyle = "#3399ff";
        ctx.fillRect(h.x, h.y, 30, 30);
        ctx.fillStyle = "white";
        ctx.fillText("Lv" + h.level, h.x, h.y - 5);
    });

    // arqueiros
    archers.forEach(a => {
        ctx.fillStyle = "#ffa500";
        ctx.fillRect(a.x, a.y, 18, 18);
    });

    // HUD
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Wave: " + wave, 10, 20);
    ctx.fillText("Gold: " + gold, 10, 40);

    // efeitos de gold
    ctx.font = "14px Arial";
    goldEffects.forEach(g => {
        ctx.fillStyle = `rgba(255, 215, 0, ${g.timer/50})`;
        ctx.fillText("+" + g.value, g.x, g.y - (50 - g.timer));
    });

    // botões
    [buyHeroBtn, upHeroBtn, buyArchBtn].forEach(btn => {
        ctx.fillStyle = btn.color;
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = "black";
        ctx.fillText(btn.text, btn.x + 10, btn.y + 25);
    });
}

// =================== LOOP ===================
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
