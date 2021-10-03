class Player {
    constructor({
        x,
        y,
        score,
        id,
        main
    }) {
        this.x = x;
        this.y = y;
        this.score = score;
        this.id = id;
        this.main = main;
        this.speed = 5;
        this.movingDirection = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        this.rank = 1;
    }

    moveDir(dir){
        this.movingDirection[dir] = true;
    }
    stopDir(dir){
        this.movingDirection[dir] = false;
    }

    draw(context, imgArray){
        Object.keys(this.movingDirection)
            .filter(d => this.movingDirection[d])
            .forEach(d => this.movePlayer(d, this.speed));
        if(this.main)
            context.drawImage(imgArray[0], this.x, this.y, 40, 40);
        else
            context.drawImage(imgArray[1], this.x, this.y, 40, 40);
    }


    movePlayer(dir, speed) {
        if (dir === 'up') this.y -= speed;
        if (dir === 'left') this.x -= speed;
        if (dir === 'down') this.y += speed;
        if (dir === 'right') this.x += speed;
    }

    collision(item) {
        this.score += item.value;
    }

    calculateRank(arr) {
        arr.sort((a, b) => b.score - a.score);
        let i;
        for(i = 0; i < arr.length; i++){
            if(arr[i].id == this.id) break;
        }
        this.rank = i + 1;
        return "Rank:" + this.rank + '/' + arr.length;
    }
}

export default Player;
