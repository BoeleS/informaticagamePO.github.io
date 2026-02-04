const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ---------------- INPUT ----------------
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ---------------- GAME STATE ----------------
let paused = false;

// ---------------- PLAYER ----------------
const player = {
    x: 400,
    y: 300,
    speed: 3,
    hp: 100,
    maxHp: 100,
    ammo: 20,
    damage: 10,
    damageBoost: 0
};

// ---------------- OBJECTS ----------------
let bullets = [];
let enemies = [];
let enemyBullets = [];
let powerups = [];

// ---------------- WAVES ----------------
const waves = ["normal", "spider", "boss"];
let currentWave = 0;
let waveTimer = 0;
let restTimer = 0;
let inRest = false;
let waveText = "";

// ---------------- TIMERS ----------------
let powerupTimer = 0;

// ---------------- UTILS ----------------
function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function randPos() {
    return {
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50
    };
}

// ---------------- SHOOT ----------------
canvas.addEventListener("click", () => {
    if (paused || player.ammo <= 0) return;
    player.ammo--;

    bullets.push({
        x: player.x,
        y: player.y,
        vx: 6,
        vy: 0,
        damage: player.damage + player.damageBoost
    });
});

// ---------------- SPAWNS ----------------
function spawnEnemy() {
    let p = randPos();
    enemies.push({
        x: p.x, y: p.y,
        hp: 20,
        speed: 1.5,
        type: "normal"
    });
}

function spawnSpider() {
    let p = randPos();
    enemies.push({
        x: p.x, y: p.y,
        hp: 30,
        speed: 1,
        fire: 2,
        type: "spider"
    });
}

function spawnBoss() {
    enemies.push({
        x: 400,
        y: 150,
        hp: 500,
        speed: 0.5,
        fire: 2,
        type: "boss"
    });
}

function spawnPowerup() {
    let p = randPos();
    powerups.push({
        x: p.x,
        y: p.y,
        type: Math.random() < 0.5 ? "health" : "damage"
    });
}

// ---------------- UPDATE ----------------
function update() {
    if (paused) return;

    // Movement
    if (keys.w) player.y -= player.speed;
    if (keys.s) player.y += player.speed;
    if (keys.a) player.x -= player.speed;
    if (keys.d) player.x += player.speed;

    // Waves
    if (!inRest) {
        waveTimer += 1 / 60;

        if (waves[currentWave] === "normal" && Math.random() < 0.02)
            spawnEnemy();

        if (waves[currentWave] === "spider" && Math.random() < 0.015)
            spawnSpider();

        if (waves[currentWave] === "boss" && enemies.length === 0)
            spawnBoss();

        if (waveTimer >= 60 && waves[currentWave] !== "boss") {
            inRest = true;
            waveText = "Wave voltooid";
            enemies = [];
            waveTimer = 0;
            restTimer = 0;
        }
    } else {
        restTimer += 1 / 60;
        if (restTimer >= 15) {
            inRest = false;
            waveText = "";
            currentWave++;
            if (currentWave >= waves.length)
                waveText = "Level voltooid";
        }
    }

    // Enemies
    enemies.forEach((e, i) => {
        let dx = player.x - e.x;
        let dy = player.y - e.y;
        let d = Math.hypot(dx, dy);
        e.x += dx / d * e.speed;
        e.y += dy / d * e.speed;

        if (e.fire !== undefined) {
            e.fire -= 1 / 60;
            if (e.fire <= 0) {
                enemyBullets.push({
                    x: e.x, y: e.y,
                    vx: dx / d * 4,
                    vy: dy / d * 4,
                    damage: e.type === "boss" ? 20 : 5
                });
                e.fire = e.type === "boss" ? 1.5 : 2;
            }
        }

        if (dist(e, player) < 25) {
            player.hp -= 10;
            enemies.splice(i, 1);
        }
    });

    // Bullets
    bullets.forEach((b, i) => {
        b.x += b.vx;
        enemies.forEach((e, j) => {
            if (dist(b, e) < 20) {
                e.hp -= b.damage;
                bullets.splice(i, 1);
                if (e.hp <= 0) enemies.splice(j, 1);
            }
        });
    });

    enemyBullets.forEach((b, i) => {
        b.x += b.vx;
        b.y += b.vy;
        if (dist(b, player) < 20) {
            player.hp -= b.damage;
            enemyBullets.splice(i, 1);
        }
    });

    // Powerups
    powerupTimer += 1 / 60;
    if (powerupTimer >= 15) {
        spawnPowerup();
        powerupTimer = 0;
    }

    powerups.forEach((p, i) => {
        if (dist(p, player) < 25) {
            if (p.type === "health")
                player.hp = Math.min(100, player.hp + 50);
            if (p.type === "damage") {
                player.damageBoost = 10;
                setTimeout(() => player.damageBoost = 0, 15000);
            }
            powerups.splice(i, 1);
        }
    });
}

// ---------------- DRAW ----------------
function drawStickman(x, y, happy = true, color = "blue") {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Head
    ctx.beginPath();
    ctx.arc(x, y - 20, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Face
    ctx.beginPath();
    ctx.arc(x - 3, y - 22, 1, 0, Math.PI * 2);
    ctx.arc(x + 3, y - 22, 1, 0, Math.PI * 2);
    ctx.stroke();

    if (happy) {
        ctx.beginPath();
        ctx.arc(x, y - 18, 4, 0, Math.PI);
        ctx.stroke();
    }

    // Body
    ctx.beginPath();
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 15);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(x, y + 15);
    ctx.lineTo(x - 8, y + 30);
    ctx.moveTo(x, y + 15);
    ctx.lineTo(x + 8, y + 30);
    ctx.stroke();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawStickman(player.x, player.y, true, "blue");

    enemies.forEach(e => {
        if (e.type === "normal") drawStickman(e.x, e.y, false, "red");
        if (e.type === "spider") {
            ctx.strokeStyle = "purple";
            for (let i = 0; i < 8; i++) {
                ctx.beginPath();
                ctx.moveTo(e.x, e.y);
                ctx.lineTo(
                    e.x + Math.cos(i) * 20,
                    e.y + Math.sin(i) * 20
                );
                ctx.stroke();
            }
        }
        if (e.type === "boss") {
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.arc(e.x, e.y, 60, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    ctx.fillStyle = "black";
    ctx.fillText("Ammo: " + player.ammo, 10, 20);
    ctx.fillText("HP: " + player.hp, canvas.width / 2 - 30, canvas.height - 20);

    if (waveText) {
        ctx.font = "40px Arial";
        ctx.fillText(waveText, 260, 300);
    }
}

// ---------------- LOOP ----------------
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
