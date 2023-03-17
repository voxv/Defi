var canvasW = 1200
var canvasH = 850
var g
var mySelectedAvatar
var otherSelectedAvatar
var otherName
var myName

const debug = true
const debugCard = 0

if (debug) {
    mySelectedAvatar = 2
    otherSelectedAvatar = 4
    otherName = 'other'
    myName = 'myself'
} else {
    mySelectedAvatar = -1
    otherSelectedAvatar = -1
    otherName = ''
    myName = ''
}
var avatars = []
var playersAll = []
var buttonLocked = false
var selectedCover = 1
var cardResetPosX = -200
var cardResetPosY = 0
var cardScale = 1
var cardScaleDraw = 0.20
var totCards = 36
var xPos_p1 = 60
var yPos_p1 = 525
var xPos_p2 = 740
var yPos_p2 = 60
var xOffset_avatar_deck = 80
var yOffset_avatar_deck = 4
var startingPlayer = 'player1'
var timeoutHandle = null
var playedCard = 0
var currentAttrChoice = 0
var attrMetricsAdded = false
var gameStarted = false
var cardPlayed = null

/*var inGameFrameX_p1 = 210
var inGameFrameY_p1 = 240
var inGameFrameY_p2 = 570
var inGameFrameY_p2 = 360*/

var inGameFrameX_p1 = 145
var inGameFrameY_p1 = 230
var inGameFrameX_p2 = 650
var inGameFrameY_p2 = 368

var choiceXStart = 395
var choiceYStart = 77
var choiceStep = 100


var cardScaleAnimRange = cardScaleDraw+0.02
var cardScaleAnim = cardScaleAnimRange

var stoppedScaleCardAnim = false

var attrResultsAdded = false
var animChoiceTextAdded = false

var currentWinner

