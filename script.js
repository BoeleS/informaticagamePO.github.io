const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ammoUI = document.getElementById("ammoUI");
const gameOverUI = document.getElementById("gameOver");

let mouse = {x:0,y:0};
canvas.addEventListener("mousemove", e=>{
    let rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

// ---------- PLAYER ----------
let player = {
    x:450,
    y:300,
    health:100,
    ammo:12,
    maxAmmo:12,
    speed:3,
    oneShot:false,
    oneShotTimer:0
};

let keys = {};
let bullets = [];
let enemies = [];
let powerups = [];

document.addEventListener("keydown", e=>{
    keys[e.key.toLowerCase()] = true;
    if(e.key==="r") player.ammo = player.maxAmmo;
    if(e.key==="Enter" && player.health<=0) restart();
});
document.addEventListener("keyup", e=>{
    keys[e.key.toLowerCase()] = false;
});
canvas.addEventListener("click", shoot);

// ---------- WAVES ----------
let waves = [
    {type:"normal", duration:60},    // Wave 1, 1 min, normale monsters
    {type:"spiders", duration:60},   // Wave 2, 1 min, spinnen
    {type:"boss", duration:0}        // Wave 3, eindbaas
];

let currentWave = 0;
let waveTimer = 0;
let restTimer = 0;
let inRest = false;
let waveText = "";

function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();

// ---------- UPDATE ----------
function update(){
    if(player.health<=0) return;

    // Movement
    if(keys["w"]) player.y -= player.speed;
    if(keys["s"]) player.y += player.speed;
    if(keys["a"]) player.x -= player.speed;
    if(keys["d"]) player.x += player.speed;

    // Wave & timer logic
    if(!inRest){
        waveTimer += 1/60;

        // Spawn enemies based on wave
        if(waves[currentWave].type === "normal" && Math.random()<0.02) spawnEnemy();
        if(waves[currentWave].type === "spiders" && Math.random()<0.015) spawnSpider();
        if(waves[currentWave].type === "boss" && enemies.length===0) spawnBoss();

        // Check wave end
        if(waveTimer >= waves[currentWave].duration && waves[currentWave].type !== "boss"){
            inRest = true;
            restTimer = 0;
            waveText = "Wave voltooid!";
            waveTimer = 0;
        }
    } else {
        restTimer += 1/60;
        if(restTimer >= 10){
            inRest = false;
            waveText = "";
            currentWave++;
            if(currentWave >= waves.length){
                waveText = "Level completed!";
                enemies = [];
            }
        }
    }

    // ONE SHOT TIMER
    if(player.oneShot){
        player.oneShotTimer -= 1/60;
        if(player.oneShotTimer <=0) player.oneShot = false;
    }

    // BULLETS
    bullets.forEach((b,i)=>{
        b.x += b.vx;
        b.y += b.vy;

        enemies.forEach((enemy,j)=>{
            if(dist(b,enemy)<18){
                if(player.oneShot || enemy.type==="boss" && player.oneShot) enemy.health = 0;
                else enemy.health -=10;
                bullets.splice(i,1);
                if(enemy.health<=0) enemies.splice(j,1);
            }
        });
    });

    // ENEMY MOVEMENT
    enemies.forEach((enemy,i)=>{
        if(enemy.type==="spiderweb"){
            enemy.fireTimer -= 1/60;
            if(enemy.fireTimer <=0){
                shootWeb(enemy);
                enemy.fireTimer = 2; // elke 2 sec een web
            }
        }

        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let d = Math.sqrt(dx*dx+dy*dy);

        enemy.x += dx/d * enemy.speed;
        enemy.y += dy/d * enemy.speed;

        if(dist(enemy,player)<25){
            player.health -= enemy.damage || 10;
            enemies.splice(i,1);
        }
    });

    // POWERUP PICKUP
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

    ammoUI.textContent = "Ammo: " + player.ammo;
    if(player.health<=0) gameOverUI.style.display="block";
}

// ---------- DRAW ----------
function draw(){
    drawBackground();
    drawPlayer();
    bullets.forEach(drawLaser);
    enemies.forEach(drawEnemy);
    powerups.forEach(drawPowerup);
    drawHealthBar();

    // Wave timer & text
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";

    if(!inRest && waves[currentWave].type !== "boss")
        ctx.fillText(`Wave Timer: ${Math.ceil(waves[currentWave].duration - waveTimer)}`, canvas.width/2, 40);

    if(waveText) ctx.fillText(waveText, canvas.width/2, canvas.height/2);
}

// ---------- SPAWN FUNCTIONS ----------
function spawnEnemy(){
    enemies.push({x:Math.random()*canvas.width, y:-20, health:20, speed:1.3, type:"normal"});
}

function spawnSpider(){
    enemies.push({x:Math.random()*canvas.width, y:-20, health:25, speed:1.5, type:"spiderweb", fireTimer:2, damage:5});
}

function spawnBoss(){
    enemies.push({x:canvas.width/2, y:-60, health:500, speed:1, type:"boss"});
}

// ---------- SPIDER SHOOT ----------
function shootWeb(spider){
    bullets.push({
        x: spider.x,
        y: spider.y,
        vx: (player.x-spider.x)/dist(player,spider)*4,
        vy: (player.y-spider.y)/dist(player,spider)*4,
        damage: 5,
        color: "purple"
    });
}

// ---------- POWERUPS ----------
let powerupTimer = 0;
const powerupInterval = 15; // seconden

function spawnPowerup(){
    let type = Math.random()<0.5 ? "health":"damage";
    powerups.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, type:type});
}

