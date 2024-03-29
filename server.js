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
let startTime = 0
let gameOverTimeout = false
let gameMaxLength = 900
let debug = false

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
    showLastTurnDone: false,
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
        this.attributes.at_1 = attrs[(selectedCover - 1)][this.id].at_1
        this.attributes.at_2 = attrs[(selectedCover - 1)][this.id].at_2
        this.attributes.at_3 = attrs[(selectedCover - 1)][this.id].at_3
        this.attributes.at_4 = attrs[(selectedCover - 1)][this.id].at_4
        this.color = attrs[(selectedCover - 1)][this.id].col
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
    console.log(evt);
}

function onError(evt) {
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
        //console.log('message:' + message)
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

                players[socket.player.state.id].state.username = data.name
                players[socket.player.state.id].state.avatar = data.avatar
                var dat = {
                    type: 'updateNames',
                    players: ret,
                    callerp: socket.player.state.id,
                    avatarTaken: players[socket.player.state.id].state.avatar
                }
                sendToAll(dat)
                break;

            case 'udpateAvatarP2':
                var c = 1
                if (players['player1'].state.selectedCover != '') {
                    c = players['player1'].state.selectedCover
                }
                socket.send({
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
                players['player1'].state.drawDone = false
                players['player2'].state.drawDone = false
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
                players[socket.player.state.id].state.inGame = true
                if (players['player1'].state.inGame && players['player2'].state.inGame) {
                    players['player1'].state.inGame = false
                    players['player2'].state.inGame = false
                    sendToAll({
                        type: 'inGameConfirm'
                    })
                }
                for (var i = 0; i < cardsMain.length; i++) {
                    cardsMain[i].setAttributes(attrs)
                }
                inGame = true
                gameOverTimeout = false
                players['player1'].state.cards = []
                players['player2'].state.cards = []
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
                if (players['player1'].state.drawDone && players['player2'].state.drawDone) {
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
                players[socket.player.state.id].state.drawWinnerShown = true
                if (players['player1'].state.drawWinnerShown && players['player2'].state.drawWinnerShown) {
                    startTime = new Date()
                    sendToAll({
                        type: 'drawWinnerShown',
                        caller: socket.player.state.id
                    })
                }
                break

            case 'drawCard':

                var c = players[socket.player.state.id].state.cards.pop()

                if (debug) {
				    console.log(socket.player.state.id+' draw:'+c.id)
				    console.log(socket.player.state.id+ ' remaining:'+players[socket.player.state.id].state.cards.length)
				}

                var ret = {
                    type: 'drawCard',
                    cardId: c.id,
                    playerId: socket.player.state.id
                }
                sendToAll(ret)
                break

            case 'playedCard':
                players[socket.player.state.id].state.playedCard = true
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
                currentTurn = data.currentTurn
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
                    idP1 = players['player1'].state.attrResultsFound['attrId']
                    idP2 = players['player2'].state.attrResultsFound['attrId']
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
                            col_p2: colP2,
                            valP1: valP1,
                            valP2: valP2,
                            idP1: idP1,
                            idP2: idP2
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
                            valP2: valP2,
                            idP1: idP1,
                            idP2: idP2
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
                if (debug) {
					/*var str1 = ''
					for (var i = 0 ; i < cardsPlayedP1.length ; i++) {
						str1+=cardsPlayedP1[i].id+' ,'
					}
					console.log('P1 TRASH: '+cardsPlayedP1.length)
					console.log(str1)
					str1 = ''
					for (var i = 0 ; i < players['player1'].state.cards.length ; i++) {
						str1+=players['player1'].state.cards[i].id+', '
					}
					console.log('P1 REMAINING:'+players['player2'].state.cards.length)
					console.log(str1)

					str1 = ''
					for (var i = 0 ; i < cardsPlayedP2.length ; i++) {
						str1+=cardsPlayedP2[i].id+' ,'
					}
					console.log('P2 TRASH: '+cardsPlayedP2.length)
					console.log(str1)
					str1 = ''
					for (var i = 0 ; i < players['player2'].state.cards.length ; i++) {
						str1+=players['player2'].state.cards[i].id+', '
					}
					console.log('P2 REMAINING: '+players['player2'].state.cards.length)
					console.log(str1)*/
				}

                players[socket.player.state.id].state.readyNextTurn = true
                if (players['player1'].state.readyNextTurn && players['player2'].state.readyNextTurn) {
                    reinit(players['player1'].state)
                    reinit(players['player2'].state)
                    colOverrideSent = false
                    var gameover = false
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
                    if (gameOverTimeout || players['player1'].state.cards.length == 0 && cardsPlayedP1.length == 0 || players['player2'].state.cards.length == 0 && cardsPlayedP2.length == 0) {
                        var p1rem = players['player1'].state.cards.length + cardsPlayedP1.length
                        var p2rem = players['player2'].state.cards.length + cardsPlayedP2.length

                        var thewinner = 'player1'
                        if (p2rem > p1rem) {
							thewinner = 'player2'
						}
                        reinit(players['player1'].state)
                        reinit(players['player2'].state)
                        players['player2'].state.cards = []
                        players['player1'].state.cards = []
                        resetCardsMain();
                        colOverrideSent = false
                        cardsPlayedP1 = []
                        cardsPlayedP2 = []
                        playersReady = []
						console.log('gameover remaing p1:'+p1rem+' remaing p2:'+p2rem)
						console.log('winner:'+thewinner)
                        sendToAll({
                            type: 'gameOver',
                            caller: socket.player.state.id,
                            winner: thewinner,
                            remaining_p1: p1rem,
                            remaining_p2: p2rem,
                        })
                    } else {
                        const now = new Date();
                        const timeDiff = now.getTime() - startTime.getTime();
                        const diffInSeconds = Math.floor(timeDiff / 1000);

                        if (diffInSeconds >= gameMaxLength) {
                            sendToAll({
                                type: 'showLastTurn',
                                caller: socket.player.state.id,
                                winner: data.winner
                            })
                        } else {
                            sendToAll({
                                type: 'readyNextTurn',
                                caller: socket.player.state.id,
                                winner: data.winner
                            })
                        }
                    }
                }
                break
            case 'showLastTurnDone':
                players[socket.player.state.id].state.showLastTurnDone = true
                if (players['player1'].state.showLastTurnDone && players['player2'].state.showLastTurnDone) {
                    sendToAll({
                        type: 'showLastTurnDone',
                        caller: socket.player.state.id,
                        winner: data.winner
                    })
                    gameOverTimeout = true
                }
                break
            case 'showGameoverDone':
                players[socket.player.state.id].state.showGameoverDone = true
                if (players['player1'].state.showGameoverDone && players['player2'] && players['player2'].state && players['player2'].state.showGameoverDone) {
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
        pl_state.showLastTurnDone = false
        //pl_state.avatar = ''
        pl_state.bonneChanceDone = false
        pl_state.quiVaCommencerDone = false
        pl_state.drawWinnerShown = false
        pl_state.inGame = false
        pl_state.drawDone = false
    }
    socket.on('disconnect', (reason) => {
        console.log(reason)
        console.log(socket.player.state.id + ' disconnected');
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
                players['player1'].state.avatar = ''
                sock.send(JSON.stringify({
                    type: 'changeToPlayer1'
                }))
                sock.player.state.id = 'player1'
            } else {
                players['player2'].state.avatar = ''
                sock.send(JSON.stringify({
                    type: 'player2DC'
                }))
            }
        }
        resetCardsMain();
        totPlayers--
        colOverrideSent = false
        cardsPlayedP1 = []
        cardsPlayedP2 = []
        if (players['player2'])
            reinit(players['player1'].state)
        if (players['player2'])
            reinit(players['player2'].state)
    });
    var avatarTaken = false
    if (socket.player.state.id == 'player2' && players['player1'] && players['player1'].state && players['player1'].state.avatar != '') {
        avatarTaken = players['player1'].state.avatar
    }
    socket.send(JSON.stringify({
        type: 'setID',
        id: socket.player.state.id,
        avatarTaken: avatarTaken
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