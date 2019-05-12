function Game(canvas) {
    this.canvas = canvas;
    
    this.keysPressed = [];
    this.previousKeysPressed = [];
    
    this.updatesPerSecond = 20;
    this.blockSize = 25;
    
    this.renderer = new Renderer(this);
    
    this.grid = new Grid();
    this.tetromino = null;
    this.heldTetrominoType = null;
    this.hasSwitchedTetromino = false;
    
    this.tickers = {
        initialMove: new Ticker(this.updatesPerSecond * 0.2),
        move:        new Ticker(this.updatesPerSecond * 0.03),
        goDown:      new Ticker(this.updatesPerSecond * 0.05),
        autoGoDown:  new Ticker(this.updatesPerSecond * 1),
        land:        new Ticker(this.updatesPerSecond * 0.8),
        forceLand:   new Ticker(this.updatesPerSecond * 2),
    };
    
    this.start = function () {
        var self = this;
        
        this.queue = new Queue();
        this.previousDate = Date.now();
        
        this.updateInterval = setInterval(function () {
            var currentDate = Date.now();
            
            this.delta = (currentDate - self.previousDate) / 1000;
            
            self.update();
            self.renderer.render();

            self.previousDate = currentDate;
        }, 1000 / self.updatesPerSecond);
        
        this.createTetromino();
    };

    this.update = function () {
        this.tickers.goDown.tick();
        this.tickers.move.tick();
        this.tickers.initialMove.tick();
        this.tickers.autoGoDown.tick();

    
        if (this.isKeyPressed("ArrowLeft") && this.tickers.initialMove.isDone() && this.tickers.move.isDone()) {
            if (this.isLocationValid( this.getTransformedBlocks(-1, 0, 0) )) {
                this.tetromino.move(-1, 0);
                this.tickers.move.reset();
                this.tickers.land.reset();
            }
        }
        
        if (this.isKeyPressed("ArrowRight") && this.tickers.initialMove.isDone() && this.tickers.move.isDone()) {
            if (this.isLocationValid( this.getTransformedBlocks(1, 0, 0) )) {
                this.tetromino.move(1, 0);
                this.tickers.move.reset();
                this.tickers.land.reset();
            }
        }
        
        if (this.isKeyPressed("ArrowDown") && this.tickers.goDown.isDone()) {
            if (this.isLocationValid( this.getTransformedBlocks(0, 1, 0) )) {
                this.tetromino.move(0, 1);
                this.tickers.goDown.reset();
                this.tickers.autoGoDown.reset();
            }
        }

        
        if (this.isLocationValid( this.getTransformedBlocks(0, 1, 0) )) {
            if (this.tickers.autoGoDown.isDone()) {
                this.tetromino.move(0, 1);
                this.tickers.autoGoDown.reset();
            }
        }
        else {
            console.log("strange");
            this.tickers.land.tick();
            this.tickers.forceLand.tick();
        }
        
        if (this.tickers.land.isDone() ||
        this.tickers.forceLand.isDone()) {
            this.placeTetromino();
            this.grid.tryClearingLines();
            this.createTetromino();
            this.hasSwitchedTetromino = false;
        }
        
        this.updatePreviousKeys();
    }
    
    this.createTetromino = function (type) {
        var t = type || this.queue.getNextTetrominoType();
        
        this.tetromino = new Tetromino(t);

        this.tickers.autoGoDown.reset();
        this.tickers.land.reset();
        this.tickers.forceLand.reset();
    };

    this.placeTetromino = function () {
        var properties = Tetromino.Properties[this.tetromino.type];
        var blocks = properties.blocks[this.tetromino.rotation];
        var color = properties.color;

        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            this.grid.setBlock(this.tetromino.x + block[0], this.tetromino.y + block[1], color);
        }
    };

    this.getPredictedLandingY = function () { 
        var y = 0;
        while (this.isLocationValid( this.getTransformedBlocks(0, y + 1, 0) )) {
            y++;
        }
        return y;
    }

    this.getTransformedBlocks = function (translateX, translateY, rotate) {
        var blockRotations = Tetromino.Properties[this.tetromino.type].blocks;
        var r = this.tetromino.rotation + rotate;

        if (r < 0)
            r = this.tetromino.MAX_ROTATION;
        if (r > this.tetromino.MAX_ROTATION)
            r = 0;

        var blocks = blockRotations[r];
        var transformedBlocks = [];

        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            transformedBlocks[i] = [
                block[0] + this.tetromino.x + translateX,
                block[1] + this.tetromino.y + translateY,
            ];
        }
        
        return transformedBlocks;
    }

    this.isLocationValid = function (blocks) {
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];

            if (block[0] < 0 ||
            block[0] > this.grid.cols - 1 ||
            block[1] > this.grid.rows - 1 ||
            this.grid.getBlock(block[0], block[1]) != this.grid.EMPTY_BLOCK) {
                return false;
            }
        }

        return true;
    };
    
    this.onKeyPress = function () {
        if ((this.isKeyPressed("C") && !this.wasKeyPressed("C")) ||
        (this.isKeyPressed("c") && !this.wasKeyPressed("c")) && !this.hasSwitchedTetromino) {
            var shapeBeingHeld_ = this.heldTetrominoType;
            
            this.heldTetrominoType = this.tetromino.type;

            this.createTetromino(shapeBeingHeld_)
            
            this.hasSwitchedTetromino = true;
        }

        if (this.isKeyPressed((" ")) && !this.wasKeyPressed(" ")) {
            var y = this.getPredictedLandingY();
            this.tetromino.move(0, y);

            this.placeTetromino();
            this.grid.tryClearingLines();
            this.createTetromino();
            this.hasSwitchedTetromino = false;
        }

        if (this.isKeyPressed("ArrowLeft") && !this.wasKeyPressed("ArrowLeft")) {
            if (this.isLocationValid( this.getTransformedBlocks(-1, 0, 0) )) {
                this.tetromino.move(-1, 0);
                this.tickers.initialMove.reset();
                this.tickers.land.reset();
                moved = true;
            }
        }
        
        if (this.isKeyPressed("ArrowRight") && !this.wasKeyPressed("ArrowRight")) {
            if (this.isLocationValid( this.getTransformedBlocks(    1, 0, 0) )) {
                this.tetromino.move(1, 0);
                this.tickers.initialMove.reset();
                this.tickers.land.reset();
            }
        }
        
        if (this.isKeyPressed("ArrowUp") && !this.wasKeyPressed("ArrowUp")) {
            if (this.isLocationValid( this.getTransformedBlocks(0, 0, 1) )) {
                this.tetromino.rotate(1);
                this.tickers.land.reset();
            }
            else if (this.isLocationValid( this.getTransformedBlocks(1, 0, 1) )) {
                this.tetromino.move(1, 0);
                this.tetromino.rotate(1);
                this.tickers.land.reset();
            }
            else if (this.isLocationValid( this.getTransformedBlocks(-1, 0, 1) )) {
                this.tetromino.move(-1, 0);
                this.tetromino.rotate(1);
                this.tickers.land.reset();
            }
            else if (this.isLocationValid( this.getTransformedBlocks(1, 1, 1) )) {
                this.tetromino.move(1, 1);
                this.tetromino.rotate(1);
                this.tickers.land.reset();
            }
            else if (this.isLocationValid( this.getTransformedBlocks(-1, 1, 1) )) {
                this.tetromino.move(-1, 1);
                this.tetromino.rotate(1);
                this.tickers.land.reset();
            }
            else if (this.isLocationValid( this.getTransformedBlocks(1, 2, 1) )) {
                this.tetromino.move(1, 2);
                this.tetromino.rotate(1);
                this.tickers.land.reset();
            }
            else if (this.isLocationValid( this.getTransformedBlocks(-1, 2, 1) )) {
                this.tetromino.move(-1, 2);
                this.tetromino.rotate(1);
                this.tickers.land.reset();
            }
        }
    
        if ((this.isKeyPressed("z") && !this.wasKeyPressed("z")) ||
        (this.isKeyPressed("Z") &&  !this.wasKeyPressed("Z"))) {
            if (this.isLocationValid( this.getTransformedBlocks(0, 0, -1) )) {
                this.tetromino.rotate(-1);
                this.tickers.land.reset();
            }
            else if (this.isLocationValid( this.getTransformedBlocks(1, 0, -1) )) {
                this.tetromino.move(1, 0);
                this.tetromino.rotate(-1);
                this.tickers.land.reset();
            }
            else if (this.isLocationValid( this.getTransformedBlocks(-1, 0, -1) )) {
                this.tetromino.move(-1, 0);
                this.tetromino.rotate(-1);
                this.tickers.land.reset();
            }
            else if (this.isLocationValid( this.getTransformedBlocks(1, 1, -1) )) {
                this.tetromino.move(1, 1);
                this.tetromino.rotate(-1);
                this.tickers.land.reset();
            }
            else if (this.isLocationValid( this.getTransformedBlocks(-1, 1, -1) )) {
                this.tetromino.rotate(-1);
                this.tetromino.move(-1, 1);
                this.tickers.land.reset();
            }
            else if (this.isLocationValid( this.getTransformedBlocks(1, 2, -1) )) {
                this.tetromino.move(1, 2);
                this.tetromino.rotate(-1);
                this.tickers.land.reset();
            }
            else if (this.isLocationValid( this.getTransformedBlocks(-1, 2, -1) )) {
                this.tetromino.move(-1, 2);
                this.tetromino.rotate(-1);
                this.tickers.land.reset();
            }
        }
        
        if (this.isKeyPressed("ArrowDown") && this.tickers.goDown.isDone()) {
            if (this.isLocationValid( this.getTransformedBlocks(0, 1, 0) )) {
                this.tetromino.move(0, 1);
                this.tickers.goDown.reset();
                this.tickers.autoGoDown.reset();
            }
        }

        this.updatePreviousKeys();
    };
    
    this.updatePreviousKeys = function() {
        this.previousKeysPressed = [];

        for (var i = 0; i < this.keysPressed.length; i++)
            this.previousKeysPressed[i] = this.keysPressed[i];
    };
    
    this.isKeyPressed = function (key) {
        return this.keysPressed.indexOf(key) >= 0;
    };
    
    this.wasKeyPressed = function (key) {
        return this.previousKeysPressed.indexOf(key) >= 0;
    };


}


