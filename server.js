var express = require('express');
var http = require('http');
var socket = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socket(server);

var rooms = [];

app.get('/rooms', function (req, res) {
	res.send(rooms);
});

server.listen(process.env.PORT || 5000, function () {
	console.log('Starting server on port 5000.')
});

io.on('connection', function (socket) {
    console.log('Socket connected: ' + socket.id);
    
    socket.on('create_room', function (roomname) {
        socket.join(roomname);
        rooms.push(roomname);
        io.emit('room_created', roomname);
        console.log('Room created: ' + roomname);
    });

    socket.on('join_room', function (roomname) {
        socket.join(roomname);
    });
});
