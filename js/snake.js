class Snake {
    constructor(width, height, gridSize) {
        this.width = width;
        this.height = height;
        this.gridSize = gridSize;
        this.reset();
        // 加载篮球图片
        this.headImage = new Image();
        this.headImage.src = 'assets/images/basketball.png';
    }

    reset() {
        // 初始化蛇的位置在画布中间
        const startX = Math.floor((this.width / this.gridSize) / 2);
        const startY = Math.floor((this.height / this.gridSize) / 2);
        this.body = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
    }

    move(food) {
        this.direction = this.nextDirection;
        const head = { ...this.body[0] };

        // 根据方向移动蛇头
        switch (this.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }

        // 检查是否吃到食物
        const ateFood = isSamePosition(head, food.position);

        // 将新头部添加到身体数组的开头
        this.body.unshift(head);

        // 如果没有吃到食物，删除尾部；如果吃到了，保留尾部（蛇变长）
        if (!ateFood) {
            this.body.pop();
        }

        return ateFood;
    }

    changeDirection(newDirection) {
        // 防止蛇直接向相反方向移动
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[newDirection] !== this.direction) {
            this.nextDirection = newDirection;
        }
    }

    checkCollision() {
        const head = this.body[0];
        
        // 检查是否撞墙
        if (checkCollision(head, this.width / this.gridSize, this.height / this.gridSize)) {
            return true;
        }

        // 检查是否撞到自己
        return this.body.slice(1).some(segment => isSamePosition(segment, head));
    }

    draw(ctx) {
        this.body.forEach((segment, index) => {
            if (index === 0) {
                // 绘制篮球样式的蛇头
                ctx.save();
                // 计算旋转角度
                let angle = 0;
                switch(this.direction) {
                    case 'up': angle = -Math.PI/2; break;
                    case 'down': angle = Math.PI/2; break;
                    case 'left': angle = Math.PI; break;
                    case 'right': angle = 0; break;
                }
                
                // 移动到蛇头位置并旋转
                ctx.translate(
                    segment.x * this.gridSize + this.gridSize/2,
                    segment.y * this.gridSize + this.gridSize/2
                );
                ctx.rotate(angle);
                
                // 绘制篮球图片
                ctx.drawImage(
                    this.headImage,
                    -this.gridSize/2,
                    -this.gridSize/2,
                    this.gridSize,
                    this.gridSize
                );
                ctx.restore();
            } else {
                // 绘制蛇身
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(
                    segment.x * this.gridSize,
                    segment.y * this.gridSize,
                    this.gridSize,
                    this.gridSize
                );
            }
        });
    }
} 