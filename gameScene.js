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
}
class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene'
        });
    }

    create() {
        g = this
        this.cardsMain = {}
        for (var i = 0; i < 36; i++) {
            var c = new card(i, 'card_' + i)
            this.cardsMain[i] = c
        }

        socket.send(JSON.stringify({
            type: 'inGameConfirm',

        }))
    }

    update() {

    }
}