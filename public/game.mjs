import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import controls from './controls.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');
const { width, height } = canvas;

const player_image = new Image(40, 40);
player_image.src = 'public/cat-player.png';

const enemy_image = new Image(40, 40);
enemy_image.src = 'public/cat-enemy1.png';

const coin_image = new Image(30, 30);
coin_image.src = 'public/coin.png';

const imgArray = [player_image, enemy_image];

let currPlayers = [];

let tick;

let coin = new Collectible({
    x: Math.floor(Math.random() * (width - 29)),
    y: Math.floor(Math.random() * (height - 29)),
    value: 1,
    id: "coin"
});

let mainPlayer;

function draw(){
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#162B32';
    context.fillRect(0, 0, width, height);
    currPlayers.forEach(player => {
        player.calculateRank(currPlayers);
        player.draw(context, imgArray);
    });
    console.log(mainPlayer.calculateRank(currPlayers));
    coin.draw(context, coin_image);

    tick = requestAnimationFrame(draw);
}

socket.on('init', (id, playerList) => {
    playerList.forEach(d => {
        let ids = currPlayers.map(f => f.id);
        if(!ids.includes(d.id))
            currPlayers.push(new Player(d));
    });

    mainPlayer = new Player({
        x: width / 2,
        y: height / 2,
        score: 0,
        id,
        main: true
    });
    controls(socket, mainPlayer);
    currPlayers.push(mainPlayer);

    socket.emit("new-player", mainPlayer);

    socket.on("new-player", obj => {
        let ids = currPlayers.map(d => d.id);
        if(!ids.includes(obj.id))
            currPlayers.push(new Player(obj));
    });

    socket.on("move-player", (dir, id, posObj) => {
        let movPlayer = currPlayers.filter(p => p.id == id)[0];
        movPlayer.moveDir(dir);

        movPlayer.x = posObj.x;
        movPlayer.y = posObj.y;
    });
    socket.on("stop-player", (dir, id, posObj) => {
        let movPlayer = currPlayers.filter(p => p.id == id)[0];
        movPlayer.stopDir(dir);
        movPlayer.x = posObj.x;
        movPlayer.y = posObj.y;
    });
    socket.on("delete-player", id => {
        currPlayers = currPlayers.filter(p => p.id != id);
    });
    socket.on('coin', emitted_coin => {
        coin = new Collectible(emitted_coin);
    });
    socket.on('update-score', (coin, id) => {
        currPlayers.find(d => d.id == id).collision(coin);
    });
    draw();

});

