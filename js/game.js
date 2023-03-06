class Game {
    static Points = {
        // reference: https://tetris.fandom.com/wiki/Scoring#Guideline_scoring_system
        SOFT_DROP: 1,
        HARD_DROP_MULTIPLIER: 2,
        SINGLE: 100,
        DOUBLE: 300,
        TRIPLE: 500,
        TETRIS: 800,            // BACK TO BACK
        MINI_TSPIN: 100,
        MINI_TSPIN_SINGLE: 200, // BACK TO BACK
        MINI_TSPIN_DOUBLE: 400, // BACK TO BACK
        TSPIN: 400,
        TSPIN_SINGLE: 800,      // BACK TO BACK
        TSPIN_DOUBLE: 1200,     // BACK TO BACK
        TSPIN_TRIPLE: 1600,     // BACK TO BACK

        BACK_TO_BACK_MULTIPLIER: 1.5,
        COMBO_BONUS: 50,
    }
    static TetriminoAction = {
        TRANSLATION: 0,
        ROTATION: 1,
    };
    static GameOverReason = {
        BLOCK_OUT: 0,
    }

    constructor(canvas) {
        this.canvas = canvas;

        this.keysPressed = [];
        this.previousKeysPressed = [];

        this.updatesPerSecond = 20;

        this.renderer = new Renderer(this);

        this.grid = new Grid();
        this.tetrimino = null;
        this.heldTetriminoType = null;
        this.recentTetriminoAction = null;
        this.recentTetriminoKick = null;
        this.recentTetriminoTspin = null;
        this.hasSwitchedTetrimino = false;
        this.totalLinesCleared = 0;
        this.backToBack = false;
        this.comboLength = -1;
        this.level = 1;
        this.score = 0;
        this.gameOver = false;

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
        this.updateInterval = setInterval(() => {
            this.update();
            this.renderer.render();
        }, 1000 / this.updatesPerSecond);

        this.queue = new Queue();
        this.spawnTetrimino();
        this.gameOver = false;
    }

    stop(gameOverReason) {
        this.gameOver = true;
        clearInterval(this.updateInterval);

        let reasonMessage;
        switch (gameOverReason) {
            case Game.GameOverReason.BLOCK_OUT:
                reasonMessage = "Block out"; break;
            default:
                reasonMessage = "Unknown";
        }
        console.log(`Game Over: ${reasonMessage}`);
    }

    moveTetriminoLeft() {
        this.tetrimino.move(-1, 0);
        this.tickers.move.reset();
        this.tickers.land.reset();
        this.recentTetriminoKick = null;
        this.recentTetriminoAction = Game.TetriminoAction.TRANSLATION;
    }

    moveTetriminoRight() {
        this.tetrimino.move(1, 0);
        this.tickers.move.reset();
        this.tickers.land.reset();
        this.recentTetriminoKick = null;
        this.recentTetriminoAction = Game.TetriminoAction.TRANSLATION;
    }

    update() {
        this.tickers.move.tick();
        this.tickers.initialMove.tick();
        this.tickers.autoGoDown.tick();


        if (this.isKeyPressed("ArrowLeft") && this.tickers.initialMove.isDone() && this.tickers.move.isDone()) {
            if (this.isLocationValid(this.getTransformedBlocks(-1, 0, 0))) {
                this.moveTetriminoLeft();
            }
        }

        if (this.isKeyPressed("ArrowRight") && this.tickers.initialMove.isDone() && this.tickers.move.isDone()) {
            if (this.isLocationValid(this.getTransformedBlocks(1, 0, 0))) {
                this.moveTetriminoRight();
            }
        }

        if (this.isKeyPressed("ArrowDown") && this.tickers.goDown.isDone()) {
            this.attemptSoftDrop();
        }


        if (this.isLocationValid(this.getTransformedBlocks(0, 1, 0))) {
            if (this.tickers.autoGoDown.isDone()) {
                this.tetrimino.move(0, 1);
                this.tickers.autoGoDown.reset();
                this.recentTetriminoAction = Game.TetriminoAction.TRANSLATION;
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

    holdTetrimino() {
        let shapeBeingHeld = this.heldTetriminoType;
        this.heldTetriminoType = this.tetrimino.type;
        this.spawnTetrimino(shapeBeingHeld);
        this.hasSwitchedTetrimino = true;
    }

    attemptSoftDrop() {
        if (this.isLocationValid(this.getTransformedBlocks(0, 1, 0))) {
            this.tetrimino.move(0, 1);
            this.tickers.goDown.reset();
            this.tickers.autoGoDown.reset();
            this.score += Game.Points.SOFT_DROP;
            this.recentTetriminoAction = Game.TetriminoAction.TRANSLATION;
        }
    }

    doHardDrop() {
        let ghostTetriminoLocation = this.getGhostTetriminoLocation();
        this.tetrimino.move(0, ghostTetriminoLocation.y);
        this.score += ghostTetriminoLocation.y * Game.Points.HARD_DROP_MULTIPLIER;

        if (ghostTetriminoLocation.y > 0)
            this.recentTetriminoAction = Game.TetriminoAction.TRANSLATION;
    }

    land() {
        this.recentTetriminoTspin = this.checkForTSpin();

        this.lockTetrimino();
        if (this.gameOver)
            return;

        this.grid.attemptToClearRow();
        this.totalLinesCleared += this.grid.numOfRowsCleared;

        this.scorePoints();

        this.spawnTetrimino();

        this.hasSwitchedTetrimino = false;
    }

    scorePoints() {
        if (this.recentTetriminoTspin == Tetrimino.TSpins.MINI) {
            // T-Spin Mini
            if (this.grid.numOfRowsCleared == 0) {
                this.comboLength = -1;
                this.score += Game.Points.MINI_TSPIN;
                console.log("T-Spin Mini");
            }
            // T-Spin Mini Single
            else if (this.grid.numOfRowsCleared == 1) {
                this.comboLength++;
                this.score += Game.Points.MINI_TSPIN_SINGLE * this.getScoreMultiplier() + this.getScoreBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Mini Single" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
            // T-Spin Mini Double
            else if (this.grid.numOfRowsCleared == 2) {
                this.comboLength++;
                this.score += Game.Points.MINI_TSPIN_DOUBLE * this.getScoreMultiplier() + this.getScoreBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Mini Double" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
        }
        else if (this.recentTetriminoTspin == Tetrimino.TSpins.REGULAR) {
            // T-Spin
            if (this.grid.numOfRowsCleared == 0) {
                this.comboLength = -1;
                this.score += Game.Points.TSPIN;
                console.log("T-Spin");
            }
            // T-Spin Single
            else if (this.grid.numOfRowsCleared == 1) {
                this.comboLength++;
                this.score += Game.Points.TSPIN_SINGLE * this.getScoreMultiplier() + this.getScoreBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Single" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
            // T-Spin Double
            else if (this.grid.numOfRowsCleared == 2) {
                this.comboLength++;
                this.score += Game.Points.TSPIN_DOUBLE * this.getScoreMultiplier() + this.getScoreBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Double" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
            // T-Spin Triple
            else if (this.grid.numOfRowsCleared == 3) {
                this.comboLength++;
                this.score += Game.Points.TSPIN_TRIPLE * this.getScoreMultiplier() + this.getScoreBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Triple" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
        }
        else {
            if (this.grid.numOfRowsCleared == 0) {
                this.comboLength = -1;
            }
            // Single Line Clear
            else if (this.grid.numOfRowsCleared == 1) {
                this.comboLength++;
                this.score += Game.Points.SINGLE + this.getScoreBonus();
                this.backToBack = false;
                console.log("Single" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
            }
            // Double Line Clear
            else if (this.grid.numOfRowsCleared == 2) {
                this.comboLength++;
                this.score += Game.Points.DOUBLE + this.getScoreBonus();
                this.backToBack = false;
                console.log("Double" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
            }
            // Triple Line Clear
            else if (this.grid.numOfRowsCleared == 3) {
                this.comboLength++;
                this.score += Game.Points.TRIPLE + this.getScoreBonus();
                this.backToBack = false;
                console.log("Triple" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
            }
            // Tetris
            else if (this.grid.numOfRowsCleared == 4) {
                this.comboLength++;
                this.score += Game.Points.TETRIS * this.getScoreMultiplier() + this.getScoreBonus();
                console.log((this.backToBack ? "Back to back " : "") + "Tetris" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
        }
    }

    getScoreMultiplier() {
        return this.backToBack ? Game.Points.BACK_TO_BACK_MULTIPLIER : 1;
    }

    getScoreBonus() {
        return this.comboLength > 0 ? this.comboLength * Game.Points.COMBO_BONUS : 0;
    }

    checkForTSpin() {
        if (this.tetrimino.type == Tetrimino.Types.T && this.recentTetriminoAction == Game.TetriminoAction.ROTATION) {
            let topCorners, bottomCorners;
            let tSpinTripleKick = (this.recentTetriminoKick != null &&
                Math.abs(this.recentTetriminoKick[0]) == 1 &&
                this.recentTetriminoKick[1] == -2);

            switch (this.tetrimino.orientation) {
                case Tetrimino.Orientation.DEFAULT:
                    topCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y),
                    ];
                    bottomCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y + 2),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y + 2),
                    ];
                    break;

                case Tetrimino.Orientation.RIGHT:
                    topCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y + 2)
                    ];
                    bottomCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y + 2)
                    ];
                    break;

                case Tetrimino.Orientation.DOWN:
                    topCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y + 2),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y + 2)
                    ];
                    bottomCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y)
                    ];
                    break;

                case Tetrimino.Orientation.LEFT:
                    topCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y + 2)
                    ];
                    bottomCorners = [
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y),
                        !this.grid.isWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y + 2)
                    ];
                    break;
            }

            let atLeastOneBottomCorner = bottomCorners[0] || bottomCorners[1];
            let atLeastOneTopCorner = topCorners[0] || topCorners[1];
            let twoBottomCorners = bottomCorners[0] && bottomCorners[1];
            let twoTopCorners = topCorners[0] && topCorners[1];

            if ((twoTopCorners && atLeastOneBottomCorner) ||
                (twoBottomCorners && atLeastOneTopCorner && tSpinTripleKick)) {
                return Tetrimino.TSpins.REGULAR;
            }
            else if (twoBottomCorners && atLeastOneTopCorner) {
                return Tetrimino.TSpins.MINI;
            }
        }

        return null;
    }

    spawnTetrimino(type) {
        let t = type || this.queue.getNextTetriminoType();

        this.tetrimino = new Tetrimino(3, Grid.NUM_OF_HIDDEN_ROWS, t);

        let translateCounter = 0;
        while (translateCounter < Grid.NUM_OF_HIDDEN_ROWS &&
            !this.isLocationValid(this.getTransformedBlocks(0, 0, 0))
        ) {
            this.tetrimino.y -= 1;
            translateCounter++;
        }

        if (!this.isLocationValid(this.getTransformedBlocks(0, 0, 0))) {
            this.stop(Game.GameOverReason.BLOCK_OUT);
            return;
        }

        this.tickers.autoGoDown.reset();
        this.tickers.land.reset();
        this.tickers.forceLand.reset();
    }

    lockTetrimino() {
        let properties = Tetrimino.Properties[this.tetrimino.type];
        let blocks = properties.blocks[this.tetrimino.orientation];
        let color = properties.color;

        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];
            this.grid.setBlock(this.tetrimino.x + block[0], this.tetrimino.y + block[1], color);
        }
    }

    getGhostTetriminoLocation() {
        let location = {
            x: this.tetrimino.x,
            y: 0,
        };

        while (this.isLocationValid(this.getTransformedBlocks(0, location.y + 1, 0))) {
            location.y++;
        }

        return location;
    }

    getTransformedBlocks(translateX, translateY, rotate) {
        let blockRotations = Tetrimino.Properties[this.tetrimino.type].blocks;
        let r = this.tetrimino.orientation + rotate;

        if (r < Tetrimino.Orientation.DEFAULT)
            r = Tetrimino.Orientation.LEFT;
        if (r > Tetrimino.Orientation.LEFT)
            r = Tetrimino.Orientation.DEFAULT;

        let blocks = blockRotations[r];
        let transformedBlocks = [];

        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];
            transformedBlocks[i] = [
                block[0] + this.tetrimino.x + translateX,
                block[1] + this.tetrimino.y + translateY,
            ];
        }

        return transformedBlocks;
    }

    isLocationValid(blocks) {
        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];

            if (!this.grid.isWithinBoundsAndEmpty(block[0], block[1])) {
                return false;
            }
        }

        return true;
    }

    onKeyPress() {
        if (this.gameOver)
            return;

        if ((this.isKeyPressed("C") && !this.wasKeyPressed("C")) ||
            (this.isKeyPressed("c") && !this.wasKeyPressed("c")) && !this.hasSwitchedTetrimino) {
            this.holdTetrimino();
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
                this.recentTetriminoAction = Game.TetriminoAction.TRANSLATION;
            }
        }

        if (this.isKeyPressed("ArrowRight") && !this.wasKeyPressed("ArrowRight")) {
            if (this.isLocationValid(this.getTransformedBlocks(1, 0, 0))) {
                this.tetrimino.move(1, 0);
                this.tickers.initialMove.reset();
                this.tickers.land.reset();
                this.recentTetriminoAction = Game.TetriminoAction.TRANSLATION;
            }
        }

        // Rotate Clockwise
        if (this.isKeyPressed("ArrowUp") && !this.wasKeyPressed("ArrowUp")) {
            if (this.isLocationValid(this.getTransformedBlocks(0, 0, 1))) {
                this.tetrimino.rotate(Tetrimino.Direction.CLOCKWISE);
                this.tickers.land.reset();
                this.recentTetriminoAction = Game.TetriminoAction.ROTATION;
            }
            else if (this.tetrimino.type != Tetrimino.Types.O) {
                let kickTests;
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

                for (let i = 0; i < kickTests.length; i++) {
                    let test = kickTests[i];

                    if (this.isLocationValid(this.getTransformedBlocks(test[0], test[1], 1))) {
                        this.tetrimino.move(test[0], test[1]);
                        this.tetrimino.rotate(Tetrimino.Direction.CLOCKWISE);
                        this.tickers.land.reset();
                        this.recentTetriminoAction = Game.TetriminoAction.ROTATION;
                        this.recentTetriminoKick = test;
                        console.log("Kick");
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
                this.recentTetriminoAction = Game.TetriminoAction.ROTATION;
            }
            else if (this.tetrimino.type != Tetrimino.Types.O) {
                let kickTests;
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

                for (let i = 0; i < kickTests.length; i++) {
                    let test = kickTests[i];

                    if (this.isLocationValid(this.getTransformedBlocks(test[0], test[1], -1))) {
                        this.tetrimino.move(test[0], test[1]);
                        this.tetrimino.rotate(Tetrimino.Direction.COUNTER_CLOCKWISE);
                        this.tickers.land.reset();
                        this.recentTetriminoAction = Game.TetriminoAction.ROTATION;
                        this.recentTetriminoKick = test;
                        console.log("Kick");
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

        for (let i = 0; i < this.keysPressed.length; i++)
            this.previousKeysPressed[i] = this.keysPressed[i];
    }

    isKeyPressed(key) {
        return this.keysPressed.indexOf(key) >= 0;
    }

    wasKeyPressed(key) {
        return this.previousKeysPressed.indexOf(key) >= 0;
    }
}
