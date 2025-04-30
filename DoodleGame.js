const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 100,
    width: 40,
    height: 40,
    velocityY: 0,
    jumpStrength: 15,
    gravity: 0.6
};

let platforms = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
let gameOver = false;
let animationFrameId;

const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
highScoreDisplay.textContent = `High Score: ${highScore}`;

function createPlatform(x, y) {
    return { x, y, width: 80, height: 15 };
}

function generateInitialPlatforms() {
    platforms = [];
    const spacing = canvas.height / 7;
    for (let i = 0; i < 7; i++) {
        platforms.push(createPlatform(Math.random() * (canvas.width - 80), canvas.height - (i + 1) * spacing));
    }
    // Ensure there's a solid base under the player
    platforms.push(createPlatform(player.x - 20, player.y + player.height + 10));
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') player.x -= 20;
    if (e.code === 'ArrowRight') player.x += 20;
});

function updateGame() {
    if (gameOver) return;

    player.velocityY += player.gravity;
    player.y += player.velocityY;

    if (player.y < canvas.height / 2) {
        const diff = canvas.height / 2 - player.y;
        player.y = canvas.height / 2;
        score += Math.floor(diff);
        platforms.forEach(p => p.y += diff);
    }

    platforms.forEach((p) => {
        if (
            player.velocityY > 0 &&
            player.x + player.width > p.x &&
            player.x < p.x + p.width &&
            player.y + player.height > p.y &&
            player.y + player.height < p.y + p.height
        ) {
            player.velocityY = -player.jumpStrength;
        }
    });

    platforms = platforms.filter(p => p.y < canvas.height);

    while (platforms.length < 7) {
        let lastPlatformY = platforms[platforms.length - 1]?.y || 0;
        platforms.push(createPlatform(Math.random() * (canvas.width - 80), lastPlatformY - 80));
    }

    scoreDisplay.textContent = `Score: ${score}`;

    if (player.y > canvas.height) {
        gameOver = true;
        cancelAnimationFrame(animationFrameId);
        document.getElementById('game-over-container').style.display = 'block';
        document.getElementById('final-score').textContent = `Your Score: ${score}`;
        if (score > highScore) {
            localStorage.setItem('highScore', score);
            highScoreDisplay.textContent = `High Score: ${score}`;
        }
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff5e57';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    platforms.forEach((p) => {
        ctx.fillStyle = '#6c5ce7';
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
}

function gameLoop() {
    updateGame();
    drawGame();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function startGame() {
    player.x = canvas.width / 2 - 20;
    player.y = canvas.height - 100;
    player.velocityY = 0;
    score = 0;
    gameOver = false;
    generateInitialPlatforms();
    document.getElementById('game-over-container').style.display = 'none';
    cancelAnimationFrame(animationFrameId);
    gameLoop();
}

function restartGame() {
    startGame();
}

// Start the game on load
startGame();
