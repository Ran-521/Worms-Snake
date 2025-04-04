<!-- GameBoard.vue -->
<template>
  <div class="game-container">
    <div class="game-header">
      <ScorePanel :score="score" :high-score="highScore" />
      <ControlPanel 
        :is-running="isRunning" 
        :is-paused="isPaused"
        @start="startGame"
        @pause="pauseGame"
        @resume="resumeGame"
        @reset="resetGame"
      />
    </div>
    
    <div class="game-view">
      <canvas
        ref="gameCanvas"
        :width="canvasWidth"
        :height="canvasHeight"
        class="game-canvas"
        tabindex="0"
        @keydown="handleKeyPress"
      ></canvas>

      <!-- 游戏状态提示层 -->
      <div v-if="showOverlay" class="game-overlay" :class="overlayClass">
        <div class="overlay-content">
          <h2>{{ overlayTitle }}</h2>
          <p>{{ overlayMessage }}</p>
          <div class="overlay-buttons">
            <button v-if="isGameOver" @click="resetGame">重新开始</button>
            <button v-if="isPaused" @click="resumeGame">继续游戏</button>
          </div>
        </div>
      </div>
    </div>

    <div class="game-controls">
      <div class="mobile-controls">
        <button @click="handleDirectionChange(Direction.UP)" class="direction-btn up-btn">↑</button>
        <div class="horizontal-controls">
          <button @click="handleDirectionChange(Direction.LEFT)" class="direction-btn left-btn">←</button>
          <button @click="handleDirectionChange(Direction.RIGHT)" class="direction-btn right-btn">→</button>
        </div>
        <button @click="handleDirectionChange(Direction.DOWN)" class="direction-btn down-btn">↓</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import ScorePanel from './ScorePanel.vue';
import ControlPanel from './ControlPanel.vue';

// 游戏常量
enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3
}

interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const canvasWidth = GRID_SIZE * CELL_SIZE;
const canvasHeight = GRID_SIZE * CELL_SIZE;
const GAME_SPEED = 150; // 蛇移动间隔（毫秒）

// 响应式状态
const gameCanvas = ref<HTMLCanvasElement | null>(null);
const score = ref(0);
const highScore = ref(0);
const isRunning = ref(false);
const isPaused = ref(false);
const isGameOver = ref(false);

// 游戏状态
let snake: Point[] = [];
let food: Point = { x: 0, y: 0 };
let direction = Direction.RIGHT;
let nextDirection = Direction.RIGHT;
let gameInterval: number | null = null;

// 计算属性
const showOverlay = computed(() => isPaused.value || isGameOver.value);
const overlayClass = computed(() => ({
  'overlay-paused': isPaused.value,
  'overlay-gameover': isGameOver.value
}));
const overlayTitle = computed(() => {
  if (isGameOver.value) return '游戏结束';
  if (isPaused.value) return '游戏暂停';
  return '';
});
const overlayMessage = computed(() => {
  if (isGameOver.value) {
    const isNewHighScore = score.value === highScore.value && score.value > 0;
    return isNewHighScore 
      ? `恭喜！你获得了新的最高分：${score.value}分！`
      : `你的得分：${score.value}分`;
  }
  if (isPaused.value) return '按空格键或点击继续按钮恢复游戏';
  return '';
});

// 初始化游戏
const initGame = () => {
  // 初始化蛇
  const centerX = Math.floor(GRID_SIZE / 2);
  const centerY = Math.floor(GRID_SIZE / 2);
  snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];
  
  // 重置方向
  direction = Direction.RIGHT;
  nextDirection = Direction.RIGHT;
  
  // 生成食物
  generateFood();
  
  // 重置分数
  score.value = 0;
  
  // 加载最高分
  loadHighScore();
  
  // 状态重置
  isRunning.value = false;
  isPaused.value = false;
  isGameOver.value = false;
  
  // 绘制初始状态
  drawGame();
};

// 游戏控制
const startGame = () => {
  if (isRunning.value) return;
  
  if (isGameOver.value) {
    initGame();
  }
  
  isRunning.value = true;
  isPaused.value = false;
  isGameOver.value = false;
  
  gameLoop();
  gameCanvas.value?.focus();
};

const pauseGame = () => {
  if (!isRunning.value || isPaused.value) return;
  
  isPaused.value = true;
  if (gameInterval) {
    clearTimeout(gameInterval);
    gameInterval = null;
  }
};

