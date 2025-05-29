# 🐍 Snake

This is a fun and minimalistic Snake Game built as a desktop application using **Tauri** and **HTML5 Canvas**. Designed for a smooth offline gaming experience with beautiful themes and responsive controls.

## 🎮 About

The Snake Game is a classic arcade-style game where you control a snake to eat food, grow longer, and avoid colliding with yourself. This desktop version includes theme toggling and keyboard controls for a seamless and modern gameplay experience.

## ✨ Features

* 🎨 **Dark/Light Theme Toggle:** Switch between 🌙 Dark Mode and ☀️ Light Mode with a single click.
* 🕹️ **Keyboard Controls:** Use arrow keys to move the snake. Press `Space` to pause or resume.
* 💻 **Canvas-Based Rendering:** Smooth animation and wall wrapping logic built using HTML5 Canvas.
* 🚫 **Self-Collision Detection:** The game ends when the snake runs into itself, just like the classic.
* 🔁 **Auto Reset:** The game resets automatically after a game-over to keep the fun going.

## 🛠️ Technologies Used

* **Tauri:** For building a fast and lightweight desktop application.
* **HTML5 + Canvas API:** Handles the rendering of the game grid, snake, and food.
* **CSS3 (with Tailwind):** Provides responsive design and dynamic theme transitions.
* **JavaScript:** Core game logic, input handling, theme switching, and rendering.

## 📦 How to Run Locally

> Make sure you have [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites) installed (Rust, Node.js, etc.).

```bash
# Clone this repository
git clone https://github.com/your-username/snake-tauri-app.git
cd snake-tauri-app

# Install dependencies
npm install

# Run the Tauri app
npm run tauri dev
```

## 📁 Folder Structure

```
.
├── src-tauri/           # Tauri backend and config files
├── index.html           # Main HTML file with canvas and controls
├── main.js              # Snake game logic and theme handling
├── styles.css           # Custom CSS styles and Tailwind tweaks
└── README.md            # This file!
```

### [License](LICENSE.md)

`Copyright (C) 2025 Rajveer Singh Saggu`