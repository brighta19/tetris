// https://harddrop.com/wiki/

let canvas = document.getElementById("cvs");
let game = new Game(canvas);

window.addEventListener('keydown', function (event) {
    if (game.keysPressed.indexOf(event.key) < 0) {
        game.keysPressed.push(event.key);
        game.onKeyPress();
    }
});
window.addEventListener('keyup', function (event) {
    let index = game.keysPressed.indexOf(event.key);
    if (index >= 0) {
        game.keysPressed.splice(index, 1);
    }
});

game.start();