var attrs_labels = {
    0: {
        at_1: 'Taille',
        at_2: 'Poids',
        at_3: 'Puissance',
        at_4: "Apparition"
    }
}
var attrs_metrics = {
    0: {
        at_1: 'cm',
        at_2: 'kg',
        at_3: '',
        at_4: ""
    }
}
var attrs = {
    0: { // pack id
        0: {
            at_1: 170,
            at_2: 95,
            at_3: 215,
            at_4: -750,
            col: 'red',
            name: 'Méduse'
        },
        1: {
            at_1: 500,
            at_2: 1100,
            at_3: 120,
            at_4: 565,
            col: 'green',
            name: 'Monstre du Loch Ness'
        },
        2: {
            at_1: 25000,
            at_2: 5000,
            at_3: 290,
            at_4: 1250,
            col: 'yellow',
            name: 'Kraken'
        },
        3: {
            at_1: 235,
            at_2: 200,
            at_3: 170,
            at_4: 1832,
            col: 'green',
            name: 'Yéti'
        },
        4: {
            at_1: 128,
            at_2: 40,
            at_3: 50,
            at_4: 800,
            col: 'green',
            name: 'Saumon de la sagesse'
        },
        5: {
            at_1: 190,
            at_2: 86,
            at_3: 190,
            at_4: -450,
            col: 'yellow',
            name: 'Loup-garou'
        },
        6: {
            at_1: 230,
            at_2: 192,
            at_3: 240,
            at_4: -1500,
            col: 'green',
            name: 'Sphinx'
        },
        7: {
            at_1: 205,
            at_2: 190,
            at_3: 285,
            at_4: -3000,
            col: 'red',
            name: 'Griffon'
        },
        8: {
            at_1: 260,
            at_2: 15,
            at_3: 210,
            at_4: 50,
            col: 'orange',
            name: 'Amphisbène'
        },
        9: {
            at_1: 50,
            at_2: 2,
            at_3: 3,
            at_4: 1829,
            col: 'green',
            name: 'Jackalope'
        },
        10: {
            at_1: 450,
            at_2: 750,
            at_3: 200,
            at_4: -750,
            col: 'red',
            name: 'Cyclope'
        },
        11: {
            at_1: 172,
            at_2: 75,
            at_3: 20,
            at_4: 400,
            col: 'yellow',
            name: 'Croque-mitaine'
        },
        12: {
            at_1: 183,
            at_2: 78,
            at_3: 15,
            at_4: 1697,
            col: 'yellow',
            name: 'Zombi'
        },
        13: {
            at_1: 60000,
            at_2: 190000,
            at_3: 180,
            at_4: 300,
            col: 'green',
            name: 'Zaratan'
        },
        14: {
            at_1: 40,
            at_2: 16,
            at_3: 25,
            at_4: 1550,
            col: 'green',
            name: 'Farfadet'
        },
        15: {
            at_1: 240,
            at_2: 600,
            at_3: 80,
            at_4: -400,
            col: 'green',
            name: 'Licorne'
        },
        16: {
            at_1: 130,
            at_2: 48,
            at_3: 70,
            at_4: 1230,
            col: 'green',
            name: 'Elfe'
        },
        17: {
            at_1: 90,
            at_2: 85,
            at_3: 220,
            at_4: -750,
            col: 'red',
            name: 'Cerbère'
        },
        18: {
            at_1: 210,
            at_2: 1000,
            at_3: 185,
            at_4: -700,
            col: 'red',
            name: 'Centaure'
        },
        19: {
            at_1: 135,
            at_2: 62,
            at_3: 10,
            at_4: 1583,
            col: 'green',
            name: 'Dahu'
        },
        20: {
            at_1: 255,
            at_2: 150,
            at_3: 230,
            at_4: 1700,
            col: 'green',
            name: 'Mishipeshu'
        },
        21: {
            at_1: 320,
            at_2: 0,
            at_3: 160,
            at_4: 650,
            col: 'green',
            name: 'Djinn'
        },
        22: {
            at_1: 700,
            at_2: 1200,
            at_3: 280,
            at_4: -5000,
            col: 'red',
            name: 'Dragon'
        },
        23: {
            at_1: 185,
            at_2: 80,
            at_3: 90,
            at_4: 1725,
            col: 'orange',
            name: 'Vampire'
        },
        24: {
            at_1: 20000,
            at_2: 3000,
            at_3: 270,
            at_4: 150,
            col: 'green',
            name: 'Quetzalcoatl'
        },
        25: {
            at_1: 80,
            at_2: 0,
            at_3: 30,
            at_4: 1165,
            col: 'green',
            name: 'Fantôme'
        },
        26: {
            at_1: 300,
            at_2: 325,
            at_3: 205,
            at_4: 1180,
            col: 'yellow',
            name: 'Ogre'
        },
        27: {
            at_1: 10,
            at_2: 1,
            at_3: 60,
            at_4: 950,
            col: 'green',
            name: 'Fée'
        },
        28: {
            at_1: 171,
            at_2: 65,
            at_3: 110,
            at_4: 700,
            col: 'orange',
            name: 'Sirène'
        },
        29: {
            at_1: 270,
            at_2: 250,
            at_3: 225,
            at_4: 900,
            col: 'orange',
            name: 'Troll'
        },
        30: {
            at_1: 350,
            at_2: 20,
            at_3: 195,
            at_4: -2000,
            col: 'green',
            name: 'Phénix'
        },
        31: {
            at_1: 100,
            at_2: 10,
            at_3: 250,
            at_4: 1000,
            col: 'green',
            name: 'Oiseau-tonnerre'
        },
        32: {
            at_1: 168,
            at_2: 61,
            at_3: 140,
            at_4: -1010,
            col: 'yellow',
            name: 'Sorcière'
        },
        33: {
            at_1: 163,
            at_2: 54,
            at_3: 150,
            at_4: -50,
            col: 'orange',
            name: 'Baba Yaga'
        },
        34: {
            at_1: 60,
            at_2: 23,
            at_3: 40,
            at_4: 530,
            col: 'green',
            name: 'Korrigan'
        },
        35: {
            at_1: 192,
            at_2: 120,
            at_3: 260,
            at_4: -700,
            col: 'red',
            name: 'Minotaure'
        }
    }
}