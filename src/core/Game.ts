import { Point } from '../types/Point';
import { Direction } from '../types/Direction';
import { Snake } from './Snake';
import { FoodManager } from './FoodManager';
import { Grid } from './Grid';
import { ScoreManager } from './ScoreManager';

export class Game {
  private snake: Snake;
  private food: FoodManager;
  private grid: Grid;
  private score: ScoreManager;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastTime: number = 0;
  private readonly FPS: number = 60;
  private readonly frameTime: number = 1000 / 60;

  constructor(
    private readonly width: number = 30,
    private readonly height: number = 30,
    private readonly cellSize: number = 20
  ) {
    this.grid = new Grid(width, height);
    this.snake = new Snake(this.getInitialSnakePosition());
    this.food = new FoodManager(this.grid);
    this.score = new ScoreManager();
  }

  public init(): void {
    this.snake.reset(this.getInitialSnakePosition());
    this.food.generateFood();
    this.score.reset();
    this.isRunning = false;
    this.isPaused = false;
  }

  public start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.gameLoop();
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
      this.gameLoop();
    }
  }

  public reset(): void {
    this.init();
  }

  private gameLoop(): void {
    if (!this.isRunning || this.isPaused) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= this.frameTime) {
      this.update();
      this.lastTime = currentTime;
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    this.snake.move();
    
    // 检查碰撞
    if (this.checkCollision()) {
      this.gameOver();
      return;
    }

    // 检查是否吃到食物
    if (this.checkFoodCollision()) {
      this.snake.grow();
      this.score.addScore(10);
      this.food.generateFood();
    }
  }

  private checkCollision(): boolean {
    const head = this.snake.getHead();
    
    // 检查墙壁碰撞
    if (
      head.x < 0 ||
      head.x >= this.width ||
      head.y < 0 ||
      head.y >= this.height
    ) {
      return true;
    }

    // 检查自身碰撞
    return this.snake.checkSelfCollision();
  }

  private checkFoodCollision(): boolean {
    const head = this.snake.getHead();
    return this.food.checkCollision(head);
  }

  private gameOver(): void {
    this.isRunning = false;
    this.score.updateHighScore();
  }

  private getInitialSnakePosition(): Point {
    return {
      x: Math.floor(this.width / 2),
      y: Math.floor(this.height / 2)
    };
  }

  // Getters
  public getScore(): number {
    return this.score.getScore();
  }

  public getHighScore(): number {
    return this.score.getHighScore();
  }

  public getSnake(): Snake {
    return this.snake;
  }

  public getFood(): FoodManager {
    return this.food;
  }

  public getGrid(): Grid {
    return this.grid;
  }

  public isGameRunning(): boolean {
    return this.isRunning;
  }

  public isGamePaused(): boolean {
    return this.isPaused;
  }
} 