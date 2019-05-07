var canvas = document.getElementById("cvs");
var ctx = canvas.getContext('2d');
var prevKeys = [];
var keys = [];

var updatesPerSecond = 20;
var BLOCK_SIZE = 25;
var currentShape = undefined;
var shapeBeingHeld = undefined;
var hasSwitchedBlock = false;
var holdingBlock = false;
var grid = new Grid();
var queue = new Queue();

var tickers = {
    land: new Ticker(updatesPerSecond * 0.8),
    forceLand: new Ticker(updatesPerSecond * 2),
};
var timers = {
    initialMove: new Timer(200),
    move: new Timer(40),
    autoGoDown: new Timer(1000),
};

function update() {
    var initMoveTimerDone = timers.initialMove.isDone(),
        moveTimerDone = timers.move.isDone();
        
    if ((isKeyPressed("C") && !wasKeyPressed("C")) ||
    (isKeyPressed("c") && !wasKeyPressed("c")) && !hasSwitchedBlock) {
        var isShapeHeld = (shapeBeingHeld != undefined) ? true : false;
        var shapeBeingHeld_ = shapeBeingHeld;
        
        shapeBeingHeld = currentShape.type;
        if (isShapeHeld)
            currentShape = new Tetromino(Tetromino[shapeBeingHeld_]);
        else
            setShape();
        
        timers.autoGoDown.reset();
        tickers.land.reset();
        tickers.forceLand.reset();
        
        holdingBlock = false;
        hasSwitchedBlock = true;
    }
    
    if (isKeyPressed((" ")) && !wasKeyPressed(" ")) {
        var y = 0;
        while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
            y++;
        }
        currentShape.translateBlocks(0, y);
        
        holdingBlock = true;
    }
    
    if (holdingBlock && !isKeyPressed(" ") && wasKeyPressed(" ")) {
        landShape();
        grid.tryClearingLines();
        setShape();
        hasSwitchedBlock = false;
        timers.autoGoDown.reset();
        holdingBlock = false;
    }
    
    if (isKeyPressed("ArrowUp") && !wasKeyPressed("ArrowUp")) {
        if (isLocationValid( currentShape.getRotatedBlocks(1) )) {
            currentShape.rotateBlocks(1);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
        else if (isLocationValid( currentShape.getTranslatedBlocks(1, 0, 1) )) {
            currentShape.rotateBlocks(1);
            currentShape.translateBlocks(1, 0);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
        else if (isLocationValid( currentShape.getTranslatedBlocks(-1, 0, 1) )) {
            currentShape.rotateBlocks(1);
            currentShape.translateBlocks(-1, 0);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
        else if (isLocationValid( currentShape.getTranslatedBlocks(1, 1, 1) )) {
            currentShape.rotateBlocks(1);
            currentShape.translateBlocks(1, 1);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
        else if (isLocationValid( currentShape.getTranslatedBlocks(-1, 1, 1) )) {
            currentShape.rotateBlocks(1);
            currentShape.translateBlocks(-1, 1);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
        else if (isLocationValid( currentShape.getTranslatedBlocks(-1, 2, 1) )) {
            currentShape.rotateBlocks(1);
            currentShape.translateBlocks(-1, 2);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
        else if (isLocationValid( currentShape.getTranslatedBlocks(-1, 2, 1) )) {
            currentShape.rotateBlocks(1);
            currentShape.translateBlocks(-1, 2);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
    }
    
    if ((isKeyPressed("z") && !wasKeyPressed("z")) ||
    (isKeyPressed("Z") &&  !wasKeyPressed("Z"))) {
        if (isLocationValid( currentShape.getRotatedBlocks(-1) )) {
            currentShape.rotateBlocks(-1);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
        else if (isLocationValid( currentShape.getTranslatedBlocks(1, 0, -1) )) {
            currentShape.rotateBlocks(-1);
            currentShape.translateBlocks(1, 0);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
        else if (isLocationValid( currentShape.getTranslatedBlocks(-1, 0, -1) )) {
            currentShape.rotateBlocks(-1);
            currentShape.translateBlocks(-1, 0);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
        else if (isLocationValid( currentShape.getTranslatedBlocks(1, 1, -1) )) {
            currentShape.rotateBlocks(-1);
            currentShape.translateBlocks(1, 1);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
        else if (isLocationValid( currentShape.getTranslatedBlocks(-1, 1, -1) )) {
            currentShape.rotateBlocks(-1);
            currentShape.translateBlocks(-1, 1);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
        else if (isLocationValid( currentShape.getTranslatedBlocks(-1, 2, -1) )) {
            currentShape.rotateBlocks(-1);
            currentShape.translateBlocks(-1, 2);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
        else if (isLocationValid( currentShape.getTranslatedBlocks(-1, 2, 1) )) {
            currentShape.rotateBlocks(1);
            currentShape.translateBlocks(-1, 2);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            tickers.land.reset();
        }
    }
    
    if (isKeyPressed("ArrowLeft") && initMoveTimerDone && moveTimerDone) {
        if (isLocationValid( currentShape.getTranslatedBlocks(-1, 0) )) {
            currentShape.translateBlocks(-1, 0);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            timers.move.reset();
            tickers.land.reset();
        }
    }
    
    if (isKeyPressed("ArrowRight") && initMoveTimerDone && moveTimerDone) {
        if (isLocationValid( currentShape.getTranslatedBlocks(1, 0) )) {
            currentShape.translateBlocks(1, 0);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            timers.move.reset();
            tickers.land.reset();
        }
    }
    
    if (isKeyPressed("ArrowDown")) {
        if (isLocationValid( currentShape.getTranslatedBlocks(0, 1) )) {
            currentShape.translateBlocks(0, 1);
            timers.autoGoDown.reset();
        }
    }
    
    if (isLocationValid( currentShape.getTranslatedBlocks(0, 1) )) {
        if (timers.autoGoDown.isDone()) {
            currentShape.translateBlocks(0, 1);
            timers.autoGoDown.reset();
        }
    }
    else {
        console.log("strange");
        tickers.land.tick();
        tickers.forceLand.tick();
    }
    
    if (tickers.land.isDone() || tickers.forceLand.isDone()) {
        landShape();
        grid.tryClearingLines();
        setShape();
        hasSwitchedBlock = false;
        timers.autoGoDown.reset();
        holdingBlock = false;
    }
    
    
    // Update previous Keys
    prevKeys = [];
    for (var i = 0; i < keys.length; i++)
        prevKeys[i] = keys[i];
}

function landShape() {
    var blocks = currentShape.getBlocks(),
        i, block;
        
    for (i = 0; i < blocks.length; i++) {
        block = blocks[i];
        grid.setBlock(block.x, block.y, currentShape.color);
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
    currentShape = new Tetromino(block);
    
    timers.autoGoDown.reset();
    tickers.land.reset();
    tickers.forceLand.reset();
}

function getGhostBlock() {
    var yTranslation = 1;
    var blocks = currentShape.getTranslatedBlocks(0, 0);
    var nextBlocks = currentShape.getTranslatedBlocks(0, yTranslation);
    
    while (isLocationValid(nextBlocks)) {
        blocks = currentShape.getTranslatedBlocks(0, yTranslation);
        yTranslation++;
        nextBlocks = currentShape.getTranslatedBlocks(0, yTranslation);
    }
    return blocks;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    var offsetX = (canvas.width / 2) - (grid.width / 2);
    var offsetY = (canvas.height / 2) - (grid.height / 2);
    
    drawGrid(offsetX, offsetY);
    drawShape(offsetX, offsetY);
    drawGhostBlock(offsetX, offsetY);
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
    var blocks = currentShape.getBlocks();
    
    ctx.save();
    ctx.fillStyle = currentShape.color;
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

function drawGhostBlock(offsetX, offsetY) {
    var blocks = getGhostBlock();
    
    ctx.save();
    ctx.beginPath();
    for (var i = 0; i < blocks.length; i++) {
        ctx.rect(offsetX + blocks[i].x * grid.blockSize,
            offsetY + blocks[i].y * grid.blockSize,
            grid.blockSize, grid.blockSize);
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fill();
    ctx.restore();
}

function onKeyPress() {
    var blocks;
    
    if (isKeyPressed("ArrowLeft") && !wasKeyPressed("ArrowLeft")) {
        blocks = currentShape.getTranslatedBlocks(-1, 0);
        if (isLocationValid(blocks)) {
            currentShape.translateBlocks(-1, 0);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            timers.initialMove.reset();
            tickers.land.reset();
        }
    }
    
    if (isKeyPressed("ArrowRight") && !wasKeyPressed("ArrowRight")) {
        blocks = currentShape.getTranslatedBlocks(1, 0);
        if (isLocationValid(blocks)) {
            currentShape.translateBlocks(1, 0);
            if (holdingBlock) {
                var y = 0;
                while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
                    y++;
                }
                currentShape.translateBlocks(0, y);
            }
            timers.initialMove.reset();
            tickers.land.reset();
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
    }, 1000 / updatesPerSecond);
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
