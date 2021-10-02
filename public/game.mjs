import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import controls from './controls.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');
const { width, height } = canvas;

let currPlayers = [];

let tick;



function draw(){
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#162B32';
    context.fillRect(0, 0, width, height);
    currPlayers.forEach(player => {
        player.draw(context);
    });
    tick = requestAnimationFrame(draw);
}

socket.on('init', (id, playerList) => {
    playerList.forEach(d => {
        let ids = currPlayers.map(f => f.id);
        if(!ids.includes(d.id))
            currPlayers.push(new Player(d));
    });

    let mainPlayer = new Player({
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
    draw();

});

