// 获取随机整数
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 检查两个位置是否相等
function isSamePosition(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

// 获取本地存储的最高分
function getHighScore() {
    return parseInt(localStorage.getItem('snakeHighScore')) || 0;
}

// 更新最高分
function updateHighScore(score) {
    const currentHighScore = getHighScore();
    if (score > currentHighScore) {
        localStorage.setItem('snakeHighScore', score);
    }
}

// 根据难度获取游戏速度
function getGameSpeed(difficulty) {
    switch (difficulty) {
        case 'easy':
            return 150;
        case 'medium':
            return 100;
        case 'hard':
            return 70;
        default:
            return 100;
    }
}

// 检查是否发生碰撞
function checkCollision(position, width, height) {
    return position.x < 0 || position.x >= width || position.y < 0 || position.y >= height;
} 