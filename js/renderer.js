function Renderer(game) {
    const BLOCK_SIZE = 25;

    this.game = game;
    this.canvas = this.game.canvas;
    this.context = this.canvas.getContext("2d");


    this.render = function () {
        var width = this.game.grid.numOfCols * BLOCK_SIZE;
        var height = this.game.grid.numOfRows * BLOCK_SIZE;

        var offset = {
            x: (this.canvas.width / 2) - (width / 2),
            y: 0,
        };

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = "#FAFAFA";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBox(25, 25, 80, 110);
        this.drawHoldQueue();

        this.drawBox(400, 25, 80, 280);
        this.drawNextQueue();

        this.drawBox(25, 155, 80, 160);
        this.drawNumberOfLinesCleared();

        this.drawScore();

        this.drawGrid(offset);
        this.drawTetrimino(offset);
        this.drawGhostTetrimino(offset);
    };

    this.drawGrid = function (offset) {

        this.context.save();
        this.context.strokeStyle = "#CCC";

        for (var y = 0; y < this.game.grid.numOfRows; y++) {
            for (var x = 0; x < this.game.grid.numOfCols; x++) {
                var blockColor = this.game.grid.getBlock(x, y);

                this.context.beginPath();
                this.context.rect(offset.x + x * BLOCK_SIZE,
                    offset.y + y * BLOCK_SIZE,
                    BLOCK_SIZE, BLOCK_SIZE);
                this.context.closePath();
                this.context.stroke();

                if (blockColor != 0) {
                    this.context.fillStyle = blockColor;
                    this.context.fill();
                }
            }
        }

        this.context.restore();
    };

    this.drawBox = function (x, y, width, height) {
        this.context.save();

        this.context.strokeStyle = "#CCC";
        this.context.strokeRect(x, y, width, height);

        this.context.restore();
    };

    this.drawNumberOfLinesCleared = function () {
        this.context.save();

        this.context.textAlign = "left";
        this.context.font = "15px sans-serif";
        this.context.fillStyle = "#000";
        this.context.fillText("LINES", 44, 180);

        this.context.fillStyle = "#000";
        this.context.font = "18px sans-serif";
        this.context.textAlign = "center";
        this.context.fillText(this.game.totalLinesCleared, 65, 212);

        this.context.restore();
    };

    this.drawScore = function () {
        this.context.save();

        this.context.textAlign = "left";
        this.context.font = "15px sans-serif";
        this.context.fillStyle = "#000";
        this.context.fillText("SCORE", 40, 260);

        this.context.fillStyle = "#000";
        this.context.font = "18px sans-serif";
        this.context.textAlign = "center";
        this.context.fillText(this.game.score, 65, 292);

        this.context.restore();
    };

    this.drawHoldQueue = function () {
        this.context.save();

        this.context.textAlign = "left";
        this.context.font = "15px sans-serif";
        this.context.fillStyle = "#000";
        this.context.fillText("HOLD", 44, 50);

        if (this.game.heldTetriminoType)
            this.drawBlocks(this.game.heldTetriminoType, 0, 35, 80, 0.6);

        this.context.restore();
    };

    this.drawNextQueue = function () {
        this.context.save();

        this.context.textAlign = "left";
        this.context.font = "15px sans-serif";
        this.context.fillStyle = "#000";
        this.context.fillText("NEXT", 420, 50);

        var nextThreeTypes = this.game.queue.getNextThree();
        for (var i = 0; i < nextThreeTypes.length; i++)
            this.drawBlocks(nextThreeTypes[i], 0, 410, 90 + (i * 80), 0.6);

        this.context.restore();
    };

    this.drawBlocks = function (tetriminoType, rotation, x, y, scale) {
        var properties = Tetrimino.Properties[tetriminoType];
        var blocks = properties.blocks[rotation];
        var color = properties.color;
        var size = BLOCK_SIZE * (scale || 1);

        this.context.save();

        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];

            this.context.fillStyle = color;
            this.context.fillRect(x + block[0] * size,
                y + block[1] * size, size, size);
        }

        this.context.restore();
    };

    this.drawTetrimino = function (offset) {
        var properties = Tetrimino.Properties[this.game.tetrimino.type];
        var blocks = properties.blocks[this.game.tetrimino.rotation];

        this.context.save();

        this.context.fillStyle = properties.color;
        this.context.strokeStyle = "white";
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];

            this.context.beginPath();
            this.context.rect(offset.x + (this.game.tetrimino.x + block[0]) * BLOCK_SIZE,
                offset.y + (this.game.tetrimino.y + block[1]) * BLOCK_SIZE,
                BLOCK_SIZE, BLOCK_SIZE);
            this.context.closePath();
            this.context.fill();
            this.context.stroke();
        }

        this.context.restore();
    };

    this.drawGhostTetrimino = function (offset) {
        var ghostTetriminoLocation = this.game.getGhostTetriminoLocation();
        var blocks = this.game.getTransformedBlocks(0, ghostTetriminoLocation.y, 0)

        this.context.save();
        this.context.beginPath();
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];

            this.context.rect(offset.x + block[0] * BLOCK_SIZE,
                offset.y + block[1] * BLOCK_SIZE,
                BLOCK_SIZE, BLOCK_SIZE);
        }
        this.context.fillStyle = "rgba(0, 0, 0, 0.4)";
        this.context.fill();
        this.context.restore();
    };
}
