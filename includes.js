var canvasW = 1200
var canvasH = 850
var g
var mySelectedAvatar = -1
var avatars = []
var playersAll = []
var buttonLocked = false
var selectedCover = 1
var cardResetPosX = -200
var cardResetPosY = 0

var attrs = {
	0: {   // pack id
		0: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		1: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		2: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		3: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		4: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		5: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		6: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		7: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		8: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		9: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		10: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		11: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		12: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		13: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		14: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		15: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		16: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		17: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		18: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		19: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		20: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		21: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		22: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		23: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		24: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		25: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		26: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		27: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		28: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		29: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		30: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		31: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		32: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		33: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		34: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
		35: { at_1: 400, at_2: 2, at_3: 9000, at_4: 810, col: 'green' },
	}
}