const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI
const ammoUI = document.getElementById('ammo');
const scoreUI = document.getElementById('score');
const healthUI = document.getElementById('health');
const gameOverUI = document.getElementById('gameOver');

// PLAYER
let player = {
    x: canvas.width/2,
    y: canvas.height/2,
    width: 40,
    height: 40,
    health: 100,
    speed: 4,
    ammo: 12,
    maxAmmo: 12,
    canShoot: true
};

// BULLETS
let bullets = [];

// ENEMIES
let enemies = [];
let score = 0;

let keys = {};

document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;

    if(e.key === "r") reload();
    if(e.key === "Enter" && player.health <= 0) restartGame();
});

document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("click", shoot);

// ---------------- LOOP ----------------

function gameLoop(){
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// ---------------- UPDATE ----------------

function update(){

    if(player.health <= 0) return;

    // Movement
    if(keys["w"]) player.y -= player.speed;
    if(keys["s"]) player.y += player.speed;
    if(keys["a"]) player.x -= player.speed;
    if(keys["d"]) player.x += player.speed;

    // Spawn enemies
    if(Math.random() < 0.01) spawnEnemy();

    // Bullets
    bullets.forEach((b, i) => {

        b.x += b.vx;
        b.y += b.vy;

        enemies.forEach((enemy, j) => {
            if(rectCollision(b, enemy)){
                enemy.health -= 10;
                bullets.splice(i,1);

                if(enemy.health <= 0){
                    enemies.splice(j,1);
                    score++;
                }
            }
        });
    });

    // Enemy movement
    enemies.forEach((enemy, i) => {

        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        enemy.x += dx/dist * enemy.speed;
        enemy.y += dy/dist * enemy.speed;

        // Damage player bij aanraken
        if(rectCollision(enemy, player)){
            player.health -= 10;
            enemies.splice(i,1);
        }
    });

    // UI
    ammoUI.textContent = `Ammo: ${player.ammo}`;
    scoreUI.textContent = `Score: ${score}`;
    healthUI.textContent = `Health: ${player.health}`;

    if(player.health <= 0){
        gameOverUI.style.display = "block";
    }
}

// ---------------- DRAW ----------------

function draw(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // ===== PLAYER POPPETJE =====
    drawPlayer();

    // ===== BULLETS =====
    ctx.fillStyle = "yellow";
    bullets.forEach(b => {
        ctx.fillRect(b.x,b.y,5,5);
    });

    // ===== ENEMIES =====
    enemies.forEach(enemy => drawEnemy(enemy));

    // ===== PLAYER HEALTH ONDERIN =====
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Levens: ${player.health}`, canvas.width/2, canvas.height - 20);
}

// ---------------- PLAYER TEKENEN ----------------

function drawPlayer(){

    // Body
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(player.x, player.y, 20, 0, Math.PI*2);
    ctx.fill();

    // Wapen
    ctx.fillStyle = "gray";
    ctx.fillRect(player.x + 15, player.y - 5, 25, 10);
}

// ---------------- ENEMY TEKENEN ----------------

function drawEnemy(enemy){

    // Monster body
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, 15, 0, Math.PI*2);
    ctx.fill();

    // Ogen
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(enemy.x-5, enemy.y-3, 3, 0, Math.PI*2);
    ctx.arc(enemy.x+5, enemy.y-3, 3, 0, Math.PI*2);
    ctx.fill();

    // Levens boven hoofd
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(enemy.health, enemy.x, enemy.y - 25);
}

// ---------------- SHOOT ----------------

function shoot(event){

    if(player.ammo <= 0 || !player.canShoot || player.health <= 0) return;

    let rect = canvas.getBoundingClientRect();

    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    let dx = mouseX - player.x;
    let dy = mouseY - player.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    bullets.push({
        x: player.x,
        y: player.y,
        vx: dx/dist * 8,
        vy: dy/dist * 8
    });

    player.ammo--;
}

// ---------------- RELOAD ----------------

function reload(){
    player.ammo = player.maxAmmo;
}

// ---------------- SPAWN ENEMY ----------------

function spawnEnemy(){

    enemies.push({
        x: Math.random()*canvas.width,
        y: -20,
        health: 20,
        speed: 1.5,
        width: 30,
        height: 30
    });
}

// ---------------- COLLISION ----------------

function rectCollision(a,b){
    return Math.abs(a.x - b.x) < 20 &&
           Math.abs(a.y - b.y) < 20;
}

// ---------------- RESTART ----------------

function restartGame(){

    player.health = 100;
    player.ammo = player.maxAmmo;
    enemies = [];
    bullets = [];
    score = 0;

    gameOverUI.style.display = "none";
}
