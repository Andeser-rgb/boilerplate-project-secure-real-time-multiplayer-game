class Collectible {
    constructor({
        x,
        y,
        value,
        id
    }) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.id = id;
    }

    draw(context, img){
        context.drawImage(img, this.x, this.y, 30, 30);
    }


}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
    module.exports = Collectible;
} catch (e) {}

export default Collectible;
