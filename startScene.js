class StartScreen extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScreen' });
  }
  preload() {
    // Load the avatar images
    this.load.image('avatar1', 'images/avatar1.png');
    this.load.image('avatar2', 'images/avatar2.png');
    this.load.image('avatar3', 'images/avatar3.png');
    this.load.image('avatar4', 'images/avatar4.png');
  }

  create() {
	g = this
    const { width, height } = this.scale;
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.add.text(centerX, centerY - 200, 'Défi Nature', {
      fontSize: '48px',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

	let avatarY = centerY+70
    const avatar1 = this.add.image(100, avatarY, 'avatar1');
    avatar1.setInteractive();
    avatar1.on('pointerup', () => this.selectAvatar(1));

    const avatar2 = this.add.image(200, avatarY, 'avatar2');
    avatar2.setInteractive();
    avatar2.on('pointerup', () => this.selectAvatar(2));

    const avatar3 = this.add.image(300, avatarY, 'avatar3');
    avatar3.setInteractive();
    avatar3.on('pointerup', () => this.selectAvatar(3));

    const avatar4 = this.add.image(400, avatarY, 'avatar4');
    avatar4.setInteractive();
    avatar4.on('pointerup', () => this.selectAvatar(4));

    this.add.text(310, 200, 'Ton nom:', {
      fontSize: '18px',
      fontFamily: 'Arial',
      fontColor: '#ffffff'
    }).setOrigin(0.5);

    const div = document.getElementById('username')
    this.game.canvas.parentNode.appendChild(div);
    div.style.position = 'absolute';
    div.style.left = '360px';
    div.style.top = '200px';

    const div2 = document.getElementById('join-button')
    this.game.canvas.parentNode.appendChild(div);
    div2.style.position = 'absolute';
    div2.style.left = '450px';
    div2.style.top = '300px';
  }
  selectAvatar(avatarIndex) {

    this.selectedAvatar = avatarIndex;
    sendMessage({ type: 'nameRegister', name: this.username, avatar: this.selectedAvatar })
  }
}