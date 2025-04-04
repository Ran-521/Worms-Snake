import { Point } from '../types/Point';
import { Direction } from '../types/Direction';

export class Snake {
  private body: Point[] = [];
  private direction: Direction = Direction.RIGHT;
  private growing: boolean = false;

  constructor(initialPosition: Point) {
    this.reset(initialPosition);
  }

  public reset(position: Point): void {
    this.body = [
      { ...position },
      { x: position.x - 1, y: position.y },
      { x: position.x - 2, y: position.y }
    ];
    this.direction = Direction.RIGHT;
    this.growing = false;
  }

  public move(): void {
    const head = this.getHead();
    let newHead: Point;

    switch (this.direction) {
      case Direction.UP:
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case Direction.RIGHT:
        newHead = { x: head.x + 1, y: head.y };
        break;
      case Direction.DOWN:
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case Direction.LEFT:
        newHead = { x: head.x - 1, y: head.y };
        break;
    }

    this.body.unshift(newHead);
    
    if (!this.growing) {
      this.body.pop();
    } else {
      this.growing = false;
    }
  }

  public setDirection(newDirection: Direction): void {
    // 防止180度转向
    const oppositeDirections = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT
    };

    if (oppositeDirections[newDirection] !== this.direction) {
      this.direction = newDirection;
    }
  }

  public grow(): void {
    this.growing = true;
  }

  public getHead(): Point {
    return { ...this.body[0] };
  }

  public getBody(): Point[] {
    return [...this.body];
  }

  public checkSelfCollision(): boolean {
    const head = this.getHead();
    return this.body.slice(1).some(segment => 
      segment.x === head.x && segment.y === head.y
    );
  }

  public getLength(): number {
    return this.body.length;
  }

  public getDirection(): Direction {
    return this.direction;
  }
} 