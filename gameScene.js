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
    this.backImg = null

    this.setAttributes = function() {
		this.attributes.at_1 = attrs[(selectedCover-1)][this.id]['at_1']
		this.attributes.at_2 = attrs[(selectedCover-1)][this.id]['at_2']
		this.attributes.at_3 = attrs[(selectedCover-1)][this.id]['at_3']
		this.attributes.at_4 = attrs[(selectedCover-1)][this.id]['at_4']
		this.color = attrs[(selectedCover-1)][this.id].col
	}
}


class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene'
        });
    }

    preload() {

		for (var i = 0; i < 36; i++) {
        	this.load.image('card_'+i, 'images/pack'+(selectedCover-1)+'/card_0.png');
		}

    }

    create() {
        g = this
        this.cardsMain = {}
        this.createCards()

        socket.send(JSON.stringify({
            type: 'inGameConfirm',

        }))
        console.dir(this.cardsMain)
    }

	createCards() {
        for (var i = 0; i < 36; i++) {
			const cardimg = this.add.image(cardResetPosX, cardResetPosY, 'card_'+i);
            var c = new card(i, cardimg)
            this.cardsMain[i] = c
            this.cardsMain[i].setAttributes()
        }
	}
    update() {

    }
}