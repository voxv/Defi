var proto = 'ws'
if (window.location.hostname === 'defi-nature.onrender.com') {
  url = 'defi-nature.onrender.com'
  proto = 'wss'
} else {
  url = 'localhost:3000'
}

var socket = io(proto+"://"+url, {transports: ['websocket']});

let players;
let myid = 0

const player = {
	username: '',
	avatar: ''
}

var playersTemplate = function() {
	this.player1 = Object.assign({}, player)
	this.player2 = Object.assign({}, player)
}

socket.addEventListener('connect', (event) => {
	players = new playersTemplate()
	console.log('OPENED!!')
});

socket.addEventListener('message', (event) => {
	console.dir(socket)
  console.log('msg:')
  console.dir(event)
  let data = JSON.parse(event);

  switch (data.type) {
	case 'setID':
	  myid = data.id
	  console.dir('my id:'+myid)
	  break;
    case 'changeToPlayer1':
	  myid = 'player1'
	  console.log('my id switched to player1')
      break;
    case 'updateNames':
      console.dir(data.players)
      break

  }
});

socket.addEventListener('disconnect', (event) => {
  console.log('WebSocket connection closed');
});

socket.addEventListener('error', (error) => {
  console.error('WebSocket error: ', error);
});

function sendMessage(message) {
   console.dir(socket)
   socket.send(JSON.stringify(message));

  /*if (socket.readyState === WebSocket.OPEN) {
	console.log('Sending:'+JSON.stringify(message))
    socket.send(JSON.stringify(message));
  }else {
    console.error('WebSocket is not open, cannot send message');
  }*/
}

console.dir(socket);
