let board;
let boardWidth = 500;
let boardHeight = 500;
let context;
let player1Score = 0;
let player2Score = 0;
let ballSpeedMultiplier = 1.05;

let playerWidth = 10;
let playerHeight = 50;
let playerSpeed = 3;

let ballWidth = 10;
let ballHeight = 10;
let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: 1,
    velocityY: 2
};

// Player 1
let player1 = {
    x: 10,
    y: boardHeight / 2 - playerHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: 0
};

// Player 2 (AI)
let player2 = {
    x: boardWidth - playerWidth - 10,
    y: boardHeight / 2 - playerHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: 0
};

// Power-ups array (randomly dropping power-ups)
let powerUps = [];

// Sounds
let hitSound = new Audio("hit.wav");
let scoreSound = new Audio("score.wav");

// Track game mode (AI or 2-player)
let gameMode = '';

// Initial game setup
window.onload = function () {
    document.getElementById('start-menu').style.display = 'block';
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");
};

function startGame(mode) {
    gameMode = mode;
    document.getElementById('start-menu').style.display = 'none';
    board.style.display = 'block';
    requestAnimationFrame(update);
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
};

// Power-up drop function (randomly drop power-ups)
function dropPowerUp() {
    if (Math.random() < 0.01) { // 1% chance each frame to drop a power-up
        let powerUpType = Math.random() < 0.5 ? 'speed' : 'shrink';
        let xPosition = Math.random() * (boardWidth - 50);
        powerUps.push({
            x: xPosition,
            y: 0,
            type: powerUpType
        });
    }
}

// Power-ups collision detection
function checkPowerUpCollision() {
    powerUps = powerUps.filter(powerUp => {
        if (ball.x < powerUp.x + 10 && ball.x + ball.width > powerUp.x && ball.y < powerUp.y + 10 && ball.y + ball.height > powerUp.y) {
            activatePowerUp(powerUp.type);
            return false;
        }
        return true;
    });
}

// Activate power-up
function activatePowerUp(type) {
    if (type === "speed") {
        ball.velocityX *= 1.5;
        ball.velocityY *= 1.5;
    } else if (type === "shrink") {
        player1.height = Math.max(20, player1.height / 2); // Shrink player 1
        player2.height = Math.max(20, player2.height / 2); // Shrink player 2
    }
}

// Update AI behavior (Player 2)
function updateAI() {
    if (ball.y > player2.y + player2.height / 2) {
        player2.velocityY = playerSpeed;
    } else if (ball.y < player2.y + player2.height / 2) {
        player2.velocityY = -playerSpeed;
    } else {
        player2.velocityY = 0;
    }

    // AI power-up decision
    powerUps.forEach(powerUp => {
        if (ball.y + ball.height > powerUp.y && ball.x + ball.width > powerUp.x && ball.x < powerUp.x + 10) {
            if (powerUp.type === 'speed') {
                player2.velocityY = playerSpeed;
            } else if (powerUp.type === 'shrink') {
                player2.velocityY = 0;
            }
        }
    });
}

function update() {
    // Clear the board
    context.clearRect(0, 0, boardWidth, boardHeight);

    // Update player positions
    player1.y += player1.velocityY;
    player1.y = Math.max(0, Math.min(boardHeight - player1.height, player1.y));

    // Update AI for single-player mode
    if (gameMode === 'single') {
        updateAI();
    }
    player2.y += player2.velocityY;
    player2.y = Math.max(0, Math.min(boardHeight - player2.height, player2.y));

    // Draw players
    context.fillStyle = 'skyblue';
    context.fillRect(player1.x, player1.y, player1.width, player1.height);
    context.fillRect(player2.x, player2.y, player2.width, player2.height);

    // Update ball position
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillStyle = 'white';
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // Ball collision with top and bottom walls
    if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
        ball.velocityY *= -1;
        hitSound.play(); // Play sound
    }

    // Ball collision with paddles
    if (
        (ball.x <= player1.x + player1.width && ball.y + ball.height >= player1.y && ball.y <= player1.y + player1.height) ||
        (ball.x + ball.width >= player2.x && ball.y + ball.height >= player2.y && ball.y <= player2.y + player2.height)
    ) {
        ball.velocityX *= -1;
        hitSound.play(); // Play sound
    }

    // Power-up collision check
    checkPowerUpCollision();

    // Drop a power-up every frame
    dropPowerUp();

    // Update scores
    if (ball.x < 0) {
        player2Score++;
        scoreSound.play();
        resetGame(1);
    } else if (ball.x + ball.width > boardWidth) {
        player1Score++;
        scoreSound.play();
        resetGame(-1);
    }

    // Display scores
    context.font = "45px sans-serif";
    context.fillText(player1Score, boardWidth / 5, 45);
    context.fillText(player2Score, (boardWidth * 4) / 5 - 45, 45);

    // Create middle line
    for (let i = 10; i < board.height; i += 25) {
        context.fillRect(boardWidth / 2, i, 5, 5);
    }

    // Loop the game
    requestAnimationFrame(update);
}

function resetGame(direction) {
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: direction,
        velocityY: 2
    }
}

// Handle key down events for controls
function keyDownHandler(e) {
    // Player 1 controls
    if (e.code == "KeyW") {
        player1.velocityY = -playerSpeed;
    } else if (e.code == "KeyS") {
        player1.velocityY = playerSpeed;
    }

    // Player 2 controls
    if (e.code == "ArrowUp") {
        player2.velocityY = -playerSpeed;
    } else if (e.code == "ArrowDown") {
        player2.velocityY = playerSpeed;
    }
}

// Handle key up events for controls
function keyUpHandler(e) {
    // Player 1 controls
    if (e.code == "KeyW" || e.code == "KeyS") {
        player1.velocityY = 0;
    }

    // Player 2 controls
    if (e.code == "ArrowUp" || e.code == "ArrowDown") {
        player2.velocityY = 0;
    }
}
