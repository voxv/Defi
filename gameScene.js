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

var drawDeck = function(tot, x, y) {
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

    this.initImages = function() {
        this.countTweens = 0
        this.deck = []
        var offsetX = 0
        var offsetY = 0
        this.topOffsetX = offsetX
        this.topOffsetY = offsetY
        var stepX = 3
        var stepY = 4
        for (var i = 0; i < this.currentTot; i++) {
            if (i % 4 == 0) {
                var img = g.add.image(this.x + offsetX, this.y + offsetY, 'card_back')
                img.setScale(cardScaleDraw)
                img.visible = false
                this.backImages.push(img)
                offsetX += stepX
                offsetY += stepY
            }
        }
    }

    this.addCard = function() {

        this.currentTot++
        this.update(true)

    }
    this.update = function(noDecrement) {

        for (var i = 0; i < this.backImages.length; i++) {
            this.backImages[i].destroy()
        }
        this.backImages = []
        var offsetX = 0
        var offsetY = 0
        var stepX = 3
        var stepY = 2

        for (var i = 0; i < this.currentTot; i++) {
            if (i % 6 == 0) {
                var img = g.add.image(this.x + offsetX, this.y + offsetY, 'card_back')
                img.setScale(cardScaleDraw)
                img.visible = true
                this.backImages.push(img)
                offsetX += stepX
                offsetY += stepY
            }
        }
        this.topOffsetX = offsetX - stepX
        this.topOffsetY = offsetY - stepY
        if (!noDecrement)
            this.currentTot--
    }

    this.doDraw = function() {

        var nimg = g.add.image(this.x + this.topOffsetX, this.y + this.topOffsetY, 'card_back')
        nimg.setScale(cardScaleDraw)
        nimg.setDepth(14)
        var isP1 = false
        if (this.yDir == yPos_p1 - yOffset_avatar_deck) {
            this.yDir = yPos_p2 + yOffset_avatar_deck
            this.xDir = xPos_p2 - xOffset_avatar_deck-5
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
            duration: 30,
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
					socket.send(JSON.stringify({
						type: 'drawDoneConfirm',
					}))
				}
            },
            delay: 10
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
        this.load.image('game_back', 'images/game_back1.jpg');
        this.load.image('gameBackName', 'images/gameBackName.png');
        this.load.image('playerpickback', 'images/playerpickback.jpg');
        this.load.image('bonnechance', 'images/bonnechance.jpg');

        this.load.audio('cardflip', 'sounds/cardflip.mp3');
        this.load.audio('bonnechance', 'sounds/bonnechance.mp3');
        this.load.audio('drumroll', 'sounds/drumroll.mp3');

    }

    create() {
        g = this
        this.createBackImage()
		//const backname1 = this.add.image(xPos_p1+28, yPos_p1 , 'backname');
		//const backname2 = this.add.image(xPos_p2-28, yPos_p2 , 'backname');
        this.avatarScale = 0.6
        this.cardsMain = {}
        this.createCards()
        this.createFrames()

        socket.send(JSON.stringify({
            type: 'inGameConfirm',
        }))
        this.drawDeck = new drawDeck(totCards, 420, 300)
        this.drawDeck.update()
        this.drawDeck.doDraw()

        this.frame1X = xPos_p1
        this.frame1Y = yPos_p1
        this.frame2X = xPos_p2
        this.frame2Y = yPos_p2

        this.deckP1 = new drawDeck(0, xPos_p1 + xOffset_avatar_deck, yPos_p1 - yOffset_avatar_deck)
        this.deckP2 = new drawDeck(0, xPos_p2 - xOffset_avatar_deck-5, yPos_p2 + yOffset_avatar_deck)
    }
	createBackImage() {
        const backimage = this.add.image(0, 0, 'game_back');
        const canvasWidth = this.game.config.width;
        const canvasHeight = this.game.config.height;
        const imageWidth = backimage.width;
        const imageHeight = backimage.height;
        const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
        backimage.setScale(scale+0.2);
        //backimage.setDepth(1);
        backimage.setPosition(canvasWidth / 2, canvasHeight / 2);
        //backimage.alpha = 0.8
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

		const gameBackName = this.add.image(x, y+144, 'gameBackName');
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
            this.cardsMain[i] = c
            this.cardsMain[i].setAttributes()
        }
    }
    startPlayerPick() {
		const x = canvasW/2-169
		const y = canvasH/2-125
		const backimage = this.add.image(x, y-80, 'playerpickback');
		backimage.setDepth(4)
		backimage.setScale(1.2)

        var tt = this.add.text(x, y -80, 'Qui va commencer?', {
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
        tt.setDepth(5)

        const sound = this.sound.add('drumroll');
        sound.play();
		setTimeout(function() { backimage.destroy(); tt.destroy(); socket.send(JSON.stringify({ type: 'quiVaCommencerDone' }))} , 2350)
        sound.on('complete', function() {
            socket.send(JSON.stringify({
                type: 'quiVaCommencerDone'
            }))
        })
	}

	quiVaCommencerDone() {

		console.log('yay')
	}
	showBonneChance() {
		const backimage = this.add.image(canvasW/2-169, canvasH/2-125, 'bonnechance');
		//setTimeout(function() { backimage.destroy(); socket.send(JSON.stringify({ type: 'bonneChanceDone' })) }, 1000)
        const sound = this.sound.add('bonnechance');
        sound.play();
        sound.on('complete', function() {
			backimage.destroy()
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
}