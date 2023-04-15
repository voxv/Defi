var proto = 'ws'
var is_local = false

if (window.location.hostname === 'defi-nature.voxv.repl.co') {
    url = 'defi.voxv.repl.co'
    proto = 'wss'
} else {
    url = 'localhost:3000'
    is_local = true
}

var socket = io(proto + "://" + url, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity
});

let players;
let myid = 0

const player = {
    username: '',
    avatar: '',
    cards: []
}

var playersTemplate = function() {
    this.player1 = Object.assign({}, player)
    this.player2 = Object.assign({}, player)
}

socket.addEventListener('connect', (event) => {
    players = new playersTemplate()
});

socket.addEventListener('message', (event) => {


    let data = JSON.parse(event);
    if (data.type != 'drawDone') {
        mylog('msg:' + event)
    }
    switch (data.type) {
        case 'setID':
            myid = data.id
            avatarTaken = data.avatarTaken
            break;
        case 'changeToPlayer1':
            playerDC = true
            myid = 'player1'

            for (var i = 0; i < playersAll.length; i++) {
                if (playersAll[i].id == 'player1' || playersAll[i] == '') {
                    delete playersAll[i]
                } else {
                    playersAll[i].id = 'player1'
                }
            }
            playersAll = playersAll.filter(function(player) {
                return player !== undefined;
            });
            playersAll = playersAll.map((value) => value);
            if (playersAll[0])
                playersAll[0].id = 'player1'

            var playclick = false
            if (g && g.otherName) {
                playclick = true
            }
            if (g && g.sound)
                g.sound.stopAll()
            if (g && g.resetCovers) {
                g.resetCovers()
            }
            if (g && g.otherAvatarImg) {
                g.otherAvatarImg.destroy()
                g.otherAvatarImg = null
            }
            if (g && g.otherName) {
                g.otherName.destroy()
                g.otherName = null
            }
            if (g && g.myName) {
                g.myName.destroy()
                g.myName = null
            }
            if (g && g.myAvatarImg) {
                g.myAvatarImg.destroy()
                g.myAvatarImg = null
            }
            if (g && g.addAvatar)
                g.addAvatar({
                    nosound: playclick
                })

            if (g && g.covers) {
                for (const i in g.covers) {
                    g.addCoverClick(g.covers[i], i)
                }
            }
            if (g && g.scene.key == 'GameScene') {
                if (g.removeClickListener)
                    g.removeClickListener()
                if (g.sound.stopAll)
                    g.sound.stopAll();
                buttonLocked = false
                g.scene.pause();
                g.scene.shutdown()
                g.scene.start('PreScene');
            }
            remaining_p1 = 0
            remaining_p2 = 0
            showGameoverDoneShowned = false
            countryWinSoundAdded = false
            gameoverSceneStarted = false
            readyNextTurnSent = false
            lastTurnSent = false
            coverClickBlock = false
            otherSelectedAvatar = ''
            stoppedScaleCardAnim = false
            if (g && g.battleSoundPlayed) {
                g.battleSoundPlayed = false
            }
            if (avatarTaken) {
                var avatar = avatars.find(item => item.id == avatarTaken)
                avatar.clearTint()
                avatar.on('pointerup', () => g.onClickAvatar('avatar' + avatar.id, avatar, true), g);
                avatarTaken = false
            }
            break;

        case 'player2DC':
            playerDC = true
            var playclick = false
            if (g && g.otherName) {
                playclick = true
            }
            for (var i = 0; i < playersAll.length; i++) {
                if (playersAll[i].id == 'player2') {
                    delete playersAll[i]
                }
            }
            playersAll = playersAll.filter(function(player) {
                return player !== undefined;
            });
            playersAll = playersAll.map((value) => value);
            if (g && g.otherAvatarImg) {
                g.otherAvatarImg.destroy()
                g.otherAvatarImg = null
            }
            if (g && g.otherName) {
                g.otherName.destroy()
                g.otherName = null
            }
            if (g && g.addAvatar)
                g.addAvatar({
                    nosound: playclick
                })

            if (g.scene.key == 'GameScene') {
                if (g.removeClickListener)
                    g.removeClickListener()
                if (g.sound.stopAll)
                    g.sound.stopAll()
                buttonLocked = false
                g.scene.pause();
                g.scene.shutdown()
                g.scene.start('PreScene');
            }
            g.sound.stopAll()
            buttonLocked = false
            remaining_p1 = 0
            remaining_p2 = 0
            showGameoverDoneShowned = false
            countryWinSoundAdded = false
            gameoverSceneStarted = false
            readyNextTurnSent = false
            g.battleSoundPlayed = false
            lastTurnSent = false
            coverClickBlock = false
            otherSelectedAvatar = ''
            stoppedScaleCardAnim = false
            if (g && g.resetCovers) {
                g.resetCovers()
            }
            if (avatarTaken) {
                var avatar = avatars.find(item => item.id == avatarTaken)
                avatar.clearTint()
                avatar.on('pointerup', () => g.onClickAvatar('avatar' + avatar.id, avatar), g);
                avatarTaken = false
            }
            break

        case 'updateNames':

            playersAll = data.players
            if (data.callerp == myid) {
                if (g) {
                    if (g.removeClickListener) {
                        g.removeClickListener()
                    }
                    g.sound.stopAll();
                    g.scene.pause();
                    g.scene.shutdown()
                    g.scene.start('PreScene');
                }
            } else {
                if (data.avatarTaken && g && g.updateAvatarTaken)
                    g.updateAvatarTaken(data.avatarTaken)
                avatarTaken = data.avatarTaken
            }
            if (g && g.addAvatar)
                g.addAvatar()

            if (playerDC && myid == 'player1') {
                sendMessage({
                    type: 'nameRegister',
                    name: myName,
                    avatar: mySelectedAvatar
                })
                playerDC = false
            }
            var tt = playersAll.find(item => item.id == myid)
            mySelectedAvatar = tt.avatar
            myName = tt.username
            break
        case 'udpateAvatarP2':
            if (g && g.addAvatar)
                g.addAvatar()
            selectedCover = data.coverid
            if (g && g.selectCover)
                g.selectCover(data.coverid)
            break;
        case 'startGameSequence':
            if (g && g.startGameSequence)
                g.startGameSequence()
            break;
        case 'startGame':
            if (g && g.startGame)
                g.startGame()
            break;
        case 'selectedCover':
            if (g && g.selectCover)
                g.selectCover(data.coverid)
            break;
        case 'drawDone':
            startingPlayer = data.starting
            if (g && g.showBonneChance)
                g.showBonneChance()
            break
        case 'bonneChanceDone':
            if (g && g.startPlayerPick)
                g.startPlayerPick()
            break
        case 'quiVaCommencerDone':
            if (g && g.quiVaCommencerDone)
                g.quiVaCommencerDone()
            break
        case 'drawWinnerShown':
            if (g && g.drawWinnerShown)
                g.drawWinnerShown(data.caller)
            gameoverSceneStarted = false
            break
        case 'drawCard':
            if (g && g.drawCard)
                g.drawCard(data)
            break;
        case 'playedCardFinish':
            if (g && g.playedCardFinish)
                g.playedCardFinish(data)
            break
        case 'attributeSet':
            if (g && g.attributeSet)
                g.attributeSet(data)
            break
        case 'attrResults':
            if (g && g.attributeSet)
                g.attrResults(data)
            break
        case 'finishedChoiceAnim':
            if (g && g.finishedChoiceAnim)
                g.finishedChoiceAnim(data)
            break
        case 'showColOverride':
            if (g && g.showColOverride)
                g.showColOverride(data)
            break
        case 'showColOverrideDone':
            if (g && g.showColOverride)
                g.showColOverrideDone(data)
            break
        case 'showAttrValsDone':
            if (g && g.showAttrValsDone)
                g.showAttrValsDone(data)
            break
        case 'playCardAttackDone':
            if (g && g.playCardAttackDone)
                g.playCardAttackDone(data)
            break
        case 'readyNextTurn':
            if (g && g.readyNextTurn)
                g.readyNextTurn(data)
            break
        case 'gameOver':
            if (gameoverSceneStarted) {
                return
            }
            if (g.removeClickListener)
                g.removeClickListener()
            if (g.sound.stopAll)
                g.sound.stopAll();
            if (g.sound.stopTweens)
                g.stopTweens()
            buttonLocked = false
            currentWinner = data.winner
            console.log('start gmaeover with winner:'+data.winner+' remp1:'+data.remaining_p1+' remp2:'+data.remaining_p2)
            remaining_p1 = data.remaining_p1
            remaining_p2 = data.remaining_p2
            g.scene.pause();
            g.scene.shutdown()
            g.scene.start('GameoverScene');
            gameoverSceneStarted = true
            break
        case 'showGameoverDone':
            if (g && g.showGameoverDone)
                g.showGameoverDone(data)
            break
        case 'showTotCardsDone':
            if (g && g.showTotCardsDone)
                g.showTotCardsDone(data)
            break
        case 'readyToKick':
            if (g && g.kickLoser)
                g.kickLoser()
            break
        case 'makeLoserFlyDone':
            if (g && g.makeLoserFlyDone)
                g.makeLoserFlyDone()
            break
        case 'showLastTurn':
            if (g && g.showLastTurn)
                g.showLastTurn(data)
            break
        case 'showLastTurnDone':
            if (g && g.showLastTurnDone)
                g.showLastTurnDone(data)
            break
    }
});

socket.addEventListener('disconnect', (event) => {
    mylog('WebSocket connection closed');
});

socket.addEventListener('error', (error) => {
    if (is_local) {
        console.error('WebSocket error: ', error)
    }
});

function sendMessage(message) {
    socket.send(JSON.stringify(message));
}

function mylog(msg) {
    if (is_local) {
        console.log(msg)
    }
}