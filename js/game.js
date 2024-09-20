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
    };
    static TetriminoAction = {
        TRANSLATION: 0,
        ROTATION: 1,
    };
    static GameOverReason = {
        LOCK_OUT: 0,
        BLOCK_OUT: 1,
    };
    static Key = {
        MOVE_LEFT: "ArrowLeft",
        MOVE_RIGHT: "ArrowRight",
        ROTATE_CLOCKWISE: "ArrowUp",
        ROTATE_COUNTER_CLOCKWISE: "KeyZ",
        SOFT_DROP: "ArrowDown",
        HARD_DROP: "Space",
        HOLD: "KeyC"
    };

    constructor(canvas) {
        this.canvas = canvas;

        this.keysPressed = [];
        this.previousKeysPressed = [];

        this.updatesPerSecond = 30;

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
        this.instantDrop = false;
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
            case Game.GameOverReason.LOCK_OUT:
                reasonMessage = "Lock out"; break;
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
        if (!this.instantDrop)
            this.tickers.autoGoDown.tick();


        if (this.isKeyPressed("ArrowLeft") && this.tickers.initialMove.isDone() && this.tickers.move.isDone()) {
            if (this.canMoveTetrimino(-1, 0)) {
                this.moveTetriminoLeft();
            }
        }

        if (this.isKeyPressed("ArrowRight") && this.tickers.initialMove.isDone() && this.tickers.move.isDone()) {
            if (this.canMoveTetrimino(1, 0)) {
                this.moveTetriminoRight();
            }
        }

        if (this.isKeyPressed("ArrowDown") && this.tickers.goDown.isDone()) {
            this.attemptToSoftDrop();
        }


        if (this.canMoveTetrimino(0, 1)) {
            if (this.instantDrop) {
                let ghostTetrimino = this.getGhostTetrimino();
                this.tetrimino = ghostTetrimino;
                this.recentTetriminoAction = Game.TetriminoAction.TRANSLATION;
            }
            else if (this.tickers.autoGoDown.isDone()) {
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

    attemptToSoftDrop() {
        if (this.canMoveTetrimino(0, 1)) {
            this.tetrimino.move(0, 1);
            this.tickers.goDown.reset();
            this.tickers.autoGoDown.reset();
            this.score += Game.Points.SOFT_DROP;
            this.recentTetriminoAction = Game.TetriminoAction.TRANSLATION;
        }
    }

    doHardDrop() {
        let ghostTetrimino = this.getGhostTetrimino();
        let distance = ghostTetrimino.y - this.tetrimino.y;

        this.score += distance * Game.Points.HARD_DROP_MULTIPLIER;
        this.tetrimino = ghostTetrimino;

        if (distance > 0)
            this.recentTetriminoAction = Game.TetriminoAction.TRANSLATION;
    }

    land() {
        this.recentTetriminoTspin = this.checkForTSpin();

        this.lockTetrimino();

        this.checkForLockOut();

        if (this.gameOver)
            return;

        this.grid.attemptToClearRow();
        this.totalLinesCleared += this.grid.numOfRowsCleared;

        this.scorePoints();

        this.attemptToAdvanceLevel();

        this.spawnTetrimino();

        this.hasSwitchedTetrimino = false;
    }

    attemptToAdvanceLevel() {
        if (!this.instantDrop && this.totalLinesCleared >= this.level * 10) {
            this.level++;
            let ticks = this.updatesPerSecond * 1.1 - (this.level - 1) * 2;
            this.tickers.autoGoDown = new Ticker(ticks);
            if (ticks < 0)
                this.instantDrop = true;
            console.log(`Advanced to level ${this.level}!`);
        }
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
        // https://tetris.wiki/T-Spin

        if (this.tetrimino.type != Tetrimino.Types.T || this.recentTetriminoAction != Game.TetriminoAction.ROTATION)
            return null;

        let topCorners, bottomCorners;
        let tSpinTripleKick = (this.recentTetriminoKick != null &&
            Math.abs(this.recentTetriminoKick[0]) == 1 &&
            this.recentTetriminoKick[1] == 2);

        switch (this.tetrimino.orientation) {
            case Tetrimino.Orientation.DEFAULT:
                topCorners = [
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y),
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y),
                ];
                bottomCorners = [
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y + 2),
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y + 2),
                ];
                break;

            case Tetrimino.Orientation.RIGHT:
                topCorners = [
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y),
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y + 2)
                ];
                bottomCorners = [
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y),
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y + 2)
                ];
                break;

            case Tetrimino.Orientation.DOWN:
                topCorners = [
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y + 2),
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y + 2)
                ];
                bottomCorners = [
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y),
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y)
                ];
                break;

            case Tetrimino.Orientation.LEFT:
                topCorners = [
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y),
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x, this.tetrimino.y + 2)
                ];
                bottomCorners = [
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y),
                    !this.grid.isCellWithinBoundsAndEmpty(this.tetrimino.x + 2, this.tetrimino.y + 2)
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

    spawnTetrimino(type) {
        type ??= this.queue.getNextTetriminoType();

        let y = this.instantDrop ? Grid.NUM_OF_ROWS - 1 : Grid.NUM_OF_HIDDEN_ROWS;
        this.tetrimino = new Tetrimino(3, y, type);

        this.attemptToPlaceTetrimino();

        if (this.isTetriminoBlockedOut() || this.isTetriminoHidden()) {
            this.stop(Game.GameOverReason.BLOCK_OUT);
            return;
        }

        this.tickers.autoGoDown.reset();
        this.tickers.land.reset();
        this.tickers.forceLand.reset();
    }

    attemptToPlaceTetrimino() {
        while (this.isTetriminoBlockedOut() && this.tetrimino.y > 0)
            this.tetrimino.move(0, -1);
    }

    lockTetrimino() {
        let blocks = this.tetrimino.blocks;
        let color = this.tetrimino.color;

        for (let i = 0; i < blocks.length; i++) {
            let [x, y] = blocks[i];

            this.grid.setBlock(x, y, color);
        }
    }

    getGhostTetrimino() {
        let distanceY = 0;

        while (this.canMoveTetrimino(0, distanceY + 1))
            distanceY++;

        let ghostTetrimino = Tetrimino.clone(this.tetrimino);
        ghostTetrimino.move(0, distanceY);
        return ghostTetrimino;
    }

    isTetriminoBlockedOut() {
        let clonedTetrimino = this.cloneTetrimino(0, 0, Tetrimino.Direction.NONE);
        return !this.isLocationValid(clonedTetrimino);
    }

    canMoveTetrimino(x, y) {
        let clonedTetrimino = this.cloneTetrimino(x, y, Tetrimino.Direction.NONE);
        return this.isLocationValid(clonedTetrimino);
    }

    canRotateTetrimino(direction) {
        let clonedTetrimino = this.cloneTetrimino(0, 0, direction);
        return this.isLocationValid(clonedTetrimino);
    }

    findAvailableWallKick(intendedRotationDirection) {
        let kicks = this.tetrimino.getWallKicks(intendedRotationDirection);
        for (let i = 0; i < kicks.length; i++) {
            let kick = kicks[i];

            let clonedTetrimino = this.cloneTetrimino(kick[0], kick[1], intendedRotationDirection);
            if (this.isLocationValid(clonedTetrimino))
                return kick;
        }

        return null;
    }

    cloneTetrimino(moveX, moveY, rotateDirection) {
        let clonedTetrimino = Tetrimino.clone(this.tetrimino);
        clonedTetrimino.move(moveX, moveY);
        clonedTetrimino.rotate(rotateDirection);

        return clonedTetrimino;
    }

    isLocationValid(tetrimino) {
        let blocks = tetrimino.blocks;
        return blocks.every(([x, y]) => this.grid.isCellWithinBoundsAndEmpty(x, y));
    }

    checkForLockOut() {
        if (this.isTetriminoHidden())
            this.stop(Game.GameOverReason.LOCK_OUT);
    }

    isTetriminoHidden() {
        let blocks = this.tetrimino.blocks;
        return blocks.every(([_x, y]) => y < Grid.NUM_OF_HIDDEN_ROWS);
    }

    onKeyPress() {
        if (this.gameOver)
            return;

        if (this.isKeyJustPressed(Game.Key.HOLD) && !this.hasSwitchedTetrimino) {
            this.holdTetrimino();
        }

        if (this.isKeyJustPressed(Game.Key.HARD_DROP)) {
            this.doHardDrop();
            this.land();
        }

        if (this.isKeyJustPressed(Game.Key.MOVE_LEFT)) {
            if (this.canMoveTetrimino(-1, 0)) {
                this.tetrimino.move(-1, 0);
                this.tickers.initialMove.reset();
                this.tickers.land.reset();
                this.recentTetriminoAction = Game.TetriminoAction.TRANSLATION;
            }
        }

        if (this.isKeyJustPressed(Game.Key.MOVE_RIGHT)) {
            if (this.canMoveTetrimino(1, 0)) {
                this.tetrimino.move(1, 0);
                this.tickers.initialMove.reset();
                this.tickers.land.reset();
                this.recentTetriminoAction = Game.TetriminoAction.TRANSLATION;
            }
        }

        if (this.isKeyJustPressed(Game.Key.ROTATE_CLOCKWISE)) {
            if (this.canRotateTetrimino(Tetrimino.Direction.CLOCKWISE)) {
                this.tetrimino.rotate(Tetrimino.Direction.CLOCKWISE);
                this.tickers.land.reset();
                this.recentTetriminoAction = Game.TetriminoAction.ROTATION;
            }
            else {
                let kick = this.findAvailableWallKick(Tetrimino.Direction.CLOCKWISE);
                if (kick != null) {
                    this.tetrimino.move(kick[0], kick[1]);
                    this.tetrimino.rotate(Tetrimino.Direction.CLOCKWISE);
                    this.tickers.land.reset();
                    this.recentTetriminoAction = Game.TetriminoAction.ROTATION;
                    this.recentTetriminoKick = kick;

                    console.log(`Kicked (${kick[0]}, ${-kick[1]})`);
                }
            }
        }

        if (this.isKeyJustPressed(Game.Key.ROTATE_COUNTER_CLOCKWISE)) {
            if (this.canRotateTetrimino(Tetrimino.Direction.COUNTER_CLOCKWISE)) {
                this.tetrimino.rotate(Tetrimino.Direction.COUNTER_CLOCKWISE);
                this.tickers.land.reset();
                this.recentTetriminoAction = Game.TetriminoAction.ROTATION;
            }
            else {
                let kick = this.findAvailableWallKick(Tetrimino.Direction.COUNTER_CLOCKWISE);
                if (kick != null) {
                    this.tetrimino.move(kick[0], kick[1]);
                    this.tetrimino.rotate(Tetrimino.Direction.COUNTER_CLOCKWISE);
                    this.tickers.land.reset();
                    this.recentTetriminoAction = Game.TetriminoAction.ROTATION;
                    this.recentTetriminoKick = kick;

                    console.log(`Kicked (${kick[0]}, ${-kick[1]})`);
                }
            }
        }

        if (this.isKeyPressed(Game.Key.SOFT_DROP) && this.tickers.goDown.isDone()) {
            this.attemptToSoftDrop();
        }

        this.updatePreviousKeys();
    }

    updatePreviousKeys() {
        this.previousKeysPressed = [];

        for (let i = 0; i < this.keysPressed.length; i++)
            this.previousKeysPressed[i] = this.keysPressed[i];
    }

    isKeyJustPressed(key) {
        return this.isKeyPressed(key) && !this.wasKeyPressed(key);
    }

    isKeyPressed(key) {
        return this.keysPressed.indexOf(key) >= 0;
    }

    wasKeyPressed(key) {
        return this.previousKeysPressed.indexOf(key) >= 0;
    }
}