const resumeGame = () => {
  if (!isRunning.value || !isPaused.value) return;
  
  isPaused.value = false;
  gameLoop();
  gameCanvas.value?.focus();
};

const resetGame = () => {
  if (gameInterval) {
    clearTimeout(gameInterval);
    gameInterval = null;
  }
  
  initGame();
  gameCanvas.value?.focus();
};

const endGame = () => {
  isRunning.value = false;
  isGameOver.value = true;
  
  if (gameInterval) {
    clearTimeout(gameInterval);
    gameInterval = null;
  }
  
  // 更新最高分
  if (score.value > highScore.value) {
    highScore.value = score.value;
    saveHighScore();
  }
};

// 游戏逻辑
const gameLoop = () => {
  if (!isRunning.value || isPaused.value) return;
  
  // 更新游戏状态
  updateGame();
  
  // 绘制游戏
  drawGame();
  
  // 继续游戏循环
  gameInterval = setTimeout(gameLoop, GAME_SPEED) as unknown as number;
};

const updateGame = () => {
  // 更新方向
  direction = nextDirection;
  
  // 计算新的蛇头位置
  const head = { ...snake[0] };
  
  switch (direction) {
    case Direction.UP:
      head.y -= 1;
      break;
    case Direction.RIGHT:
      head.x += 1;
      break;
    case Direction.DOWN:
      head.y += 1;
      break;
    case Direction.LEFT:
      head.x -= 1;
      break;
  }
  
  // 检查碰撞
  if (checkCollision(head)) {
    endGame();
    return;
  }
  
  // 添加新的蛇头
  snake.unshift(head);
  
  // 检查是否吃到食物
  if (head.x === food.x && head.y === food.y) {
    // 增加分数
    score.value += 10;
    
    // 生成新的食物
    generateFood();
  } else {
    // 如果没有吃到食物，移除蛇尾
    snake.pop();
  }
};

const checkCollision = (point: Point): boolean => {
  // 检查墙壁碰撞
  if (
    point.x < 0 ||
    point.x >= GRID_SIZE ||
    point.y < 0 ||
    point.y >= GRID_SIZE
  ) {
    return true;
  }
  
  // 检查自身碰撞（除了尾巴，因为它会移动）
  for (let i = 0; i < snake.length - 1; i++) {
    if (snake[i].x === point.x && snake[i].y === point.y) {
      return true;
    }
  }
  
  return false;
};

const generateFood = () => {
  const availablePositions: Point[] = [];
  
  // 找出所有可用位置
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      // 检查该位置是否被蛇占用
      let isOccupied = false;
      for (const segment of snake) {
        if (segment.x === x && segment.y === y) {
          isOccupied = true;
          break;
        }
      }
      
      if (!isOccupied) {
        availablePositions.push({ x, y });
      }
    }
  }
  
  if (availablePositions.length > 0) {
    // 随机选择一个位置作为食物
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    food = availablePositions[randomIndex];
  }
};

// 渲染函数
const drawGame = () => {
  const canvas = gameCanvas.value;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // 绘制背景
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // 绘制网格
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 0.5;
  
  for (let x = 0; x <= GRID_SIZE; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL_SIZE, 0);
    ctx.lineTo(x * CELL_SIZE, canvasHeight);
    ctx.stroke();
  }
  
  for (let y = 0; y <= GRID_SIZE; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL_SIZE);
    ctx.lineTo(canvasWidth, y * CELL_SIZE);
    ctx.stroke();
  }
  
  // 绘制食物
  ctx.fillStyle = '#FF5252';
  ctx.beginPath();
  ctx.arc(
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  // 绘制蛇
  for (let i = 0; i < snake.length; i++) {
    // 蛇身的颜色渐变：头部最深，尾部最浅
    const colorIntensity = Math.max(50, 100 - (i * 5));
    ctx.fillStyle = `rgb(0, ${colorIntensity}, 0)`;
    
    // 绘制圆角矩形
    roundRect(
      ctx,
      snake[i].x * CELL_SIZE + 1,
      snake[i].y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2,
      4
    );
    
    // 如果是蛇头，添加眼睛
    if (i === 0) {
      ctx.fillStyle = 'white';
      
      // 根据方向确定眼睛位置
      const eyeSize = 3;
      const eyeOffset = 4;
      
      let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
      
      switch (direction) {
        case Direction.UP:
          leftEyeX = snake[i].x * CELL_SIZE + eyeOffset;
          leftEyeY = snake[i].y * CELL_SIZE + eyeOffset;
          rightEyeX = snake[i].x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
          rightEyeY = snake[i].y * CELL_SIZE + eyeOffset;
          break;
        case Direction.RIGHT:
          leftEyeX = snake[i].x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
          leftEyeY = snake[i].y * CELL_SIZE + eyeOffset;
          rightEyeX = snake[i].x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
          rightEyeY = snake[i].y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
          break;
        case Direction.DOWN:
          leftEyeX = snake[i].x * CELL_SIZE + eyeOffset;
          leftEyeY = snake[i].y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
          rightEyeX = snake[i].x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
          rightEyeY = snake[i].y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
          break;
        case Direction.LEFT:
          leftEyeX = snake[i].x * CELL_SIZE + eyeOffset;
          leftEyeY = snake[i].y * CELL_SIZE + eyeOffset;
          rightEyeX = snake[i].x * CELL_SIZE + eyeOffset;
          rightEyeY = snake[i].y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
          break;
      }
      
      ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
      ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
    }
  }
};

