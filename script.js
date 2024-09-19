// https://harddrop.com/wiki/

let canvas = document.getElementById("cvs");
let game = new Game(canvas);

window.addEventListener('keydown', function (event) {
    if (game.keysPressed.indexOf(event.code) < 0) {
        game.keysPressed.push(event.code);
        game.onKeyPress();
    }
});
window.addEventListener('keyup', function (event) {
    let index = game.keysPressed.indexOf(event.code);
    if (index >= 0) {
        game.keysPressed.splice(index, 1);
    }
});

game.start();
