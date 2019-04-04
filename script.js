//http://cslibrary.stanford.edu/112/TetrisAssignment.pdf
var Blocks = {
    Z: [ [0, 0], [1, 0], [1, 1], [2, 1] ],
    S: [ [0, 1], [1, 1], [1, 0], [2, 0] ],
    T: [ [0, 0], [0, 1], [0, 2], [1, 1] ],
    L: [ [0, 0], [0, 1], [0, 2], [1, 2] ],
    J: [ [1, 0], [1, 1], [1, 2], [0, 2] ],
    O: [ [0, 0], [1, 0], [0, 1], [1, 1] ],
    I: [ [0, 0], [0, 1], [0, 2], [0, 3] ],
};

var canvas = document.getElementById("cvs");
var ctx = canvas.getContext('2d');
var keys = [];
var grid = [];

function drawGrid() {

    for(var i = 0; i < canvas.width; i+=30){
        ctx.beginPath();
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.closePath();
        ctx.stroke();
    }
    
    for(var i = 0;i < canvas.height; i+=20){
        ctx.beginPath();
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.closePath();
        ctx.stroke();
    }

}

function update() {
    
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears the screen

    drawGrid(); // Draws the grid
}



function Tetrimino(block) {
    this.block = block;
    
    this.isValid = function () {
        
    };
    
    this.rotateLeft = function () {
        
    };
    this.rotateRight = function () {
        
    };
    this.lined = function () {
        
    }
}

addEventListener('keydown', function (e) {
    if (keys.indexOf(e.key) < 0)
        keys.push(e.key);
});
addEventListener('keyup', function (e) {
    var index = keys.indexOf(e.keyCode);
    if (index >= 0)
        keys.splice(index, 1);
});

setInterval(function () {
    update();
    draw();
}, 1000);
