const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Vogel eigenschappen
const bird = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    gravity: 0.6,
    lift: -12,
    velocity: 0
};

// Pijpen
const pipes = [];
const pipeWidth = 50;
const pipeGap = 150;

let frame = 0;
let score = 0;
let gameOver = false;

// Tekenen van de vogel
function drawBird() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

// Tekenen van de pijpen
function drawPipes() {
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });
}

// Nieuwe pijpen genereren
function generatePipes() {
    if (frame % 90 === 0) {
        const top = Math.random() * (canvas.height - pipeGap - 50) + 25;
        const bottom = canvas.height - top - pipeGap;
        pipes.push({ x: canvas.width, top, bottom });
    }
}

// Pijpen bewegen en score bijhouden
function updatePipes() {
    pipes.forEach(pipe => pipe.x -= 2);
    if (pipes.length && pipes[0].x + pipeWidth < 0) {
        pipes.shift();
        score++;
    }
}

// Botsing checken
function checkCollision() {
    for (let pipe of pipes) {
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
        ) {
            gameOver = true;
        }
    }
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver = true;
    }
}

// Score tekenen
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText("Score: " + score, 10, 40);
}

// Spel update
function update() {
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', 80, 300);
        ctx.font = '20px Arial';
        ctx.fillText('Refresh om opnieuw te starten', 60, 350);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frame++;
    drawBird();
    generatePipes();
    drawPipes();
    drawScore();

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    updatePipes();
    checkCollision();

    requestAnimationFrame(update);
}

// Vogel laten springen
document.addEventListener('keydown', () => {
    bird.velocity = bird.lift;
});

update();
