// https://harddrop.com/wiki/

var Inputs = {
    MOVEMENT: 0,
    ROTATION: 1,
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
