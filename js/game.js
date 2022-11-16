class Game {
    constructor(canvas) {
        this.canvas = canvas;

        this.keysPressed = [];
        this.previousKeysPressed = [];

        this.updatesPerSecond = 20;

        this.renderer = new Renderer(this);

        this.grid = new Grid();
        this.tetrimino = null;
        this.heldTetriminoType = null;
        this.recentInput = null;
        this.recentTetriminoKick = null;
        this.hasSwitchedTetrimino = false;
        this.totalLinesCleared = 0;
        this.backToBack = false;
        this.comboBonus = -1;
        this.level = 1;
        this.score = 0;

        this.tickers = {
            initialMove: new Ticker(this.updatesPerSecond * 0.2),
            move: new Ticker(this.updatesPerSecond * 0.03),
            goDown: new Ticker(this.updatesPerSecond * 0.05),
            autoGoDown: new Ticker(this.updatesPerSecond * 1.1),
            land: new Ticker(this.updatesPerSecond * 0.8),
            forceLand: new Ticker(this.updatesPerSecond * 2.5),
        };
    }

    start() {
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

        this.createTetrimino();
    }

    update() {
        this.tickers.move.tick();
        this.tickers.initialMove.tick();
        this.tickers.autoGoDown.tick();


        if (this.isKeyPressed("ArrowLeft") && this.tickers.initialMove.isDone() && this.tickers.move.isDone()) {
            if (this.isLocationValid(this.getTransformedBlocks(-1, 0, 0))) {
                this.tetrimino.move(-1, 0);
                this.tickers.move.reset();
                this.tickers.land.reset();
                this.recentInput = Inputs.MOVEMENT;
            }
        }

        if (this.isKeyPressed("ArrowRight") && this.tickers.initialMove.isDone() && this.tickers.move.isDone()) {
            if (this.isLocationValid(this.getTransformedBlocks(1, 0, 0))) {
                this.tetrimino.move(1, 0);
                this.tickers.move.reset();
                this.tickers.land.reset();
                this.recentInput = Inputs.MOVEMENT;
            }
        }

        if (this.isKeyPressed("ArrowDown") && this.tickers.goDown.isDone()) {
            this.attemptSoftDrop();
        }


        if (this.isLocationValid(this.getTransformedBlocks(0, 1, 0))) {
            if (this.tickers.autoGoDown.isDone()) {
                this.tetrimino.move(0, 1);
                this.tickers.autoGoDown.reset();
                this.recentInput = Inputs.MOVEMENT;
            }
        }
        else {
            this.tickers.land.tick();
            this.tickers.forceLand.tick();
        }

        if (this.tickers.land.isDone() ||
            this.tickers.forceLand.isDone()) {
            this.land();
        }

        this.tickers.goDown.tick();

        this.updatePreviousKeys();
    }

    hold() {
        var shapeBeingHeld = this.heldTetriminoType;

        this.heldTetriminoType = this.tetrimino.type;

        this.createTetrimino(shapeBeingHeld);

        this.hasSwitchedTetrimino = true;
    }

    attemptSoftDrop() {
        if (this.isLocationValid(this.getTransformedBlocks(0, 1, 0))) {
            this.tetrimino.move(0, 1);
            this.tickers.goDown.reset();
            this.tickers.autoGoDown.reset();
            this.score++;
            this.recentInput = Inputs.MOVEMENT;
        }
    }

    doHardDrop() {
        var ghostTetriminoLocation = this.getGhostTetriminoLocation();
        this.tetrimino.move(0, ghostTetriminoLocation.y);
        this.score += 2 * ghostTetriminoLocation.y;

        if (ghostTetriminoLocation.y > 0)
            this.recentInput = Inputs.MOVEMENT;
    }

    land() {
        var tSpin = this.checkForTSpin();

        this.placeTetrimino();
        this.grid.attemptToClearRow();
        this.totalLinesCleared += this.grid.numOfRowsCleared;

        this.scorePoints(tSpin);

        this.createTetrimino();

        this.hasSwitchedTetrimino = false;
    }

    scorePoints(tSpin) {
        if (tSpin == TSpins.REGULAR) {
            // Regular T Spin
            if (this.grid.numOfRowsCleared == 0) {
                this.score += 400;
                this.comboBonus = -1;
                console.log("T Spin");
            }
            // T Spin Single
            else if (this.grid.numOfRowsCleared == 1) {
                this.comboBonus++;
                this.score += 800 * (this.backToBack ? 1.5 : 1) + (this.comboBonus * 50);
                this.backToBack = true;
                console.log((this.backToBack ? "Back to back " : "") + "T Spin Single" + (this.comboBonus > 1 ? " + COMBO x " + this.comboBonus : ""));
            }
            // T Spin Double
            else if (this.grid.numOfRowsCleared == 2) {
                this.comboBonus++;
                this.score += 1200 * (this.backToBack ? 1.5 : 1) + (this.comboBonus * 50);
                this.backToBack = true;
                console.log((this.backToBack ? "Back to back " : "") + "T Spin Double" + (this.comboBonus > 1 ? " + COMBO x " + this.comboBonus : ""));
            }
            // T Spin Triple
            else if (this.grid.numOfRowsCleared == 3) {
                this.comboBonus++;
                this.score += 1600 * (this.backToBack ? 1.5 : 1) + (this.comboBonus * 50);
                console.log((this.backToBack ? "Back to back " : "") + "T Spin Triple" + (this.comboBonus > 1 ? " + COMBO x " + this.comboBonus : ""));
                this.backToBack = true;
            }
        }
        else {
            // T Spin Mini
            if (tSpin == TSpins.MINI) {
                this.score += 100;
                console.log("T Spin Mini");
            }

            if (this.grid.numOfRowsCleared == 0) {
                this.comboBonus = -1;
            }
            // Single Line Clear
            else if (this.grid.numOfRowsCleared == 1) {
                this.comboBonus++;
                this.score += 100 + (this.comboBonus * 50);
                this.backToBack = false;
                console.log("Single" + (this.comboBonus > 1 ? " + COMBO x " + this.comboBonus : ""));
            }
            // Double Line Clear
            else if (this.grid.numOfRowsCleared == 2) {
                this.comboBonus++;
                this.score += 300 + (this.comboBonus * 50);
                this.backToBack = false;
                console.log("Double" + (this.comboBonus > 1 ? " + COMBO x " + this.comboBonus : ""));
            }
            // Triple Line Clear
            else if (this.grid.numOfRowsCleared == 3) {
                this.comboBonus++;
                this.score += 500 + (this.comboBonus * 50);
                this.backToBack = false;
                console.log("Triple" + (this.comboBonus > 1 ? " + COMBO x " + this.comboBonus : ""));
            }
            // Tetris
            else if (this.grid.numOfRowsCleared == 4) {
                this.comboBonus++;
                this.score += 800 * (this.backToBack ? 1.5 : 1) + (this.comboBonus * 50);
                console.log((this.backToBack ? "Back to back " : "") + "Tetris" + (this.comboBonus > 1 ? " + COMBO x " + this.comboBonus : ""));
                this.backToBack = true;
            }
        }
    }

    checkForTSpin() {
        if (this.tetrimino.type == Tetrimino.Types.T && this.recentInput == Inputs.ROTATION) {
            var frontCorners, backCorners;
            var tSpinTripleKick = (this.recentTetriminoKick != null &&
                Math.abs(this.recentTetriminoKick[0]) == 1 &&
                Math.abs(this.recentTetriminoKick[1]) == 2);

            switch (this.tetrimino.orientation) {
                case Tetrimino.Orientation.DEFAULT:
                    frontCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y),
                    ];
                    backCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y + 2),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y + 2),
                    ];
                    break;

                case Tetrimino.Orientation.RIGHT:
                    frontCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y + 2)
                    ];
                    backCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y + 2)
                    ];
                    break;

                case Tetrimino.Orientation.DOWN:
                    frontCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y + 2),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y + 2)
                    ];
                    backCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y)
                    ];
                    break;

                case Tetrimino.Orientation.LEFT:
                    frontCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y + 2)
                    ];
                    backCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y + 2)
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
    }

    createTetrimino(type) {
        var t = type || this.queue.getNextTetriminoType();

        this.tetrimino = new Tetrimino(3, Grid.NUM_OF_HIDDEN_ROWS, t);

        this.tickers.autoGoDown.reset();
        this.tickers.land.reset();
        this.tickers.forceLand.reset();
    }

    placeTetrimino() {
        var properties = Tetrimino.Properties[this.tetrimino.type];
        var blocks = properties.blocks[this.tetrimino.orientation];
        var color = properties.color;

        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            this.grid.setBlock(this.tetrimino.x + block[0], this.tetrimino.y + block[1], color);
        }
    }

    getGhostTetriminoLocation() {
        var location = {
            x: this.tetrimino.x,
            y: 0,
        };

        while (this.isLocationValid(this.getTransformedBlocks(0, location.y + 1, 0))) {
            location.y++;
        }

        return location;
    }

    getTransformedBlocks(translateX, translateY, rotate) {
        var blockRotations = Tetrimino.Properties[this.tetrimino.type].blocks;
        var r = this.tetrimino.orientation + rotate;

        if (r < Tetrimino.Orientation.DEFAULT)
            r = Tetrimino.Orientation.LEFT;
        if (r > Tetrimino.Orientation.LEFT)
            r = Tetrimino.Orientation.DEFAULT;

        var blocks = blockRotations[r];
        var transformedBlocks = [];

        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            transformedBlocks[i] = [
                block[0] + this.tetrimino.x + translateX,
                block[1] + this.tetrimino.y + translateY,
            ];
        }

        return transformedBlocks;
    }

    isLocationValid(blocks) {
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];

            if (!this.grid.isWithinBoundsAndEmpty(block[0], block[1])) {
                return false;
            }
        }

        return true;
    }

    onKeyPress() {
        var kickTests, test, i;

        if ((this.isKeyPressed("C") && !this.wasKeyPressed("C")) ||
            (this.isKeyPressed("c") && !this.wasKeyPressed("c")) && !this.hasSwitchedTetrimino) {
            this.hold();
        }

        if (this.isKeyPressed((" ")) && !this.wasKeyPressed(" ")) {
            this.doHardDrop();
            this.land();
        }

        if (this.isKeyPressed("ArrowLeft") && !this.wasKeyPressed("ArrowLeft")) {
            if (this.isLocationValid(this.getTransformedBlocks(-1, 0, 0))) {
                this.tetrimino.move(-1, 0);
                this.tickers.initialMove.reset();
                this.tickers.land.reset();
                this.recentInput = Inputs.MOVEMENT;
            }
        }

        if (this.isKeyPressed("ArrowRight") && !this.wasKeyPressed("ArrowRight")) {
            if (this.isLocationValid(this.getTransformedBlocks(1, 0, 0))) {
                this.tetrimino.move(1, 0);
                this.tickers.initialMove.reset();
                this.tickers.land.reset();
                this.recentInput = Inputs.MOVEMENT;
            }
        }

        // Rotate Clockwise
        if (this.isKeyPressed("ArrowUp") && !this.wasKeyPressed("ArrowUp")) {
            if (this.isLocationValid(this.getTransformedBlocks(0, 0, 1))) {
                this.tetrimino.rotate(Tetrimino.Direction.CLOCKWISE);
                this.tickers.land.reset();
                this.recentInput = Inputs.ROTATION;
            }
            else if (this.tetrimino.type != Tetrimino.Types.O) {
                if (this.tetrimino.type == Tetrimino.Types.I) {
                    switch (this.tetrimino.orientation) {
                        case Tetrimino.Orientation.DEFAULT:
                            kickTests = Tetrimino.Kicks.I.DEFAULT_TO_RIGHT; break;
                        case Tetrimino.Orientation.RIGHT:
                            kickTests = Tetrimino.Kicks.I.RIGHT_TO_DOWN; break;
                        case Tetrimino.Orientation.DOWN:
                            kickTests = Tetrimino.Kicks.I.DOWN_TO_LEFT; break;
                        case Tetrimino.Orientation.LEFT:
                            kickTests = Tetrimino.Kicks.I.LEFT_TO_DEFAULT; break;
                    }
                }
                else {
                    switch (this.tetrimino.orientation) {
                        case Tetrimino.Orientation.DEFAULT:
                            kickTests = Tetrimino.Kicks.Other.DEFAULT_TO_RIGHT; break;
                        case Tetrimino.Orientation.RIGHT:
                            kickTests = Tetrimino.Kicks.Other.RIGHT_TO_DOWN; break;
                        case Tetrimino.Orientation.DOWN:
                            kickTests = Tetrimino.Kicks.Other.DOWN_TO_LEFT; break;
                        case Tetrimino.Orientation.LEFT:
                            kickTests = Tetrimino.Kicks.Other.LEFT_TO_DEFAULT; break;
                    }
                }

                for (i = 0; i < kickTests.length; i++) {
                    test = kickTests[i];

                    if (this.isLocationValid(this.getTransformedBlocks(test[0], test[1], 1))) {
                        this.tetrimino.move(test[0], test[1]);
                        this.tetrimino.rotate(Tetrimino.Direction.CLOCKWISE);
                        this.tickers.land.reset();
                        this.recentInput = Inputs.ROTATION;
                        this.recentTetriminoKick = test;
                        break;
                    }
                }
            }
        }

        // Counter Clockwise
        if ((this.isKeyPressed("z") && !this.wasKeyPressed("z")) ||
            (this.isKeyPressed("Z") && !this.wasKeyPressed("Z"))) {
            if (this.isLocationValid(this.getTransformedBlocks(0, 0, -1))) {
                this.tetrimino.rotate(Tetrimino.Direction.COUNTER_CLOCKWISE);
                this.tickers.land.reset();
                this.recentInput = Inputs.ROTATION;
            }
            else if (this.tetrimino.type != Tetrimino.Types.O) {
                if (this.tetrimino.type == Tetrimino.Types.I) {
                    switch (this.tetrimino.orientation) {
                        case Tetrimino.Orientation.DEFAULT:
                            kickTests = Tetrimino.Kicks.I.DEFAULT_TO_LEFT; break;
                        case Tetrimino.Orientation.LEFT:
                            kickTests = Tetrimino.Kicks.I.LEFT_TO_DOWN; break;
                        case Tetrimino.Orientation.DOWN:
                            kickTests = Tetrimino.Kicks.I.DOWN_TO_RIGHT; break;
                        case Tetrimino.Orientation.RIGHT:
                            kickTests = Tetrimino.Kicks.I.RIGHT_TO_DEFAULT; break;
                    }
                }
                else {
                    switch (this.tetrimino.orientation) {
                        case Tetrimino.Orientation.DEFAULT:
                            kickTests = Tetrimino.Kicks.Other.DEFAULT_TO_LEFT; break;
                        case Tetrimino.Orientation.LEFT:
                            kickTests = Tetrimino.Kicks.Other.LEFT_TO_DOWN; break;
                        case Tetrimino.Orientation.DOWN:
                            kickTests = Tetrimino.Kicks.Other.DOWN_TO_RIGHT; break;
                        case Tetrimino.Orientation.RIGHT:
                            kickTests = Tetrimino.Kicks.Other.RIGHT_TO_DEFAULT; break;
                    }
                }

                for (i = 0; i < kickTests.length; i++) {
                    test = kickTests[i];

                    if (this.isLocationValid(this.getTransformedBlocks(test[0], test[1], -1))) {
                        this.tetrimino.move(test[0], test[1]);
                        this.tetrimino.rotate(Tetrimino.Direction.COUNTER_CLOCKWISE);
                        this.tickers.land.reset();
                        this.recentInput = Inputs.ROTATION;
                        this.recentTetriminoKick = test;
                        break;
                    }
                }
            }
        }

        if (this.isKeyPressed("ArrowDown") && this.tickers.goDown.isDone()) {
            this.attemptSoftDrop();
        }

        this.updatePreviousKeys();
    }

    updatePreviousKeys() {
        this.previousKeysPressed = [];

        for (var i = 0; i < this.keysPressed.length; i++)
            this.previousKeysPressed[i] = this.keysPressed[i];
    }

    isKeyPressed(key) {
        return this.keysPressed.indexOf(key) >= 0;
    }

    wasKeyPressed(key) {
        return this.previousKeysPressed.indexOf(key) >= 0;
    }
}
