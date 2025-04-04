import { Point } from '../types/Point';

export class Grid {
  private grid: boolean[][];

  constructor(
    private readonly width: number,
    private readonly height: number
  ) {
    this.grid = Array(height).fill(null).map(() => 
      Array(width).fill(false)
    );
  }

  public reset(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = false;
      }
    }
  }

  public isOccupied(point: Point): boolean {
    return this.isInBounds(point) && this.grid[point.y][point.x];
  }

  public setOccupied(point: Point, value: boolean = true): void {
    if (this.isInBounds(point)) {
      this.grid[point.y][point.x] = value;
    }
  }

  public getRandomEmptyPosition(): Point {
    const emptyPositions: Point[] = [];
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.grid[y][x]) {
          emptyPositions.push({ x, y });
        }
      }
    }

    if (emptyPositions.length === 0) {
      throw new Error('No empty positions available');
    }

    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    return emptyPositions[randomIndex];
  }

  public isInBounds(point: Point): boolean {
    return (
      point.x >= 0 &&
      point.x < this.width &&
      point.y >= 0 &&
      point.y < this.height
    );
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }
} 