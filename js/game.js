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
    static TetrominoAction = {
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

        this.playingField = new PlayingField();

        this.tetromino = null;
        this.heldTetrominoType = null;
        this.recentTetrominoAction = null;
        this.recentTetrominoKick = null;
        this.recentTetrominoTspin = null;
        this.hasSwitchedTetromino = false;
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
            softDrop: new Ticker(this.updatesPerSecond * 0.05),
            gravity: new Ticker(this.updatesPerSecond * 1.1),
            lock: new Ticker(this.updatesPerSecond * 0.8),
            forceLock: new Ticker(this.updatesPerSecond * 2.5),
        };
    }

    start() {
        this.updateInterval = setInterval(() => {
            this.update();
            this.renderer.render();
        }, 1000 / this.updatesPerSecond);

        this.queue = new Queue();
        this.spawnTetromino();
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

    moveTetrominoLeft() {
        this.tetromino.move(-1, 0);
        this.tickers.move.reset();
        this.tickers.lock.reset();
        this.recentTetrominoKick = null;
        this.recentTetrominoAction = Game.TetrominoAction.TRANSLATION;
    }

    moveTetrominoRight() {
        this.tetromino.move(1, 0);
        this.tickers.move.reset();
        this.tickers.lock.reset();
        this.recentTetrominoKick = null;
        this.recentTetrominoAction = Game.TetrominoAction.TRANSLATION;
    }

    update() {
        this.tickers.move.tick();
        this.tickers.initialMove.tick();
        if (!this.instantDrop)
            this.tickers.gravity.tick();


        if (this.isKeyPressed(Game.Key.MOVE_LEFT) && this.tickers.initialMove.isDone() && this.tickers.move.isDone()) {
            if (this.canMoveTetromino(-1, 0)) {
                this.moveTetrominoLeft();
            }
        }

        if (this.isKeyPressed(Game.Key.MOVE_RIGHT) && this.tickers.initialMove.isDone() && this.tickers.move.isDone()) {
            if (this.canMoveTetromino(1, 0)) {
                this.moveTetrominoRight();
            }
        }

        if (this.isKeyPressed(Game.Key.SOFT_DROP) && this.tickers.softDrop.isDone()) {
            this.attemptToSoftDrop();
        }


        if (this.canMoveTetromino(0, 1)) {
            if (this.instantDrop) {
                let ghostTetromino = this.getGhostTetromino();
                this.tetromino = ghostTetromino;
                this.recentTetrominoAction = Game.TetrominoAction.TRANSLATION;
            }
            else if (this.tickers.gravity.isDone()) {
                this.tetromino.move(0, 1);
                this.tickers.gravity.reset();
                this.recentTetrominoAction = Game.TetrominoAction.TRANSLATION;
            }
        }
        else {
            this.tickers.lock.tick();
            this.tickers.forceLock.tick();
        }

        if (this.tickers.lock.isDone() ||
            this.tickers.forceLock.isDone()) {
            this.lockTetromino();
        }

        this.tickers.softDrop.tick();

        this.updatePreviousKeys();
    }

    holdTetromino() {
        let shapeBeingHeld = this.heldTetrominoType;
        this.heldTetrominoType = this.tetromino.type;
        this.spawnTetromino(shapeBeingHeld);
        this.hasSwitchedTetromino = true;
    }

    attemptToSoftDrop() {
        if (this.canMoveTetromino(0, 1)) {
            this.tetromino.move(0, 1);
            this.tickers.softDrop.reset();
            this.tickers.gravity.reset();
            this.score += Game.Points.SOFT_DROP;
            this.recentTetrominoAction = Game.TetrominoAction.TRANSLATION;
        }
    }

    doHardDrop() {
        let ghostTetromino = this.getGhostTetromino();
        let distance = ghostTetromino.y - this.tetromino.y;

        this.score += distance * Game.Points.HARD_DROP_MULTIPLIER;
        this.tetromino = ghostTetromino;

        if (distance > 0)
            this.recentTetrominoAction = Game.TetrominoAction.TRANSLATION;
    }

    lockTetromino() {
        this.recentTetrominoTspin = this.checkForTSpin();

        this.addTetrominoToGrid();

        this.checkForLockOut();

        if (this.gameOver)
            return;

        let linesCleared = this.playingField.clearLines();
        this.totalLinesCleared += linesCleared;

        this.scorePoints(linesCleared);

        this.attemptToAdvanceLevel();

        this.spawnTetromino();

        this.hasSwitchedTetromino = false;
    }

    attemptToAdvanceLevel() {
        if (!this.instantDrop && this.totalLinesCleared >= this.level * 10) {
            this.level++;
            let ticks = this.updatesPerSecond * 1.1 - (this.level - 1) * 2;
            this.tickers.gravity = new Ticker(ticks);
            if (ticks < 0)
                this.instantDrop = true;
            console.log(`Advanced to level ${this.level}!`);
        }
    }

    scorePoints(linesCleared) {
        if (this.recentTetrominoTspin == Tetromino.TSpins.MINI) {
            // T-Spin Mini
            if (linesCleared == 0) {
                this.comboLength = -1;
                this.score += Game.Points.MINI_TSPIN;
                console.log("T-Spin Mini");
            }
            // T-Spin Mini Single
            else if (linesCleared == 1) {
                this.comboLength++;
                this.score += Game.Points.MINI_TSPIN_SINGLE * this.getScoreMultiplier() + this.getScoreBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Mini Single" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
            // T-Spin Mini Double
            else if (linesCleared == 2) {
                this.comboLength++;
                this.score += Game.Points.MINI_TSPIN_DOUBLE * this.getScoreMultiplier() + this.getScoreBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Mini Double" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
        }
        else if (this.recentTetrominoTspin == Tetromino.TSpins.REGULAR) {
            // T-Spin
            if (linesCleared == 0) {
                this.comboLength = -1;
                this.score += Game.Points.TSPIN;
                console.log("T-Spin");
            }
            // T-Spin Single
            else if (linesCleared == 1) {
                this.comboLength++;
                this.score += Game.Points.TSPIN_SINGLE * this.getScoreMultiplier() + this.getScoreBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Single" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
            // T-Spin Double
            else if (linesCleared == 2) {
                this.comboLength++;
                this.score += Game.Points.TSPIN_DOUBLE * this.getScoreMultiplier() + this.getScoreBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Double" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
            // T-Spin Triple
            else if (linesCleared == 3) {
                this.comboLength++;
                this.score += Game.Points.TSPIN_TRIPLE * this.getScoreMultiplier() + this.getScoreBonus();
                console.log((this.backToBack ? "Back to back " : "") + "T-Spin Triple" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
                this.backToBack = true;
            }
        }
        else {
            if (linesCleared == 0) {
                this.comboLength = -1;
            }
            // Single Line Clear
            else if (linesCleared == 1) {
                this.comboLength++;
                this.score += Game.Points.SINGLE + this.getScoreBonus();
                this.backToBack = false;
                console.log("Single" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
            }
            // Double Line Clear
            else if (linesCleared == 2) {
                this.comboLength++;
                this.score += Game.Points.DOUBLE + this.getScoreBonus();
                this.backToBack = false;
                console.log("Double" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
            }
            // Triple Line Clear
            else if (linesCleared == 3) {
                this.comboLength++;
                this.score += Game.Points.TRIPLE + this.getScoreBonus();
                this.backToBack = false;
                console.log("Triple" + (this.comboLength > 0 ? " + COMBO x " + this.comboLength : ""));
            }
            // Tetris
            else if (linesCleared == 4) {
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

        if (this.tetromino.type != Tetromino.Types.T || this.recentTetrominoAction != Game.TetrominoAction.ROTATION)
            return null;

        let topCorners, bottomCorners;
        let tSpinTripleKick = (this.recentTetrominoKick != null &&
            Math.abs(this.recentTetrominoKick[0]) == 1 &&
            this.recentTetrominoKick[1] == 2);

        switch (this.tetromino.orientation) {
            case Tetromino.Orientation.DEFAULT:
                topCorners = [
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x, this.tetromino.y),
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x + 2, this.tetromino.y),
                ];
                bottomCorners = [
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x, this.tetromino.y + 2),
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x + 2, this.tetromino.y + 2),
                ];
                break;

            case Tetromino.Orientation.RIGHT:
                topCorners = [
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x + 2, this.tetromino.y),
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x + 2, this.tetromino.y + 2)
                ];
                bottomCorners = [
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x, this.tetromino.y),
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x, this.tetromino.y + 2)
                ];
                break;

            case Tetromino.Orientation.DOWN:
                topCorners = [
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x, this.tetromino.y + 2),
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x + 2, this.tetromino.y + 2)
                ];
                bottomCorners = [
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x, this.tetromino.y),
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x + 2, this.tetromino.y)
                ];
                break;

            case Tetromino.Orientation.LEFT:
                topCorners = [
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x, this.tetromino.y),
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x, this.tetromino.y + 2)
                ];
                bottomCorners = [
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x + 2, this.tetromino.y),
                    !this.playingField.isCellWithinBoundsAndEmpty(this.tetromino.x + 2, this.tetromino.y + 2)
                ];
                break;
        }

        let atLeastOneBottomCorner = bottomCorners[0] || bottomCorners[1];
        let atLeastOneTopCorner = topCorners[0] || topCorners[1];
        let twoBottomCorners = bottomCorners[0] && bottomCorners[1];
        let twoTopCorners = topCorners[0] && topCorners[1];

        if ((twoTopCorners && atLeastOneBottomCorner) ||
            (twoBottomCorners && atLeastOneTopCorner && tSpinTripleKick)) {
            return Tetromino.TSpins.REGULAR;
        }
        else if (twoBottomCorners && atLeastOneTopCorner) {
            return Tetromino.TSpins.MINI;
        }

        return null;
    }

    spawnTetromino(type) {
        type ??= this.queue.getNextTetrominoType();

        let y = this.instantDrop ? this.playingField.lastLine : this.playingField.firstLine;
        this.tetromino = new Tetromino(3, y, type);

        this.attemptToPlaceTetromino();

        if (this.isTetrominoBlockedOut() || this.isTetrominoHidden()) {
            this.stop(Game.GameOverReason.BLOCK_OUT);
            return;
        }

        this.tickers.gravity.reset();
        this.tickers.lock.reset();
        this.tickers.forceLock.reset();
    }

    attemptToPlaceTetromino() {
        while (this.isTetrominoBlockedOut() && this.tetromino.y > 0)
            this.tetromino.move(0, -1);
    }

    addTetrominoToGrid() {
        let blocks = this.tetromino.blocks;
        let color = this.tetromino.color;

        for (let i = 0; i < blocks.length; i++) {
            let [x, y] = blocks[i];

            this.playingField.setCell(x, y, color);
        }
    }

    getGhostTetromino() {
        let distanceY = 0;

        while (this.canMoveTetromino(0, distanceY + 1))
            distanceY++;

        let ghostTetromino = Tetromino.clone(this.tetromino);
        ghostTetromino.move(0, distanceY);
        return ghostTetromino;
    }

    isTetrominoBlockedOut() {
        let clonedTetromino = this.cloneTetromino(0, 0, Tetromino.Direction.NONE);
        return !this.isLocationValid(clonedTetromino);
    }

    canMoveTetromino(x, y) {
        let clonedTetromino = this.cloneTetromino(x, y, Tetromino.Direction.NONE);
        return this.isLocationValid(clonedTetromino);
    }

    canRotateTetromino(direction) {
        let clonedTetromino = this.cloneTetromino(0, 0, direction);
        return this.isLocationValid(clonedTetromino);
    }

    findAvailableWallKick(intendedRotationDirection) {
        let kicks = this.tetromino.getWallKicks(intendedRotationDirection);
        for (let i = 0; i < kicks.length; i++) {
            let kick = kicks[i];

            let clonedTetromino = this.cloneTetromino(kick[0], kick[1], intendedRotationDirection);
            if (this.isLocationValid(clonedTetromino))
                return kick;
        }

        return null;
    }

    cloneTetromino(moveX, moveY, rotateDirection) {
        let clonedTetromino = Tetromino.clone(this.tetromino);
        clonedTetromino.move(moveX, moveY);
        clonedTetromino.rotate(rotateDirection);

        return clonedTetromino;
    }

    isLocationValid(tetromino) {
        let blocks = tetromino.blocks;
        return blocks.every(([x, y]) => this.playingField.isCellWithinBoundsAndEmpty(x, y));
    }

    checkForLockOut() {
        if (this.isTetrominoHidden())
            this.stop(Game.GameOverReason.LOCK_OUT);
    }

    isTetrominoHidden() {
        let blocks = this.tetromino.blocks;
        return blocks.every(([x, y]) => this.playingField.isCellInVanishZone(x, y));
    }

    onKeyPress() {
        if (this.gameOver)
            return;

        if (this.isKeyJustPressed(Game.Key.HOLD) && !this.hasSwitchedTetromino) {
            this.holdTetromino();
        }

        if (this.isKeyJustPressed(Game.Key.HARD_DROP)) {
            this.doHardDrop();
            this.lockTetromino();
        }

        if (this.isKeyJustPressed(Game.Key.MOVE_LEFT)) {
            if (this.canMoveTetromino(-1, 0)) {
                this.tetromino.move(-1, 0);
                this.tickers.initialMove.reset();
                this.tickers.lock.reset();
                this.recentTetrominoAction = Game.TetrominoAction.TRANSLATION;
            }
        }

        if (this.isKeyJustPressed(Game.Key.MOVE_RIGHT)) {
            if (this.canMoveTetromino(1, 0)) {
                this.tetromino.move(1, 0);
                this.tickers.initialMove.reset();
                this.tickers.lock.reset();
                this.recentTetrominoAction = Game.TetrominoAction.TRANSLATION;
            }
        }

        if (this.isKeyJustPressed(Game.Key.ROTATE_CLOCKWISE)) {
            if (this.canRotateTetromino(Tetromino.Direction.CLOCKWISE)) {
                this.tetromino.rotate(Tetromino.Direction.CLOCKWISE);
                this.tickers.lock.reset();
                this.recentTetrominoAction = Game.TetrominoAction.ROTATION;
            }
            else {
                let kick = this.findAvailableWallKick(Tetromino.Direction.CLOCKWISE);
                if (kick != null) {
                    this.tetromino.move(kick[0], kick[1]);
                    this.tetromino.rotate(Tetromino.Direction.CLOCKWISE);
                    this.tickers.lock.reset();
                    this.recentTetrominoAction = Game.TetrominoAction.ROTATION;
                    this.recentTetrominoKick = kick;

                    console.log(`Kicked (${kick[0]}, ${-kick[1]})`);
                }
            }
        }

        if (this.isKeyJustPressed(Game.Key.ROTATE_COUNTER_CLOCKWISE)) {
            if (this.canRotateTetromino(Tetromino.Direction.COUNTER_CLOCKWISE)) {
                this.tetromino.rotate(Tetromino.Direction.COUNTER_CLOCKWISE);
                this.tickers.lock.reset();
                this.recentTetrominoAction = Game.TetrominoAction.ROTATION;
            }
            else {
                let kick = this.findAvailableWallKick(Tetromino.Direction.COUNTER_CLOCKWISE);
                if (kick != null) {
                    this.tetromino.move(kick[0], kick[1]);
                    this.tetromino.rotate(Tetromino.Direction.COUNTER_CLOCKWISE);
                    this.tickers.lock.reset();
                    this.recentTetrominoAction = Game.TetrominoAction.ROTATION;
                    this.recentTetrominoKick = kick;

                    console.log(`Kicked (${kick[0]}, ${-kick[1]})`);
                }
            }
        }

        if (this.isKeyPressed(Game.Key.SOFT_DROP) && this.tickers.softDrop.isDone()) {
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
