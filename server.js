require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const helmet = require("helmet");
const cors = require("cors");


const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());

app.use(function(req, res, next) {
    res.setHeader('X-Powered-By', 'PHP 7.4.3');
    next();
});

const server = require('http').createServer(app);

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Index page (static HTML)
app.route('/')
    .get(function(req, res) {
        res.sendFile(process.cwd() + '/views/index.html');
    });

app.use(cors({
    origin: '*'
})); //For FCC testing purposes
fccTestingRoutes(app);


// 404 Not Found Middleware
app.use(function(req, res, next) {
    res.status(404)
        .type('text')
        .send('Not Found');
});

const portNum = process.env.PORT || 3000;
const io = socket(server);

let playerList = [];
let coin = {
    x: Math.floor(Math.random() * (640 - 29)),
    y: Math.floor(Math.random() * (480 - 29)),
    value: 1,
    id: Date.now(),
};


io.on('connection', socket => {
    console.log('A new user connected');
    socket.emit('init', socket.id, playerList);
    socket.emit('coin', coin);
    socket.on("new-player", player => {
        playerList.push(player);
        player.main = false;
        socket.broadcast.emit('new-player', player);
    });
    socket.on("move-player", (dir, id, posObj) => {
        socket.broadcast.emit('move-player', dir, id, posObj);
        let player = playerList.find(p => p.id == socket.id);
        player.x = posObj.x;
        player.y = posObj.y;
        if (checkCollision({
            x:player.x,
            y: player.y
        }, {
            x: coin.x,
            y: coin.y
        })) {
            console.log("Collision");
            coin.x = Math.floor(Math.random() * (640 - 29));
            coin.y = Math.floor(Math.random() * (480 - 29));
            coin.id = Date.now();
            io.emit('update-score', coin, player.id);
            io.emit('coin', coin);
        }


    });
    socket.on('stop-player', (dir, id, posObj) => {
        socket.broadcast.emit('stop-player', dir, id, posObj);
        let player = playerList.find(p => p.id == socket.id);
        player.x = posObj.x;
        player.y = posObj.y;
        if (checkCollision(player, coin)) {
            console.log("Collision");
            coin.x = Math.floor(Math.random() * (640 - 29));
            coin.y = Math.floor(Math.random() * (480 - 29));
            coin.id = Date.now();
            io.emit('update-score', coin, player.id);
            io.emit('coin', coin);
        }
    });
    socket.on('disconnecting', () => {
        console.log("A user disconnected");
        io.emit('delete-player', socket.id);
        playerList = playerList.filter(p => p.id != socket.id);
    });
});


// Set up server and tests
server.listen(portNum, () => {
    console.log(`Listening on port ${portNum}`);

    //Test execution
    if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(function() {
            try {
                runner.run();
            } catch (error) {
                console.log('Tests are not valid:');
                console.error(error);
            }
        }, 1500);
    }

});

function checkCollision(p, c) {
    return checkXcollision(p, c) && checkYcollision(p, c);
}
function checkXcollision(p, c){
    if(p.x <= c.x + 20 && p.x >= c.x) return true;
    if(p.x + 70 <= c.x + 20 && p.x + 70 >= c.x) return true;
    if(p.x + 70 <= c.x && p.x >= c.x) return true;
    if(p.x<= c.x + 20 && p.x + 70 >= c.x + 20) return true;
    return false;
}
function checkYcollision(p, c){
    if(p.y <= c.y + 20 && p.y >= c.y) return true;
    if(p.y + 70 <= c.y + 20 && p.y + 70 >= c.y) return true;
    if(p.y + 70 <= c.y && p.y >= c.y) return true;
    if(p.y <= c.y + 20 && p.y + 70 >= c.y + 20) return true;
    return false;
}

module.exports = app; // For testing
