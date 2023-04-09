class StartScreen extends Phaser.Scene {
    constructor() {
        super({
            key: 'StartScreen'
        });
    }
    preload() {
        this.load.image('avatar1', 'images/avatar1_high.png');
        this.load.image('avatar2', 'images/avatar2_high.png');
        this.load.image('avatar3', 'images/avatar3_high.png');
        this.load.image('avatar4', 'images/avatar4_high.png');
        this.load.image('avatar5', 'images/avatar5_high.png');
        this.load.image('backstart', 'images/backstart.jpg');
        this.load.audio('avatar1', 'sounds/avatar1.mp3');
        this.load.audio('avatar2', 'sounds/avatar2.mp3');
        this.load.audio('avatar3', 'sounds/avatar3.mp3');
        this.load.audio('avatar4', 'sounds/avatar4.mp3');
        this.load.audio('avatar5', 'sounds/avatar5.mp3');
    }

    create() {
        g = this
        const {
            width,
            height
        } = this.scale;
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        var tt = this.add.text(centerX, centerY - 200, 'Défi Nature', {
            fontSize: '58px',
            fontFamily: 'Georgia',
            fontWeight: 'bold',
            color: '#11360f',
        }).setOrigin(0.5).setDepth(10);

        let avatarY = centerY + 60
        let avatarX = 120
        let step = 140

        const canvasWidth = this.game.config.width;
        const canvasHeight = this.game.config.height;

        const backimage = this.add.image(0, 0, 'backstart');
        const imageWidth = backimage.width;
        const imageHeight = backimage.height;
        const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
        backimage.setScale(scale);
        backimage.setPosition(canvasWidth / 2, canvasHeight / 2);


        const scaleAvatar = 0.7
        this.avatar1 = this.add.image(avatarX, avatarY, 'avatar1');
        if (avatarTaken != 1) {
            this.avatar1.setInteractive();
            this.avatar1.on('pointerup', () => this.onClickAvatar('avatar1', this.avatar1), this);
        } else {
            this.avatar1.setTint(0x777777);
        }
        this.avatar1.setScale(scaleAvatar)
        this.avatar1.id = 1
        avatarX = avatarX + step
        avatars.push(this.avatar1)

        this.avatar2 = this.add.image(avatarX, avatarY, 'avatar2');
        if (avatarTaken != 2) {
            this.avatar2.setInteractive();
            this.avatar2.on('pointerup', () => this.onClickAvatar('avatar2', this.avatar2), this);
        } else {
            this.avatar2.setTint(0x777777);
        }
        this.avatar2.setScale(scaleAvatar)
        this.avatar2.id = 2
        avatarX = avatarX + step
        avatars.push(this.avatar2)

        this.avatar3 = this.add.image(avatarX, avatarY, 'avatar3');
        if (avatarTaken != 3) {
            this.avatar3.setInteractive();
            this.avatar3.on('pointerup', () => this.onClickAvatar('avatar3', this.avatar3), this);
        } else {
            this.avatar3.setTint(0x777777);
        }
        this.avatar3.setScale(scaleAvatar)
        this.avatar3.id = 3
        avatarX = avatarX + step
        avatars.push(this.avatar3)

        this.avatar4 = this.add.image(avatarX, avatarY, 'avatar4');
        this.avatar4.id = 4
        if (avatarTaken != 4) {
            this.avatar4.setInteractive();
            this.avatar4.on('pointerup', () => this.onClickAvatar('avatar4', this.avatar4), this);
        } else {
            this.avatar4.setTint(0x777777);
        }
        this.avatar4.setScale(scaleAvatar)

        avatarX = avatarX + step
        avatars.push(this.avatar4)

        this.avatar5 = this.add.image(avatarX, avatarY, 'avatar5');
        if (avatarTaken != 5) {
            this.avatar5.setInteractive();
            this.avatar5.on('pointerup', () => this.onClickAvatar('avatar5', this.avatar5), this);
        } else {
            this.avatar5.setTint(0x777777);
        }
        this.avatar5.setScale(scaleAvatar)
        this.avatar5.id = 5
        avatarX = avatarX + step
        avatars.push(this.avatar5)
        this.add.text(canvasW / 2 - 200, 260, 'Choisis un avatar', {
            fontSize: '26px',
            fontFamily: 'Tahoma',
            color: '#96c5f2',
            padding: {
                x: 10,
                y: 5
            },
            lineSpacing: 10,
            stroke: '#000',
            strokeThickness: 5,
            strokeRounded: true
        }).setOrigin(0.5);

        this.div = document.getElementById('userform')
        this.game.canvas.parentNode.appendChild(this.div);
        this.div.style.position = 'absolute';
        this.div.style.left = '250px';
        this.div.style.top = '180px';

        this.div2 = document.getElementById('join-button')
        this.game.canvas.parentNode.appendChild(this.div2);
        this.div2.style.position = 'absolute';
        this.div2.style.left = '370px';
        this.div2.style.top = (canvasH - 350) + 'px';
        this.joinButton = this.div2

        this.joinButton.addEventListener("click", this.sendRegisterName)

        const usernameInput = document.getElementById("username");

        usernameInput.addEventListener("input", function(event) {
            const value = event.target.value;
            if (value != undefined && value != '') {
                g.activateJoinButton()
            } else {
                g.deactivateJoinButton()
            }
        });
        this.events.on('pause', this.onPause, this);
    }

    onClickAvatar(avatarName, avImg) {
        if (avatarName === 'avatar1') {
            this.selectAvatar(1, this.avatar1)
        } else if (avatarName === 'avatar2') {
            this.selectAvatar(2, this.avatar2)
        } else if (avatarName === 'avatar3') {
            this.selectAvatar(3, this.avatar3)
        } else if (avatarName === 'avatar4') {
            this.selectAvatar(4, this.avatar4)
        } else if (avatarName === 'avatar5') {
            this.selectAvatar(5, this.avatar5)
        }
    }
    onPause() {
        g.div.style.display = "none";
        g.div2.style.display = "none";
    }

    removeClickListener() {
        this.joinButton.removeEventListener('click', this.sendRegisterName);
    }

    updateAvatarTaken(av) {
        var avatar = avatars.find(item => item.id == av)
        avatar.setScale(0.7)
        avatar.setTint(0x777777);
        avatar.removeListener('pointerup', this.onClickAvatar('avatar' + avatar.id, avatar));
        for (const a of avatars) {
            a.setScale(0.7)
        }
    }

    selectAvatar(avatarIndex, avatar) {
        g.sound.stopAll();
        mySelectedAvatar = avatarIndex;
        for (const a of avatars) {
            a.setScale(0.7)
        }
        avatar.setScale(1)
        this.activateJoinButton()
        const sound = this.sound.add('avatar' + mySelectedAvatar);
        sound.play();
    }

    deactivateJoinButton() {
        this.joinButton.classList.remove("btn-primary");
        this.joinButton.classList.add("btn-secondary");
        this.joinButton.disabled = true
    }

    activateJoinButton() {
        var u = document.getElementById('username').value
        if (u && u != undefined && mySelectedAvatar >= 0) {
            this.joinButton.classList.remove("btn-secondary");
            this.joinButton.classList.add("btn-primary");
            this.joinButton.disabled = false
        }
    }

    sendRegisterName() {
        var u = document.getElementById('username').value
        sendMessage({
            type: 'nameRegister',
            name: u,
            avatar: mySelectedAvatar
        })
    }
}