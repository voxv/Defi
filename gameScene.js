var card = function(id, img) {
    this.id = id
    this.img = img
    this.color = null
    this.attributes = {
        at_1: 0,
        at_2: 0,
        at_3: 0,
        at_4: 0
    }
    this.name = ''
    this.backImg = null

    this.setAttributes = function() {
        this.attributes.at_1 = attrs[(selectedCover - 1)][this.id]['at_1']
        this.attributes.at_2 = attrs[(selectedCover - 1)][this.id]['at_2']
        this.attributes.at_3 = attrs[(selectedCover - 1)][this.id]['at_3']
        this.attributes.at_4 = attrs[(selectedCover - 1)][this.id]['at_4']
        this.color = attrs[(selectedCover - 1)][this.id].col
        this.name = attrs[(selectedCover - 1)][this.id]['name']
    }
}

var lifeBar = function(x, y, playerid, deck) {
    this.x = x
    this.y = y
    if (playerid == 'player1') {
        this.x -= 125
        this.y -= 70
    } else {
        this.x -= 24
        this.y += 83
    }
    this.playerId = playerid
    this.backImage = g.add.image(this.x, this.y, 'lifebarEmpty').setOrigin(0, 0);
    this.barImage = g.add.image(this.x, this.y, 'lifebar').setOrigin(0, 0);
    this.barImage.scaleX = 1
    this.barImage.scaleY = 1
    this.backImage.setDepth(9)
    this.barImage.setDepth(10)
    this.originalBarX = this.x

    this.update = function() {
        var ratio = deck.currentTot / 36
        this.barImage.setScale(ratio, 1);
        var newx = (this.barImage.width - this.barImage.width * ratio) / 5.2;
        this.barImage.x = this.originalBarX + newx
    }
    this.update()
}
var drawDeck = function(tot, x, y, playerId) {
    this.x = x
    this.y = y
    this.tot = tot
    this.currentTot = this.tot
    this.cards = []
    this.backImages = []
    this.tweensDraw = []
    this.deck = []
    this.countTweens = 0
    this.yDir = yPos_p1 - yOffset_avatar_deck
    this.xDir = xPos_p1 + xOffset_avatar_deck
    this.topOffsetX = 0
    this.topOffsetY = 0
    this.lastImage = null
    this.hasLifeBar = false

    if (playerId) {
        this.playerId = playerId
        this.lifeBar = new lifeBar(this.x, this.y, this.playerId, this)
        this.hasLifeBar = true
    }


    this.initImages = function() {
        this.countTweens = 0
        this.deck = []
        var offsetX = 0
        var offsetY = 0
        this.topOffsetX = offsetX
        this.topOffsetY = offsetY
        var stepX = 2
        var stepY = 4
        for (var i = 0; i < this.currentTot; i++) {
            if (i % 4 == 0) {
                var img = g.add.image(this.x + offsetX, this.y + offsetY, 'card_back')
                img.setScale(cardScaleDraw)
                img.visible = false
                img.setDepth(11)
                this.backImages.push(img)
                offsetX += stepX
                offsetY += stepY
            }
        }
    }

    this.addCard = function() {

        this.currentTot++
        this.update(true)
        if (this.hasLifeBar) {
            this.lifeBar.update()
        }
    }

    this.removeCard = function() {

        this.currentTot--
        this.update(true)
        if (this.hasLifeBar) {
            this.lifeBar.update()
        }
    }

    this.update = function(noDecrement) {

        for (var i = 0; i < this.backImages.length; i++) {
            this.backImages[i].destroy()
        }
        this.backImages = []
        var offsetX = 0
        var offsetY = 0
        var stepX = 2
        var stepY = 2

        for (var i = 0; i < this.currentTot; i++) {
            if (i % 4 == 0) {
                var img = g.add.image(this.x + offsetX, this.y + offsetY, 'card_back')
                img.setScale(cardScaleDraw)
                img.visible = true
                img.setDepth(11)
                this.backImages.push(img)
                offsetX += stepX
                offsetY += stepY
            }
        }
        this.lastImage = this.backImages.slice(-1)[0];
        if ((myid == 'player1' && this.playerId == 'player1' || myid == 'player2' && this.playerId == 'player1') && this.lastImage && !stoppedScaleCardAnim) {

            this.lastImage.setInteractive()
            const onClick = () => {
                if (!gameStarted || coverClickBlock) return
                coverClickBlock = true
                this.lastImage.removeListener('pointerdown', onClick);
                stoppedScaleCardAnim = true;
                readyNextTurnSent = false
                socket.send(JSON.stringify({
                    type: 'drawCard'
                }));
                const sound = g.sound.add('cardflip');
                sound.play();

            }
            this.lastImage.on('pointerdown', onClick);
        }
        this.topOffsetX = offsetX - stepX
        this.topOffsetY = offsetY - stepY

        if (!noDecrement) {
            this.currentTot--
        }
    }

    this.doDraw = function() {

        var nimg = g.add.image(this.x + this.topOffsetX, this.y + this.topOffsetY, 'card_back')
        nimg.setScale(cardScaleDraw)
        nimg.setDepth(14)
        var isP1 = false

        if (this.yDir == yPos_p1 - yOffset_avatar_deck) {
            this.yDir = yPos_p2 - yOffset_avatar_deck
            this.xDir = xPos_p2 - xOffset_avatar_deck - 5
        } else {
            isP1 = true
            this.yDir = yPos_p1 - yOffset_avatar_deck
            this.xDir = xPos_p1 + xOffset_avatar_deck
        }

        const sound = g.sound.add('cardflip');
        sound.setVolume(0.6)
        sound.play();

        this.tweensDraw.push(g.tweens.add({
            targets: nimg,
            y: this.yDir,
            x: this.xDir,
            ease: Phaser.Math.Easing.Cubic.In,
            duration: drawSpeed,
            context: this,
            onComplete: function() {

                if (g.drawDeck.currentTot >= 0) {
                    g.drawDeck.update()
                    g.drawDeck.doDraw()
                    if (isP1) {
                        g.deckP1.addCard()
                    } else {
                        g.deckP2.addCard()
                    }
                    g.drawDeck.tweensDraw.pop()
                    nimg.destroy()
                } else {
                    nimg.destroy()
                    socket.send(JSON.stringify({
                        type: 'drawDoneConfirm',
                    }))
                }
            },
            delay: drawDelay
        }));

        this.countTweens++
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene'
        });
    }

    preload() {

        for (var i = 0; i < totCards; i++) {
            this.load.image('card_' + i, 'images/pack' + (selectedCover - 1) + '/card_' + i + '.png');
        }
        this.load.image('card_back', 'images/card_back.png');
        this.load.image('card_sp_tornade', 'images/card_sp_tornade.png');
        this.load.image('frame', 'images/frame.png');
        this.load.image('avatar1', 'images/avatar1_high.png');
        this.load.image('avatar2', 'images/avatar2_high.png');
        this.load.image('avatar3', 'images/avatar3_high.png');
        this.load.image('avatar4', 'images/avatar4_high.png');
        this.load.image('avatar5', 'images/avatar5_high.png');
        this.load.image('game_back', 'images/game_back.jpg');
        this.load.image('gameBackName', 'images/gameBackName.png');
        this.load.image('backChoice', 'images/backChoice.png');
        this.load.image('frameInGame', 'images/frameInGame.png');
        this.load.image('commenceback', 'images/commenceBack.jpg');
        this.load.image('bonnechance', 'images/bonnechance.jpg');
        this.load.image('choiceBackground', 'images/choiceBackground2.jpg');
        this.load.image('red', 'images/red.png');
        this.load.image('yellow', 'images/yellow.png');
        this.load.image('orange', 'images/orange.png');
        this.load.image('green', 'images/green.png');
        this.load.image('backShowScore', 'images/backShowScore2.png');
        this.load.image('lifebarEmpty', 'images/lifebarEmpty2.jpg');
        this.load.image('lifebar', 'images/lifebar.png');

        this.load.audio('cardflip', 'sounds/cardflip.mp3');
        this.load.audio('bonnechance', 'sounds/bonnechance3.mp3');
        //this.load.audio('bonnechance', 'sounds/playerquit.mp3')
        this.load.audio('drumroll', 'sounds/drumroll.mp3');
        this.load.audio('colorChange', 'sounds/colorChange.mp3');
        this.load.audio('showScore', 'sounds/showScore.mp3');
        this.load.audio('showScoreWin', 'sounds/showScoreWin.mp3');
        this.load.audio('avatar1', 'sounds/avatar1.mp3');
        this.load.audio('avatar2', 'sounds/avatar2.mp3');
        this.load.audio('avatar3', 'sounds/avatar3.mp3');
        this.load.audio('avatar4', 'sounds/avatar4.mp3');
        this.load.audio('avatar5', 'sounds/avatar5.mp3');
        this.load.audio('thump', 'sounds/thump.mp3');
        this.load.audio('choiceClick', 'sounds/choiceClick.mp3');
        this.load.audio('choiceShow', 'sounds/choiceShow3.mp3');
        this.load.audio('cardPlaced', 'sounds/cardPlaced.mp3');
        this.load.audio('countryWin', 'sounds/countryWin.mp3');

        this.load.spritesheet('arrows', 'images/arrows.png', {
            frameWidth: 60,
            frameHeight: 68
        });
        this.load.spritesheet('cardhit', 'images/cardhit_spritesheet.png', {
            frameWidth: 150,
            frameHeight: 143
        });
    }

    create() {
        g = this
        this.createBackImage()
        this.avatarScale = 0.6
        this.cardsMain = []
        this.createCards()
        this.createFrames()
        if (debug) {
            playersAll[0] = {}
            playersAll[0].id = 'player1'
            playersAll[0].username = 'myself'
            playersAll[0].avatar = '2'
            playersAll[0].playedCardFinish = false
            playersAll[1] = {}
            playersAll[1].id = 'player2'
            playersAll[1].username = 'other'
            playersAll[1].avatar = '4'
            playersAll[1].playedCardFinish = false
            socket.send(JSON.stringify({
                type: 'drawWinnerShown',
            }))
        } else {
            socket.send(JSON.stringify({
                type: 'inGameConfirm',
            }))
        }

        if (debug) {
            this.drawDeck = new drawDeck(0, 420, 300)
        } else {
            this.drawDeck = new drawDeck(totCards, 420, 300)
        }
        this.drawDeck.update()

        if (!debug) {
            this.drawDeck.doDraw()
        }

        this.frame1X = xPos_p1
        this.frame1Y = yPos_p1
        this.frame2X = xPos_p2
        this.frame2Y = yPos_p2


        this.deckP1 = new drawDeck(0, xPos_p1 + xOffset_avatar_deck, yPos_p1 - yOffset_avatar_deck, 'player1')
        this.deckP2 = new drawDeck(0, xPos_p2 - xOffset_avatar_deck - 12, yPos_p2 - yOffset_avatar_deck, 'player2')

        if (debug) {
            for (var i = 0; i < totCards / 2; i++) {
                this.deckP1.addCard()
                this.deckP2.addCard()
            }
        }
        this.anims.create({
            key: 'animarrows',
            frames: this.anims.generateFrameNumbers('arrows', {
                start: 0,
                end: 1
            }),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create({
            key: 'animCardHit',
            frames: this.anims.generateFrameNumbers('cardhit', {
                start: 0,
                end: 7
            }),
            frameRate: 30
        });

        this.game.canvas.setAttribute('willReadFrequently', 'true');
        this.backChoices = []
        this.attrTexts = []
        this.backChoiceImgs = []
        this.choiceAttrData = {}
        this.arrowSide = null
        this.card_back_other = 0
        this.winnerAnimTween = null
        this.showAttrTexts = []
        this.backShowScores = []
        this.myCardImg = null
        countryWinSoundAdded = false
        buttonLocked = false
        remaining_p1 = 0
        remaining_p2 = 0
        showGameoverDoneShowned = false
    }
    createBackImage() {
        const backimage = this.add.image(0, 0, 'game_back');
        const canvasWidth = this.game.config.width;
        const canvasHeight = this.game.config.height;
        const imageWidth = backimage.width;
        const imageHeight = backimage.height;
        const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
        backimage.setScale(scale + 0.2);
        backimage.setPosition(canvasWidth / 2, canvasHeight / 2);
    }

    createFrames() {
        const cardimgp1 = this.add.image(xPos_p1, yPos_p1, 'frame');
        cardimgp1.setScale(this.avatarScale)
        cardimgp1.setDepth(12)
        const cardimgp2 = this.add.image(xPos_p2, yPos_p2, 'frame');
        cardimgp2.setScale(this.avatarScale)
        cardimgp2.setDepth(12)
        this.myAvatarImg = this.add.image(xPos_p1, yPos_p1, 'avatar' + mySelectedAvatar);
        this.myAvatarImg.setScale(this.avatarScale)
        this.myAvatarImg.setDepth(10)
        this.otherAvatarImg = this.add.image(xPos_p2, yPos_p2, 'avatar' + otherSelectedAvatar);
        this.otherAvatarImg.setScale(this.avatarScale)
        this.otherAvatarImg.setDepth(10)
        this.addName(xPos_p1, yPos_p1 - 85, myName)
        this.addName(xPos_p2, yPos_p2 - 85, otherName)
    }

    addName(x, y, name) {

        const gameBackName = this.add.image(x, y + 144, 'gameBackName');
        gameBackName.setDepth(2)
        var tt = this.add.text(x, y + 141, name, {
            fontSize: '18px',
            fontFamily: 'Tahoma',
            color: '#fcba03',
            padding: {
                x: 10,
                y: 5
            },
            lineSpacing: 10
        }).setOrigin(0.5);
        tt.setDepth(3)
        return tt
    }
    createCards() {
        for (var i = 0; i < totCards; i++) {
            const cardimg = this.add.image(cardResetPosX, cardResetPosY, 'card_' + i);
            cardimg.setScale(cardScale)
            cardimg.x = cardResetPosX
            cardimg.y = cardResetPosY
            var c = new card(i, cardimg)
            c.setAttributes()
            this.cardsMain.push(c)
        }
    }
    startPlayerPick() {
        if (bonneChanceimage) {
            bonneChanceimage.destroy()
        }
        const x = canvasW / 2 - 199
        const y = canvasH / 2 - 125
        quiVaCommencerBackimage = this.add.image(x, y - 40, 'commenceback');
        quiVaCommencerBackimage.setDepth(4)
        quiVaCommencerBackimage.setScale(1.2)

        quiVaCommencerText = this.add.text(x, y - 40, 'Qui va commencer?', {
            fontSize: '28px',
            fontFamily: 'Tahoma',
            color: '#fcba03',
            padding: {
                x: 10,
                y: 5
            },
            lineSpacing: 10,
            stroke: '#1a540e',
            strokeThickness: 5,
            strokeRounded: true,
        }).setOrigin(0.5);
        quiVaCommencerText.setDepth(5)

        const sound = this.sound.add('drumroll');
        sound.play();
        timeoutHandle = setTimeout(function() {
            timeoutHandle = null;
            quiVaCommencerBackimage.destroy();
            quiVaCommencerText.destroy();
            socket.send(JSON.stringify({
                type: 'quiVaCommencerDone'
            }))
        }, 2650)
    }

    quiVaCommencerDone() {
        quiVaCommencerBackimage.destroy();
        if (quiVaCommencerText != undefined) {
            quiVaCommencerText.destroy()
        }
        if (quiVaCommencerBackimage != undefined) {
            quiVaCommencerBackimage.destroy()
        }
        const x = canvasW / 2 - 169
        const y = canvasH / 2 - 125
        var uname = ''
        var av = ''

        if (debug && playersAll.length == 0) {
            playersAll[0] = {}
            playersAll[0].id = 'player1'
            playersAll[0].username = 'myself'
            playersAll[0].avatar = '2'
            playersAll[0].playedCardFinish = false
            playersAll[1] = {}
            playersAll[1].id = 'player2'
            playersAll[1].username = 'other'
            playersAll[1].avatar = '4'
            playersAll[1].playedCardFinish = false
        }
        for (var i = 0; i < playersAll.length; i++) {
            if (playersAll[i].id == startingPlayer) {
                uname = playersAll[i].username
                av = playersAll[i].avatar
            }
        }
        var av = this.add.image(x - 20, y - 30, 'avatar' + av);
        av.setScale(1.2)

        const frame = this.add.image(x - 20, y - 30, 'frame');
        frame.setScale(1.2)
        frame.setDepth(12)

        var tt = this.add.text(x - 15, y + 80, uname, {
            fontSize: '38px',
            fontFamily: 'Tahoma',
            color: '#fcba03',
            padding: {
                x: 10,
                y: 5
            },
            lineSpacing: 10,
            stroke: '#1a540e',
            strokeThickness: 5,
            strokeRounded: true,
        }).setOrigin(0.5);
        tt.setDepth(5)

        if (!timeoutHandle) {
            timeoutHandle = setTimeout(function() {
                timeoutHandle = null;
                av.destroy();
                tt.destroy();
                frame.destroy(), socket.send(JSON.stringify({
                    type: 'drawWinnerShown'
                }))
            }, 2650)
        }
    }

    drawCard(data) {

        var cardid = data.cardId
        var playerId = data.playerId
        var imgName = 'card_' + cardid
        var xDest = inGameFrameX_p1
        var yDest = inGameFrameY_p1
        var xStart = g.deckP1.x + 10
        var yStart = g.deckP1.y
        var isMine = true

        if (playerId == myid) {
            playedCard = cardid
        }

        if (playerId != myid) {
            playedCardOther = cardid
            imgName = 'card_back'
            xDest = inGameFrameX_p2
            yDest = inGameFrameY_p2
            xStart = g.deckP2.x - 10
            yStart = g.deckP2.y
            isMine = false
        }

        if (!isMine) {
            this.deckP2.removeCard()
        } else {
            this.deckP1.removeCard()
        }
        const b = this.add.image(xStart, yStart, 'card_back');
        b.setScale(cardScaleDraw + 0.03)
        b.setDepth(25)

        let tt = g.tweens.add({
            targets: b,
            scale: 1,
            x: xDest,
            y: yDest,
            ease: 'Linear',
            duration: 390,
            context: this,
            onComplete: function() {
                if (isMine) {
                    g.myCardImg = g.add.image(inGameFrameX_p1, inGameFrameY_p1, 'card_' + cardid);
                } else {
                    g.card_back_other = g.add.image(inGameFrameX_p2, inGameFrameY_p2, 'card_back');
                }
                b.destroy()
                tt.stop()
                tt.remove()
                const sound = g.sound.add('cardPlaced');
                sound.play();
                if (playerId == myid) {
                    socket.send(JSON.stringify({
                        type: 'playedCard'
                    }))
                }
            }
        })
    }

    showColOverrideDone() {
        this.playedCardFinish()
    }

    showColOverride(data) {
        if (myid != startingPlayer) {
            this.addPickedChoiceNotTurn(data, true)
        }
        const sound = this.sound.add('colorChange');
        sound.play();
        sound.on('complete', function() {
            socket.send(JSON.stringify({
                type: 'showColOverrideDone',
            }));
        });

        if (myid == startingPlayer) {
            var p = data.col_p2
            var p2 = data.col_p1
            if (myid == 'player2') {
                p = data.col_p1
                p2 = data.col_p2
            }
            colorWinnerImg = g.add.image(inGameFrameX_p2 - 88, inGameFrameY_p2 - 172, p);
            colorLoserImg = g.add.image(inGameFrameX_p1 - 97, inGameFrameY_p1 - 181, p2);
            colorLoserImg.setScale(0.19, 0.19)
        } else {
            var p = data.col_p1
            var p2 = data.col_p2
            if (myid == 'player2') {
                p = data.col_p2
                p2 = data.col_p1
            }
            colorWinnerImg = g.add.image(inGameFrameX_p1 - 99, inGameFrameY_p1 - 180, p);
            colorLoserImg = g.add.image(inGameFrameX_p2 - 90, inGameFrameY_p2 - 174, p2);
            colorLoserImg.setScale(0.22, 0.22)
        }
        colorWinnerImg.setDepth(15)
        colorWinnerImg.setScale(0.18, 0.18)
        colorLoserImg.setDepth(15)

        let ttc = g.tweens.add({
            targets: colorWinnerImg,
            scale: 0.25,
            ease: Phaser.Math.Easing.Cubic.Out,
            duration: 490,
            context: this,
            yoyo: true,
            loop: true,
            repeat: -1
        })
        startingPlayer = data.currentTurn
        if (myid != startingPlayer && this.backChoiceImgs && this.backChoices && this.attrTexts) {
            for (var i = 0; i < 4; i++) {
                if (this.backChoiceImgs[i]) {
                    this.backChoiceImgs[i].destroy()
                }
                if (this.backChoices[i]) {
                    this.backChoices[i].destroy()
                }
                if (this.attrTexts[i]) {
                    this.attrTexts[i].destroy()
                }
            }
            return
        }
        this.changeArrowSide()
    }

    playedCardFinish(data) {

        if (data && data.override) {
            startingPlayer = data.currentTurn
            if (myid != startingPlayer && this.backChoiceImgs && this.backChoices && this.attrTexts) {
                return
            }
        }
        cardPlayed = this.cardsMain.find(item => item.id == playedCard)

        if (attrMetricsAdded || myid != startingPlayer) {
            return
        }
        attrMetricsAdded = true
        let textVals = []
        let textKeys = []
        var tt
        var x = choiceXStart
        var y = choiceYStart
        var bck = g.add.image(x + 4, y + 153, 'choiceBackground')
        var labels = []
        var attributes = []
        var metrics = []

        bck.setDepth(1)
        this.backChoiceImgs.push(bck)

        for (var i = 0; i < 4; i++) {
            let ii = i
            let yVal = y
            tt = g.add.image(x + 3, y, 'backChoice');
            tt.setScale(1.05, 1.05)
            tt.setDepth(2)
            tt.setInteractive()
            tt.setTint(0xaaaaaa)
            this.backChoices.push(tt)
            let img = tt
            tt.on('pointerover', () => {
                g.input.setDefaultCursor('pointer')
                img.setTint(0xffffff);
            })
            tt.on('pointerout', () => {
                g.input.setDefaultCursor('auto')
                img.setTint(0xaaaaaa)
            })
            const onClick = () => {
                currentAttrChoice = parseInt(textVals[ii])
                socket.send(JSON.stringify({
                    type: 'attributeSet',
                    cardId: cardPlayed.id,
                    attr: textKeys[ii],
                    attrId: ii,
                    color: cardPlayed.color,
                    name: cardPlayed.name,
                    attrVal: currentAttrChoice,
                    currentTurn: startingPlayer
                }));
                tt.removeListener('pointerdown', onClick);
            }
            tt.on('pointerdown', onClick);
            y += choiceStep
        }
        labels.push(attrs_labels[(selectedCover - 1)].at_1)
        labels.push(attrs_labels[(selectedCover - 1)].at_2)
        labels.push(attrs_labels[(selectedCover - 1)].at_3)
        labels.push(attrs_labels[(selectedCover - 1)].at_4)
        attributes.push(cardPlayed.attributes.at_1)
        attributes.push(cardPlayed.attributes.at_2)
        attributes.push(cardPlayed.attributes.at_3)
        attributes.push(cardPlayed.attributes.at_4)
        metrics.push(attrs_metrics[(selectedCover - 1)].at_1)
        metrics.push(attrs_metrics[(selectedCover - 1)].at_2)
        metrics.push(attrs_metrics[(selectedCover - 1)].at_3)
        metrics.push(attrs_metrics[(selectedCover - 1)].at_4)
        x = choiceXStart
        y = choiceYStart
        var txts = []
        for (var i = 0; i < 4; i++) {
            if (i == 3) x += 3
            var txt = this.add.text(x, y, labels[i] + ': ' + attributes[i] + ' ' + metrics[i], {
                fontSize: '22px',
                fontFamily: 'Tahoma',
                color: '#fcba03',
                padding: {
                    x: 10,
                    y: 5
                },
                lineSpacing: 10,
                stroke: '#1a540e',
                strokeThickness: 5,
                strokeRounded: true,
            }).setOrigin(0.5);
            txt.setDepth(5)
            txt.myVal = attributes[i]
            txt.myLabel = labels[i]
            const nums = txt.text.match(/-?\d+/g);
            textVals.push(nums)
            textKeys.push(labels[i])
            this.attrTexts.push(txt)
            y += choiceStep
        }
    }

    attributeSet(data) {
        if (debug) {
            if (myid == 'player2') {
                cardPlayed = this.cardsMain.find(item => item.id == debugCard)
            }
        } else {
            if (myid != data.playerId) {
                cardPlayed = this.cardsMain.find(item => item.id == playedCard)
            }
        }

        currentAttrChoice = data.attrVal
        var attName = 'at_' + (data.attrId + 1)
        this.choiceAttrData = data
        cardPlayed.setAttributes()
        var isReversed = false
        var ind = selectedCover - 1
        if (scoreReversed[ind]) {
            for (var i = 0; i < scoreReversed[ind].length; i++) {
                if (scoreReversed[ind][i] == data.attrId) {
                    isReversed = true
                }
            }
        }
        socket.send(JSON.stringify({
            type: 'attrResults',
            val: cardPlayed.attributes[attName],
            col: cardPlayed['color'],
            caller: myid,
            isReversed: isReversed
        }))
    }

    addPickedChoiceNotTurn(data,skip) {
        var x = choiceXStart
        var yStart = 275

        var tt = g.add.image(x + 3, yStart, 'backChoice');
        tt.setScale(1.05, 1.05)
        tt.setDepth(2)

        var txt = this.add.text(x + 3, yStart, this.choiceAttrData['attr'], {
            fontSize: '22px',
            fontFamily: 'Tahoma',
            color: '#fcba03',
            padding: {
                x: 10,
                y: 5
            },
            lineSpacing: 10,
            stroke: '#1a540e',
            strokeThickness: 5,
            strokeRounded: true,
        }).setOrigin(0.5);
        txt.setDepth(5)
        animChoiceTextAdded = false
        animChoiceTextAdded2 = false
        if (skip) {
			this.animChoiceText2(tt, txt, true)
		} else {
        	this.animChoiceText(tt, txt, true)
		}
    }

    attrResults(data) {
        if (attrResultsAdded) return

        attrResultsAdded = true
        currentWinner = data.winner

        playedCardValP1 = data.valP1
        playedCardValP2 = data.valP2
		console.log('attrResults winner is '+currentWinner)
        if (myid != startingPlayer) {
            this.addPickedChoiceNotTurn(data)
            return
        }
        var foundIndex
        for (var i = 0; i < this.backChoiceImgs.length; i++) {
            this.backChoiceImgs[i].destroy()
        }
        for (var i = 0; i < this.attrTexts.length; i++) {

            if (currentAttrChoice == this.attrTexts[i].myVal) {
                foundIndex = i;
                continue;
            }
            this.attrTexts[i].destroy()
        }
        for (var i = 0; i < this.backChoices.length; i++) {
            if (i == foundIndex) {
                continue
            }
            this.backChoices[i].destroy()
        }
        var remainingTxt = this.attrTexts[foundIndex]
        if (remainingTxt != undefined) {

            remainingTxt.setStyle({
                fontSize: '22px'
            });
            remainingTxt.text = this.attrTexts[foundIndex].myLabel

            var remainingBack = this.backChoices[foundIndex]
            remainingBack.off('pointerover');
            remainingBack.off('pointerout');
            remainingBack.off('pointerdown');
        }

        if (data.caller != myid && data.override) {
            this.animChoiceText(remainingBack, remainingTxt, true)
        } else {
            this.animChoiceText(remainingBack, remainingTxt, data.override)
        }

    }

    animChoiceText(back, text, override, noback, speed, scale) {

        if (animChoiceTextAdded) return
        animChoiceTextAdded = true

        var sp = 1390
        var sc = 1.4
        if (speed) {
            sp = speed
        }
        if (scale) {
            sc = scale
        }

        if (!noback) {
            const sound = g.sound.add('choiceShow');
            sound.setVolume(1)
            sound.play();
            let tt = g.tweens.add({
                targets: back,
                scale: 1.2,
                ease: Phaser.Math.Easing.Cubic.Out,
                duration: 1390,
                context: this,
                onComplete: function() {
                    tt.stop()
                    tt.remove()
                }
            })
        }
        let tt2 = g.tweens.add({
            targets: text,
            scale: sc,
            ease: Phaser.Math.Easing.Cubic.Out,
            duration: sp,
            context: this,
            onComplete: function() {
                tt2.stop()
                tt2.remove()
            }
        })
        if (!noback) {
            let tt3 = g.tweens.add({
                targets: back,
                scale: 0.01,
                alpha: 0,
                ease: Phaser.Math.Easing.Cubic.Out,
                duration: 1390,
                context: this,
                delay: 1300,
                onComplete: function() {
                    tt3.stop()
                    tt3.remove()
                }
            })

            let tt4 = g.tweens.add({
                targets: text,
                scale: 0.01,
                alpha: 0,
                ease: Phaser.Math.Easing.Cubic.Out,
                duration: sp,
                context: this,
                delay: 1300,
                onComplete: function() {
                    if (!noback) {
                        tt4.stop()
                        tt4.remove()
                        var ret = {
                            type: 'finishedChoiceAnim'
                        }
                        animChoiceTextAdded = true
                        socket.send(JSON.stringify(ret))
                    }
                }
            })
        }
    }

    animChoiceText2(back, text, override) {

        if (animChoiceTextAdded2) return
        animChoiceTextAdded2 = true

       // if (!noback) {
            const sound = g.sound.add('choiceShow');
            sound.setVolume(1)
            sound.play();
            let tt = g.tweens.add({
                targets: back,
                scale: 1.2,
                ease: Phaser.Math.Easing.Cubic.Out,
                duration: 1390,
                context: this,
                onComplete: function() {
                    tt.stop()
                    tt.remove()
                }
            })
       // }
        let tt2 = g.tweens.add({
            targets: text,
            scale: 1.4,
            ease: Phaser.Math.Easing.Cubic.Out,
            duration: 1390,
            context: this,
            onComplete: function() {
                tt2.stop()
                tt2.remove()
            }
        })
       // if (!noback) {
            let tt3 = g.tweens.add({
                targets: back,
                scale: 0.01,
                alpha: 0,
                ease: Phaser.Math.Easing.Cubic.Out,
                duration: 1390,
                context: this,
                delay: 1300,
                onComplete: function() {
                    tt3.stop()
                    tt3.remove()
                }
            })

            let tt4 = g.tweens.add({
                targets: text,
                scale: 0.01,
                alpha: 0,
                ease: Phaser.Math.Easing.Cubic.Out,
                duration: 1390,
                context: this,
                delay: 1300,
                onComplete: function() {
                    tt4.stop()
                    tt4.remove()
                    animChoiceTextAdded2 = true
                }
            })
       // }
    }

    finishedChoiceAnim() {

        if (debug) {
            currentWinner = 'player1'
            playedCardValP1 = 2000
            playedCardValP2 = 1900
        }
        const sound = g.sound.add('cardflip');
        sound.setVolume(0.6)
        sound.play();
        if (colorWinnerImg) {
            colorWinnerImg.destroy()
        }
        if (colorLoserImg) {
            colorLoserImg.destroy()
        }
        this.card_back_other.destroy()
        this.card_back_other = g.add.image(inGameFrameX_p2, inGameFrameY_p2, 'card_' + playedCardOther);
        this.stopTweens()
        timeoutHandle = setTimeout(function() {
            timeoutHandle = null
            g.showAttrVals(currentWinner)
        }, 3300)

        if (myid == currentWinner) {
            winnerCard = this.myCardImg
        } else {
            winnerCard = this.card_back_other
        }
        setTimeout(function() {
            g.showAttrVals()
        }, 2500)
    }

    showAttrVals(winner) {
        var xpos
        var ypos
        var val

        if (winner != undefined) {
            if (winner == 'player1') {
                val = playedCardValP1

            } else {
                val = playedCardValP2

            }
            if (myid == winner) {
                xpos = xPos_p1 + 275
                ypos = yPos_p1 - 312
            } else {
                xpos = xPos_p2 - 285
                ypos = yPos_p2 + 272
            }

        } else {
            if (currentWinner == 'player1') {
                val = playedCardValP2
            } else {
                val = playedCardValP1
            }
            if (myid != currentWinner) {
                xpos = xPos_p1 + 275
                ypos = yPos_p1 - 312
            } else {
                xpos = xPos_p2 - 285
                ypos = yPos_p2 + 272
            }
        }
        var sc = 1.0
        var fnt = '28px'
        var tweenScMax = 1.04
        if (val.toString().length > 5) {
            sc = 0.80
            fnt = '24px'
            tweenScMax = 1.00
        }
        if (winner) {
            sc = 1.0
            const sound = this.sound.add('showScoreWin');
            sound.setVolume(0.5)
            sound.play();
        } else {
            const sound = this.sound.add('showScore');
            sound.setVolume(0.7)
            sound.play();
        }
        var bckImg = this.add.image(xpos, ypos, 'backShowScore').setOrigin(0.5);
        bckImg.setScale(0.6)
        this.backShowScores.push(bckImg)
        var tt = this.add.text(xpos, ypos, val, {
            fontSize: fnt,
            fontFamily: 'Tahoma',
            color: '#fcba03',
            fontWeight: 'bold',
            padding: {
                x: 10,
                y: 5
            },
            lineSpacing: 10,
            stroke: '#1a540e',
            strokeThickness: 4,
            strokeRounded: true,
        }).setOrigin(0.5);
        tt.setDepth(16)
        this.showAttrTexts.push(tt)
        animChoiceTextAdded = false
        animChoiceTextAdded2 = false
        this.animChoiceText(null, tt, false, true, 300, sc, winner)

        if (winner) {
            var t1 = setTimeout(function() {
                var tdir = sc
                g.winnerAnimTween = g.tweens.add({
                    targets: tt,
                    scale: tweenScMax,
                    ease: 'Linear',
                    duration: 390,
                    context: this,
                    yoyo: true,
                    repeat: -1,
                })
            }, 500)

            var ava
            if (myid == winner) {
                ava = mySelectedAvatar
            } else {
                ava = otherSelectedAvatar
            }
            var t2 = setTimeout(function() {
                const sound = g.sound.add('avatar' + ava);
                sound.play();
            }, 1000)

            var t3 = setTimeout(function() {
                socket.send(JSON.stringify({
                    type: 'showAttrValsDone'
                }))
            }, 2000)
        }
    }

    showAttrValsDone() {
        this.winnerAnimTween.stop()
        this.winnerAnimTween.remove()
        for (var i = 0; i < this.backShowScores.length; i++) {
            this.backShowScores[i].destroy();
        }

        for (var i = 0; i < this.showAttrTexts.length; i++) {
            this.showAttrTexts[i].destroy();
        }
        winnerCard.setDepth(30)
        var tt = g.tweens.add({
            targets: winnerCard,
            scale: 1.1,
            ease: 'Linear',
            duration: 190,
            onComplete: function() {
                g.playCardAttack()
            }
        })
    }

    playCardAttack() {
        var path_spline = {
            t: 0,
            vec: new Phaser.Math.Vector2()
        };
        var points = [];
        if (currentWinner == myid) {
            points.push(new Phaser.Math.Vector2(inGameFrameX_p1, inGameFrameY_p1));
            points.push(new Phaser.Math.Vector2(inGameFrameX_p1 - 30, inGameFrameY_p1 + 15));
            points.push(new Phaser.Math.Vector2(inGameFrameX_p2 - 130, inGameFrameY_p2 - 20));
            points.push(new Phaser.Math.Vector2(inGameFrameX_p2 - 200, inGameFrameY_p2 - 80));
        } else {
            points.push(new Phaser.Math.Vector2(inGameFrameX_p2, inGameFrameY_p2));
            points.push(new Phaser.Math.Vector2(inGameFrameX_p2 + 30, inGameFrameY_p2 - 15));
            points.push(new Phaser.Math.Vector2(inGameFrameX_p1 + 165, inGameFrameY_p1 + 65));
            points.push(new Phaser.Math.Vector2(inGameFrameX_p1 + 200, inGameFrameY_p1 + 30));
        }
        var curve = new Phaser.Curves.Spline(points);

        var xpos = inGameFrameX_p1 + 40
        var ypos = inGameFrameY_p1 + 40
        if (currentWinner == myid) {
            xpos = inGameFrameX_p2 + 0
            ypos = inGameFrameY_p2 + 10
        }
        g.tweens.add({
            targets: path_spline,
            t: 1,
            ease: 'Sine.easeInOut',
            duration: 300,
            onUpdate: function() {
                curve.getPoint(path_spline.t, path_spline.vec);
                winnerCard.x = path_spline.vec.x;
                winnerCard.y = path_spline.vec.y;
            },
            onComplete: function() {
                const sound = g.sound.add('thump');
                sound.setVolume(1.3)
                sound.play();
                var thump = g.add.sprite(xpos, ypos, 'cardhit')
                thump.setDepth(35)
                thump.setScale(3.5)
                thump.alpha = 1
                thump.play('animCardHit')
                thump.on('animationcomplete', function() {
                    thump.destroy();
                    g.playCardAttackDone()
                });
            }
        });
    }

    playCardAttackDone() {
        var cid
        var cido
        var dposx
        var dposy
        if (currentWinner == myid) {
            dposx = xPos_p1 + xOffset_avatar_deck
            dposy = yPos_p1 + yOffset_avatar_deck
            cid = this.myCardImg
            cido = this.card_back_other
        } else {
            dposx = xPos_p2 - xOffset_avatar_deck - 5
            dposy = yPos_p2 + yOffset_avatar_deck
            cid = this.card_back_other
            cido = this.myCardImg
        }
        var tt = g.tweens.add({
            targets: cid,
            x: dposx,
            y: dposy,
            scale: cardScaleDraw,
            alpha: 0,
            ease: Phaser.Math.Easing.Cubic.In,
            duration: 900,
            onComplete: function() {
                tt.stop()
                tt.remove()
                cid.destroy()
            }
        });
        var tt2 = g.tweens.add({
            targets: cido,
            x: dposx,
            y: dposy,
            scale: cardScaleDraw,
            alpha: 0.3,
            ease: Phaser.Math.Easing.Cubic.In,
            duration: 900,
            delay: 300,
            onComplete: function() {
                tt2.stop()
                tt2.remove()
                cido.destroy()
                if (currentWinner == myid) {
                    g.deckP1.addCard()
                    stoppedScaleCardAnim = false
                    g.deckP1.addCard()
                } else {
                    g.deckP2.addCard()
                    stoppedScaleCardAnim = false
                    g.deckP2.addCard()
                }
                attrMetricsAdded = false
                attrResultsAdded = false
                animChoiceTextAdded = false
                animChoiceTextAdded2 = false
                if (!readyNextTurnSent) {
					readyNextTurnSent = true
					socket.send(JSON.stringify({
						type: 'readyNextTurn',
						c1: playedCard,
						c2: playedCardOther,
						winner: currentWinner
					}))
				}
            }
        });
    }

    readyNextTurn(data) {
        coverClickBlock = false
        g.deckP1.update(true)
        g.deckP2.update(true)
        g.animScaleCard(myid)
        currentWinner = data.winner
        startingPlayer = currentWinner
        g.changeArrowSide()
        if (this.backChoices) {
            for (var i = 0; i < this.backChoices.length; i++) {
                if (this.backChoices[i]) {
                    this.backChoices[i].destroy()
                }
            }
        }
        this.backChoices = []
        if (this.backChoiceImgs) {
            for (var i = 0; i < this.backChoiceImgs.length; i++) {
                if (this.backChoiceImgs[i]) {
                    this.backChoiceImgs[i].destroy()
                }
            }
        }
        this.backChoiceImgs = []
        if (this.attrTexts) {
            for (var i = 0; i < this.attrTexts.length; i++) {
                if (this.attrTexts[i]) {
                    this.attrTexts[i].destroy()
                }
            }
        }
        this.attrTexts = []
    }

    getCoordsByPlayer() {
        var xpos = xPos_p1
        var ypos = yPos_p1
        var flip = true
        var offx = 70
        var offy = 57
        if (startingPlayer != myid) {
            xpos = xPos_p2
            ypos = yPos_p2
            flip = false
            offx = -70
            offy = 57
        }
        return {
            xpos: xpos,
            ypos: ypos,
            flip: flip,
            offx: offx,
            offy: offy
        }
    }

    changeArrowSide() {
        if (this.arrowSide) {
            this.arrowSide.destroy()
            console.log('destroyed old')
        }
        var xpos = xPos_p1
        var ypos = yPos_p1
        var flip = true
        var offx = 70
        var offy = 57
        //if ((currentWinner && currentWinner!=myid) || startingPlayer != myid) {
		if (startingPlayer != myid) {
            xpos = xPos_p2
            ypos = yPos_p2
            flip = false
            offx = -70
            offy = 57
        }
        console.log('ARROW XPOS:'+xpos + offx+'  ARROW YPOS:'+ypos + offy)
        console.log('WON:'+currentWinner)
        var arr = g.add.sprite(xpos + offx, ypos + offy, 'arrows')
        if (flip) {
            arr.setFlipX(true);
        }
        arr.setDepth(10)
        arr.setScale(0.3)
        arr.play('animarrows')
        this.arrowSide = arr
    }

    drawWinnerShown(caller) {
        this.changeArrowSide()
        const frame1 = this.add.image(inGameFrameX_p1, inGameFrameY_p1, 'frameInGame');
        frame1.setScale(1.1)
        const frame2 = this.add.image(inGameFrameX_p2, inGameFrameY_p2, 'frameInGame');
        frame2.setScale(1.1)
        this.animScaleCard(caller)
        gameStarted = true
    }

    animScaleCard(caller) {
        if (!stoppedScaleCardAnim) {
            let tt = g.tweens.add({
                targets: g.deckP1.lastImage,
                scale: cardScaleAnim,
                ease: 'Linear',
                duration: 190,
                context: this,
                yoyo: true,
                repeat: -1
            })
        }
    }

    showBonneChance() {
        bonneChanceimage = this.add.image(canvasW / 2 - 169, canvasH / 2 - 125, 'bonnechance');
        const sound = this.sound.add('bonnechance');
        sound.play();
        sound.on('complete', function() {
            bonneChanceimage.destroy()
            g.sound.stopAll()
            socket.send(JSON.stringify({
                type: 'bonneChanceDone'
            }))
        })
    }

    reinit() {
        this.drawDeck = new drawDeck(totCards, 420, 300)
        selectedCover = 1
        playersAll = []
        buttonLocked = false
        mySelectedAvatar = ''
    }
    stopTweens() {
        let tweens = g.tweens.getAllTweens();
        for (let i = 0; i < tweens.length; i++) {
            tweens[i].stop();
            tweens[i].remove();
        }
    }
}