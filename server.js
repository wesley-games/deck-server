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

app.get('/rooms', function (req, res) {
    res.json(rooms);
});

server.listen(process.env.PORT || 5000, function () {
    console.log('Starting server on port 5000.')
});

io.on('connection', function (socket) {
    console.log('Connected socket: ' + socket.id);

    // Events for room
    socket.on('join_room', function (room) {
        if (!rooms.hasOwnProperty(room)) {
            rooms[room] = {
                players: []
            };
            io.emit('created_room', room);
            console.log('Created room: ' + room);
        }
        rooms[room].players.push(socket.id);
        socket.join(room);
        io.emit('joined_room', socket.id);
        console.log('Joined room: ' + socket.id + ' - ' + room);
        if (rooms[room].players.length === 2) {
            rooms[room].deck = new Game.Deck();
            io.to(room).emit('started_game');
        }
    });

    // Events for game
    socket.on('draw_card', function (data) {
        for (var room in rooms) {
            if (rooms[room].players.includes(socket.id)) {
                let card = rooms[room].deck.drawCard();
                io.to(room).emit('drawn_card', card);
                console.log('Drawn card: ' + card);
                break;
            }
        }
    });

    socket.on('play_card', function (card) {
        for (var room in rooms) {
            if (rooms[room].players.includes(socket.id)) {
                io.to(room).emit('played_card', card);
                console.log('Played card: ' + card);
                break;
            }
        }
    });
});