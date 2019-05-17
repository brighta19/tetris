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
    this.recentInput = null;
    this.recentWallKick = null;
    this.hasSwitchedTetromino = false;
    this.totalLinesCleared = 0;
    this.backToBack = false;
    this.comboBonus = -1;
    this.level = 1;
    this.score = 0;
    
    this.tickers = {
        initialMove: new Ticker(this.updatesPerSecond * 0.2),
        move:        new Ticker(this.updatesPerSecond * 0.03),
        goDown:      new Ticker(this.updatesPerSecond * 0.05),
        autoGoDown:  new Ticker(this.updatesPerSecond * 1.1),
        land:        new Ticker(this.updatesPerSecond * 0.8),
        forceLand:   new Ticker(this.updatesPerSecond * 2.5),
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
        this.tickers.move.tick();
        this.tickers.initialMove.tick();
        this.tickers.autoGoDown.tick();

    
        if (this.isKeyPressed("ArrowLeft") && this.tickers.initialMove.isDone() && this.tickers.move.isDone()) {
            if (this.isLocationValid( this.getTransformedBlocks(-1, 0, 0) )) {
                this.tetromino.move(-1, 0);
                this.tickers.move.reset();
                this.tickers.land.reset();
                this.recentInput = Inputs.MOVEMENT;
            }
        }
        
        if (this.isKeyPressed("ArrowRight") && this.tickers.initialMove.isDone() && this.tickers.move.isDone()) {
            if (this.isLocationValid( this.getTransformedBlocks(1, 0, 0) )) {
                this.tetromino.move(1, 0);
                this.tickers.move.reset();
                this.tickers.land.reset();
                this.recentInput = Inputs.MOVEMENT;
            }
        }
        
        if (this.isKeyPressed("ArrowDown") && this.tickers.goDown.isDone()) {
            this.trySoftDrop();
        }

        
        if (this.isLocationValid( this.getTransformedBlocks(0, 1, 0) )) {
            if (this.tickers.autoGoDown.isDone()) {
                this.tetromino.move(0, 1);
                this.tickers.autoGoDown.reset();
                this.recentInput = Inputs.MOVEMENT;
            }
        }
        else {
            console.log("strange");
            this.tickers.land.tick();
            this.tickers.forceLand.tick();
        }
        
        if (this.tickers.land.isDone() ||
        this.tickers.forceLand.isDone()) {
            this.land();
        }
        
        this.tickers.goDown.tick();
        
        this.updatePreviousKeys();
    };
    
    this.hold = function () {
        var shapeBeingHeld = this.heldTetrominoType;
        
        this.heldTetrominoType = this.tetromino.type;

        this.createTetromino(shapeBeingHeld);
            
        this.hasSwitchedTetromino = true;
    };
    
    this.trySoftDrop = function () {
        if (this.isLocationValid( this.getTransformedBlocks(0, 1, 0) )) {
            this.tetromino.move(0, 1);
            this.tickers.goDown.reset();
            this.tickers.autoGoDown.reset();
            this.score++;
            this.recentInput = Inputs.MOVEMENT;
        }
    };
    
    this.doHardDrop = function () {
        var y = this.getPredictedLandingY();
        this.tetromino.move(0, y);
        this.score += 2 * y;
        
        if (y > 0)
            this.recentInput = Inputs.MOVEMENT;
    };
    
    this.land = function () {
        var tSpin = this.didTSpin();
        
        this.placeTetromino();
        this.grid.tryClearingLines();
        this.totalLinesCleared += this.grid.linesCleared.length;
        
        this.scorePoints(tSpin);
            
        this.createTetromino();
        
        this.hasSwitchedTetromino = false;
    };
    
    this.scorePoints = function (tSpin) {
        if (tSpin == TSpins.REGULAR) {
            // Regular T Spin
            if (this.grid.linesCleared.length == 0) {
                this.score += 400;
                this.comboBonus = -1;
                console.log("T Spin");
            }
            // T Spin Single
            else if (this.grid.linesCleared.length == 1) {
                this.comboBonus++;
                this.score += 800 * (this.backToBack ? 1.5 : 1) + (this.comboBonus * 50);
                this.backToBack = true;
                console.log("T Spin Single");
            }
            // T Spin Double
            else if (this.grid.linesCleared.length == 2) {
                this.comboBonus++;
                this.score += 1200 * (this.backToBack ? 1.5 : 1) + (this.comboBonus * 50);
                this.backToBack = true;
                console.log("T Spin Double");
            }
            // T Spin Triple
            else if (this.grid.linesCleared.length == 3) {
                this.comboBonus++;
                this.score += 1600 * (this.backToBack ? 1.5 : 1) + (this.comboBonus * 50);
                this.backToBack = true;
                console.log("T Spin Triple");
            }
        }
        else {
            // T Spin Mini
            if (tSpin == TSpins.MINI) {
                this.score += 100;
                console.log("T Spin Mini");
            }
            
            if (this.grid.linesCleared.length == 0) {
                this.comboBonus = -1;
            }
            // Single Line Clear
            else if (this.grid.linesCleared.length == 1) {
                this.comboBonus++;
                this.score += 100 + (this.comboBonus * 50);
                this.backToBack = false;
                console.log("Single");
            }
            // Double Line Clear
            else if (this.grid.linesCleared.length == 2) {
                this.comboBonus++;
                this.score += 300 + (this.comboBonus * 50);
                this.backToBack = false;
                console.log("Double");
            }
            // Triple Line Clear
            else if (this.grid.linesCleared.length == 3) {
                this.comboBonus++;
                this.score += 500 + (this.comboBonus * 50);
                this.backToBack = false;
                console.log("Triple");
            }
            // Tetris
            else if (this.grid.linesCleared.length == 4) {
                this.comboBonus++;
                this.score += 800 * (this.backToBack ? 1.5 : 1) + (this.comboBonus * 50);
                this.backToBack = true;
                console.log("Tetris");
            }
        }
    };
    
    this.didTSpin = function () {
        if (this.tetromino.type == Tetromino.Types.T && this.recentInput == Inputs.ROTATION) {
            var frontCorners, backCorners;
            var tSpinTripleKick = (this.recentWallKick != null &&
                Math.abs(this.recentWallKick[0]) == 1 &&
                Math.abs(this.recentWallKick[1]) == 2);
            
            switch (this.tetromino.rotation) {
                case Tetromino.Rotations.DEFAULT:
                    frontCorners = [
                        !this.grid.isEmpty(this.tetromino.x, this.tetromino.y),
                        !this.grid.isEmpty(this.tetromino.x + 2, this.tetromino.y),
                    ];
                    backCorners = [
                        !this.grid.isEmpty(this.tetromino.x, this.tetromino.y + 2),
                        !this.grid.isEmpty(this.tetromino.x + 2, this.tetromino.y + 2),
                    ];
                    break;
                    
                case Tetromino.Rotations.RIGHT:
                    frontCorners = [
                        !this.grid.isEmpty(this.tetromino.x + 2, this.tetromino.y),
                        !this.grid.isEmpty(this.tetromino.x + 2, this.tetromino.y + 2)
                    ];
                    backCorners = [
                        !this.grid.isEmpty(this.tetromino.x, this.tetromino.y),
                        !this.grid.isEmpty(this.tetromino.x, this.tetromino.y + 2)
                    ];
                    break;
                    
                case Tetromino.Rotations.DOWN:
                    frontCorners = [
                        !this.grid.isEmpty(this.tetromino.x , this.tetromino.y + 2),
                        !this.grid.isEmpty(this.tetromino.x + 2, this.tetromino.y + 2)
                    ];
                    backCorners = [
                        !this.grid.isEmpty(this.tetromino.x, this.tetromino.y),
                        !this.grid.isEmpty(this.tetromino.x + 2, this.tetromino.y)
                    ];
                    break;
                    
                case Tetromino.Rotations.LEFT:
                    frontCorners = [
                        !this.grid.isEmpty(this.tetromino.x, this.tetromino.y),
                        !this.grid.isEmpty(this.tetromino.x, this.tetromino.y + 2)
                    ];
                    backCorners = [
                        !this.grid.isEmpty(this.tetromino.x + 2, this.tetromino.y),
                        !this.grid.isEmpty(this.tetromino.x + 2, this.tetromino.y + 2)
                    ];
                    break;
            }
            
            var atLeastOneBackCorner = backCorners[0] || backCorners[1];
            var atLeastOneFrontCorner = frontCorners[0] || frontCorners[1];
            var twoBackCorners = backCorners[0] && backCorners[1];
            var twoFrontCorners = frontCorners[0] && frontCorners[1];
            
            if ((atLeastOneBackCorner && twoFrontCorners) ||
            (twoBackCorners && atLeastOneFrontCorner && tSpinTripleKick)) {
                return TSpins.REGULAR;
            }
            else if (twoBackCorners && atLeastOneFrontCorner) {
                return TSpins.MINI;
            }
        }
        
        return null;
    };
    
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
    };

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
    };

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
        var wallKickTests, test, i;
        
        if ((this.isKeyPressed("C") && !this.wasKeyPressed("C")) ||
        (this.isKeyPressed("c") && !this.wasKeyPressed("c")) && !this.hasSwitchedTetromino) {
            this.hold();
        }

        if (this.isKeyPressed((" ")) && !this.wasKeyPressed(" ")) {
            this.doHardDrop();
            this.land();
        }

        if (this.isKeyPressed("ArrowLeft") && !this.wasKeyPressed("ArrowLeft")) {
            if (this.isLocationValid( this.getTransformedBlocks(-1, 0, 0) )) {
                this.tetromino.move(-1, 0);
                this.tickers.initialMove.reset();
                this.tickers.land.reset();
                this.recentInput = Inputs.MOVEMENT;
            }
        }
        
        if (this.isKeyPressed("ArrowRight") && !this.wasKeyPressed("ArrowRight")) {
            if (this.isLocationValid( this.getTransformedBlocks(1, 0, 0) )) {
                this.tetromino.move(1, 0);
                this.tickers.initialMove.reset();
                this.tickers.land.reset();
                this.recentInput = Inputs.MOVEMENT;
            }
        }
        
        // Rotate Clockwise
        if (this.isKeyPressed("ArrowUp") && !this.wasKeyPressed("ArrowUp")) {
            if (this.isLocationValid( this.getTransformedBlocks(0, 0, 1) )) {
                this.tetromino.rotate(Tetromino.Rotations.CLOCKWISE);
                this.tickers.land.reset();
                this.recentInput = Inputs.ROTATION;
            }
            else if (this.tetromino.type != Tetromino.Types.O) {
                if (this.tetromino.type == Tetromino.Types.I) {
                    switch (this.tetromino.rotation) {
                        case Tetromino.Rotations.DEFAULT:
                            wallKickTests = WallKicks.I.DEFAULT_TO_RIGHT; break;
                        case Tetromino.Rotations.RIGHT:
                            wallKickTests = WallKicks.I.RIGHT_TO_DOWN; break;
                        case Tetromino.Rotations.DOWN:
                            wallKickTests = WallKicks.I.DOWN_TO_LEFT; break;
                        case Tetromino.Rotations.LEFT:
                            wallKickTests = WallKicks.I.LEFT_TO_DEFAULT; break;
                    }
                }
                else {
                    switch (this.tetromino.rotation) {
                        case Tetromino.Rotations.DEFAULT:
                            wallKickTests = WallKicks.Other.DEFAULT_TO_RIGHT; break;
                        case Tetromino.Rotations.RIGHT:
                            wallKickTests = WallKicks.Other.RIGHT_TO_DOWN; break;
                        case Tetromino.Rotations.DOWN:
                            wallKickTests = WallKicks.Other.DOWN_TO_LEFT; break;
                        case Tetromino.Rotations.LEFT:
                            wallKickTests = WallKicks.Other.LEFT_TO_DEFAULT; break;
                    }
                }
                    
                for (i = 0; i < wallKickTests.length; i++) {
                    test = wallKickTests[i];
                    
                    if (this.isLocationValid( this.getTransformedBlocks(test[0], test[1], 1) )) {
                        this.tetromino.move(test[0], test[1]);
                        this.tetromino.rotate(Tetromino.Rotations.CLOCKWISE);
                        this.tickers.land.reset();
                        this.recentInput = Inputs.ROTATION;
                        this.recentWallKick = test;
                        break;
                    }
                }
            }
        }
    
        // Counter Clockwise
        if ((this.isKeyPressed("z") && !this.wasKeyPressed("z")) ||
        (this.isKeyPressed("Z") &&  !this.wasKeyPressed("Z"))) {
            if (this.isLocationValid( this.getTransformedBlocks(0, 0, -1) )) {
                this.tetromino.rotate(Tetromino.Rotations.COUNTER_CLOCKWISE);
                this.tickers.land.reset();
                this.recentInput = Inputs.ROTATION;
            }
            else if (this.tetromino.type != Tetromino.Types.O) {
                if (this.tetromino.type == Tetromino.Types.I) {
                    switch (this.tetromino.rotation) {
                        case Tetromino.Rotations.DEFAULT:
                            wallKickTests = WallKicks.I.DEFAULT_TO_LEFT; break;
                        case Tetromino.Rotations.LEFT:
                            wallKickTests = WallKicks.I.LEFT_TO_DOWN; break;
                        case Tetromino.Rotations.DOWN:
                            wallKickTests = WallKicks.I.DOWN_TO_RIGHT; break;
                        case Tetromino.Rotations.RIGHT:
                            wallKickTests = WallKicks.I.RIGHT_TO_DEFAULT; break;
                    }
                }
                else {
                    switch (this.tetromino.rotation) {
                        case Tetromino.Rotations.DEFAULT:
                            wallKickTests = WallKicks.Other.DEFAULT_TO_LEFT; break;
                        case Tetromino.Rotations.LEFT:
                            wallKickTests = WallKicks.Other.LEFT_TO_DOWN; break;
                        case Tetromino.Rotations.DOWN:
                            wallKickTests = WallKicks.Other.DOWN_TO_RIGHT; break;
                        case Tetromino.Rotations.RIGHT:
                            wallKickTests = WallKicks.Other.RIGHT_TO_DEFAULT; break;
                    }
                }
                    
                for (i = 0; i < wallKickTests.length; i++) {
                    test = wallKickTests[i];
                    
                    if (this.isLocationValid( this.getTransformedBlocks(test[0], test[1], -1) )) {
                        this.tetromino.move(test[0], test[1]);
                        this.tetromino.rotate(Tetromino.Rotations.COUNTER_CLOCKWISE);
                        this.tickers.land.reset();
                        this.recentInput = Inputs.ROTATION;
                        this.recentWallKick = test;
                        break;
                    }
                }
            }
        }
        
        if (this.isKeyPressed("ArrowDown") && this.tickers.goDown.isDone()) {
            this.trySoftDrop();
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
