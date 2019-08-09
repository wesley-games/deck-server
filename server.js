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
            rooms[roomname] = [];
            io.emit('room_created', roomname);
            console.log('Room created: ' + roomname);
        }
        socket.join(roomname);
        rooms[roomname].push(socket.id);
        console.log(socket.id + ' joined the room ' + roomname);
    });
});
