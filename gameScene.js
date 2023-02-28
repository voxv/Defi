class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

 /* init(data) {

    this.username = data.username;
    this.socket = io.connect();

    this.socket.on('connect', () => {
      this.socket.emit('join', { room: this.room, username: this.username });
    });

    this.socket.on('update', (gameState) => {
      // update game state with gameState object
    });

    this.socket.on('end', (winner) => {
      // display winner and end game
    });
  }*/

  create() {
	g = this
	console.log('GAME STARTED')
    // display game board and player hands
  }

  update() {
    // handle player input and update game state
  }
}