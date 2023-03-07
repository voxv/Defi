if (process && process.env.NODE_ENV === "production") {
    const {
        exec
    } = require('child_process');
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
const {
    attrs
} = require('./server_defs.js');

const debug = false

app.get('/healthcheck', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is up and running'
    });
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
    avatar: '',
    inGame: false,
    drawDone: false,
    bonneChanceDone: false,
    quiVaCommencerDone: false,
    drawWinnerShown: false,
    selectedCover: '',
    cards: []
};
var players = {
    'player1': null,
    'player2': null
}

cardsMain = []

var card = function(id) {
    this.id = id
    this.color = null
    this.attributes = {
        at_1: 0,
        at_2: 0,
        at_3: 0,
        at_4: 0
    }
    this.setAttributes = function(attrs) {
        var selectedCover
        if (players['player1'].state.selectedCover == '') {
            selectedCover = 1
        } else {
            selectedCover = players['player1'].state.selectedCover
        }
        var selectedCover = players['player1'].state.selectedCover
        this.attributes.at_1 = attrs[0][this.id].at_1
        this.attributes.at_2 = attrs[0][this.id].at_2
        this.attributes.at_3 = attrs[0][this.id].at_3
        this.attributes.at_4 = attrs[0][this.id].at_4
        this.color = attrs[0][this.id].col
    }
}

for (var i = 0; i < 36; i++) {
    var c = new card(i)
    cardsMain.push(c)
}
cardsMain = shuffleArray(cardsMain)

server.on('connection', (socket) => {

    let theid
    if (totPlayers == 0) {
        theid = 'player1'
    } else if (totPlayers == 1) {
        theid = 'player2'
    }
    totPlayers++

    var playerstate = Object.assign({}, playerState)
    playerstate.id = theid
    let player = {
        socket: socket,
        state: playerstate
    };
    players[theid] = player
    socket.player = player
    socket.on('message', (message) => {
        console.log('message:' + message)
        let data = JSON.parse(message);

        switch (data.type) {

            case 'nameRegister':
                socket.player.state.username = data.name
                socket.player.state.avatar = data.avatar
                var ret = []
                for (const s of sockets) {
                    ret.push({
                        id: s.player.state.id,
                        username: s.player.state.username,
                        avatar: s.player.state.avatar
                    })
                }
                var dat = {
                    type: 'updateNames',
                    players: ret,
                    callerp: socket.player.state.id
                }
                sendToAll(dat)
                break;

            case 'udpateAvatarP2':
                var c = 1
                if (players['player1'].state.selectedCover != '') {
                    c = players['player1'].state.selectedCover
                }
                sendToAll({
                    type: 'udpateAvatarP2',
                    coverid: c
                })
                break;

            case 'startGameSequence':
                sendToAll({
                    type: 'startGameSequence'
                })
                break;

            case 'finishedStartSequence':
                playersReady.push(data.id)
                if (playersReady.length > 1) {
                    sendToAll({
                        type: 'startGame'
                    })
                }
                break;
            case 'selectedCover':
                sendToAll({
                    type: 'selectedCover',
                    coverid: data.coverid
                }, socket)
                socket.player.state.selectedCover = data.coverid
                players['player1'].state.selectedCover = data.coverid
                break;

            case 'inGameConfirm':
                if (debug && players[socket.player.state.id].state.username == '') {
                    players[socket.player.state.id].state.username = 'myself'
                    players[socket.player.state.id].state.avatar = '2'
                }
                players[socket.player.state.id].state.inGame = true

                if (!debug && players['player1'].state.inGame && players['player2'].state.inGame) {
                    sendToAll({
                        type: 'inGameConfirm'
                    })
                }
                for (var i = 0 ; i < cardsMain.length ; i++) {
                    cardsMain[i].setAttributes(attrs)
                }
				console.dir(cardsMain)
                break;

            case 'drawDoneConfirm':
                players[socket.player.state.id].state.drawDone = true
                if (!debug && players['player1'].state.drawDone && players['player2'].state.drawDone) {
                    var starting = 'player1'
                    var n = Math.floor(Math.random() * 2) + 1;
                    if (n == 2) {
                        starting = 'player2'
                    }
                    sendToAll({
                        type: 'drawDone',
                        starting: starting,
                    })
                }
                break;
            case 'bonneChanceDone':
                players[socket.player.state.id].state.bonneChanceDone = true
                if (players['player1'].state.bonneChanceDone && players['player2'].state.bonneChanceDone) {
                    sendToAll({
                        type: 'bonneChanceDone'
                    })
                }
                break;
            case 'quiVaCommencerDone':
                players[socket.player.state.id].state.quiVaCommencerDone = true
                if (players['player1'].state.quiVaCommencerDone && players['player2'].state.quiVaCommencerDone) {
                    sendToAll({
                        type: 'quiVaCommencerDone'
                    })
                }
                break
            case 'drawWinnerShown':
            	if (debug) {

					players['player1'].state.drawWinnerShown = true
					players['player2'].state.drawWinnerShown = true
				} else {
					players[socket.player.state.id].state.drawWinnerShown = true
				}
				if (players['player1'].state.drawWinnerShown && players['player2'].state.drawWinnerShown) {
					sendToAll({
						type: 'drawWinnerShown'
					})
				}
                break
             case 'drawCard':
             	var c = cardsMain.pop()
				players[socket.player.state.id].state.cards.push(c)
				var othersock
				for (const sock of sockets) {
					if (sock.player.state.id != socket.player.state.id) {
						othersock = sock
						break;
					}
				}
				othersock.send(JSON.stringify({
        			type: 'drawCard',
        			cardId: c.id,
        			playerId: socket.player.state.id
    			}));
				socket.send(JSON.stringify({
        			type: 'drawCard',
        			cardId: c.id,
        			playerId: socket.player.state.id
    			}));
    			console.log(socket.player.state.id+' drew card '+c.id)
             	break

        }
    });

    socket.on('disconnect', () => {
        playersReady = []
        if (socket.player.state.id == 'player1') {
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
                sock.send(JSON.stringify({
                    type: 'changeToPlayer1'
                }))
                sock.player.state.id = 'player1'
            } else {
                sock.send(JSON.stringify({
                    type: 'player2DC'
                }))
            }
        }
        totPlayers--
    });

    socket.send(JSON.stringify({
        type: 'setID',
        id: socket.player.state.id
    }));
    sockets.add(socket);
});

function sendToAll(msg, exceptSocket) {
	console.log('SENDTOALL: '+JSON.stringify(msg))
    for (const otherSocket of sockets) {
        if (!exceptSocket || otherSocket !== exceptSocket) {
            otherSocket.send(JSON.stringify(msg));
        }
    }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}