function Renderer(game) {
    this.game = game;
    this.canvas = this.game.canvas;
    this.context = this.canvas.getContext("2d");
    
    
    this.render = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawTetromino();
        this.drawGhostTetromino();
    };
    
    this.drawGrid = function () {
        this.context.save();
        this.context.strokeStyle = "#CCC";
    
        for (var y = 0; y < this.game.grid.rows; y++) {
            for (var x = 0; x < this.game.grid.cols; x++) {
                var block = this.game.grid.getBlock(x, y);
                
                this.context.beginPath();
                this.context.rect(x * this.game.blockSize,
                    y * this.game.blockSize,
                    this.game.blockSize, this.game.blockSize);
                this.context.closePath();
                this.context.stroke();
                
                if (block != 0) {
                    this.context.fillStyle = block;
                    this.context.fill();
                }
            }
        }
    
        this.context.restore();
    };
    
    this.drawTetromino = function () {
        var properties = Tetromino.Properties[this.game.tetromino.type];
        var blocks = properties.blocks[this.game.tetromino.rotation];
        
        this.context.save();
        
        this.context.fillStyle = properties.color;
        this.context.strokeStyle = "white";
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            
            this.context.beginPath();
            this.context.rect((this.game.tetromino.x + block[0]) * this.game.grid.blockSize,
                (this.game.tetromino.y + block[1]) * this.game.grid.blockSize,
                this.game.grid.blockSize, this.game.grid.blockSize);
            this.context.closePath();
            this.context.fill();
            this.context.stroke();
        }
    
        this.context.restore();
    };
    
    this.drawGhostTetromino = function () {
        var blocks = this.game.getTransformedBlocks(0, this.game.getPredictedLandingY(), 0);
        
        this.context.save();
        this.context.beginPath();
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];

            this.context.rect(block[0] * this.game.grid.blockSize,
                block[1] * this.game.grid.blockSize,
                this.game.grid.blockSize, this.game.grid.blockSize);
        }
        this.context.fillStyle = "rgba(0, 0, 0, 0.4)";
        this.context.fill();
        this.context.restore();
    };
}


