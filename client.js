const publicKey = '-----BEGIN PUBLIC KEY-----MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMkOzVmF36ykSAb3WTmNAGQLFBcVUy+pmsS6fDzE3cYFTDFbV+teHrOZ/K2kwezPggkIRKqmChBEzIjebqYjPskCAwEAAQ==-----END PUBLIC KEY-----';

const socket = new WebSocket('wss://defi-nature.onrender.com');

/*const socket = new WebSocket('wss://defi-nature.onrender.com:3001', ['echo-protocol'], {
    verifyClient: (info, cb) => {
        const publicKeyObj = { key: publicKey };
        const cert = info.req.connection.getPeerCertificate();
        const verified = crypto.verify(null, cert.raw.toString('base64'), publicKeyObj, 'base64');
        if (verified) {
            cb(true);
        } else {
            cb(false, 401, 'Unauthorized');
        }
    }
});*/

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
  console.log('msg:')
  console.dir(event.data)
  let data = JSON.parse(event.data);

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

  if (socket.readyState === WebSocket.OPEN) {
	console.log('Sending:'+JSON.stringify(message))
    socket.send(JSON.stringify(message));
  }else {
    console.error('WebSocket is not open, cannot send message');
  }
}

console.dir(socket);
