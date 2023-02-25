var proto = 'wss'
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
  proto = 'ws'
}
const url = process.env.NODE_ENV === "production" ? process.env.PROD_URL : process.env.DEV_URL;

var socket = io("ws://"+url, {transports: ['websocket']});
if (process.env.NODE_ENV === 'development') {
	socket = io(proto+"://"+url, {transports: ['websocket']});
} else {
	socket = io(proto+"://"+url, {transports: ['websocket']});
}

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

socket.addEventListener('open', (event) => {
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

  }
});

socket.addEventListener('close', (event) => {
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
