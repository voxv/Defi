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
});

socket.addEventListener('message', (event) => {
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
	  //console.log('l1='+playersAll.length)

	  for (var i = 0 ; i < playersAll.length ; i++) {
		  if (playersAll[i].id == 'player1' || playersAll[i]=='') {
			  delete playersAll[i]
		  } else {
			  playersAll[i].id = 'player1'
		  }
	  }

	  playersAll = playersAll.filter(function(player) {
	    return player !== undefined;
	  });
	  playersAll = playersAll.map((value) => value);
	  //console.log('THEZERO:')
	  //console.dir(playersAll)
	  if (playersAll[0])
	  playersAll[0].id = 'player1'

	  g.otherAvatarImg.destroy()
	  g.myAvatarImg.destroy()
	  g.addAvatar()
	  //console.log('l12='+playersAll.length)
	  //console.log('my id switched to player1')
      break;

    case 'player2DC':

	  for (var i = 0 ; i < playersAll.length ; i++) {
		  if (playersAll[i].id == 'player2') {
			  delete playersAll[i]
		  }
	  }
	  playersAll = playersAll.filter(function(player) {
	    return player !== undefined;
	  });
	  playersAll = playersAll.map((value) => value);
	  g.otherAvatarImg.destroy()
	  g.addAvatar()
	  //console.log('THEZERO222:')
	  //console.dir(playersAll)
      break


    case 'updateNames':

      playersAll = data.players
      //console.log('players!')
      //console.dir(data.callerp)
      if (data.callerp == myid) {
		  g.sound.stopAll();
		  g.scene.pause();
		  g.scene.shutdown()
		  g.scene.start('PreScene');
	  }

      break

     case 'udpateAvatarP2':
     	if (myid=='player1')
      	g.addAvatar()
        break;


  }
});

socket.addEventListener('disconnect', (event) => {
  console.log('WebSocket connection closed');
});

socket.addEventListener('error', (error) => {
  console.error('WebSocket error: ', error);
});

function sendMessage(message) {
   //console.dir(socket)
   socket.send(JSON.stringify(message));

  /*if (socket.readyState === WebSocket.OPEN) {
	console.log('Sending:'+JSON.stringify(message))
    socket.send(JSON.stringify(message));
  }else {
    console.error('WebSocket is not open, cannot send message');
  }*/
}

//console.dir(socket);
