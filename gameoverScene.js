class GameoverScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameoverScene'
        });
    }
    preload() {
        this.load.image('avatar1_round', 'images/avatar1_high_round.png');
        this.load.image('avatar2_round', 'images/avatar2_high_round.png');
        this.load.image('avatar3_round', 'images/avatar3_high_round.png');
        this.load.image('avatar4_round', 'images/avatar4_high_round.png');
        this.load.image('avatar5_round', 'images/avatar5_high_round.png');
        this.load.image('gameoverBack', 'images/backGameover.jpg');
        this.load.image('card_back', 'images/card_back.png');
        this.load.image('backShowScore', 'images/backShowScore2.png');
        this.load.image('avatar1_king', 'images/avatar1_high_king.png');
        this.load.image('avatar2_king', 'images/avatar2_high_king.png');
        this.load.image('avatar3_king', 'images/avatar3_high_king.png');
        this.load.image('avatar4_king', 'images/avatar4_high_king.png');
        this.load.image('avatar5_king', 'images/avatar5_high_king.png');

        this.load.audio('avatar1', 'sounds/avatar1.mp3');
        this.load.audio('avatar2', 'sounds/avatar2.mp3');
        this.load.audio('avatar3', 'sounds/avatar3.mp3');
        this.load.audio('avatar4', 'sounds/avatar4.mp3');
        this.load.audio('avatar5', 'sounds/avatar5.mp3');
        this.load.audio('countryWin', 'sounds/countryWin.mp3');
        //this.load.audio('countryWin', 'sounds/avatar1.mp3');
        this.load.audio('cardPile', 'sounds/cardPile.mp3')
        this.load.audio('showScore', 'sounds/showScore.mp3');
        this.load.audio('showScoreWin', 'sounds/showScoreWin.mp3');
        this.load.audio('fight', 'sounds/fight.mp3');
        this.load.audio('thump', 'sounds/thump.mp3');
        this.load.audio('loserfly', 'sounds/loserfly.mp3');
        this.load.audio('kingMusic', 'sounds/kingMusic.mp3');
        this.load.spritesheet('pow', 'images/cardhit_spritesheet.png', {
            frameWidth: 150,
            frameHeight: 143
        });
    }

    create() {
        g = this
        const {
            width,
            height
        } = this.scale;
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        gameoverStartText = this.add.text(centerX, centerY - 200, 'Partie Terminée', {
            fontSize: '58px',
            fontFamily: 'Georgia',
            fontWeight: 'bold',
            color: '#fcba03',
            lineSpacing: 10,
            stroke: '#1a540e',
            strokeThickness: 5,
            strokeRounded: true
        }).setOrigin(0.5).setDepth(10);

        this.titleAnimTween = g.tweens.add({
            targets: gameoverStartText,
            scale: 1.06,
            ease: 'Linear',
            duration: 390,
            context: this,
            yoyo: true,
            repeat: -1,
        })
        const canvasWidth = this.game.config.width;
        const canvasHeight = this.game.config.height;

        const backimage = this.add.image(0, 0, 'gameoverBack');
        const imageWidth = backimage.width;
        const imageHeight = backimage.height;
        const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
        backimage.setScale(scale);
        backimage.setPosition(canvasWidth / 2, canvasHeight / 2);

        this.imgCardsBack_p1 = []
        this.imgCardsBack_p2 = []
        this.winnerAvatarImg = null
        this.loserAvatarImg = null
        this.winnerXpos = 150
        this.winnerYpos = 370
        this.loserXpos = 620
        this.loserYpos = 370
        this.yorig = 0
        this.offSetY = 5
        this.currentDetune = 0
        this.createFrames()
        this.max_tot = 0
        this.remainingCardsLoser = null
        this.remainingCardsWinner = null
        this.bckImgShowScoreLoser = null
        this.bckImgShowScoreWinner = null
        this.winnerAnimTween = null
        this.winnerAvatarKing = null

        if (!countryWinSoundAdded) {
            const sound = this.sound.add('countryWin');
            sound.play();
            sound.on('complete', function() {
                g.stopTweens()
                gameoverStartText.destroy()
                socket.send(JSON.stringify({
                    type: 'showGameoverDone',
                }));
            });
            countryWinSoundAdded = true
        }
        this.anims.create({
            key: 'animpow',
            frames: this.anims.generateFrameNumbers('pow', {
                start: 0,
                end: 7
            }),
            frameRate: 30
        });
    }
    showGameoverDone() {
		console.log('showGameoverDoneShowned is '+showGameoverDoneShowned)
        if (showGameoverDoneShowned) {
			console.log('nope')
            return
        }
        showGameoverDoneShowned = true
        this.max_tot = Math.max(remaining_p1, remaining_p2)
        this.yorig = this.winnerYpos - 120
        for (var i = 0; i < this.max_tot; i++) {
            setTimeout('g.showOneCard(' + i + ')', 700 + i * 40)
        }
    }
    showOneCard(i) {
        if (i < remaining_p1) {
            var img = g.add.image(this.winnerXpos, this.yorig, 'card_back')
            img.setScale(cardScaleDraw)
            this.imgCardsBack_p1.push(img)
            const sound = this.sound.add('cardPile');
            sound.detune = this.currentDetune;
            sound.setVolume(1.3)
            sound.play();
            this.currentDetune += 20
        }
        if (i < remaining_p2) {
            var img = g.add.image(this.loserXpos, this.yorig, 'card_back')
            img.setScale(cardScaleDraw)
            this.imgCardsBack_p2.push(img)
        }
        this.yorig -= this.offSetY
        if (i == this.max_tot - 1) {
            setTimeout('g.showTotCards()', 1500)
            setTimeout('g.showTotCards(true)', 3200)
            setTimeout('g.sendCardsDone()', 6200)
        }
    }
    sendCardsDone() {
        socket.send(JSON.stringify({
            type: 'showTotCardsDone',
        }));
    }
    showTotCards(winner) {
        if (!winner) {
            this.bckImgShowScoreLoser = this.add.image(this.loserXpos - 110, this.loserYpos - 150, 'backShowScore').setOrigin(0.5);
            this.bckImgShowScoreLoser.setScale(0.6)
            this.bckImgShowScoreLoser.setDepth(9)
            this.remainingCardsLoser = this.add.text(this.loserXpos - 110, this.loserYpos - 150, remaining_p2, {
                fontSize: '48px',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                color: '#fffa66',
                lineSpacing: 10,
                stroke: '#000000',
                strokeThickness: 3,
                strokeRounded: true
            }).setOrigin(0.5).setDepth(10);
            const sound = this.sound.add('showScore');
            sound.play();
        } else {
            this.bckImgShowScoreWinner = this.add.image(this.winnerXpos + 125, this.winnerYpos - 150, 'backShowScore').setOrigin(0.5);
            this.bckImgShowScoreWinner.setScale(0.6)
            this.bckImgShowScoreWinner.setDepth(9)
            var tt = g.tweens.add({
                targets: this.bckImgShowScoreWinner,
                scale: 0.65,
                ease: 'Linear',
                duration: 390,
                context: this,
                yoyo: true,
                repeat: -1,
            })
            this.remainingCardsWinner = this.add.text(this.winnerXpos + 125, this.winnerYpos - 150, remaining_p1, {
                fontSize: '48px',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                color: '#fffa66',
                lineSpacing: 10,
                stroke: '#000000',
                strokeThickness: 3,
                strokeRounded: true
            }).setOrigin(0.5).setDepth(10);
            const sound = this.sound.add('showScoreWin');
            sound.play();
            this.winnerAnimTween = g.tweens.add({
                targets: this.remainingCardsWinner,
                scale: 1.12,
                ease: 'Linear',
                duration: 390,
                context: this,
                yoyo: true,
                repeat: -1,
            })
        }
    }

    createFrames() {
        if (myid == currentWinner) {
            this.winnerAvatarImg = this.add.image(this.winnerXpos, this.winnerYpos, 'avatar' + mySelectedAvatar + '_round');
            this.loserAvatarImg = this.add.image(this.loserXpos, this.loserYpos, 'avatar' + otherSelectedAvatar + '_round');
        } else {
            this.loserAvatarImg = this.add.image(this.loserXpos, this.loserYpos, 'avatar' + mySelectedAvatar + '_round');
            this.winnerAvatarImg = this.add.image(this.winnerXpos, this.winnerYpos, 'avatar' + otherSelectedAvatar + '_round');
        }
        this.winnerAvatarImg.setScale(this.avatarScale)
        this.winnerAvatarImg.setDepth(10)
        this.loserAvatarImg.setScale(this.avatarScale)
        this.loserAvatarImg.setDepth(10)
    }

    showTotCardsDone() {
        this.bckImgShowScoreLoser.destroy()
        this.remainingCardsLoser.destroy()
        this.bckImgShowScoreWinner.destroy()
        this.remainingCardsWinner.destroy()
        for (var i = 0; i < this.imgCardsBack_p1.length; i++) {
            this.imgCardsBack_p1[i].destroy()
        }
        for (var i = 0; i < this.imgCardsBack_p2.length; i++) {
            this.imgCardsBack_p2[i].destroy()
        }
        this.stopTweens()
        this.playFight()
        this.setUpPows()
    }

    setUpPows() {

        for (var i = 50; i > 0; i--) {
            var del = Phaser.Math.Between(30, 60)
            setTimeout('g.playPow(' + i + ')', i * 100 - del)

        }
    }

    playPow(ii) {
        var t = Phaser.Math.Between(1, 50)
        if (t == 3) {
            const sounda = g.sound.add('thump');
            sounda.setVolume(1.0)
            sounda.play();
        }

        var mid = canvasW / 2 - 150
        var xpos = Phaser.Math.Between(mid - 130, mid + 130)
        var ypos = Phaser.Math.Between(this.loserYpos - 90, this.loserYpos + 90)
        var sc = Phaser.Math.Between(2, 5)
        var thump = g.add.sprite(xpos, ypos, 'pow')
        thump.setDepth(35)
        thump.setScale(sc)
        thump.alpha = 1
        thump.play('animpow')
        thump.on('animationcomplete', function() {
            thump.destroy();
        });
    }

    playFight() {
        var path_spline_winner = {
            t: 0,
            vec: new Phaser.Math.Vector2()
        };
        var path_spline_loser = {
            t: 0,
            vec: new Phaser.Math.Vector2()
        };
        var pointsWinner = [];
        var pointsLoser = []

        var xMiddle = canvasW / 2 - 150

        const sound = this.sound.add('fight');
        sound.play();
        sound.on('complete', function() {
            socket.send(JSON.stringify({
                type: 'readyToKick',
            }));
        });

        setTimeout('const sound1 = g.sound.add("avatar' + mySelectedAvatar + '"); sound1.play()', 1000);
        setTimeout('const sound2 = g.sound.add("avatar' + otherSelectedAvatar + '"); sound2.play()', 1900);
        setTimeout('const sound3 = g.sound.add("avatar' + mySelectedAvatar + '"); sound3.play()', 3000);
        setTimeout('const sound4 = g.sound.add("avatar' + otherSelectedAvatar + '"); sound4.play()', 3900);

        pointsWinner.push(new Phaser.Math.Vector2(this.winnerXpos, this.winnerYpos));
        for (var i = 0; i < 30; i++) {
            if (i % 2 == 0) {
                pointsWinner.push(new Phaser.Math.Vector2(xMiddle, this.winnerYpos));
            } else {
                pointsWinner.push(new Phaser.Math.Vector2(xMiddle - 130, this.winnerYpos));
            }
        }

        pointsLoser.push(new Phaser.Math.Vector2(this.loserXpos, this.loserYpos));
        for (var i = 0; i < 30; i++) {
            if (i % 2 == 0) {
                pointsLoser.push(new Phaser.Math.Vector2(xMiddle, this.loserYpos));
            } else {
                pointsLoser.push(new Phaser.Math.Vector2(xMiddle + 130, this.loserYpos));
            }
        }

        var curveWinner = new Phaser.Curves.Spline(pointsWinner);
        var curveLoser = new Phaser.Curves.Spline(pointsLoser);

        g.tweens.add({
            targets: path_spline_winner,
            t: 1,
            ease: 'Sine.easeOutIn',
            duration: 4100,
            onUpdate: function() {
                curveWinner.getPoint(path_spline_winner.t, path_spline_winner.vec);
                g.winnerAvatarImg.x = path_spline_winner.vec.x;
                g.winnerAvatarImg.y = path_spline_winner.vec.y;
            }
        })
        g.tweens.add({
            targets: path_spline_loser,
            t: 1,
            ease: 'Sine.easeOutIn',
            duration: 4390,
            onUpdate: function() {
                curveLoser.getPoint(path_spline_loser.t, path_spline_loser.vec);
                g.loserAvatarImg.x = path_spline_loser.vec.x;
                g.loserAvatarImg.y = path_spline_loser.vec.y;
            }
        });
    }
    kickLoser() {
        var path_spline_winner = {
            t: 0,
            vec: new Phaser.Math.Vector2()
        };
        var pointsWinner = [];
        var pointsLoser = []
        pointsWinner.push(new Phaser.Math.Vector2(g.winnerAvatarImg.x, g.winnerAvatarImg.y));
        pointsWinner.push(new Phaser.Math.Vector2(160, g.winnerAvatarImg.y));
        pointsWinner.push(new Phaser.Math.Vector2(g.loserAvatarImg.x - 50, g.winnerAvatarImg.y));
        pointsWinner.push(new Phaser.Math.Vector2(canvasW / 2 - 160, g.winnerAvatarImg.y));
        var curveWinner = new Phaser.Curves.Spline(pointsWinner);

        g.tweens.add({
            targets: path_spline_winner,
            t: 1,
            ease: 'Sine.easeInOut',
            duration: 220,
            onUpdate: function() {
                curveWinner.getPoint(path_spline_winner.t, path_spline_winner.vec);
                g.winnerAvatarImg.x = path_spline_winner.vec.x;
                g.winnerAvatarImg.y = path_spline_winner.vec.y;
            },
            onComplete: function() {
                g.makeLoserFly();
            }
        })
    }

    makeLoserFly() {
        const player = this.loserAvatarImg
        const startPos = {
            x: player.x,
            y: player.y
        };
        const endPos = {
            x: 800,
            y: 10
        };
        const startScale = player.scaleX;
        const endScale = 0.04;
        const ss = g.sound.add('loserfly');
        ss.setVolume(1.0)
        ss.play();
        const duration = 980;
        this.tweens.add({
            targets: player,
            x: endPos.x,
            y: endPos.y,
            scaleX: endScale,
            scaleY: endScale,
            duration: duration,
            ease: 'Linear',
            onComplete: function() {
                player.destroy();
                setTimeout('socket.send(JSON.stringify({ type: "makeLoserFlyDone"}));', 900)
            }
        });
    }

    showWinnerName() {
        var n = myName
        var ava = mySelectedAvatar
        if (myid != currentWinner) {
            n = otherName
            ava = otherSelectedAvatar
        }
        this.remainingCardsWinner = this.add.text(canvasW / 2 - 145, 490, 'Bravo ' + n + ' !', {
            fontSize: '50px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#fffa66',
            lineSpacing: 10,
            stroke: '#000000',
            strokeThickness: 10,
            strokeRounded: true
        }).setOrigin(0.5).setDepth(18);
        setTimeout('const sound5 = g.sound.add("avatar' + ava + '"); sound5.play()', 80);
        setTimeout('g.restart()', 6000);
    }

    restart() {
        g.sound.stopAll();
        g.stopTweens()
        g.scene.pause();
        g.scene.shutdown()
        g.scene.start('PreScene');
    }
    makeLoserFlyDone() {
        if (myid == currentWinner) {
            this.winnerAvatarImg.setTexture('avatar' + mySelectedAvatar + '_king');
        } else {
            this.winnerAvatarImg.setTexture('avatar' + otherSelectedAvatar + '_king');
        }
        setTimeout('const ss = g.sound.add("kingMusic"); ss.setVolume(0.9); ss.play(); ss.on("complete", function() { g.showWinnerName()  }); ', 500)
        this.tweens.add({
            targets: this.winnerAvatarImg,
            y: 200,
            scale: 2,
            duration: 3000,
            ease: 'Linear'
        });
    }
    stopTweens() {
        let tweens = g.tweens.getAllTweens();
        for (let i = 0; i < tweens.length; i++) {
            tweens[i].stop();
            tweens[i].remove();
        }
    }
}