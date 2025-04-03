class Food {
    constructor(width, height, gridSize) {
        this.width = width;
        this.height = height;
        this.gridSize = gridSize;
        this.position = { x: 0, y: 0 };
        this.generate();
    }

    generate(snake = []) {
        let newPosition;
        do {
            newPosition = {
                x: getRandomInt(0, (this.width / this.gridSize) - 1),
                y: getRandomInt(0, (this.height / this.gridSize) - 1)
            };
        } while (this.isOnSnake(newPosition, snake));

        this.position = newPosition;
    }

    isOnSnake(position, snake) {
        return snake.some(segment => isSamePosition(segment, position));
    }

    draw(ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(
            this.position.x * this.gridSize,
            this.position.y * this.gridSize,
            this.gridSize,
            this.gridSize
        );
    }
} 