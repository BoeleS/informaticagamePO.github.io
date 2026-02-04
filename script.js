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
let powerupInterval = 15;

let ammoUI = document.getElementById("ammo");
let gameOverUI = document.getElementById("gameover");

// ---------- WAVES ----------
let waves = [
    {type:"normal", duration:60},
    {type:"spiders", duration:60},
    {type:"boss", duration:0}
];

let currentWave = 0;
let waveTimer = 0;
let restTimer = 0;
let inRest = false;
let waveText = "";

// ---------- UTILS ----------
function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }

// ---------- SPAWNS ----------
function spawnEnemy(){
    enemies.push({x:Math.random()*800, y:Math.random()*600, speed:1.5, health:30, damage:10, type:"normal"});
}

function spawnSpider(){
    enemies.push({
        x:Math.random()*800,
        y:Math.random()*600,
        speed:1.2,
        health:25,
        type:"spider",
        fireTimer:2
    });
}

function shootWeb(spider){
    let dx = player.x - spider.x;
    let dy = player.y - spider.y;
    let d = Math.hypot(dx,dy);
    bullets.push({
        x:spider.x,
        y:spider.y,
        vx:dx/d*4,
        vy:dy/d*4,
        type:"web",
        damage:5
    });
}

function spawnBoss(){
    enemies.push({x:400, y:100, speed:0.5, health:500, damage:20, type:"boss"});
}

function spawnPowerup(){
    let type = Math.random()<0.5 ? "health" : "damage";
    powerups.push({x:Math.random()*800, y:Math.random()*600, type});
}

// ---------- UPDATE ----------
function update(){
    if(player.health<=0) return;

    // Movement
    if(keys["w"]) player.y -= player.speed;
    if(keys["s"]) player.y += player.speed;
    if(keys["a"]) player.x -= player.speed;
    if(keys["d"]) player.y += 0 && (player.x += 0); // noop safety

    // ---------- WAVES ----------
    if(!inRest){
        waveTimer += 1/60;

        if(waves[currentWave].type==="normal" && Math.random()<0.02) spawnEnemy();
        if(waves[currentWave].type==="spiders" && Math.random()<0.015) spawnSpider();
        if(waves[currentWave].type==="boss" && enemies.length===0) spawnBoss();

        if(waveTimer >= waves[currentWave].duration && waves[currentWave].type!=="boss"){
            inRest = true;
            restTimer = 0;
            waveText = "Wave voltooid!";
            waveTimer = 0;
            enemies = []; // 🔥 alles dood
        }
    } else {
        restTimer += 1/60;
        if(restTimer >= 15){
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

        // Web raakt speler
        if(b.type==="web" && dist(b,player)<15){
            player.health -= 5;
            bullets.splice(i,1);
        }

        // Player bullet raakt enemy
        enemies.forEach((e,j)=>{
            if(b.type!=="web" && dist(b,e)<18){
                e.health -= 10;
                bullets.splice(i,1);
                if(e.health<=0) enemies.splice(j,1);
            }
        });
    });

    // ---------- ENEMIES ----------
    enemies.forEach((e,i)=>{
        if(e.type==="spider"){
            e.fireTimer -= 1/60;
            if(e.fireTimer<=0){
                shootWeb(e);
                e.fireTimer = 2;
            }
        }

        let dx = player.x - e.x;
        let dy = player.y - e.y;
        let d = Math.hypot(dx,dy);
        e.x += dx/d * e.speed;
        e.y += dy/d * e.speed;

        if(dist(e,player)<25 && e.type!=="spider"){
            player.health -= e.damage || 10;
            enemies.splice(i,1);
        }
    });

    // ---------- POWERUPS ----------
    powerupTimer += 1/60;
    if(powerupTimer >= powerupInterval){
        spawnPowerup();
        powerupTimer = 0;
    }

    powerups.forEach((p,i)=>{
        if(dist(p,player)<25){
            if(p.type==="health") player.health = Math.min(100,player.health+50);
            if(p.type==="damage"){
                player.oneShot = true;
                player.oneShotTimer = 10;
            }
            powerups.splice(i,1);
        }
    });

    if(player.oneShot){
        player.oneShotTimer -= 1/60;
        if(player.oneShotTimer<=0) player.oneShot=false;
    }

    ammoUI.textContent = "Ammo: " + player.ammo;
    if(player.health<=0) gameOverUI.style.display="block";
}

// ---------- DRAW ----------
function draw(){
    ctx.clearRect(0,0,800,600);

    ctx.fillStyle="blue";
    ctx.beginPath();
    ctx.arc(player.x,player.y,15,0,Math.PI*2);
    ctx.fill();

    enemies.forEach(e=>{
        ctx.fillStyle = e.type==="boss"?"green":e.type==="spider"?"purple":"red";
        ctx.beginPath();
        ctx.arc(e.x,e.y,20,0,Math.PI*2);
        ctx.fill();
    });

    bullets.forEach(b=>{
        ctx.fillStyle = b.type==="web"?"orange":"black";
        ctx.beginPath();
        ctx.arc(b.x,b.y,5,0,Math.PI*2);
        ctx.fill();
    });

    powerups.forEach(p=>{
        ctx.fillStyle = p.type==="health"?"pink":"yellow";
        ctx.beginPath();
        ctx.arc(p.x,p.y,10,0,Math.PI*2);
        ctx.fill();
    });

    if(!inRest && waves[currentWave].type!=="boss"){
        ctx.fillStyle="black";
        ctx.font="30px Arial";
        ctx.textAlign="center";
        ctx.fillText(Math.ceil(waves[currentWave].duration-waveTimer),400,40);
    }

    if(waveText){
        ctx.font="40px Arial";
        ctx.fillText(waveText,400,300);
    }
}

// ---------- LOOP ----------
function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();
