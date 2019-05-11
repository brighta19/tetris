function Game(canvas) {
    this.canvas = canvas;
    
    this.keysPressed = [];
    this.previousKeysPressed = [];
    
    this.updatesPerSecond = 30;
    this.blockSize = 25;
    
    this.updater = new Updater(this);
    this.renderer = new Renderer(this);
    
    this.grid = new Grid();
    this.tetromino = null;
    this.heldTetromino = null;
    this.hasHeldTetromino = false;
    
    this.tickers = {
        initialMove: new Ticker(this.updatesPerSecond * 0.2),
        move:        new Ticker(this.updatesPerSecond * 0.04),
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
            
            self.updater.update();
            self.renderer.render();

            self.previousDate = currentDate;
        }, 1000 / self.updatesPerSecond);
        
        this.createTetromino();
    };
    
    this.createTetromino = function () {
        var type = this.queue.getNextTetrominoType();
        
        this.tetromino = new Tetromino(type);
    };
    
    this.onKeyDown = function (event) {
        if (this.keysPressed.indexOf(event.key) < 0) {
            this.keysPressed.push(event.key);
        }
        
        
        var blocks;
        
        if (this.isKeyPressed("ArrowLeft") && !this.wasKeyPressed("ArrowLeft")) {
            console.log("left")
            // blocks = currentShape.getTranslatedBlocks(-1, 0);
            // if (isLocationValid(blocks)) {
            //     currentShape.translateBlocks(-1, 0);
            //     if (holdingBlock) {
            //         var y = 0;
            //         while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
            //             y++;
            //         }
            //         currentShape.translateBlocks(0, y);
            //     }
            //     timers.initialMove.reset();
            //     tickers.land.reset();
            // }
        }
        
        if (this.isKeyPressed("ArrowRight") && !this.wasKeyPressed("ArrowRight")) {
            console.log("right")
            // blocks = currentShape.getTranslatedBlocks(1, 0);
            // if (isLocationValid(blocks)) {
            //     currentShape.translateBlocks(1, 0);
            //     if (holdingBlock) {
            //         var y = 0;
            //         while (isLocationValid( currentShape.getTranslatedBlocks(0, y+1) )) {
            //             y++;
            //         }
            //         currentShape.translateBlocks(0, y);
            //     }
            //     timers.initialMove.reset();
            //     tickers.land.reset();
            // }
        }
    };
    
    this.onKeyUp = function (event) {
        var index = this.keysPressed.indexOf(event.key);
        if (index >= 0) {
            this.keysPressed.splice(index, 1);
        }
    };
    
    this.isKeyPressed = function (key) {
        return this.keysPressed.indexOf(key) >= 0;
    };
    
    this.wasKeyPressed = function (key) {
        return this.previousKeysPressed.indexOf(key) >= 0;
    };
}


function Updater(game) {
    this.game = game;
    
    this.update = function (delta) {
        var initMoveTickerDone = game.tickers.initialMove.isDone(),
            moveTickerDone = game.tickers.move.isDone();
        
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
        var properties = Tetromino.Properties[game.tetromino.type];
        var blocks = properties.blocks[game.tetromino.rotation];
        
        this.context.save();
        
        this.context.fillStyle = properties.color;
        this.context.strokeStyle = "white";
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            
            this.context.beginPath();
            this.context.rect((game.tetromino.x + block[0]) * game.grid.blockSize,
                (game.tetromino.y + block[1]) * game.grid.blockSize,
                game.grid.blockSize, game.grid.blockSize);
            this.context.closePath();
            this.context.fill();
            this.context.stroke();
        }
    
        this.context.restore();
    };
    
    this.drawGhostTetromino = function () {
        
    };
}


function Grid() {
    this.rows = 20;
    this.cols = 10;
    this.grid = [];
    this.blockSize = 25;
    this.linesCleared = [];
    
    var EMPTY = 0;
    
    for (var y = 0; y < this.rows; y++) {
        this.grid[y] = [];
        for (var x = 0; x < this.cols; x++) {
            this.grid[y][x] = EMPTY;
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
                    this.grid[0][x] = EMPTY;
                }
                
                this.linesCleared.push(i);
            }
            else {
                i--;
            }
        }
    };
    
    this.isEmpty = function (x, y) {
        return this.grid[y][x] == EMPTY;
    };
    
    this.isLineFull = function (y) {
        return this.grid[y].indexOf(EMPTY);
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
    
    this.isDone = function () {
        return this.ticks == undefined || this.ticks >= this.maxTicks;
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
    
    
    this.move = function (direction) {
        if (direction == this.Direction.LEFT) {
            
        }
        if (direction == this.Direction.RIGHT) {
            
        }
    };
    
    this.rotate = function (direction) {
        if (direction == this.Direction.LEFT) {
            this.rotation--;
            if (this.rotation < 0)
                this.rotation = this.MAX_ROTATION;
        }
        
        if (direction == this.Direction.RIGHT) {
            this.rotation++;
            if (this.rotation > this.MAX_ROTATION)
                this.rotation = 0;
        }
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
    
    window.addEventListener('keydown', game.onKeyDown.bind(game));
    window.addEventListener('keyup', game.onKeyUp.bind(game));
    
    game.start();
}
catch (err) {
    canvas.getContext("2d").fillText(err, 10, 10);
}

canvas.getContext("2d").fillRect(0, 0, 20, 20);
