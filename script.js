//http://cslibrary.stanford.edu/112/TetrisAssignment.pdf
var canvas = document.getElementById("cvs");
var ctx = canvas.getContext('2d');
var prevKeys = [];
var keys = [];

var BLOCK_SIZE = 24;
var shape = undefined;
var grid = new Grid();
var queue = new Queue();
var timers = {
    initialMove: new Timer(200),
    move: new Timer(40),
    autoGoDown: new Timer(1000),
};

function update() {
    var initMoveTimerDone = timers.initialMove.isDone(),
        moveTimerDone = timers.move.isDone(),
        blocks;
    
    if (isKeyPressed("ArrowUp") && !wasKeyPressed("ArrowUp")) {
        blocks = shape.getRotatedBlocks(1);
        if (isLocationValid(blocks)) {
            shape.rotateBlocks(1);
        }
    }
    
    if ((isKeyPressed("z") && !wasKeyPressed("z")) ||
    isKeyPressed("Z") &&  !wasKeyPressed("Z")) {
        blocks = shape.getRotatedBlocks(-1);
        if (isLocationValid(blocks)) {
            shape.rotateBlocks(-1);
        }
    }
    
    if (isKeyPressed("ArrowLeft") && initMoveTimerDone && moveTimerDone) {
        blocks = shape.getTranslatedBlocks(-1, 0);
        if (isLocationValid(blocks)) {
            shape.translateBlocks(-1, 0);
            timers.move.reset();
        }
    }
    
    if (isKeyPressed("ArrowRight") && initMoveTimerDone && moveTimerDone) {
        blocks = shape.getTranslatedBlocks(1, 0);
        if (isLocationValid(blocks)) {
            shape.translateBlocks(1, 0);
            timers.move.reset();
        }
    }
    
    if (isKeyPressed("ArrowDown")) {
        blocks = shape.getTranslatedBlocks(0, 1);
        if (isLocationValid(blocks)) {
            shape.translateBlocks(0, 1);
            timers.autoGoDown.reset();
        }
    }
    
    
    blocks = shape.getBlocks();
    if (!isLocationValid(blocks))
        console.log("strange");
    
    
    if (timers.autoGoDown.isDone()) {
        tryMovingShape(0, 1);
        timers.autoGoDown.reset();
    }
    
    
    // Update previous Keys
    prevKeys = [];
    for (var i = 0; i < keys.length; i++)
        prevKeys[i] = keys[i];
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
        grid.tryClearingLines();
        setShape();
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

function setShape() {
    var block = queue.getNextBlock();
    shape = new Tetromino(block);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    var offsetX = (canvas.width / 2) - (grid.width / 2);
    var offsetY = (canvas.height / 2) - (grid.height / 2);
    
    drawGrid(offsetX, offsetY);
    drawShape(offsetX, offsetY);
}

function drawGrid(offsetX, offsetY) {
    ctx.save();
    ctx.strokeStyle = "gray";

    for (var y = 0; y < grid.rows; y++) {
        for (var x = 0; x < grid.cols; x++) {
            var block = grid.getBlock(x, y);
            
            ctx.beginPath();
            ctx.rect(offsetX + x * grid.blockSize,
                offsetY + y * grid.blockSize,
                grid.blockSize, grid.blockSize);
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

function drawShape(offsetX, offsetY) {
    var blocks = shape.getBlocks();
    
    ctx.save();
    ctx.fillStyle = shape.color;
    ctx.strokeStyle = "white";
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        
        ctx.beginPath();
        ctx.rect(offsetX + block.x * grid.blockSize,
            offsetY + block.y * grid.blockSize,
            grid.blockSize, grid.blockSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();
}

function onKeyPress() {
    var blocks;
    
    if (isKeyPressed("ArrowLeft")) {
        blocks = shape.getTranslatedBlocks(-1, 0);
        if (isLocationValid(blocks)) {
            shape.translateBlocks(-1, 0);
            timers.initialMove.reset();
        }
    }
    
    if (isKeyPressed("ArrowRight")) {
        blocks = shape.getTranslatedBlocks(1, 0);
        if (isLocationValid(blocks)) {
            shape.translateBlocks(1, 0);
            timers.initialMove.reset();
        }
    }
}

function isKeyPressed(key) {
    return keys.indexOf(key) >= 0;
}

function wasKeyPressed(key) {
    return prevKeys.indexOf(key) >= 0;
}

function start() {
    grid.init(BLOCK_SIZE);
    setShape();
    
    setInterval(function () {
        update();
        draw();
    }, 50);
}

addEventListener('keydown', function (e) {
    if (keys.indexOf(e.key) < 0) {
        keys.push(e.key);
        onKeyPress();
    }
});

addEventListener('keyup', function (e) {
    var index = keys.indexOf(e.key);
    if (index >= 0)
        keys.splice(index, 1);
});

start();
