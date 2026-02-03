// ---------- GAME VARIABLES ----------
let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e=>keys[e.key.toLowerCase()]=true);
document.addEventListener("keyup", e=>keys[e.key.toLowerCase()]=false);

let player = {x:400, y:300, speed:3, health:100, ammo:50, oneShot:false, oneShotTimer:0};
let bullets = [];
let enemies = [];
let powerups = [];
let powerupTimer = 0;
let powerupInterval = 15; // seconden

let ammoUI = document.getElementById("ammo");
let gameOverUI = document.getElementById("gameover");

// ---------- PAUSE ----------
let paused = false;

// ---------- WAVES ----------
let waves = [
    {type:"normal", duration:60},    // Wave 1
    {type:"spiders", duration:60},   // Wave 2
    {type:"boss", duration:0}        // Wave 3
];

let currentWave = 0;
let waveTimer = 0;
let restTimer = 0;
let inRest = false;
let waveText = "";

// ---------- UTILITY FUNCTIONS ----------
function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }

// Spawn normale enemy
function spawnEnemy(){
    enemies.push({x:Math.random()*800, y:Math.random()*600, speed:1.5, health:30, damage:10, type:"normal"});
}

// Spawn spider die web schiet
function spawnSpider(){
    enemies.push({x:Math.random()*800, y:Math.random()*600, speed:1.2, health:25, damage:5, type:"spiderweb", fireTimer:1});
}

// Shoot spiderweb
function shootWeb(spider){
    bullets.push({x:spider.x, y:spider.y, vx:(player.x-spider.x)/50, vy:(player.y-spider.y)/50, type:"web", damage:5});
}

// Spawn boss
function spawnBoss(){
    enemies.push({x:400, y:100, speed:0.5, health:500, damage:20, type:"boss"});
}

// Spawn powerup
function spawnPowerup(){
    let types = ["health","damage"];
    let type = types[Math.floor(Math.random()*types.length)];
    powerups.push({x:Math.random()*800, y:Math.random()*600, type:type});
}

// ---------- UPDATE ----------
function update(){
    if(player.health<=0 || paused) return;

    // Player movement
    if(keys["w"]) player.y -= player.speed;
    if(keys["s"]) player.y += player.speed;
    if(keys["a"]) player.x -= player.speed;
    if(keys["d"]) player.x += player.speed;

    // ---------- WAVE & TIMER ----------
    if(!inRest){
        waveTimer += 1/60;

        // Spawn enemies based on wave
        if(waves[currentWave].type === "normal" && Math.random()<0.02) spawnEnemy();
        if(waves[currentWave].type === "spiders" && Math.random()<0.015) spawnSpider();
        if(waves[currentWave].type === "boss" && enemies.length===0) spawnBoss();

        // Check wave end (alleen wave 1 & 2)
        if(waveTimer >= waves[currentWave].duration && waves[currentWave].type !== "boss"){
            inRest = true;
            restTimer = 0;
            waveText = "Wave voltooid!";
            waveTimer = 0;

            // **ALLE ENEMIES OP SCHERM DODEN**
            enemies = [];
        }
    } else {
        restTimer += 1/60;
        if(restTimer >= 15){ // nu 15 seconden rust
            inRest = false;
            waveText = "";
            currentWave++;
            if(currentWave >= waves.length){
                waveText = "Level completed!";
                enemies = [];
            }
        }
    }

    // ---------- BULLETS ----------
    bullets.forEach((b,i)=>{
        b.x += b.vx;
        b.y += b.vy;

        enemies.forEach((enemy,j)=>{
            if(dist(b,enemy)<18){
                enemy.health -= b.damage || 10;
                bullets.splice(i,1);
                if(enemy.health<=0) enemies.splice(j,1);
            }
        });
    });

    // ---------- ENEMY MOVEMENT ----------
    enemies.forEach((enemy,i)=>{
        if(enemy.type==="spiderweb"){
            enemy.fireTimer -= 1/60;
            if(enemy.fireTimer <=0){
                shootWeb(enemy);
                enemy.fireTimer = 2;
            }
        }

        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let d = Math.sqrt(dx*dx+dy*dy);

        enemy.x += dx/d * enemy.speed;
        enemy.y += dy/d * enemy.speed;

        if(dist(enemy,player)<25){
            player.health -= enemy.damage || 10;
            if(enemy.type !== "spiderweb") enemies.splice(i,1); // spinnen blijven leven
        }
    });

    // ---------- POWERUPS ----------
    powerupTimer += 1/60;
    if(powerupTimer >= powerupInterval){
        spawnPowerup();
        powerupTimer = 0;
    }

    powerups.forEach((p,i)=>{
        if(dist(p,player)<30){
            if(p.type==="health") player.health = Math.min(100,player.health+50);
            if(p.type==="damage"){
                player.oneShot = true;
                player.oneShotTimer = 10;
            }
            powerups.splice(i,1);
        }
    });

    // ---------- ONE SHOT TIMER ----------
    if(player.oneShot){
        player.oneShotTimer -= 1/60;
        if(player.oneShotTimer <=0) player.oneShot = false;
    }

    ammoUI.textContent = "Ammo: " + player.ammo;
    if(player.health<=0) gameOverUI.style.display="block";
}

// ---------- DRAW ----------
function draw(){
    ctx.clearRect(0,0,800,600);

    // Player
    ctx.fillStyle="blue";
    ctx.beginPath();
    ctx.arc(player.x,player.y,15,0,Math.PI*2);
    ctx.fill();

    // Enemies
    enemies.forEach(e=>{
        if(e.type==="normal") ctx.fillStyle="red";
        if(e.type==="spiderweb") ctx.fillStyle="purple";
        if(e.type==="boss") ctx.fillStyle="green";
        ctx.beginPath();
        ctx.arc(e.x,e.y,20,0,Math.PI*2);
        ctx.fill();
    });

    // Bullets
    bullets.forEach(b=>{
        ctx.fillStyle = b.type==="web"?"orange":"black";
        ctx.beginPath();
        ctx.arc(b.x,b.y,5,0,Math.PI*2);
        ctx.fill();
    });

    // Powerups
    powerups.forEach(p=>{
        ctx.fillStyle = p.type==="health"?"pink":"yellow";
        ctx.beginPath();
        ctx.arc(p.x,p.y,10,0,Math.PI*2);
        ctx.fill();
    });

    // Wave timer
    if(!inRest && currentWave<waves.length && waves[currentWave].type!=="boss"){
        ctx.fillStyle="black";
        ctx.font="30px Arial";
        ctx.textAlign="center";
        ctx.fillText(Math.ceil(waves[currentWave].duration - waveTimer),400,40);
    }

    // Wave text
    if(waveText){
        ctx.fillStyle="black";
        ctx.font="40px Arial";
        ctx.textAlign="center";
        ctx.fillText(waveText,400,300);
    }

    // Pauzeerknop linksboven
    ctx.fillStyle = paused ? "red" : "green";
    ctx.fillRect(10,10,80,40);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(paused?"PAUSED":"PAUSE",50,35);
}

// ---------- MOUSE CLICK ----------
canvas.addEventListener("click", e=>{
    let mx = e.offsetX;
    let my = e.offsetY;
    if(mx>=10 && mx<=90 && my>=10 && my<=50){
        paused = !paused;
    }
});

// ---------- GAME LOOP ----------
function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
