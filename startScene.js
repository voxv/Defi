class StartScreen extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScreen' });
  }
  preload() {
    // Load the avatar images
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
    const { width, height } = this.scale;
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    var tt = this.add.text(centerX, centerY - 200, 'Défi Nature', {
      fontSize: '58px',
      fontFamily: 'Georgia',
      fontWeight: 'bold',
      color: '#11360f',
    }).setOrigin(0.5).setDepth(10);


	let avatarY = centerY+60
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

	const scaleAvatar  = 0.7
    const avatar1 = this.add.image(avatarX, avatarY, 'avatar1');
    avatar1.setInteractive();
    avatar1.on('pointerup', () => this.selectAvatar(1, avatar1));
    avatar1.setScale(scaleAvatar)
    avatarX = avatarX+step
	avatars.push(avatar1)

    const avatar2 = this.add.image(avatarX, avatarY, 'avatar2');
    avatar2.setInteractive();
    avatar2.on('pointerup', () => this.selectAvatar(2, avatar2));
    avatar2.setScale(scaleAvatar)
	avatarX = avatarX+step
	avatars.push(avatar2)

    const avatar3 = this.add.image(avatarX, avatarY, 'avatar3');
    avatar3.setInteractive();
    avatar3.on('pointerup', () => this.selectAvatar(3, avatar3));
    avatar3.setScale(scaleAvatar)
    avatarX = avatarX+step
	avatars.push(avatar3)

    const avatar4 = this.add.image(avatarX, avatarY, 'avatar4');
    avatar4.setInteractive();
    avatar4.on('pointerup', () => this.selectAvatar(4, avatar4));
    avatar4.setScale(scaleAvatar)
    avatarX = avatarX+step
    avatars.push(avatar4)

    const avatar5 = this.add.image(avatarX, avatarY, 'avatar5');
    avatar5.setInteractive();
    avatar5.on('pointerup', () => this.selectAvatar(5, avatar5));
    avatar5.setScale(scaleAvatar)
    avatarX = avatarX+step
    avatars.push(avatar5)

    this.add.text(canvasW/2-200, 260, 'Choisis un avatar', {
      fontSize: '26px',
      fontFamily: 'Tahoma',
      color: '#96c5f2',
      //backgroundColor: '#1d472b',
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
    this.div2.style.top = (canvasH-350)+'px';
    this.joinButton = this.div2

    this.joinButton.addEventListener("click",this.sendRegisterName)

	const usernameInput = document.getElementById("username");

	usernameInput.addEventListener("input", function(event) {
	  const value = event.target.value;
	  if (value!=undefined && value!='') {
		  g.activateJoinButton()
	  } else {
		  g.deactivateJoinButton()
	  }
	});
	this.events.on('pause', this.onPause, this);
  }

  onPause() {
    g.div.style.display = "none";
    g.div2.style.display = "none";
  }

  selectAvatar(avatarIndex, avatar) {
	g.sound.stopAll();
	mySelectedAvatar = avatarIndex;
	for (const a of avatars) {
		a.setScale(0.7)
	}
	avatar.setScale(1)
	this.activateJoinButton()
    const sound = this.sound.add('avatar'+mySelectedAvatar);
    sound.play();
  }

  deactivateJoinButton() {
	this.joinButton.classList.remove("btn-primary");
	this.joinButton.classList.add("btn-secondary");
	this.joinButton.disabled = true
  }

  activateJoinButton() {
	var u = document.getElementById('username').value
	if (u && u!=undefined && mySelectedAvatar>=0) {
		this.joinButton.classList.remove("btn-secondary");
		this.joinButton.classList.add("btn-primary");
		this.joinButton.disabled = false
	}
  }

  sendRegisterName() {
	var u = document.getElementById('username').value
	sendMessage({ type: 'nameRegister', name: u, avatar: mySelectedAvatar })
  }
}