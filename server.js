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
let playersReady = []
let currentTurn = 'player1';
let colOverrideSent = false
const sockets = new Set();
var cardsPlayedP1 = []
var cardsPlayedP2 = []
let inGame = false

const playerState = {
    id: -1,
    username: '',
    avatar: '',
    inGame: false,
    drawDone: false,
    bonneChanceDone: false,
    quiVaCommencerDone: false,
    drawWinnerShown: false,
    playedCard: false,
    attrResultsFound: false,
    finishedChoiceAnim: false,
    showColOverrideDone: false,
    showAttrValsDone: false,
    playCardAttackDone: false,
    readyNextTurn: false,
    showGameoverDone: false,
    showTotCardsDone: false,
    readyToKick: false,
    makeLoserFlyDone: false,
    selectedCover: '',
    cards: [],
    cardsPlayed: []
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

function resetCardsMain() {
    for (var i = 0; i < 36; i++) {
        var c = new card(i)
        cardsMain.push(c)
    }
    cardsMain = shuffleArray(cardsMain)
}

resetCardsMain();

      function onClose(evt) {
         console.log("DISCONNECTED");
         console.log(evt);
      }
      function onError(evt) {
		 console.log("ERROR");
         console.log(evt);
      }

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

    socket.onerror = function(evt) {
       onError(evt)
    };

    socket.onclose = function(evt) {
       onClose(evt)
    };
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
                        avatar: s.player.state.avatar,
                        playedCardFinish: false
                    })
                }
                var dat = {
                    type: 'updateNames',
                    players: ret,
                    callerp: socket.player.state.id
                }
                players[socket.player.state.id].state.username = data.name
                players[socket.player.state.id].state.avatar = data.avatar
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
                //TODO
                /*let ww = 'player1'
                reinit(players['player1'].state)
                reinit(players['player2'].state)
                players['player2'].state.cards = []
                players['player1'].state.cards = []
                resetCardsMain();
                colOverrideSent = false
                cardsPlayedP1 = []
                cardsPlayedP2 = []
                sendToAll({
                    type: 'gameOver',
                    caller: socket.player.state.id,
                    winner: ww,
                    remaining_p1: 28,
                    remaining_p2: 8
                })*/
                ///
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
                for (var i = 0; i < cardsMain.length; i++) {
                    cardsMain[i].setAttributes(attrs)
                }
                inGame = true
                break;

            case 'drawDoneConfirm':
                if (socket.player.state.id == 'player1' && players[socket.player.state.id].state.cards.length == 0) {
                    players['player1'].state.cards = []
                    players['player2'].state.cards = []

                    for (var i = 0; i < 36; i++) {
                        var c = cardsMain.pop()
                        if (i % 2 == 0) {
                            players['player1'].state.cards.push(c)
                        } else {
                            players['player2'].state.cards.push(c)
                        }
                    }
                }
                players[socket.player.state.id].state.drawDone = true
                if (!debug && players['player1'].state.drawDone && players['player2'].state.drawDone) {
                    var starting = 'player1'
                    var n = Math.floor(Math.random() * 2) + 1;
                    if (n == 2) {
                        starting = 'player2'
                    }
                    currentTurn = starting

                    sendToAll({
                        type: 'drawDone',
                        starting: starting,
                        p1Cards: players['player1'].state.cards,
                        p2Cards: players['player2'].state.cards
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
                    if (players['player2'].state)
                        players['player2'].state.drawWinnerShown = true
                } else {
                    players[socket.player.state.id].state.drawWinnerShown = true
                }
                if (players['player1'].state.drawWinnerShown && players['player2'].state.drawWinnerShown) {
                    sendToAll({
                        type: 'drawWinnerShown',
                        caller: socket.player.state.id
                    })
                }
                break

            case 'drawCard':
                var c = players[socket.player.state.id].state.cards.pop()
                var ret = {
                    type: 'drawCard',
                    cardId: c.id,
                    playerId: socket.player.state.id
                }
                sendToAll(ret)
                break

            case 'playedCard':
                if (debug) {
                    players[socket.player.state.id].state.playedCard = true
                } else {
                    players[socket.player.state.id].state.playedCard = true
                }

                if (players['player1'].state.playedCard && players['player2'].state.playedCard) {
                    sendToAll({
                        type: 'playedCardFinish',
                        caller: socket.player.state.id
                    })
                }
                break

            case 'attributeSet':
                var ret = {
                    type: 'attributeSet',
                    cardId: data.cardId,
                    attr: data.attr,
                    attrId: data.attrId,
                    attrVal: data.attrVal,
                    color: data.color,
                    name: data.name,
                    playerId: socket.player.state.id
                }

                sendToAll(ret)
                break;

            case 'attrResults':
                var myAttrResult
                var otherAttrResult
                var winner
                myAttrResult = data.val
                players[socket.player.state.id].state.attrResultsFound = data
                var attrIsReversed = data.isReversed

                if (players['player1'].state.attrResultsFound && players['player2'].state.attrResultsFound) {

                    valP1 = players['player1'].state.attrResultsFound['val']
                    valP2 = players['player2'].state.attrResultsFound['val']
                    colP1 = players['player1'].state.attrResultsFound['col']
                    colP2 = players['player2'].state.attrResultsFound['col']

                    var colOverride = false
                    var origCurrentTurn = currentTurn

                    const colorCombinations = {
                        green: ['orange', 'yellow', 'red'],
                        yellow: ['orange', 'red'],
                        orange: ['red']
                    };
                    if (currentTurn == 'player1' && colP1 != 'red') {
                        if (colorCombinations[colP1].includes(colP2)) {
                            currentTurn = 'player2'
                            colOverride = true;
                        }
                    } else if (currentTurn == 'player2' && colP2 != 'red') {
                        if (colorCombinations[colP2].includes(colP1)) {
                            currentTurn = 'player1'
                            colOverride = true;
                        }
                    }
                    if (!colOverrideSent && colOverride) {
                        var ret = {
                            type: 'showColOverride',
                            currentTurn: currentTurn,
                            col_p1: colP1,
                            col_p2: colP2
                        }
                        players['player1'].state.finishedChoiceAnim = false
                        players['player2'].state.finishedChoiceAnim = false
                        players['player1'].state.attrResultsFound = null
                        players['player2'].state.attrResultsFound = null
                        sendToAll(ret)
                        colOverrideSent = true
                    } else {
                        if (valP1 > valP2) {
                            if (attrIsReversed) {
                                winner = 'player2'
                            } else {
                                winner = 'player1'
                            }
                        } else if (valP1 < valP2) {
                            if (attrIsReversed) {
                                winner = 'player1'
                            } else {
                                winner = 'player2'
                            }
                        } else {
                            winner = origCurrentTurn
                        }
                        var ret = {
                            type: 'attrResults',
                            winner: winner,
                            currentTurn: currentTurn,
                            override: colOverrideSent,
                            caller: socket.player.state.id,
                            valP1: valP1,
                            valP2: valP2
                        }
                        sendToAll(ret)
                        colOverrideSent = false
                    }
                }
                break

            case 'finishedChoiceAnim':
                players[socket.player.state.id].state.finishedChoiceAnim = true
                if (players['player1'].state.finishedChoiceAnim && players['player2'].state.finishedChoiceAnim) {
                    var ret = {
                        type: 'finishedChoiceAnim',
                    }
                    sendToAll(ret)
                }
                break

            case 'showColOverrideDone':
                players[socket.player.state.id].state.showColOverrideDone = true
                if (players['player1'].state.showColOverrideDone && players['player2'].state.showColOverrideDone) {
                    sendToAll({
                        type: 'playedCardFinish',
                        caller: socket.player.state.id
                    })
                }
                break

            case 'showAttrValsDone':
                players[socket.player.state.id].state.showAttrValsDone = true
                if (players['player1'].state.showAttrValsDone && players['player2'].state.showAttrValsDone) {
                    sendToAll({
                        type: 'showAttrValsDone',
                        caller: socket.player.state.id
                    })
                }
                break

            case 'playCardAttackDone':
                players[socket.player.state.id].state.playCardAttackDone = true
                if (players['player1'].state.playCardAttackDone && players['player2'].state.playCardAttackDone) {
                    sendToAll({
                        type: 'playCardAttackDone',
                        caller: socket.player.state.id
                    })
                }
                break
            case 'readyNextTurn':
                if (socket.player.state.id == 'player1') {
                    var card1 = new card(data.c1)
                    var card2 = new card(data.c2)
                    card1.setAttributes(attrs)
                    card2.setAttributes(attrs)
                    if (data.winner == 'player1') {
                        cardsPlayedP1.push(card1)
                        cardsPlayedP1.push(card2)
                    } else {
                        cardsPlayedP2.push(card1)
                        cardsPlayedP2.push(card2)
                    }
                }

                players[socket.player.state.id].state.readyNextTurn = true
                if (players['player1'].state.readyNextTurn && players['player2'].state.readyNextTurn) {
                    reinit(players['player1'].state)
                    reinit(players['player2'].state)
                    colOverrideSent = false
                    var gameover = false
                    console.log('player 1 has ' + players['player1'].state.cards.length + ' cards and ' + cardsPlayedP1.length + ' in reserve')
                    console.log('player 2 has ' + players['player2'].state.cards.length + ' cards and ' + cardsPlayedP2.length + ' in reserve')
                    if (players['player1'].state.cards.length == 0 && cardsPlayedP1.length > 0) {
                        for (var i = 0; i < cardsPlayedP1.length; i++) {
                            players['player1'].state.cards.push(cardsPlayedP1[i])
                        }
                        cardsPlayedP1 = []
                        players['player1'].state.cards = shuffleArray(players['player1'].state.cards)
                    }
                    if (players['player2'].state.cards.length == 0 && cardsPlayedP2.length > 0) {
                        for (var i = 0; i < cardsPlayedP2.length; i++) {
                            players['player2'].state.cards.push(cardsPlayedP2[i])
                        }
                        cardsPlayedP2 = []
                        players['player2'].state.cards = shuffleArray(players['player2'].state.cards)
                    }
                    if (players['player1'].state.cards.length == 0 && cardsPlayedP1.length == 0 || players['player2'].state.cards.length == 0 && cardsPlayedP2.length == 0) {
                        reinit(players['player1'].state)
                        reinit(players['player2'].state)
                        players['player2'].state.cards = []
                        players['player1'].state.cards = []
                        resetCardsMain();
                        colOverrideSent = false
                        cardsPlayedP1 = []
                        cardsPlayedP2 = []
                        //TODO
                        if (data.winner == undefined) {
                            data.winner = 'player1'
                            p1rem = 18
                            p2rem = 18
                        }
                        var p1rem = players['player1'].state.cards.length + cardsPlayedP1.length
                        var p2rem = players['player2'].state.cards.length + cardsPlayedP2.length
                        sendToAll({
                            type: 'gameOver',
                            caller: socket.player.state.id,
                            winner: data.winner,
                            remaining_p1: p1rem,
                            remaining_p2: p2rem,
                        })
                    } else {
                        sendToAll({
                            type: 'readyNextTurn',
                            caller: socket.player.state.id
                        })
                    }
                }
                break
            case 'showGameoverDone':
                players[socket.player.state.id].state.showGameoverDone = true
                if (players['player1'].state.showGameoverDone && players['player2'].state.showGameoverDone) {
                    sendToAll({
                        type: 'showGameoverDone',
                        caller: socket.player.state.id
                    })
                }
                break
            case 'showTotCardsDone':
                players[socket.player.state.id].state.showTotCardsDone = true
                if (players['player1'].state.showTotCardsDone && players['player2'].state.showTotCardsDone) {
                    sendToAll({
                        type: 'showTotCardsDone',
                        caller: socket.player.state.id
                    })
                }
                break

            case 'readyToKick':
                players[socket.player.state.id].state.readyToKick = true
                if (players['player1'].state.readyToKick && players['player2'].state.readyToKick) {
                    sendToAll({
                        type: 'readyToKick',
                        caller: socket.player.state.id
                    })
                }
                break
            case 'makeLoserFlyDone':
                players[socket.player.state.id].state.makeLoserFlyDone = true
                if (players['player1'].state.makeLoserFlyDone && players['player2'].state.makeLoserFlyDone) {
                    sendToAll({
                        type: 'makeLoserFlyDone',
                        caller: socket.player.state.id
                    })
                }
                break

        }
    });

    function reinit(pl_state) {
        pl_state.playedCard = false
        pl_state.attrResultsFound = false
        pl_state.finishedChoiceAnim = false
        pl_state.showColOverrideDone = false
        pl_state.showAttrValsDone = false
        pl_state.playCardAttackDone = false
        pl_state.readyNextTurn = false
        pl_state.showGameoverDone = false
        pl_state.showTotCardsDone = false
        pl_state.readyToKick = false
        pl_state.makeLoserFlyDone = false
    }
    socket.on('disconnect', (reason) => {
		console.log(reason)
		console.log(socket.player.state.id+' disconnected');
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
        players['player2'].state.cards = []
        players['player1'].state.cards = []
        resetCardsMain();
        totPlayers--
        colOverrideSent = false
        cardsPlayedP1 = []
        cardsPlayedP2 = []
    });
    socket.send(JSON.stringify({
        type: 'setID',
        id: socket.player.state.id
    }));
    sockets.add(socket);
});

function sendToAll(msg, exceptSocket) {
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