// 绘制圆角矩形的辅助函数
const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
};

// 输入处理
const handleKeyPress = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowUp':
      handleDirectionChange(Direction.UP);
      event.preventDefault();
      break;
    case 'ArrowRight':
      handleDirectionChange(Direction.RIGHT);
      event.preventDefault();
      break;
    case 'ArrowDown':
      handleDirectionChange(Direction.DOWN);
      event.preventDefault();
      break;
    case 'ArrowLeft':
      handleDirectionChange(Direction.LEFT);
      event.preventDefault();
      break;
    case ' ':
      if (isRunning.value && !isPaused.value) {
        pauseGame();
      } else if (isPaused.value) {
        resumeGame();
      } else {
        startGame();
      }
      event.preventDefault();
      break;
  }
};

const handleDirectionChange = (newDirection: Direction) => {
  // 防止180度转向（蛇不能直接掉头）
  const oppositeDirections = {
    [Direction.UP]: Direction.DOWN,
    [Direction.RIGHT]: Direction.LEFT,
    [Direction.DOWN]: Direction.UP,
    [Direction.LEFT]: Direction.RIGHT
  };
  
  if (oppositeDirections[newDirection] !== direction) {
    nextDirection = newDirection;
  }
};

// 本地存储
const loadHighScore = () => {
  try {
    const storedHighScore = localStorage.getItem('snake-high-score');
    if (storedHighScore) {
      highScore.value = parseInt(storedHighScore, 10);
    }
  } catch (error) {
    console.warn('无法加载最高分', error);
  }
};

const saveHighScore = () => {
  try {
    localStorage.setItem('snake-high-score', highScore.value.toString());
  } catch (error) {
    console.warn('无法保存最高分', error);
  }
};

// 生命周期钩子
onMounted(() => {
  initGame();
  window.addEventListener('keydown', handleKeyPress);
  gameCanvas.value?.focus();
});

onUnmounted(() => {
  if (gameInterval) {
    clearTimeout(gameInterval);
    gameInterval = null;
  }
  window.removeEventListener('keydown', handleKeyPress);
});
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.game-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-view {
  position: relative;
}

.game-canvas {
  border: 2px solid #333;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  outline: none;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 5px;
}

.overlay-content {
  text-align: center;
  color: white;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.overlay-content h2 {
  font-size: 2em;
  margin-bottom: 10px;
}

.overlay-content p {
  font-size: 1.2em;
  margin-bottom: 20px;
}

.overlay-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.overlay-buttons button {
  padding: 10px 20px;
  font-size: 1.1em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  transition: all 0.3s;
}

.overlay-buttons button:hover {
  background-color: #45a049;
  transform: scale(1.05);
}

.overlay-paused {
  animation: fadeIn 0.3s ease-out;
}

.overlay-gameover {
  animation: slideIn 0.5s ease-out;
}

.game-controls {
  margin-top: 20px;
}

.mobile-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.horizontal-controls {
  display: flex;
  gap: 50px;
}

.direction-btn {
  width: 50px;
  height: 50px;
  font-size: 1.5em;
  border: none;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.direction-btn:hover {
  background-color: #45a049;
  transform: scale(1.1);
}

.direction-btn:active {
  transform: scale(0.95);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (min-width: 768px) {
  .game-controls {
    display: none;
  }
}
</style> 