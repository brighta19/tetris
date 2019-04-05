//http://cslibrary.stanford.edu/112/TetrisAssignment.pdf
var canvas = document.getElementById("cvs");
var ctx = canvas.getContext('2d');
var keys = [];

var shape = undefined;
var grid = new Grid();
var blockSize = 20;

function update() {
    autoGoDown();
}

function autoGoDown() {
    tryMovingShape(0, 1);
}

function tryMovingShape(x, y) {
    var blocks = shape.getTranslatedBlocks(x, y),
        i, block;
    
    if (isLocationValid(blocks)) {
        shape.translateBlocks(x, y);
    }
    else {
        for (i = 0; i < blocks.length; i++) {
            block = blocks[i];
            grid.setBlock(block.x - x , block.y - y, shape.color);
        }
        
        setRandomShape();
    }
}

function isLocationValid(blocks) {
    var i, block;
    
    for (i = 0; i < blocks.length; i++) {
        block = blocks[i];
        
        if (block.x < 0 ||
        block.x > grid.cols - 1 ||
        block.y > grid.rows - 1 ||
        grid.getBlock(block.x, block.y) != 0) {
            return false;
        }
    }
    
    return true;
}

function setRandomShape() {
    var shapes = [
            Tetromino.S,
            Tetromino.Z,
            Tetromino.T,
            Tetromino.L,
            Tetromino.J,
            Tetromino.O,
            Tetromino.I,
        ],
        index = Math.floor(Math.random() * shapes.length);
    
    shape = new Tetromino(shapes[index]);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears the screen
    
    drawGrid();
    drawShape();
}

function drawGrid() {
    ctx.save();
    ctx.strokeStyle = "gray";
    for (var y = 0; y < grid.rows; y++) {
        for (var x = 0; x < grid.cols; x++) {
            var block = grid.getBlock(x, y);
            
            ctx.beginPath();
            ctx.rect(x * blockSize, y * blockSize, blockSize, blockSize);
            ctx.closePath();
            ctx.stroke();
            
            if (block != 0) {
                ctx.fillStyle = block;
                ctx.fill();
            }
        }
    }
    ctx.restore();
}

function drawShape() {
    var blocks = shape.getBlocks();
    
    ctx.save();
    ctx.fillStyle = shape.color;
    ctx.strokeStyle = "white";
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        
        ctx.beginPath();
        ctx.rect(block.x * blockSize, block.y * blockSize, blockSize, blockSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();
}

function start() {
    grid.init();
    setRandomShape();
    
    setInterval(function () {
        update();
        draw();
    }, 200);
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

start();