function Grid() {
    this.EMPTY_BLOCK = 0;

    this.rows = 20;
    this.cols = 10;
    this.grid = [];
    this.blockSize = 25;
    this.linesCleared = [];
    
    
    for (var y = 0; y < this.rows; y++) {
        this.grid[y] = [];
        for (var x = 0; x < this.cols; x++) {
            this.grid[y][x] = this.EMPTY_BLOCK;
        }
    }
    

    this.tryClearingLines = function () {
        var i = this.grid.length - 1;
        this.linesCleared = [];
        
        while (i >= 0) {
            if (this.isLineFull(i)) {
                this.grid.splice(i, 1);
                
                this.grid.unshift([]);
                for (var x = 0; x < this.cols; x++) {
                    this.grid[0][x] = this.EMPTY_BLOCK;
                }
                
                this.linesCleared.push(i);
            }
            else {
                i--;
            }
        }
    };
    
    this.isEmpty = function (x, y) {
        return this.grid[y][x] == this.EMPTY_BLOCK;
    };
    
    this.isLineFull = function (y) {
        return this.grid[y].indexOf(this.EMPTY_BLOCK) < 0;
    };
    
    this.setBlock = function (x, y, color) {
        this.grid[y][x] = color;
    };
    
    this.getBlock = function (x, y) {
        return this.grid[y][x];
    };
}


