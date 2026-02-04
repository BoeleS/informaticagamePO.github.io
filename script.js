const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ammoUI = document.getElementById("ammoUI");
const message = document.getElementById("message");
const pauseBtn = document.getElementById("pauseBtn");

let paused = false;
pauseBtn.onclick = () => paused = !paused;

// ---------------- PLAYER ----------------
const player = {
    x:450,
    y:300,
    hp:100,
    maxHp:100,
    ammo:20,
    maxAmmo:20,
    speed:4,
    damage:10,
    damageBoost:false,
    damageTimer:0
};

let mouse = {x:0,y:0};
let keys = {};
let bullets = [];
let enemies = [];
let enemyBullets = [];
let powerups = [];

// ---------------- WAVES ----------------
let wave = 1;
let waveTimer = 60;
let breakTimer = 0;
let state = "wave";

// ---------------- INPUT ----------------
document.addEventListener("keydown",e=>{
    keys[e.key.toLowerCase()] = true;
    if(e.key==="r") player.ammo = player.maxAmmo;
});
document.addEventListener("keyup",e=>keys[e.key.toLowerCase()] = false);

canvas.addEventListener("mousemove",e=>{
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
});

canvas.addEventListener("click",()=>{
    if(player.ammo<=0 || paused) return;
    shoot();
});

// ---------------- LOOP ----------------
function loop(){
    if(!paused){
        update();
        draw();
    }
    requestAnimationFrame(loop);
}
loop();

// ---------------- UPDATE ----------------
function update(){

    // movement
    if(keys.w) player.y -= player.speed;
    if(keys.s) player.y += player.speed;
    if(keys.a) player.x -= player.speed;
    if(keys.d) player.x += player.speed;

    // timers
    if(state==="wave"){
        waveTimer -= 1/60;
        if(waveTimer<=0){
            state="break";
            breakTimer=15;
            enemies=[];
            enemyBullets=[];
            showMessage("Wave voltooid");
        }
    }else{
        breakTimer -= 1/60;
        if(breakTimer<=0){
            state="wave";
            wave++;
            waveTimer=60;
            message.style.display="none";
        }
    }

    // spawn enemies
    if(state==="wave"){
        if(wave===1 && Math.random()<0.02) spawnEnemy("normal");
        if(wave===2 && Math.random()<0.015) spawnEnemy("spider");
        if(wave===3 && enemies.length===0) spawnEnemy("boss");
    }

    // powerups elke 15 sec
    if(Math.random()<0.002) spawnPowerup();

    // bullets
    bullets.forEach((b,i)=>{
        b.x+=b.vx; b.y+=b.vy;
        enemies.forEach((e,j)=>{
            if(dist(b,e)<20){
                e.hp -= player.damageBoost ? player.damage+10 : player.damage;
                bullets.splice(i,1);
                if(e.hp<=0) enemies.splice(j,1);
            }
        });
    });

    // enemies
    enemies.forEach((e,i)=>{
        let dx = player.x-e.x;
        let dy = player.y-e.y;
        let d = Math.hypot(dx,dy);
        e.x += dx/d*e.speed;
        e.y += dy/d*e.speed;

        if(e.type!=="boss" && d<25){
            player.hp -= 10;
            enemies.splice(i,1);
        }

        if(e.type==="spider" && Math.random()<0.01){
            enemyBullets.push({
                x:e.x,y:e.y,
                vx:dx/d*4,vy:dy/d*4,damage:5
            });
        }

        if(e.type==="boss" && Math.random()<0.02){
            enemyBullets.push({
                x:e.x,y:e.y,
                vx:dx/d*3,vy:dy/d*3,damage:20
            });
        }
    });

    // enemy bullets
    enemyBullets.forEach((b,i)=>{
        b.x+=b.vx; b.y+=b.vy;
        if(dist(b,player)<20){
            player.hp -= b.damage;
            enemyBullets.splice(i,1);
        }
    });

    // powerups
    powerups.forEach((p,i)=>{
        if(dist(p,player)<30){
            if(p.type==="health") player.hp=Math.min(100,player.hp+50);
            if(p.type==="damage"){
                player.damageBoost=true;
                player.damageTimer=15;
            }
            powerups.splice(i,1);
        }
    });

    // damage timer
    if(player.damageBoost){
        player.damageTimer-=1/60;
        if(player.damageTimer<=0) player.damageBoost=false;
    }

    ammoUI.textContent="Ammo: "+player.ammo;

    if(player.hp<=0){
        showMessage("GAME OVER");
        paused=true;
    }

    if(wave===4 && enemies.length===0){
        showMessage("LEVEL VOLTOOID");
        paused=true;
    }
}

