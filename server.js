var express = require('express');
var http = require('http');
var socket = require('socket.io');
var Game = require('./game');

var app = express();
var server = http.Server(app);
var io = socket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/rooms', (req, res) => res.json(rooms));

server.listen(process.env.PORT || 5000, () => console.log('Starting server on port 5000.'));

var rooms = {};

io.on('connection', function (socket) {
    // Events for room
    var leaving_room = function () {
        socket.broadcast.emit('disconnected_play')
        
        let room = findRoomByPlayer(socket.id);
        if (rooms[room] && rooms[room].players) {
            rooms[room].players.splice(rooms[room].players.indexOf(socket.id), 1);
            rooms[room].game = {};
        }
    }

    socket.on('leave_room', function (data) {
        leaving_room();
    });

    socket.on('disconnect', function (data) {
        leaving_room();
    })

    socket.on('join_room', function (room) {
        if (!rooms.hasOwnProperty(room)) {
            rooms[room] = { players: [] };
            io.emit('created_room', room);
        }
        rooms[room].players.push(socket.id);
        socket.join(room);
        io.emit('joined_room', socket.id);

        if (rooms[room].players.length === 2) {
            rooms[room].game = new Game.Game(rooms[room].players[0], rooms[room].players[1]);
            io.to(room).emit('started_game');

            let randomPlayer = getRandomPlayer(room);
            io.sockets.connected[randomPlayer].emit('play_turn');
        }
    });

    socket.on('restart_game', function (data) {
        let room = findRoomByPlayer(socket.id);
        rooms[room].game = new Game.Game(rooms[room].players[0], rooms[room].players[1]);
        io.to(room).emit('started_game');

        let randomPlayer = getRandomPlayer(room);
        io.sockets.connected[randomPlayer].emit('play_turn');
    });

    // EVENTS FOR GAME
    socket.on('draw_card', function (data) {
        let room = findRoomByPlayer(socket.id);
        let card = rooms[room].game.drawCard(socket.id);

        if (typeof card !== 'undefined') {
            socket.emit('drawn_card', card);
            socket.to(room).emit('drawn_enemy_card');
        } else {
            rooms[room].game.table = {};
            socket.to(room).emit('win_turn');
            socket.emit('lose_turn');
        }
    });

    socket.on('play_card', function (card) {
        let room = findRoomByPlayer(socket.id);

        socket.to(room).emit('played_enemy_card', card);

        let emptyHand = rooms[room].game.playCard(socket.id, card);

        if (Object.keys(rooms[room].game.table).length == 0) {
            rooms[room].game.table[socket.id] = card;
            socket.to(room).emit('play_turn');
        } else if (Object.keys(rooms[room].game.table).length == 1) {
            // validar se a segunda carta jogada é do mesmo naipe da anterior
            let game = rooms[room].game;

            let cardOnTable = game.table[Object.keys(game.table)]; // pega a carta jogada anteriormente
            if (!game.equalSuits(cardOnTable, card)) {
                socket.emit('wrong_card');
                socket.to(room).emit('wrong_enemy_card');
            } else {
                rooms[room].game.table[socket.id] = card;
                // descobre quem ganhou, limpa a mesa e envia as mensagens corretamente
                let orderedTurn = Object.entries(game.table).sort((a, b) => game.sortCards(a[1], b[1]));
                game.table = {};
                io.sockets.connected[orderedTurn[0][0]].emit('win_turn');
                io.sockets.connected[orderedTurn[1][0]].emit('lose_turn');
            }
        }

        if (emptyHand) {
            let room = findRoomByPlayer(socket.id);
            socket.emit('win_game');
            socket.to(room).emit('lose_game');
        }
    });
});

// UTIL FUNCTIONS
var findRoomByPlayer = (player) => Object.entries(rooms).find(r => r[1].includes(player))[0];
var getRandomPlayer = (room) => rooms[room].players[Math.floor(Math.random() * 2)];


// SOCKET.IO CHEATSHEET
// Sending to the client
// socket.emit('event', message);
// Sending to all clients except sender
// socket.broadcast.emit('event', message);
// Sending to all clients in 'game' room except sender
// socket.to(room).emit('event', message);
// Sending to all clients in 'game' room, including sender
// io.in(room).emit('event', message);
// Sending to an client id
// io.sockets.connected[socket.id].emit('event', message);