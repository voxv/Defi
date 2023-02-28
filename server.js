
if (process && process.env.NODE_ENV === "production") {
	const { exec } = require('child_process');
	exec('npm install', (err, stdout, stderr) => {
	  if (err) {
		console.error(`Error: ${err}`);
		return;
	  }
	  console.error(`stderr: ${stderr}`);
	});
}

const https = require('https');
const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const fs = require('fs');
const app = express();

app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is up and running' });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/card.html');
});

app.use(express.static(__dirname));

const serv = http.createServer(app)

const io = require('socket.io')

const server = new io.Server(serv);

serv.listen(3000);

let gameState = {};
let totPlayers = 0
let playersById = {}
let playersReady = []
const sockets = new Set();
const playerState = {
  id: -1,
  username: '',
  avatar: ''
};

server.on('connection', (socket) => {

  let theid
  if (totPlayers==0) {
	  theid = 'player1'
  } else if (totPlayers==1) {
	  theid = 'player2'
  }

  totPlayers++

  var playerstate =  Object.assign({}, playerState)
  playerstate.id = theid
  let player = { socket: socket, state: playerstate };
  socket.player = player
  socket.on('message', (message) => {
	console.log('message:'+message)
    let data = JSON.parse(message);

    switch (data.type) {

      case 'nameRegister':
        socket.player.state.username = data.name
        socket.player.state.avatar = data.avatar
        console.dir(socket.player.state)
        var ret = []
		for (const s of sockets) {
			ret.push({ id: s.player.state.id, username: s.player.state.username, avatar: s.player.state.avatar })
		}
		var dat = { type: 'updateNames', players: ret, callerp: socket.player.state.id }
        sendToAll(dat)
        break;

      case 'udpateAvatarP2':
      	sendToAll({ type: 'udpateAvatarP2' })
        break;

      case 'startGameSequence':
      	sendToAll({ type: 'startGameSequence' })
        break;

      case 'finishedStartSequence':
        playersReady.push(data.id)
        if (playersReady.length >1) {
      		sendToAll({ type: 'startGame' })
		}
        break;
    }
  });

  socket.on('disconnect', () => {
	playersReady = []
    if (socket.player.state.id=='player1') {
		for (const sock of sockets) {
		  if (sock.player.state.id === 'player1') {
			sockets.delete(sock);
			break;
		  }
		}
	} else {
		for (const sock of sockets) {
		  if (sock.player.state.id === 'player2') {
			sockets.delete(sock);
			break;
		  }
		}
	}
	for (const sock of sockets) {

	  if (sock.player.state.id == 'player2') {
	  	sock.send(JSON.stringify({ type: 'changeToPlayer1' }))
	  	sock.player.state.id = 'player1'
	  } else {
		sock.send(JSON.stringify({ type: 'player2DC' }))
	  }
	}
	totPlayers--
  });

  socket.send(JSON.stringify({ type: 'setID', id: socket.player.state.id }));
  sockets.add(socket);
});

function sendToAll(msg, exceptSocket) {

    for (const otherSocket of sockets) {
      if (!exceptSocket || otherSocket !== exceptSocket) {
        otherSocket.send(JSON.stringify(msg));
      }
    }
}
