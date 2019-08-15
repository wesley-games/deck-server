var express = require('express');
var http = require('http');
var socket = require('socket.io');
var Game = require('./game');

var app = express();
var server = http.Server(app);
var io = socket(server);

// armazena cada room criada e os clients conectadas nelas
var rooms = {};

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.get('/game', function (req, res) {
    let game = new Game.Game('wesley', 'midiã');
    res.json(game);
});

app.get('/deck', function (req, res) {
    let deck = new Game.Deck();
    res.json(deck);
});

app.get('/rooms', function (req, res) {
    res.json(rooms);
});

app.post('/rooms', function (req, res) {
    let body = req.body;
    res.json(req.body);
});

app.get('/rooms/:roomname/game', function (req, res) {
    let roomname = req.params.roomname;
    res.json(roomname);
});

server.listen(process.env.PORT || 5000, function () {
    console.log('Starting server on port 5000.')
});

io.on('connection', function (socket) {
    console.log('Socket connected: ' + socket.id);

    socket.on('join_room', function (roomname) {
        if (!rooms.hasOwnProperty(roomname)) {
            rooms[roomname] = [];
            io.emit('created_room', roomname);
        }
        socket.join(roomname);
        rooms[roomname].push(socket.id);
        io.emit('joined_room', socket.id);
    });
});