// ---------- DRAW FUNCTIONS ----------
function drawBackground(){
    let gradient = ctx.createLinearGradient(0,0,0,canvas.height);
    gradient.addColorStop(0,"#020024");
    gradient.addColorStop(1,"#090979");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

function drawPlayer(){
    let angle = Math.atan2(mouse.y-player.y, mouse.x-player.x);
    ctx.save();
    ctx.translate(player.x,player.y);
    ctx.rotate(angle);

    ctx.fillStyle="blue"; // benen
    ctx.fillRect(-6,12,5,15);
    ctx.fillRect(1,12,5,15);

    ctx.fillRect(-10,-10,20,25); // body
    ctx.fillRect(-15,-5,10,4); ctx.fillRect(5,-5,10,4); // armen

    ctx.fillStyle="#ffd1a6"; // hoofd
    ctx.beginPath(); ctx.arc(0,-18,10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="black"; ctx.fillRect(-3,-20,2,2); ctx.fillRect(1,-20,2,2); // gezicht
    ctx.fillStyle="gray"; ctx.fillRect(10,-3,28,6); // wapen
    ctx.restore();
}

function drawEnemy(enemy){
    ctx.fillStyle=enemy.type==="boss"?"darkgreen":enemy.type==="spiderweb"?"darkorange":"darkred";

    // body
    ctx.fillRect(enemy.x-10,enemy.y-10,20,20);
    // benen
    ctx.fillRect(enemy.x-5,enemy.y+10,4,12); ctx.fillRect(enemy.x+1,enemy.y+10,4,12);
    // armen
    ctx.fillRect(enemy.x-18,enemy.y-5,8,4); ctx.fillRect(enemy.x+10,enemy.y-5,8,4);
    // hoofd
    ctx.beginPath(); ctx.arc(enemy.x,enemy.y-18,10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="black"; ctx.fillRect(enemy.x-4,enemy.y-20,3,3); ctx.fillRect(enemy.x+1,enemy.y-20,3,3);
    ctx.beginPath(); ctx.arc(enemy.x,enemy.y-14,5,0,Math.PI); ctx.stroke();

    // health bar
    ctx.fillStyle="black"; ctx.fillRect(enemy.x-15,enemy.y-35,30,5);
    ctx.fillStyle="lime"; ctx.fillRect(enemy.x-15,enemy.y-35,30*(enemy.health/(enemy.type==="boss"?500:enemy.type==="spiderweb"?25:20)),5);
}

function drawPowerup(p){
    if(p.type==="health"){ctx.fillStyle="green"; ctx.fillRect(p.x-15,p.y-15,30,30); ctx.fillStyle="white"; ctx.font="14px Arial"; ctx.textAlign="center"; ctx.fillText("+50",p.x,p.y+5);}
    if(p.type==="damage"){ctx.fillStyle="red"; ctx.fillRect(p.x-15,p.y-15,30,30); ctx.fillStyle="white"; ctx.font="14px Arial"; ctx.textAlign="center"; ctx.fillText("+10",p.x,p.y+5);}
}

function drawLaser(b){
    ctx.strokeStyle=b.color || "cyan"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(b.x,b.y); ctx.lineTo(b.x - b.vx*2, b.y - b.vy*2); ctx.stroke();
}

function drawHealthBar(){
    ctx.fillStyle="black"; ctx.fillRect(canvas.width/2-200,canvas.height-40,400,30);
    ctx.fillStyle="lime"; ctx.fillRect(canvas.width/2-200,canvas.height-40,400*(player.health/100),30);
    ctx.fillStyle="white"; ctx.font="22px Arial"; ctx.textAlign="center"; ctx.fillText("LEVEN: "+player.health, canvas.width/2, canvas.height-18);
}

// ---------- SHOOT ----------
function shoot(){
    if(player.ammo<=0 || player.health<=0) return;
    let dx = mouse.x-player.x; let dy = mouse.y-player.y; let d = Math.sqrt(dx*dx+dy*dy);
    bullets.push({x:player.x,y:player.y,vx:dx/d*9,vy:dy/d*9});
    player.ammo--;
}

// ---------- UTILS ----------
function dist(a,b){return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);}

function restart(){
    player.health=100; player.ammo=12; player.oneShot=false;
    enemies=[]; bullets=[]; powerups=[];
    currentWave=0; waveTimer=0; inRest=false; waveText="";
    gameOverUI.style.display="none";
}
