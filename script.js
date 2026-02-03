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

// PLAYER
let player = {
    x:450,
    y:300,
    health:100,
    ammo:12,
    maxAmmo:12,
    speed:3
};

let keys = {};
let bullets = [];
let enemies = [];

document.addEventListener("keydown", e=>{
    keys[e.key.toLowerCase()] = true;

    if(e.key==="r") player.ammo = player.maxAmmo;
    if(e.key==="Enter" && player.health<=0) restart();
});

document.addEventListener("keyup", e=>{
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("click", shoot);

// -------- LOOP --------

function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();

// -------- UPDATE --------

function update(){

    if(player.health<=0) return;

    // Movement
    if(keys["w"]) player.y -= player.speed;
    if(keys["s"]) player.y += player.speed;
    if(keys["a"]) player.x -= player.speed;
    if(keys["d"]) player.x += player.speed;

    // Spawn enemies
    if(Math.random()<0.02) spawnEnemy();

    bullets.forEach((b,i)=>{
        b.x += b.vx;
        b.y += b.vy;

        enemies.forEach((enemy,j)=>{
            if(dist(b,enemy)<18){
                enemy.health -=10;
                bullets.splice(i,1);

                if(enemy.health<=0){
                    enemies.splice(j,1);
                }
            }
        });
    });

    enemies.forEach((enemy,i)=>{
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let d = Math.sqrt(dx*dx+dy*dy);

        enemy.x += dx/d * enemy.speed;
        enemy.y += dy/d * enemy.speed;

        if(dist(enemy,player)<25){
            player.health -=10;
            enemies.splice(i,1);
        }
    });

    ammoUI.textContent = "Ammo: " + player.ammo;

    if(player.health<=0){
        gameOverUI.style.display="block";
    }
}

// -------- DRAW --------

function draw(){

    drawBackground();

    drawPlayer();

    bullets.forEach(drawLaser);

    enemies.forEach(drawEnemy);

    drawHealthBar();
}

// -------- BACKGROUND --------

function drawBackground(){

    let gradient = ctx.createLinearGradient(0,0,0,canvas.height);
    gradient.addColorStop(0,"#020024");
    gradient.addColorStop(1,"#090979");

    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

// -------- PLAYER --------

function drawPlayer(){

    let angle = Math.atan2(mouse.y-player.y, mouse.x-player.x);

    ctx.save();
    ctx.translate(player.x,player.y);
    ctx.rotate(angle);

    // BENEN
    ctx.fillStyle="blue";
    ctx.fillRect(-6,12,5,15);
    ctx.fillRect(1,12,5,15);

    // LICHAAM
    ctx.fillRect(-10,-10,20,25);

    // ARMEN
    ctx.fillRect(-15,-5,10,4);
    ctx.fillRect(5,-5,10,4);

    // HOOFD
    ctx.fillStyle="#ffd1a6";
    ctx.beginPath();
    ctx.arc(0,-18,10,0,Math.PI*2);
    ctx.fill();

    // GEZICHT
    ctx.fillStyle="black";
    ctx.fillRect(-3,-20,2,2);
    ctx.fillRect(1,-20,2,2);

    // WAPEN
    ctx.fillStyle="gray";
    ctx.fillRect(10,-3,28,6);

    ctx.restore();
}

// -------- ENEMY --------

function drawEnemy(enemy){

    // BENEN
    ctx.fillStyle="darkred";
    ctx.fillRect(enemy.x-5,enemy.y+10,4,12);
    ctx.fillRect(enemy.x+1,enemy.y+10,4,12);

    // LICHAAM
    ctx.fillRect(enemy.x-10,enemy.y-10,20,20);

    // ARMEN
    ctx.fillRect(enemy.x-18,enemy.y-5,8,4);
    ctx.fillRect(enemy.x+10,enemy.y-5,8,4);

    // HOOFD
    ctx.beginPath();
    ctx.arc(enemy.x,enemy.y-18,10,0,Math.PI*2);
    ctx.fill();

    // ENG GEZICHT
    ctx.fillStyle="black";
    ctx.fillRect(enemy.x-4,enemy.y-20,3,3);
    ctx.fillRect(enemy.x+1,enemy.y-20,3,3);

    ctx.beginPath();
    ctx.arc(enemy.x,enemy.y-14,5,0,Math.PI);
    ctx.stroke();

    // HEALTH BAR
    ctx.fillStyle="black";
    ctx.fillRect(enemy.x-15,enemy.y-35,30,5);

    ctx.fillStyle="lime";
    ctx.fillRect(enemy.x-15,enemy.y-35,30*(enemy.health/20),5);
}

// -------- LASER --------

function drawLaser(b){

    ctx.strokeStyle="cyan";
    ctx.lineWidth=3;

    ctx.beginPath();
    ctx.moveTo(b.x,b.y);
    ctx.lineTo(b.x - b.vx*2, b.y - b.vy*2);
    ctx.stroke();
}

// -------- PLAYER HEALTH BAR --------

function drawHealthBar(){

    ctx.fillStyle="black";
    ctx.fillRect(canvas.width/2-200,canvas.height-40,400,30);

    ctx.fillStyle="lime";
    ctx.fillRect(canvas.width/2-200,canvas.height-40,400*(player.health/100),30);

    ctx.fillStyle="white";
    ctx.font="22px Arial";
    ctx.textAlign="center";
    ctx.fillText("LEVEN: "+player.health, canvas.width/2, canvas.height-18);
}

// -------- SHOOT --------

function shoot(){

    if(player.ammo<=0 || player.health<=0) return;

    let dx = mouse.x-player.x;
    let dy = mouse.y-player.y;
    let d = Math.sqrt(dx*dx+dy*dy);

    bullets.push({
        x:player.x,
        y:player.y,
        vx:dx/d*9,
        vy:dy/d*9
    });

    player.ammo--;
}

// -------- ENEMY SPAWN --------

function spawnEnemy(){
    enemies.push({
        x:Math.random()*canvas.width,
        y:-20,
        health:20,
        speed:1.3
    });
}

// -------- UTIL --------

function dist(a,b){
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

function restart(){
    player.health=100;
    player.ammo=12;
    enemies=[];
    bullets=[];
    gameOverUI.style.display="none";
}
