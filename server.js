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
app.use(express.urlencoded({ extended: true }));

app.get('/rooms', (req, res) => res.json(rooms));

server.listen(process.env.PORT || 5000, () => console.log('Starting server on port 5000.'));

io.on('connection', function (socket) {
    console.log('Connected socket: ' + socket.id);

    // Events for room
    socket.on('join_room', function (room) {
        if (!rooms.hasOwnProperty(room)) {
            rooms[room] = { players: [] };
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

            let randomPlayer = getRandomPlayer(room);
            io.sockets.connected[randomPlayer].emit('start_player');
        }
    });

    // EVENTS FOR GAME
    socket.on('draw_card', function (data) {
        let room = findRoomByPlayer(socket.id);
        let card = rooms[room].deck.drawCard();

        socket.emit('drawn_card', card);
        socket.to(room).emit('drawn_enemy_card');
        console.log('Drawn card: ' + card);
    });

    socket.on('play_card', function (card) {
        let room = findRoomByPlayer(socket.id);

        socket.to(room).emit('playerd_enemy_card', card);
        console.log('Played card: ' + card);
    });
});

// UTIL FUNCTIONS
var findRoomByPlayer = function (player) {
    for (var room in rooms) {
        if (rooms[room].players.includes(player)) {
            return room;
        }
    }
}

var getRandomPlayer = (room) => rooms[room].players[Math.floor(Math.random() * 2)];