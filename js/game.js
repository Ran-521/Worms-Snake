class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        
        this.snake = new Snake(this.canvas.width, this.canvas.height, this.gridSize);
        this.food = new Food(this.canvas.width, this.canvas.height, this.gridSize);
        
        this.score = 0;
        this.highScore = getHighScore();
        this.gameLoop = null;
        this.isPaused = false;
        this.isGameOver = false;
        
        // 初始化音效
        this.eatSound = new Audio('assets/sounds/eat.mp3');
        this.gameOverSound = new Audio('assets/sounds/gameover.mp3');
        
        this.setupEventListeners();
        this.updateHighScoreDisplay();
    }

    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.snake.changeDirection('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.snake.changeDirection('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.snake.changeDirection('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.snake.changeDirection('right');
                    break;
            }
        });

        // 按钮控制
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('difficulty').addEventListener('change', () => this.updateSpeed());
    }

    start() {
        if (this.gameLoop) {
            this.reset();
        }
        this.isGameOver = false;
        this.isPaused = false;
        this.updateSpeed();
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    reset() {
        clearInterval(this.gameLoop);
        this.snake.reset();
        this.food.generate();
        this.score = 0;
        this.updateScoreDisplay();
        this.isGameOver = false;
        this.isPaused = false;
    }

    update() {
        if (this.isPaused || this.isGameOver) return;

        // 移动蛇并检查是否吃到食物
        const ateFood = this.snake.move(this.food);

        // 如果吃到食物，更新分数和食物位置
        if (ateFood) {
            this.score += 10;
            this.updateScoreDisplay();
            this.food.generate(this.snake.body);
            // 播放吃食物音效
            this.eatSound.currentTime = 0;
            this.eatSound.play();
        }

        // 检查碰撞
        if (this.snake.checkCollision()) {
            this.gameOver();
            return;
        }

        // 绘制游戏画面
        this.draw();
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格（可选）
        this.drawGrid();

        // 绘制蛇和食物
        this.snake.draw(this.ctx);
        this.food.draw(this.ctx);
    }

    drawGrid() {
        this.ctx.strokeStyle = '#eee';
        this.ctx.lineWidth = 0.5;

        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        updateHighScore(this.score);
        // 播放游戏结束音效
        this.gameOverSound.play();
        alert(`游戏结束！得分：${this.score}`);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? '继续' : '暂停';
    }

    updateSpeed() {
        const difficulty = document.getElementById('difficulty').value;
        this.speed = getGameSpeed(difficulty);
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.speed);
        }
    }

    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
    }

    updateHighScoreDisplay() {
        document.getElementById('highScore').textContent = this.highScore;
    }
}

// 初始化游戏
window.onload = () => {
    new Game();
}; 