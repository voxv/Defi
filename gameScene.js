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
	this.x	 = x
	this.y = y
	this.tot = tot
	this.currentTot = this.tot
	this.cards = []
	this.backImages = []
    this.drawYDest_p1 = 100
	this.drawYDest_p2 = 500
    this.drawXDest_p1 = 130
    this.drawXDest_p2 = 730
	this.tweensDraw = []
	this.deck = []
	this.countTweens = 0
	this.yDir = this.drawYDest_p1
	this.xDir = this.drawXDest_p1
	this.topOffsetX = 0
	this.topOffsetY = 0

	this.initImages = function(){
		this.countTweens = 0
		this.deck = []
		var offsetX = 0
		var offsetY = 0
		this.topOffsetX = offsetX
		this.topOffsetY = offsetY
		var stepX = 3
		var stepY = 4
		for (var i = 0 ; i < this.currentTot ; i++) {
			if (i%4==0) {
				var img =  g.add.image(this.x + offsetX, this.y + offsetY, 'card_back')
				img.setScale(cardScaleDraw)
				img.visible = false
				this.backImages.push(img)
				offsetX += stepX
				offsetY += stepY
			}
		}
		console.dir(this.backImages)
	}

	this.update = function() {
		/*for (const i in this.backImages) {
			this.backImages[i].visible = true
		}*/
		for (var i = 0 ; i < this.backImages.length ; i++){
			this.backImages[i].destroy()
		}
		this.backImages = []
		var offsetX = 0
		var offsetY = 0
		var stepX = 3
		var stepY = 2
		for (var i = 0 ; i < this.currentTot ; i++) {
			if (i%6==0) {
				var img =  g.add.image(this.x + offsetX, this.y + offsetY, 'card_back')
				img.setScale(cardScaleDraw)
				img.visible = true
				this.backImages.push(img)
				offsetX += stepX
				offsetY += stepY
			}
		}
		this.topOffsetX = offsetX-stepX
		this.topOffsetY = offsetY-stepY
		this.currentTot--
	}

	this.doDraw = function() {

		var nimg = g.add.image(this.x + this.topOffsetX, this.y + this.topOffsetY, 'card_back')
		nimg.setScale(cardScaleDraw)
		//for (let i = 0; i < (this.currentTot) ; i++) {

		  if (this.yDir == this.drawYDest_p1) {
			  this.yDir = this.drawYDest_p2
			  this.xDir = this.drawXDest_p2
		  } else {
			  this.yDir = this.drawYDest_p1
			  this.xDir = this.drawXDest_p1
		  }
		  this.tweensDraw.push(g.tweens.add({
			targets: nimg,
			y: this.yDir,
			x: this.xDir,
            ease: Phaser.Math.Easing.Cubic.In,
            duration: 250,
            context: this,
            onComplete: function() {
				if (g.drawDeck.currentTot>=0) {
					g.drawDeck.update()
					g.drawDeck.doDraw()
					//g.totalRemainingInDrawDeck--
					/*if ((g.totalRemainingInDrawDeck)<=0) {
						console.log('yay')
					}*/
					g.drawDeck.tweensDraw.pop()
					//nimg.destroy()
					//this.destroy()
				}
            },
			delay:  30
		  }));
		  this.countTweens++
		//}
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
    }

    create() {
        g = this
        this.cardsMain = {}
        this.createCards()

        socket.send(JSON.stringify({
            type: 'inGameConfirm',

        }))
        this.backImage = this.add.image(cardResetPosX, cardResetPosY, 'card_back');
        this.totalRemainingInDrawDeck = totCards


        //this.drawDeck = []
        //this.tweensDraw = []
        //this.showDrawDeck()
        //this.doDraw()
        this.drawDeck = new drawDeck(totCards, 420, 300)
        this.drawDeck.update()
        this.drawDeck.doDraw()
    }



	showDrawDeck() {

		//this.drawDeck.update()


		/*const offsetX = 2;
		const offsetY = 3;
		this.drawDeck = []
		console.log(this.totalRemainingInDrawDeck)
		if (this.totalRemainingInDrawDeck>totCards-10) {
			for (var i = 0 ; i < (totCards-1) ; i++) {
				console.log(this.backImage.x)
				var img =  this.add.image(this.backImage.x + offsetX*i, this.backImage.y + offsetY*i, 'card_back')
				img.setScale(cardScaleDraw)
				//img.x = g.drawXDest
				//img.y = 300
				this.drawDeck.push(img);
			}
		} else if (this.totalRemainingInDrawDeck>totCards-20) {
			for (var i = 0 ; i < (totCards-1) ; i++) {
				const px = offsetX
				if (i%2==0){
					px += offsetX*i
				}
				var img =  this.add.image(this.backImage.x + px, this.backImage.y + offsetY*i, 'card_back')
				img.setScale(cardScaleDraw)
				this.drawDeck.push(img);
			}
		} else {
			for (var i = 0 ; i < 1 ; i++) {
				var img =  this.add.image(this.backImage.x + offsetX*i, this.backImage.y + offsetY*i, 'card_back')
				img.setScale(cardScaleDraw)
				this.drawDeck.push(img);
			}
		}*/

	//}


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
    update() {

    }
	reinit() {
        //this.totalRemainingInDrawDeck = totCards
        this.drawDeck = new drawDeck(totCards, 420, 300)
        //this.tweensDraw = []
        selectedCover = 1
        playersAll = []
        buttonLocked = false
        mySelectedAvatar = ''
	}
}