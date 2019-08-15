var express = require('express');
var http = require('http');
var socket = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socket(server);

// armazena cada room criada e os clients conectadas nelas
var rooms = {};

app.get('/rooms', function (req, res) {
    res.send(JSON.stringify(rooms) + '\n');
});

server.listen(process.env.PORT || 5000, function () {
    console.log('Starting server on port 5000.')
});

io.on('connection', function (socket) {
    console.log('Socket connected: ' + socket.id);

    socket.on('join_room', function (roomname) {
        if (!rooms.hasOwnProperty(roomname)) {
            rooms[roomname] = { players : [] };
            io.emit('created_room', roomname);
        }
        rooms[roomname].players.push(socket.id);
        socket.join(roomname);
        io.emit('joined_room', socket.id);
        if (rooms[roomname].players.length === 2) {
            rooms[roomname].game = new Game(...[rooms[roomname].players]);
        }
    });
});