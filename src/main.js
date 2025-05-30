document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const context = canvas.getContext("2d");
  const scoreElement = document.getElementById("scoreValue");
  const bestScoreElement = document.getElementById("highestScore");
  const themeToggleButton = document.getElementById("themeToggleBtn");

  if (
    !canvas ||
    !context ||
    !scoreElement ||
    !bestScoreElement ||
    !themeToggleButton
  ) {
    console.error("One or more essential HTML elements are missing.");
    return;
  }

  canvas.style.touchAction = "none";

  let bestScore = parseInt(localStorage.getItem("snakeBestScore")) || 0;
  bestScoreElement.textContent = bestScore;

  const grid = 16;
  const canvasSize = 512;
  const themes = {
    dark: {
      name: "dark",
      bodyBg: "#0a0a0a",
      bodyText: "#e5e5e5",
      wrapperBg: "#1c1c1c",
      canvasBg: "#0a0a0a",
      snake: "#4ade80",
      food: "#ef4444",
      scoreText: "#e5e5e5",
      emoji: "🌙",
    },
    light: {
      name: "light",
      bodyBg: "#f5f5f5",
      bodyText: "#1c1c1c",
      wrapperBg: "#ffffff",
      canvasBg: "#e5e5e5",
      snake: "#16a34a",
      food: "#dc2626",
      scoreText: "#1c1c1c",
      emoji: "☀️",
    },
  };
  let currentTheme = themes.dark;
  let isPaused = false;
  let gameOver = false;
  let animationFrameId = null;
  let gameLoopThrottleCount = 0;

  let snake = {
    x: canvasSize / 2 - grid,
    y: canvasSize / 2 - grid,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4,
  };
  let apple = {
    x: 0,
    y: 0,
  };

  let touchStartX = 0;
  let touchStartY = 0;
  const swipeThreshold = 30;

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function placeApple() {
    apple.x = getRandomInt(0, canvasSize / grid) * grid;
    apple.y = getRandomInt(0, canvasSize / grid) * grid;
    for (let i = 0; i < snake.cells.length; i++) {
      if (apple.x === snake.cells[i].x && apple.y === snake.cells[i].y) {
        placeApple();
        break;
      }
    }
  }

  function applyTheme() {
    document.body.style.backgroundColor = currentTheme.bodyBg;
    document.body.style.color = currentTheme.bodyText;
    document.body.className = currentTheme.name + "-theme";
    const gameWrapper = document.querySelector(".game-wrapper");
    if (gameWrapper) {
      gameWrapper.style.backgroundColor = currentTheme.wrapperBg;
    }
    const scoreDisplay = scoreElement.parentElement;
    if (scoreDisplay) {
      scoreDisplay.style.color = currentTheme.scoreText;
    }
    themeToggleButton.textContent =
      currentTheme.name === "dark" ? themes.light.emoji : themes.dark.emoji;
    themeToggleButton.style.backgroundColor = currentTheme.canvasBg;
    themeToggleButton.style.color = currentTheme.scoreText;

    context.fillStyle = currentTheme.canvasBg;
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (isPaused || !animationFrameId || gameOver) {
      drawApple();
      drawSnake();
    }
  }

  themeToggleButton.onmouseover = () => {
    themeToggleButton.style.opacity = "0.7";
  };
  themeToggleButton.onmouseout = () => {
    themeToggleButton.style.opacity = "1";
  };

  function drawSnake() {
    context.fillStyle = currentTheme.snake;
    snake.cells.forEach(function (cell) {
      context.fillRect(cell.x, cell.y, grid - 1, grid - 1);
    });
  }

  function drawApple() {
    context.fillStyle = currentTheme.food;
    context.fillRect(apple.x, apple.y, grid - 1, grid - 1);
  }

  function resetGame() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    snake.x = canvasSize / 2 - grid;
    snake.y = canvasSize / 2 - grid;
    snake.cells = [];
    snake.maxCells = 4;
    snake.dx = grid;
    snake.dy = 0;
    placeApple();
    scoreElement.textContent = 0;
    gameOver = false;
    isPaused = false;
    snake.cells.unshift({
      x: snake.x,
      y: snake.y,
    });
    applyTheme();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function gameLoop() {
    if (isPaused || gameOver) {
      return;
    }
    animationFrameId = requestAnimationFrame(gameLoop);
    if (++gameLoopThrottleCount < 4) {
      return;
    }
    gameLoopThrottleCount = 0;

    context.fillStyle = currentTheme.canvasBg;
    context.fillRect(0, 0, canvas.width, canvas.height);

    snake.x += snake.dx;
    snake.y += snake.dy;

    if (snake.x < 0) {
      snake.x = canvas.width - grid;
    } else if (snake.x >= canvas.width) {
      snake.x = 0;
    }
    if (snake.y < 0) {
      snake.y = canvas.height - grid;
    } else if (snake.y >= canvas.height) {
      snake.y = 0;
    }

    snake.cells.unshift({
      x: snake.x,
      y: snake.y,
    });

    if (snake.cells.length > snake.maxCells) {
      snake.cells.pop();
    }

    drawApple();
    drawSnake();

    if (snake.x === apple.x && snake.y === apple.y) {
      snake.maxCells++;
      const currentScore = snake.maxCells - 4;
      scoreElement.textContent = currentScore;
      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestScoreElement.textContent = bestScore;
        localStorage.setItem("snakeBestScore", bestScore);
      }
      placeApple();
    }

    for (let i = 1; i < snake.cells.length; i++) {
      if (snake.x === snake.cells[i].x && snake.y === snake.cells[i].y) {
        gameOver = true;
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        resetGame();
        return;
      }
    }
  }

  function togglePause() {
    if (gameOver && !isPaused) return;
    isPaused = !isPaused;
    if (isPaused) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      context.fillStyle = currentTheme.canvasBg;
      context.fillRect(0, 0, canvas.width, canvas.height);
      drawApple();
      drawSnake();
    } else {
      if (!animationFrameId && !gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
      e.preventDefault();
      togglePause();
      return;
    }

    if (isPaused || gameOver) return;

    const keyPressed = e.which;

    if (keyPressed === 37 && snake.dx === 0) {
      snake.dx = -grid;
      snake.dy = 0;
    } else if (keyPressed === 38 && snake.dy === 0) {
      snake.dy = -grid;
      snake.dx = 0;
    } else if (keyPressed === 39 && snake.dx === 0) {
      snake.dx = grid;
      snake.dy = 0;
    } else if (keyPressed === 40 && snake.dy === 0) {
      snake.dy = grid;
      snake.dx = 0;
    }
  });

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
  });

  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();

    if (e.changedTouches.length === 1) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (
        Math.abs(deltaX) > swipeThreshold ||
        Math.abs(deltaY) > swipeThreshold
      ) {
        if (isPaused || gameOver) return;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0 && snake.dx === 0) {
            snake.dx = grid;
            snake.dy = 0;
          } else if (deltaX < 0 && snake.dx === 0) {
            snake.dx = -grid;
            snake.dy = 0;
          }
        } else {
          if (deltaY > 0 && snake.dy === 0) {
            snake.dy = grid;
            snake.dx = 0;
          } else if (deltaY < 0 && snake.dy === 0) {
            snake.dy = -grid;
            snake.dx = 0;
          }
        }
      } else {
        togglePause();
      }
    }
  });

  themeToggleButton.addEventListener("click", () => {
    currentTheme = currentTheme.name === "dark" ? themes.light : themes.dark;
    applyTheme();
    if (isPaused) {
      context.fillStyle = currentTheme.canvasBg;
      context.fillRect(0, 0, canvas.width, canvas.height);
      drawApple();
      drawSnake();
    }
  });

  resetGame();
});
