const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ammoUI = document.getElementById('ammo');
const scoreUI = document.getElementById('score');
const gameOverUI = document.getElementById('gameOver');

let mouse = {x:0,y:0};

// PLAYER
let player = {
    x: 400,
    y: 300,
    health: 100,
    ammo: 12,
    maxAmmo: 12,
    speed: 4
};

let bullets = [];
let enemies = [];
let score = 0;
let keys = {};

canvas.addEventListener("mousemove", e=>{
    let rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

document.addEventListener("keydown", e=>{
    keys[e.key.toLowerCase()] = true;

    if(e.key==="r") player.ammo = player.maxAmmo;
    if(e.key==="Enter" && player.health <=0) restartGame();
});

document.addEventListener("keyup", e=>{
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("click", shoot);

// ---------------- LOOP ----------------

function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();

// ---------------- UPDATE ----------------

function update(){

    if(player.health <=0) return;

    // Movement
    if(keys["w"]) player.y -= player.speed;
    if(keys["s"]) player.y += player.speed;
    if(keys["a"]) player.x -= player.speed;
    if(keys["d"]) player.x += player.speed;

    // Spawn enemies
    if(Math.random() < 0.015) spawnEnemy();

    // Bullets
    bullets.forEach((b,i)=>{
        b.x += b.vx;
        b.y += b.vy;

        enemies.forEach((enemy,j)=>{
            if(distance(b,enemy) < 18){
                enemy.health -= 10;
                bullets.splice(i,1);

                if(enemy.health <=0){
                    enemies.splice(j,1);
                    score++;
                }
            }
        });
    });

    // Enemy movement
    enemies.forEach((enemy,i)=>{
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        enemy.x += dx/dist * enemy.speed;
        enemy.y += dy/dist * enemy.speed;

        if(distance(enemy,player) < 25){
            player.health -= 10;
            enemies.splice(i,1);
        }
    });

    ammoUI.textContent = `Ammo: ${player.ammo}`;
    scoreUI.textContent = `Score: ${score}`;

    if(player.health <=0){
        gameOverUI.style.display = "block";
    }
}

// ---------------- DRAW ----------------

function draw(){

    // Background grid
    ctx.fillStyle = "#111";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawGrid();

    drawPlayer();

    bullets.forEach(drawBullet);

    enemies.forEach(drawEnemy);

    drawPlayerHealth();
}

// ---------------- GRID ----------------

function drawGrid(){
    ctx.strokeStyle = "#1a1a1a";

    for(let i=0;i<canvas.width;i+=40){
        ctx.beginPath();
        ctx.moveTo(i,0);
        ctx.lineTo(i,canvas.height);
        ctx.stroke();
    }

    for(let i=0;i<canvas.height;i+=40){
        ctx.beginPath();
        ctx.moveTo(0,i);
        ctx.lineTo(canvas.width,i);
        ctx.stroke();
    }
}

// ---------------- PLAYER ----------------

function drawPlayer(){

    let angle = Math.atan2(mouse.y-player.y, mouse.x-player.x);

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(angle);

    // Body
    ctx.fillStyle = "#2a8cff";
    ctx.beginPath();
    ctx.arc(0,0,18,0,Math.PI*2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#ffd6a5";
    ctx.beginPath();
    ctx.arc(0,-25,12,0,Math.PI*2);
    ctx.fill();

    // Gun
    ctx.fillStyle = "#555";
    ctx.fillRect(10,-4,28,8);

    ctx.fillStyle = "#222";
    ctx.fillRect(35,-2,8,4);

    ctx.restore();
}

// ---------------- PLAYER HEALTH ----------------

function drawPlayerHealth(){

    ctx.textAlign = "center";

    // Background bar
    ctx.fillStyle = "#333";
    ctx.fillRect(canvas.width/2 -150, canvas.height-40,300,25);

    // Health bar
    ctx.fillStyle = "#00ff88";
    ctx.fillRect(canvas.width/2 -150, canvas.height-40,300*(player.health/100),25);

    // Text
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`LEVEN: ${player.health}`, canvas.width/2, canvas.height-20);
}

// ---------------- ENEMY ----------------

function drawEnemy(enemy){

    // Monster body
    ctx.fillStyle = "#ff2a2a";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, 16, 0, Math.PI*2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(enemy.x-5, enemy.y-4, 3, 0, Math.PI*2);
    ctx.arc(enemy.x+5, enemy.y-4, 3, 0, Math.PI*2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y+2, 6, 0, Math.PI);
    ctx.stroke();

    // Health bar
    ctx.fillStyle = "#333";
    ctx.fillRect(enemy.x-15, enemy.y-28,30,5);

    ctx.fillStyle = "#00ff88";
    ctx.fillRect(enemy.x-15, enemy.y-28,30*(enemy.health/20),5);
}

// ---------------- BULLET ----------------

function drawBullet(b){
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(b.x,b.y,4,0,Math.PI*2);
    ctx.fill();
}

// ---------------- SHOOT ----------------

function shoot(){

    if(player.ammo <=0 || player.health<=0) return;

    let dx = mouse.x-player.x;
    let dy = mouse.y-player.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    bullets.push({
        x: player.x,
        y: player.y,
        vx: dx/dist*8,
        vy: dy/dist*8
    });

    player.ammo--;
}

// ---------------- ENEMY SPAWN ----------------

function spawnEnemy(){

    enemies.push({
        x: Math.random()*canvas.width,
        y: -20,
        health: 20,
        speed: 1.5
    });
}

// ---------------- UTILS ----------------

function distance(a,b){
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

function restartGame(){
    player.health = 100;
    player.ammo = player.maxAmmo;
    bullets = [];
    enemies = [];
    score = 0;
    gameOverUI.style.display = "none";
}
