// ---------- CANVAS ----------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ---------- INPUT ----------
let keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ---------- GAME STATE ----------
let paused = false;

// ---------- PLAYER ----------
let player = {
    x: 400,
    y: 300,
    speed: 3,
    health: 100,
    ammo: 50,
    oneShot: false,
    oneShotTimer: 0
};

// ---------- OBJECTS ----------
let bullets = [];
let enemies = [];
let powerups = [];

// ---------- POWERUPS ----------
let powerupTimer = 0;
const powerupInterval = 15;

// ---------- WAVES ----------
const waves = [
    { type: "normal", duration: 60 },
    { type: "spiders", duration: 60 },
    { type: "boss", duration: 0 }
];

let currentWave = 0;
let waveTimer = 0;
let restTimer = 0;
let inRest = false;
let waveText = "";

// ---------- UTILS ----------
function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function randomSpawn() {
    return {
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20
    };
}

// ---------- SPAWNS ----------
function spawnEnemy() {
    let p = randomSpawn();
    enemies.push({
        x: p.x,
        y: p.y,
        speed: 1.5,
        health: 30,
        damage: 10,
        type: "normal"
    });
}

function spawnSpider() {
    let p = randomSpawn();
    enemies.push({
        x: p.x,
        y: p.y,
        speed: 1.2,
        health: 40,
        damage: 0,
        type: "spider",
        fireTimer: 2
    });
}

function shootWeb(spider) {
    let dx = player.x - spider.x;
    let dy = player.y - spider.y;
    let d = Math.hypot(dx, dy);

    bullets.push({
        x: spider.x,
        y: spider.y,
        vx: dx / d * 4,
        vy: dy / d * 4,
        damage: 5,
        type: "web"
    });
}

function spawnBoss() {
    enemies.push({
        x: canvas.width / 2,
        y: 120,
        speed: 0.5,
        health: 500,
        damage: 20,
        type: "boss"
    });
}

function spawnPowerup() {
    let p = randomSpawn();
    powerups.push({
        x: p.x,
        y: p.y,
        type: Math.random() < 0.5 ? "health" : "damage"
    });
}

// ---------- UPDATE ----------
function update() {
    if (paused || player.health <= 0) return;

    // Player movement (zoals van ouds)
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    // ---------- WAVES ----------
    if (!inRest) {
        waveTimer += 1 / 60;

        if (waves[currentWave].type === "normal" && Math.random() < 0.02)
            spawnEnemy();

        if (waves[currentWave].type === "spiders" && Math.random() < 0.015)
            spawnSpider();

        if (waves[currentWave].type === "boss" && enemies.length === 0)
            spawnBoss();

        if (
            waves[currentWave].type !== "boss" &&
            waveTimer >= waves[currentWave].duration
        ) {
            inRest = true;
            restTimer = 0;
            waveText = "Wave voltooid";
            enemies = [];
            waveTimer = 0;
        }
    } else {
        restTimer += 1 / 60;
        if (restTimer >= 15) {
            inRest = false;
            waveText = "";
            currentWave++;

            if (currentWave >= waves.length) {
                waveText = "Level completed";
                enemies = [];
            }
        }
    }

    // ---------- POWERUPS ----------
    powerupTimer += 1 / 60;
    if (powerupTimer >= powerupInterval) {
        spawnPowerup();
        powerupTimer = 0;
    }

    powerups.forEach((p, i) => {
        if (dist(p, player) < 25) {
            if (p.type === "health")
                player.health = Math.min(100, player.health + 50);

            if (p.type === "damage") {
                player.oneShot = true;
                player.oneShotTimer = 10;
            }
            powerups.splice(i, 1);
        }
    });

    // ---------- ONE SHOT ----------
    if (player.oneShot) {
        player.oneShotTimer -= 1 / 60;
        if (player.oneShotTimer <= 0) player.oneShot = false;
    }

    // ---------- BULLETS ----------
    bullets.forEach((b, i) => {
        b.x += b.vx;
        b.y += b.vy;

        enemies.forEach((e, j) => {
            if (dist(b, e) < 18 && b.type !== "web") {
                e.health -= player.oneShot ? 999 : 10;
                bullets.splice(i, 1);
                if (e.health <= 0) enemies.splice(j, 1);
            }
        });

        if (b.type === "web" && dist(b, player) < 18) {
            player.health -= b.damage;
            bullets.splice(i, 1);
        }
    });

    // ---------- ENEMIES ----------
    enemies.forEach((e, i) => {
        let dx = player.x - e.x;
        let dy = player.y - e.y;
        let d = Math.hypot(dx, dy);

        e.x += dx / d * e.speed;
        e.y += dy / d * e.speed;

        if (e.type === "spider") {
            e.fireTimer -= 1 / 60;
            if (e.fireTimer <= 0) {
                shootWeb(e);
                e.fireTimer = 2;
            }
        }

        if (dist(e, player) < 25) {
            player.health -= e.damage;
            enemies.splice(i, 1);
        }
    });
}

// ---------- DRAW ----------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player (zoals vroeger)
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Enemies
    enemies.forEach(e => {
        ctx.fillStyle =
            e.type === "boss" ? "green" :
            e.type === "spider" ? "purple" : "red";

        ctx.beginPath();
        ctx.arc(
            e.x,
            e.y,
            e.type === "boss" ? 35 : 18,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });

    // Bullets
    bullets.forEach(b => {
        ctx.fillStyle = b.type === "web" ? "orange" : "black";
        ctx.beginPath();
        ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Powerups
    powerups.forEach(p => {
        ctx.fillStyle = p.type === "health" ? "pink" : "yellow";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });

    // Timer
    if (!inRest && waves[currentWave]?.duration) {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            Math.ceil(waves[currentWave].duration - waveTimer),
            canvas.width / 2,
            40
        );
    }

    // Wave text
    if (waveText) {
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText(waveText, canvas.width / 2, canvas.height / 2);
    }
}

// ---------- LOOP ----------
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
