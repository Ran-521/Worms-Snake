import { Point } from '../types/Point';
import { Grid } from './Grid';

export class FoodManager {
  private currentFood: Point | null = null;

  constructor(private grid: Grid) {}

  public generateFood(): void {
    if (this.currentFood) {
      this.grid.setOccupied(this.currentFood, false);
    }

    try {
      this.currentFood = this.grid.getRandomEmptyPosition();
      this.grid.setOccupied(this.currentFood, true);
    } catch (error) {
      console.warn('无法生成食物：没有可用的空位置');
      this.currentFood = null;
    }
  }

  public checkCollision(point: Point): boolean {
    if (!this.currentFood) return false;
    return (
      point.x === this.currentFood.x &&
      point.y === this.currentFood.y
    );
  }

  public getCurrentFood(): Point | null {
    return this.currentFood ? { ...this.currentFood } : null;
  }

  public reset(): void {
    if (this.currentFood) {
      this.grid.setOccupied(this.currentFood, false);
      this.currentFood = null;
    }
  }
} 