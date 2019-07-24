var express = require('express');
var http = require('http');
var socket = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socket(server);

app.get('/', function (req, res) {
	res.send(players);
});

server.listen(5000, function () {
	console.log('Starting server on port 5000.')
});

io.on('connection', function (socket) {
    console.log('connected: ' + socket.id);
    
	socket.on('send_message', function (message) {
        console.log(socket.id + ': ' + message);

		socket.broadcast.emit('on_message', message);
	});
});
