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
    this.load.audio('bkmusic', 'sounds/backintro.mp3');
  }
  init(data) {
	console.log('data:')
	console.log(data)
	this.players = data.players;
	console.log('yea')
	console.dir(data)
  }
  create() {
	g = this
	console.log(g)
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

	const frame1 = this.add.image(180, 200, 'frame');
	const frame2 = this.add.image(550, 200, 'frame');

  }
  updateFrames(players) {
	  console.log('sok')
  }

}