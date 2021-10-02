class Player {
    constructor({
        x,
        y,
        score,
        id
    }) {
        this.x = x;
        this.y = y;
        this.score = score;
        this.id = id;
        this.speed = 5;
        this.movingDirection = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }

    moveDir(dir){
        this.movingDirection[dir] = true;
    }
    stopDir(dir){
        this.movingDirection[dir] = false;
    }

    draw(context){
        Object.keys(this.movingDirection)
            .filter(d => this.movingDirection[d])
            .forEach(d => this.movePlayer(d, this.speed));
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, 30, 30);
    }


    movePlayer(dir, speed) {
        if (dir === 'up') this.y -= speed;
        if (dir === 'left') this.x -= speed;
        if (dir === 'down') this.y += speed;
        if (dir === 'right') this.x += speed;
    }

    collision(item) {
        return;
    }

    calculateRank(arr) {
        return;
    }
}

export default Player;