function Queue() {
    this.queue = [];
    
    this.generateNextQueue = function () {
        var types = Tetromino.getAllTypes();

        while (types.length > 0) {
            var randomIndex = Math.floor(Math.random() * types.length);
            
            this.queue.push(types[randomIndex]);
            types.splice(randomIndex, 1);
        }
    };
    
    this.getNextTetrominoType = function () {
        if (this.queue.length == 0) {
            this.generateNextQueue();
        }

        return this.queue.splice(this.queue.length - 1, 1)[0];
    };
}


function Ticker(maxTicks) {
    this.maxTicks = maxTicks;
    this.ticks = 0;
    
    this.isDone = function () {
        return this.ticks >= Math.ceil(this.maxTicks);
    };
    
    this.tick = function () {
        this.ticks++;
    };
    
    this.reset = function () {
        this.ticks = 0;
    };
}


function Tetromino(type) {
    this.MAX_ROTATION = 3;
    this.Direction = {
        LEFT: 0,
        RIGHT: 1,
    };
    
    this.type = type;
    this.x = 4;
    this.y = 0;
    this.rotation = 0;
    
    
    this.move = function (x, y) {
        this.x += x;
        this.y += y;
    };
    
    this.rotate = function (r) {
        this.rotation += r;

        if (this.rotation < 0)
            this.rotation = this.MAX_ROTATION;
        if (this.rotation > this.MAX_ROTATION)
            this.rotation = 0;
    };
}
Tetromino.getAllTypes = function () {
    return [
        Tetromino.Types.I,
        Tetromino.Types.O,
        Tetromino.Types.T,
        Tetromino.Types.L,
        Tetromino.Types.J,
        Tetromino.Types.S,
        Tetromino.Types.Z,
    ];
};

Tetromino.Types = {
    I: "I",
    O: "O",
    T: "T",
    L: "L",
    J: "J",
    S: "S",
    Z: "Z"
};
Tetromino.Properties = {
    Z: {
        color: "red",
        blocks: [
            [[0, 0], [1, 0], [1, 1], [2, 1]],
            [[2, 0], [2, 1], [1, 1], [1, 2]],
            [[0, 1], [1, 1], [1, 2], [2, 2]],
            [[1, 0], [1, 1], [0, 1], [0, 2]],
        ],
    },
    S: {
        color: "lime",
        blocks: [
            [[0, 1], [1, 1], [1, 0], [2, 0]],
            [[1, 0], [1, 1], [2, 1], [2, 2]],
            [[0, 2], [1, 2], [1, 1], [2, 1]],
            [[0, 0], [0, 1], [1, 1], [1, 2]],
        ],
    },
    T: {
        color: "purple",
        blocks: [
            [[0, 1], [1, 0], [2, 1], [1, 1]],
            [[1, 0], [2, 1], [1, 2], [1, 1]],
            [[2, 1], [1, 2], [0, 1], [1, 1]],
            [[1, 2], [0, 1], [1, 0], [1, 1]],
        ],
    },
    L: {
        color: "orange",
        blocks: [
            [[0, 1], [1, 1], [2, 1], [2, 0]],
            [[1, 0], [1, 1], [1, 2], [2, 2]],
            [[0, 2], [0, 1], [1, 1], [2, 1]],
            [[0, 0], [1, 0], [1, 1], [1, 2]],
        ],
    },
    J: {
        color: "darkblue",
        blocks: [
            [[0, 0], [0, 1], [1, 1], [2, 1]],
            [[2, 0], [1, 0], [1, 1], [1, 2]],
            [[0, 1], [1, 1], [2, 1], [2, 2]],
            [[1, 0], [1, 1], [1, 2], [0, 2]],
        ],
    },
    O: {
        color: "gold",
        blocks: [
            [[0, 0], [1, 0], [0, 1], [1, 1]],
            [[0, 0], [1, 0], [0, 1], [1, 1]],
            [[0, 0], [1, 0], [0, 1], [1, 1]],
            [[0, 0], [1, 0], [0, 1], [1, 1]],
        ],
    },
    I: {
        color: "dodgerblue",
        blocks: [
            [[0, 1], [1, 1], [2, 1], [3, 1]],
            [[2, 0], [2, 1], [2, 2], [2, 3]],
            [[0, 2], [1, 2], [2, 2], [3, 2]],
            [[1, 0], [1, 1], [1, 2], [1, 3]],
        ],
    }

};


var canvas = document.getElementById("cvs");

try {
    var game = new Game(document.getElementById("cvs"));
    
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
}
catch (err) {
    canvas.getContext("2d").fillText(err, 10, 10);
}

canvas.getContext("2d").fillRect(0, 0, 20, 20);
