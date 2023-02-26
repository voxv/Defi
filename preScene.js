class PreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreScene' });
  }
  preload() {
    // Load the avatar images
    this.load.image('avatar1', 'images/avatar1_high.png');
    this.load.image('avatar2', 'images/avatar2_high.png');
    this.load.image('avatar3', 'images/avatar3_high.png');
    this.load.image('avatar4', 'images/avatar4_high.png');
    this.load.image('backpre', 'images/backpre.jpg');
    this.load.image('frame', 'images/frame.png');
    this.load.image('question', 'images/question.png');
    this.load.image('vs', 'images/vs.png');
    this.load.audio('bkmusic', 'sounds/backintro.mp3');
  }
  init(data) {
	//this.players = data.players;
	//console.dir(players2)
  }
  create() {
	g = this
	//console.log(g)
	this.cameras.main.setBackgroundColor('#0f3017');
    const { width, height } = this.scale;
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



	const vs = this.add.image(this.frame1X+200, this.frameY, 'vs');
	if (myid=='player2') {
		socket.send(JSON.stringify({ type: 'udpateAvatarP2' }))
	}


	this.addAvatar()
  }
  update() {

	//  console.dir(playersAll)
  }
  addAvatar() {
	if (myid=='player1') {
		this.joinButton = document.getElementById('join-button')
		this.joinButton.innerHTML = 'Débuter'
		this.joinButton.style.display = 'block'
		this.game.canvas.parentNode.appendChild(this.joinButton);
		this.joinButton.style.position = 'absolute';
		this.joinButton.style.left = '370px';
		this.joinButton.style.top = (canvasH-350)+'px';
		//this.joinButton = this.div2
		this.joinButton.addEventListener("click",this.sendRegisterName)
		 console.dir(this.joinButton)
	}

	  var xpos = this.frame1X
	  var xpos2 = this.frame2X

	  if (myid=='player2') {
		  xpos = this.frame2X
		  xpos2 = this.frame1X
	  }
	  var a = playersAll.find(player => player.id === myid);
	  this.myAvatarImg = this.add.image(xpos, this.frameY, 'avatar'+a.avatar);
	  this.myAvatarImg.setScale(this.avatarScale)

	  if (playersAll.length>1) {
		  var b = playersAll.find(player => player.id !== myid);
		  this.otherAvatarImg = this.add.image(xpos2, this.frameY, 'avatar'+b.avatar);
		  this.otherAvatarImg.setScale(this.avatarScale)
		  this.activateJoinButton()
	  } else if (myid=='player1') {
		  var t = this.add.image(xpos2, this.frameY, 'question');
		  t.setScale(this.avatarScale)
		 // t.alpha = 0.8
		  this.deactivateJoinButton()
	  }

  }
  deactivateJoinButton() {

	if (this.joinButton.classList.contains("btn-primary")) {
		this.joinButton.classList.remove("btn-primary");
	}
	this.joinButton.classList.add("btn-secondary");
	this.joinButton.disabled = true
  }
  activateJoinButton() {
	if (this.joinButton.classList.contains("btn-secondary")) {
		this.joinButton.classList.remove("btn-secondary");
	}
	this.joinButton.classList.add("btn-primary");
	this.joinButton.disabled = false

  }
}