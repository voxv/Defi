var proto = 'ws'
if (window.location.hostname === 'defi-nature.onrender.com') {
    url = 'defi-nature.onrender.com'
    proto = 'wss'
} else {
    url = 'localhost:3000'
}

var socket = io(proto + "://" + url, {
    transports: ['websocket']
});

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

    console.log('msg:' + event)
    let data = JSON.parse(event);

    switch (data.type) {
        case 'setID':
            myid = data.id
            break;
        case 'changeToPlayer1':
            myid = 'player1'

            for (var i = 0; i < playersAll.length; i++) {
                if (playersAll[i].id == 'player1' || playersAll[i] == '') {
                    delete playersAll[i]
                } else {
                    playersAll[i].id = 'player1'
                }
            }

            playersAll = playersAll.filter(function(player) {
                return player !== undefined;
            });
            playersAll = playersAll.map((value) => value);
            if (playersAll[0])
                playersAll[0].id = 'player1'

            var playclick = false
            if (g && g.otherName) {
                playclick = true
            }

            if (g && g.otherAvatarImg) {
                g.otherAvatarImg.destroy()
                g.otherAvatarImg = null
            }
            if (g && g.otherName) {
                g.otherName.destroy()
                g.otherName = null
            }
            if (g && g.myName) {
                g.myName.destroy()
                g.myName = null
            }
            if (g && g.myAvatarImg) {
                g.myAvatarImg.destroy()
                g.myAvatarImg = null
            }
            if (g && g.addAvatar)
                g.addAvatar({
                    nosound: playclick
                })
            break;

        case 'player2DC':

            var playclick = false
            if (g && g.otherName) {
                playclick = true
            }
            for (var i = 0; i < playersAll.length; i++) {
                if (playersAll[i].id == 'player2') {
                    delete playersAll[i]
                }
            }
            playersAll = playersAll.filter(function(player) {
                return player !== undefined;
            });
            playersAll = playersAll.map((value) => value);
            if (g && g.otherAvatarImg) {
                g.otherAvatarImg.destroy()
                g.otherAvatarImg = null
            }
            if (g && g.otherName) {
                g.otherName.destroy()
                g.otherName = null
            }
            if (g && g.addAvatar)
                g.addAvatar({
                    nosound: playclick
                })
            break

        case 'updateNames':

            playersAll = data.players
            if (data.callerp == myid) {
                g.sound.stopAll();
                g.scene.pause();
                g.scene.shutdown()
                g.scene.start('PreScene');
            }
            if (g && g.addAvatar)
                g.addAvatar()
            break
        case 'udpateAvatarP2':
            if (g && g.addAvatar)
                g.addAvatar()
            break;
        case 'startGameSequence':
            g.startGameSequence()
            break;
        case 'startGame':
            g.startGame()
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
    socket.send(JSON.stringify(message));
}