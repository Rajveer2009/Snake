// Ensure the DOM is fully loaded before trying to access elements
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const context = canvas.getContext("2d");
  const scoreElement = document.getElementById("scoreValue");
  const themeToggleButton = document.getElementById("themeToggleBtn");

  // Ensure elements are found before proceeding
  if (!canvas || !context || !scoreElement || !themeToggleButton) {
    console.error("One or more essential HTML elements are missing.");
    return; // Stop script execution if elements are not found
  }

  const grid = 16;
  const canvasSize = 512;
  // Canvas width and height are set in HTML, but good to have here for reference or dynamic changes
  // canvas.width = canvasSize;
  // canvas.height = canvasSize;

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
    document.body.className = currentTheme.name + "-theme"; // For CSS to target

    const gameWrapper = document.querySelector(".game-wrapper");
    if (gameWrapper) {
      // Check if element exists
      gameWrapper.style.backgroundColor = currentTheme.wrapperBg;
    }

    const scoreDisplay = scoreElement.parentElement;
    if (scoreDisplay) {
      // Check if element exists
      scoreDisplay.style.color = currentTheme.scoreText;
    }

    themeToggleButton.textContent =
      currentTheme.name === "dark" ? themes.light.emoji : themes.dark.emoji;
    themeToggleButton.style.backgroundColor = currentTheme.canvasBg;
    themeToggleButton.style.color = currentTheme.scoreText;

    context.fillStyle = currentTheme.canvasBg;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw game elements if game is in a static state
    if (isPaused || !animationFrameId || gameOver) {
      // Added gameOver here
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

    // Initialize the first cell for drawing
    snake.cells.unshift({ x: snake.x, y: snake.y });

    applyTheme(); // This will clear canvas and draw initial snake/apple

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

    // Wall wrapping logic
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

    snake.cells.unshift({ x: snake.x, y: snake.y });
    if (snake.cells.length > snake.maxCells) {
      snake.cells.pop();
    }

    drawApple();
    drawSnake();

    // Apple eaten
    if (snake.x === apple.x && snake.y === apple.y) {
      snake.maxCells++;
      scoreElement.textContent = snake.maxCells - 4;
      placeApple();
    }

    // Self collision
    for (let i = 1; i < snake.cells.length; i++) {
      if (snake.x === snake.cells[i].x && snake.y === snake.cells[i].y) {
        gameOver = true;
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        // Don't reset immediately, allow the last frame to be shown briefly
        // or handle game over state visually before reset if desired.
        // For now, we will reset after a short delay or on next input.
        // For simplicity of this refactor, let's stick to immediate reset:
        resetGame();
        return;
      }
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
      e.preventDefault();
      if (gameOver && !isPaused) return; // Prevent pause if game over and not already paused

      isPaused = !isPaused;
      if (isPaused) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        // Redraw current state when paused
        context.fillStyle = currentTheme.canvasBg;
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawApple();
        drawSnake();
      } else {
        // Resuming
        if (!animationFrameId && !gameOver) {
          // Only resume if not already running and not game over
          animationFrameId = requestAnimationFrame(gameLoop);
        }
      }
      return;
    }

    // If game is paused or over, only allow unpausing via Space
    if (isPaused || gameOver) return;

    const keyPressed = e.which;
    if (keyPressed === 37 && snake.dx === 0) {
      // Left
      snake.dx = -grid;
      snake.dy = 0;
    } else if (keyPressed === 38 && snake.dy === 0) {
      // Up
      snake.dy = -grid;
      snake.dx = 0;
    } else if (keyPressed === 39 && snake.dx === 0) {
      // Right
      snake.dx = grid;
      snake.dy = 0;
    } else if (keyPressed === 40 && snake.dy === 0) {
      // Down
      snake.dy = grid;
      snake.dx = 0;
    }
  });

  themeToggleButton.addEventListener("click", () => {
    currentTheme = currentTheme.name === "dark" ? themes.light : themes.dark;
    applyTheme();
    // If game is paused, ensure the static display updates with the new theme
    if (isPaused) {
      context.fillStyle = currentTheme.canvasBg;
      context.fillRect(0, 0, canvas.width, canvas.height);
      drawApple();
      drawSnake();
    }
  });

  // Initial setup
  resetGame(); // Start the game
});
