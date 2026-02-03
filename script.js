const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI elements
const healthUI = document.getElementById('health');
const ammoUI = document.getElementById('ammo');
const scoreUI = document.getElementById('score');
const gameOverUI = document.getElementById('gameOver');

// Player
let player = {
    x: canvas.width/2,
    y: canvas.height/2,
    width: 30,
    height: 30,
    color: 'blue',
    health: 100,
    speed: 5,
    ammo: 12,
    maxAmmo: 12,
    reloadTime: 1000, // in ms
    canShoot: true
};

// Bullets
let bullets = [];

// Enemies
let enemies = [];
let enemySpawnInterval = 2000;
let lastEnemySpawn = 0;
let score = 0;

// Controls
let keys = {};
document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if(e.key === 'r') reload();
    if(e.key === 'Enter' && player.health <= 0) restartGame();
});
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Shoot with mouse
canvas.addEventListener('click', () => {
    shoot();
});

// Game loop
let lastTime = 0;
function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// Functions
function update(dt) {
    if(player.health <= 0) return;

    // Movement
    if(keys['w']) player.y -= player.speed;
    if(keys['s']) player.y += player.speed;
    if(keys['a']) player.x -= player.speed;
    if(keys['d']) player.x += player.speed;

    // Boundaries
    if(player.x < 0) player.x = 0;
    if(player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    if(player.y < 0) player.y = 0;
    if(player.y > canvas.height - player.height) player.y = canvas.height - player.height;

    // Update bullets
    bullets.forEach((b, i) => {
        b.x += b.vx;
        b.y += b.vy;

        // Remove if off-screen
        if(b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) bullets.splice(i,1);

        // Check collision with enemies
        enemies.forEach((enemy, j) => {
            if(rectCollision(b, enemy)) {
                enemy.health -= 10;
                bullets.splice(i,1);
                if(enemy.health <= 0) {
                    enemies.splice(j,1);
                    score += 1;
                }
            }
        });
    });

    // Spawn enemies
    if(performance.now() - lastEnemySpawn > enemySpawnInterval) {
        spawnEnemy();
        lastEnemySpawn = performance.now();
    }

    // Move enemies
    enemies.forEach(enemy => {
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        enemy.x += (dx/dist) * enemy.speed;
        enemy.y += (dy/dist) * enemy.speed;

        // Damage player
        if(rectCollision(enemy, player)) {
            player.health -= 10;
            enemies.splice(enemies.indexOf(enemy),1);
        }
    });

    // Update UI
    healthUI.textContent = `Health: ${player.health}`;
    ammoUI.textContent = `Ammo: ${player.ammo}/${player.maxAmmo}`;
    scoreUI.textContent = `Score: ${score}`;

    if(player.health <= 0) {
        gameOverUI.style.display = 'block';
    }
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Bullets
    ctx.fillStyle = 'yellow';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 5, 5));

    // Enemies
    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
    });
}

function shoot() {
    if(!player.canShoot || player.ammo <= 0 || player.health <= 0) return;

    // Shoot bullet towards mouse
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    let dx = mouseX - (player.x + player.width/2);
    let dy = mouseY - (player.y + player.height/2);
    let dist = Math.sqrt(dx*dx + dy*dy);
    let speed = 10;

    bullets.push({
        x: player.x + player.width/2,
        y: player.y + player.height/2,
        vx: (dx/dist)*speed,
        vy: (dy/dist)*speed,
    });

    player.ammo -= 1;
}

function reload() {
    if(player.health <= 0) return;
    player.canShoot = false;
    setTimeout(() => {
        player.ammo = player.maxAmmo;
        player.canShoot = true;
    }, player.reloadTime);
}

function spawnEnemy() {
    let side = Math.floor(Math.random()*4);
    let enemy = {
        width: 30,
        height: 30,
        color: 'red',
        health: 20,
        speed: 2
    };

    switch(side){
        case 0: // top
            enemy.x = Math.random() * canvas.width;
            enemy.y = -30;
            break;
        case 1: // bottom
            enemy.x = Math.random() * canvas.width;
            enemy.y = canvas.height + 30;
            break;
        case 2: // left
            enemy.x = -30;
            enemy.y = Math.random() * canvas.height;
            break;
        case 3: // right
            enemy.x = canvas.width + 30;
            enemy.y = Math.random() * canvas.height;
            break;
    }
    enemies.push(enemy);
}

function rectCollision(a,b) {
    return a.x < b.x + b.width &&
           a.x + (a.width||5) > b.x &&
           a.y < b.y + b.height &&
           a.y + (a.height||5) > b.y;
}

function restartGame() {
    player.health = 100;
    player.ammo = player.maxAmmo;
    bullets = [];
    enemies = [];
    score = 0;
    gameOverUI.style.display = 'none';
}
