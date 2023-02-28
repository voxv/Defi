class PreScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'PreScene'
        });
    }
    preload() {
        this.load.image('avatar1', 'images/avatar1_high.png');
        this.load.image('avatar2', 'images/avatar2_high.png');
        this.load.image('avatar3', 'images/avatar3_high.png');
        this.load.image('avatar4', 'images/avatar4_high.png');
        this.load.image('avatar5', 'images/avatar5_high.png');
        this.load.image('backpre', 'images/backpre.jpg');
        this.load.image('frame', 'images/frame.png');
        this.load.image('question', 'images/question.png');
        this.load.image('vs', 'images/vs.png');
        this.load.audio('bkmusic', 'sounds/backintro.mp3');
        this.load.audio('avatar1', 'sounds/avatar1.mp3');
        this.load.audio('avatar2', 'sounds/avatar2.mp3');
        this.load.audio('avatar3', 'sounds/avatar3.mp3');
        this.load.audio('avatar4', 'sounds/avatar4.mp3');
        this.load.audio('avatar5', 'sounds/avatar5.mp3');
        this.load.audio('playerquit', 'sounds/playerquit.mp3');
        this.load.audio('battlestart', 'sounds/battlestart.mp3');
    }

    create() {
        g = this
        this.cameras.main.setBackgroundColor('#0f3017');
        const {
            width,
            height
        } = this.scale;
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const backimage = this.add.image(0, 0, 'backpre');
        const canvasWidth = this.game.config.width;
        const canvasHeight = this.game.config.height;
        const imageWidth = backimage.width;
        const imageHeight = backimage.height;
        const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
        backimage.setScale(scale);
        backimage.setPosition(canvasWidth / 2, canvasHeight / 2);
        backimage.alpha = 0.8

        this.frame1X = 190
        this.frame2X = 590
        this.frameY = 200
        this.avatarScale = 1.32

        const frame1 = this.add.image(this.frame1X, this.frameY, 'frame');
        const frame2 = this.add.image(this.frame2X, this.frameY, 'frame');
        frame1.setScale(1.5)
        frame2.setScale(1.5)

        this.vs = this.add.image(this.frame1X + 200, this.frameY, 'vs');
        if (myid == 'player2') {
            socket.send(JSON.stringify({
                type: 'udpateAvatarP2'
            }))
        }

        this.addAvatar()
        this.bkmusic = this.sound.add('bkmusic', {
            loop: true
        });

        this.bkmusic.play()

        this.vsTweenDir = 1
        this.battleSoundPlayed = false;
    }

    startGame() {
        let tweens = g.tweens.getAllTweens();
        for (let i = 0; i < tweens.length; i++) {
            tweens[i].stop();
        }
        if (g.joinButton)
            g.joinButton.remove();
        g.sound.stopAll();
        g.scene.pause();
        g.scene.shutdown()
        g.scene.start('GameScene');
    }
    startGameSequence() {
        if (!this.battleSoundPlayed) {
            g.sound.stopAll()
            const sound = this.sound.add('battlestart');
            sound.play();
            sound.on('complete', function() {
                g.sound.stopAll()
                socket.send(JSON.stringify({
                    type: 'finishedStartSequence',
                    id: myid
                }))
            })
            this.battleSoundPlayed = true
        }
        if (this.vsTweenDir == 1) {
            let tween = g.tweens.add({
                targets: this.vs,
                scale: 1.3,
                ease: Phaser.Math.Easing.Cubic.Out,
                duration: 500,
                context: g,
                onComplete: function() {
                    g.vsTweenDir *= -1
                    if (tween.destroy)
                        tween.destroy()
                    g.startGameSequence()
                }
            });
        } else {
            let tween = g.tweens.add({
                targets: this.vs,
                scale: 1,
                ease: 'Linear',
                duration: 500,
                context: this,
                onComplete: function() {
                    g.vsTweenDir *= -1
                    if (tween.destroy)
                        tween.destroy()
                    g.startGameSequence()
                }
            });
        }
    }
    addAvatar(options) {
        if (!buttonLocked && myid == 'player1') {
            this.joinButton = document.getElementById('join-button')
            this.joinButton.innerHTML = 'Débuter'
            this.joinButton.style.display = 'block'
            this.game.canvas.parentNode.appendChild(this.joinButton);
            this.joinButton.style.position = 'absolute';
            this.joinButton.style.left = '370px';
            this.joinButton.style.top = (canvasH - 350) + 'px';
            this.joinButton.addEventListener("click", function() {
                socket.send(JSON.stringify({
                    type: 'startGameSequence'
                }))
                buttonLocked = true
                g.lockJoinButton()
            })
        }
        if (g.otherName) {
            g.otherName.destroy()
        }

        if (g.myName) {
            g.myName.destroy()
        }
        var xpos = this.frame1X
        var xpos2 = this.frame2X

        if (myid == 'player2') {
            xpos = this.frame2X
            xpos2 = this.frame1X
        }
        var a = playersAll.find(player => player.id === myid);
        this.myAvatarImg = this.add.image(xpos, this.frameY, 'avatar' + a.avatar);
        this.myAvatarImg.setScale(this.avatarScale)
        const myp = playersAll.find(player => player.id === myid);
        this.myName = this.addName(xpos, this.frameY, myp.username)

        if (playersAll.length > 1) {
            var otherp = playersAll.find(player => player.id !== myid);
            if (otherp.avatar != '') {
                this.otherAvatarImg = this.add.image(xpos2, this.frameY, 'avatar' + otherp.avatar);
                this.otherAvatarImg.setScale(this.avatarScale)

            } else {
                var t = this.add.image(xpos2, this.frameY, 'question');
                t.setScale(this.avatarScale)
            }
            if (otherp.username != '') {
                this.otherName = this.addName(xpos2, this.frameY, otherp.username)
            }

            if (myid == 'player1' && otherp.avatar != '') {
                const sound = this.sound.add('avatar' + otherp.avatar);
                sound.play();
            } else if (otherp.avatar != '') {
                const sound = this.sound.add('avatar' + otherp.avatar);
                sound.play();
            }
            this.activateJoinButton()

        } else if (myid == 'player1') {
            var t = this.add.image(xpos2, this.frameY, 'question');
            t.setScale(this.avatarScale)
            this.deactivateJoinButton()

            if (options && options.nosound) {
                const sound = this.sound.add('playerquit');
                sound.play();
            }
        } else {
            if (options && options.nosound) {
                const sound = this.sound.add('playerquit');
                sound.play();
            }
        }
    }
    addName(x, y, name) {
        return this.add.text(x, y + 140, name, {
            fontSize: '36px',
            fontFamily: 'Tahoma',
            color: '#fcba03',
            padding: {
                x: 10,
                y: 5
            },
            lineSpacing: 10,
            stroke: '#1a540e',
            strokeThickness: 5,
            strokeRounded: true
        }).setOrigin(0.5);
    }
    deactivateJoinButton() {
        if (this.joinButton) {
            if (this.joinButton.classList.contains("btn-primary")) {
                this.joinButton.classList.remove("btn-primary");
            }
            this.joinButton.classList.add("btn-secondary");
            this.joinButton.disabled = true
        }
    }
    activateJoinButton() {
        if (this.joinButton) {
            if (this.joinButton.classList.contains("btn-secondary")) {
                this.joinButton.classList.remove("btn-secondary");
            }
            this.joinButton.classList.add("btn-primary");
            this.joinButton.disabled = false
        }
    }
    lockJoinButton() {
        if (this.joinButton) {
            if (this.joinButton.classList.contains("btn-secondary")) {
                this.joinButton.classList.remove("btn-secondary");
            }
            if (this.joinButton.classList.contains("btn-primary")) {
                this.joinButton.classList.remove("btn-primary");
            }
            this.joinButton.classList.add("btn-success");
            this.joinButton.remove()
        }
    }
}