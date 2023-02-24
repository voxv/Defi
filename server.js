const { exec } = require('child_process');

exec('npm install', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error: ${err}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

const express = require('express');
const app = express();

app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is up and running' });
});

//const PORT = process.env.PORT || 80;
app.listen(80, () => {
  console.log(`Server listening on port 80`);
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/card.html');
});



const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8000 });

let gameState = {};
let totPlayers = 0
let playersById = {}
const sockets = new Set();


const playerState = {
  id: -1,
  username: '',
  avatar: ''
};


server.on('connection', (socket) => {

  if (totPlayers==0) {
	  socket.id = 'player1'
  } else if (totPlayers==1) {
	  socket.id = 'player2'
  }

  totPlayers++

  var playerstate =  Object.assign({}, playerState)
  playerstate.id = socket.id
  let player = { socket: socket, state: playerstate };
  socket.player = player


  socket.on('message', (message) => {
	console.log('message:'+message)
    let data = JSON.parse(message);

    switch (data.type) {
      case 'nameRegister':

        socket.player.state.username = data.name
        socket.player.state.avatar = data.avatar
        break;
    }
  });

  socket.on('close', () => {

    if (socket.player.state.id=='player1') {
		for (const sock of sockets) {
		  if (sock.id === 'player1') {
			  console.log('removing player1')
			sockets.delete(sock);
			break;
		  }
		}
	} else {
		for (const sock of sockets) {
		  if (sock.id === 'player2') {
			    console.log('removing player2')
			sockets.delete(sock);
			break;
		  }
		}
	}
	for (const sock of sockets) {
	  if (sock.id == 'player2')
	  	sock.send(JSON.stringify({ type: 'changeToPlayer1' }))
	}
	totPlayers--
  });


  socket.send(JSON.stringify({ type: 'setID', id: socket.id }));
  sockets.add(socket);
});

function sendToAll(msg, exceptSocket) {

    for (const otherSocket of sockets) {
      if (!exceptSocket || otherSocket !== exceptSocket) {
        otherSocket.send(JSON.stringify(msg));
      }
    }
}
function getGameState() {

  return {
    type: 'update',
    players: players.map((player) => player.state)
  };
}

function mylog(message) {
	console.log(message.toString())
}
function mylogdir(message) {
	console.dir(message)
}
