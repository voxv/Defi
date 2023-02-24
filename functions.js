function setKeys() {
	var keys
	if (isPlayer1) {
		keys = ['W','S','A','D']
	} else {
		keys = ['K','O','L','SEMICOLON']
	}

	for (var j = 0 ; j < keymap.length ; j++) {
		keymap[j].removeAllListeners()
	}
	keymap = []
	for (var i = 0 ; i < keys.length ; i++) {
		var k = g.input.keyboard.addKey(eval('Phaser.Input.Keyboard.KeyCodes.'+keys[i]))
		keymap.push(k)

		k.on('down', function (key, event) {
			 if (key=='S') { sendMessage({ type: 'move', x: 400,y: canvasH-30}) }
    		 alert(key)
    	})
	}
}

function initPlayerSprite() {

	console.log('ll='+gameState.players.length)

	  if (gameState.players.length==1) {
		for (let sprite in playerSprites) {
		  if (playerSprites[sprite].id !== myid) {
			 console.log('delete!')
			 console.dir(playerSprites[sprite])
			playerSprites[sprite].destroy()
			delete playerSprites[sprite];
		  }
		}
	  }
	  gameState.players.forEach(function(player) {

console.log('is '+player.id+' in arr')
		if (playerSprites[player.id]==undefined) {
			console.log(playerSprites[player.id]==undefined)
			console.log('im '+myid+' and settingsprite for '+player.id)
			console.dir(playerSprites)
			var xpos
			var playerspritename

			if (player1SpriteDefined && player1SpriteDefined=='alien4') {
				xpos = 130
				playerspritename = 'alien1'
			} else {
				xpos = canvasW-130
				playerspritename = 'alien4'
			}
			/*if (player.isPlayer1) {
				xpos = 130
				playerspritename = 'player1'
			} else {
				xpos = canvasW-130
				playerspritename = 'player2'
			}*/
			console.log('xpos:'+xpos)
			//console.log('name:'+playerspritename)
			var s = g.physics.add.sprite(player.x, player.y, playerspritename)
			s.setScale(0.3)
			s.id = player.id
			g.physics.world.enable(s);
			playerSprites[player.id] = s
			//console.dir(player)
			console.log(playerSprites[player.id]==undefined)
		} else {
			player1SpriteDefined = playerSprites[player.id].key
		}
	})
}