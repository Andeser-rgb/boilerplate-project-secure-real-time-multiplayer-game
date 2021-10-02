require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

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

//For FCC testing purposes
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

io.on('connection', socket => {
    console.log('A new user connected');
    socket.emit('init', socket.id, playerList);
    socket.on("new-player", player => {
        playerList.push(player);
        socket.broadcast.emit('new-player', player);
    });
    socket.on("move-player", (dir, id, posObj) => {
        socket.broadcast.emit('move-player', dir, id, posObj);
        let player = playerList.find(p => p.id == socket.id);
        player.x = posObj.x;
        player.y = posObj.y;

    });
    socket.on('stop-player', (dir, id, posObj) => {
        socket.broadcast.emit('stop-player', dir, id, posObj);
        let player = playerList.find(p => p.id == socket.id);
        player.x = posObj.x;
        player.y = posObj.y;
    });
    socket.on('disconnecting', () => {
        console.log("A user disconnected");
        io.emit('delete-player', socket.id);
        playerList = playerList.filter(p => p.id != socket.id);
    });
});


io.on('key_pressed', socket => {
    console.log(socket);
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

module.exports = app; // For testing
