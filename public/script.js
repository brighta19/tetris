// https://harddrop.com/wiki/
var WallKicks = {
    I: {
        DEFAULT_TO_RIGHT: [ [-2, 0], [1, 0], [-2, 1], [1, -2] ],
        RIGHT_TO_DEFAULT: [ [2, 0], [-1, 0], [2, -1], [-1, 2] ],
        RIGHT_TO_DOWN: [ [-1, 0], [2, 0], [-1, -2], [2, 1] ],
        DOWN_TO_RIGHT: [ [1, 0], [-2, 0], [1, 2], [-2, -1] ],
        DOWN_TO_LEFT: [ [2, 0], [-1, 0], [2, -1], [-1, 2] ],
        LEFT_TO_DOWN: [ [-2, 0], [1, 0], [-2, 1], [1, -2] ],
        LEFT_TO_DEFAULT: [ [1, 0], [-2, 0], [1, 2], [-2, -1] ],
        DEFAULT_TO_LEFT: [ [-1, 0], [2, 0], [-1, -2], [2, 1] ],
    },
    Other: {
        DEFAULT_TO_RIGHT: [ [-1, 0], [-1, -1], [0, 2], [-1, 2] ],
        RIGHT_TO_DEFAULT: [ [1, 0], [1, 1], [0, -2], [1, -2] ],
        RIGHT_TO_DOWN: [ [1, 0], [1, 1], [0, -2], [1, -2] ],
        DOWN_TO_RIGHT: [ [-1, 0], [-1, -1], [0, 2], [-1, 2] ],
        DOWN_TO_LEFT: [ [1, 0], [1, -1], [0, 2], [1, 2] ],
        LEFT_TO_DOWN: [ [-1, 0], [-1, 1], [0, -2], [1, -2] ],
        LEFT_TO_DEFAULT: [ [-1, 0], [-1, 1], [0, -2], [-1, -2] ],
        DEFAULT_TO_LEFT: [ [1, 0], [1, -1], [0, 2], [1, 2] ],
    }
};

var Inputs = {
    MOVEMENT: 0,
    ROTATION: 1,
};

var TSpins = {
    REGULAR: 0,
    MINI: 1,
};


var canvas = document.getElementById("cvs");
var game = new Game(canvas);

window.addEventListener('keydown', function (event) {
    if (game.keysPressed.indexOf(event.key) < 0) {
        game.keysPressed.push(event.key);
        game.onKeyPress();
    }
});
window.addEventListener('keyup', function (event) {
    var index = game.keysPressed.indexOf(event.key);
    if (index >= 0) {
        game.keysPressed.splice(index, 1);
    }
});

game.start();

canvas.getContext("2d").fillRect(0, 0, 20, 20);
