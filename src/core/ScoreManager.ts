export class ScoreManager {
  private score: number = 0;
  private highScore: number = 0;
  private readonly STORAGE_KEY = 'snake-game-high-score';

  constructor() {
    this.loadHighScore();
  }

  public addScore(points: number): void {
    this.score += points;
  }

  public getScore(): number {
    return this.score;
  }

  public getHighScore(): number {
    return this.highScore;
  }

  public updateHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  public reset(): void {
    this.score = 0;
  }

  private loadHighScore(): void {
    try {
      const savedScore = localStorage.getItem(this.STORAGE_KEY);
      if (savedScore) {
        this.highScore = parseInt(savedScore, 10);
      }
    } catch (error) {
      console.warn('无法加载最高分', error);
    }
  }

  private saveHighScore(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.highScore.toString());
    } catch (error) {
      console.warn('无法保存最高分', error);
    }
  }
} 