// ---------------- DRAW ----------------
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawPlayer();
    bullets.forEach(drawBullet);
    enemies.forEach(drawEnemy);
    enemyBullets.forEach(drawEnemyBullet);
    powerups.forEach(drawPowerup);
    drawHealthBar();
}

// ---------------- DRAW FUNCTIONS ----------------
function drawPlayer(){
    let a=Math.atan2(mouse.y-player.y,mouse.x-player.x);
    ctx.save();
    ctx.translate(player.x,player.y);
    ctx.rotate(a);

    ctx.fillStyle="blue";
    ctx.fillRect(-8,10,6,15);
    ctx.fillRect(2,10,6,15);
    ctx.fillRect(-10,-5,20,20);
    ctx.fillRect(10,-2,25,4);

    ctx.fillStyle="#ffd1a6";
    ctx.beginPath();
    ctx.arc(0,-15,8,0,Math.PI*2);
    ctx.fill();

    ctx.restore();
}

function drawEnemy(e){
    ctx.fillStyle="red";
    if(e.type==="boss"){
        ctx.fillRect(e.x-40,e.y-40,80,80);
    }else{
        ctx.fillRect(e.x-10,e.y-10,20,20);
    }
}

function drawBullet(b){
    ctx.strokeStyle="cyan";
    ctx.beginPath();
    ctx.moveTo(b.x,b.y);
    ctx.lineTo(b.x-b.vx*2,b.y-b.vy*2);
    ctx.stroke();
}

function drawEnemyBullet(b){
    ctx.fillStyle="orange";
    ctx.beginPath();
    ctx.arc(b.x,b.y,6,0,Math.PI*2);
    ctx.fill();
}

function drawPowerup(p){
    ctx.fillStyle=p.type==="health"?"green":"red";
    ctx.fillRect(p.x-15,p.y-15,30,30);
    ctx.fillStyle="white";
    ctx.fillText(p.type==="health"?"+50":"+10",p.x-10,p.y+5);
}

function drawHealthBar(){
    ctx.fillStyle="black";
    ctx.fillRect(250,560,400,25);
    ctx.fillStyle="lime";
    ctx.fillRect(250,560,400*(player.hp/100),25);
}

// ---------------- HELPERS ----------------
function shoot(){
    let dx=mouse.x-player.x;
    let dy=mouse.y-player.y;
    let d=Math.hypot(dx,dy);
    bullets.push({x:player.x,y:player.y,vx:dx/d*8,vy:dy/d*8});
    player.ammo--;
}

function spawnEnemy(type){
    enemies.push({
        x:Math.random()*900,
        y:-20,
        hp:type==="boss"?500:type==="spider"?30:20,
        speed:type==="boss"?0.8:type==="spider"?1.5:1.8,
        type:type
    });
}

function spawnPowerup(){
    powerups.push({
        x:Math.random()*900,
        y:Math.random()*600,
        type:Math.random()<0.5?"health":"damage"
    });
}

function showMessage(t){
    message.textContent=t;
    message.style.display="block";
}

function dist(a,b){
    return Math.hypot(a.x-b.x,a.y-b.y);
}
