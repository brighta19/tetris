class Renderer {
    static BLOCK_SIZE = 25;

    constructor(game) {
        this.game = game;
        this.canvas = this.game.canvas;
        this.context = this.canvas.getContext("2d");
    }


    render() {
        let width = Grid.NUM_OF_COLS * Renderer.BLOCK_SIZE;

        let offset = {
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

        this.drawPlayingField(offset);
    }

    drawGrid(offset) {
        this.context.save();
        this.context.strokeStyle = "#CCC";

        for (let y = Grid.NUM_OF_HIDDEN_ROWS; y < Grid.NUM_OF_ROWS; y++) {
            for (let x = 0; x < Grid.NUM_OF_COLS; x++) {
                let blockColor = this.game.grid.getBlock(x, y);
                let blockX = offset.x + x * Renderer.BLOCK_SIZE;
                let blockY = offset.y + y * Renderer.BLOCK_SIZE;
                blockY -= Grid.NUM_OF_HIDDEN_ROWS * Renderer.BLOCK_SIZE;

                this.context.beginPath();
                this.context.rect(blockX, blockY, Renderer.BLOCK_SIZE,
                    Renderer.BLOCK_SIZE);
                this.context.closePath();
                this.context.stroke();

                if (blockColor != 0) {
                    this.context.fillStyle = blockColor;
                    this.context.fill();
                }
            }
        }

        this.context.restore();
    }

    drawBox(x, y, width, height) {
        this.context.save();

        this.context.strokeStyle = "#CCC";
        this.context.strokeRect(x, y, width, height);

        this.context.restore();
    }

    drawNumberOfLinesCleared() {
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
    }

    drawScore() {
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
    }

    drawHoldQueue() {
        this.context.save();

        this.context.textAlign = "left";
        this.context.font = "15px sans-serif";
        this.context.fillStyle = "#000";
        this.context.fillText("HOLD", 44, 50);

        if (this.game.heldTetriminoType)
            this.drawBlocks(this.game.heldTetriminoType, 0, 35, 80, 0.6);

        this.context.restore();
    }

    drawNextQueue() {
        this.context.save();

        this.context.textAlign = "left";
        this.context.font = "15px sans-serif";
        this.context.fillStyle = "#000";
        this.context.fillText("NEXT", 420, 50);

        let nextThreeTypes = this.game.queue.getNextThree();
        for (let i = 0; i < nextThreeTypes.length; i++)
            this.drawBlocks(nextThreeTypes[i], 0, 410, 90 + (i * 80), 0.6);

        this.context.restore();
    }

    drawBlocks(tetriminoType, rotation, x, y, scale) {
        let properties = Tetrimino.Properties[tetriminoType];
        let blocks = properties.blocks[rotation];
        let color = properties.color;
        let size = Renderer.BLOCK_SIZE * (scale || 1);

        this.context.save();

        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];

            this.context.fillStyle = color;
            this.context.fillRect(x + block[0] * size,
                y + block[1] * size, size, size);
        }

        this.context.restore();
    }

    drawTetrimino(offset) {
        let properties = Tetrimino.Properties[this.game.tetrimino.type];
        let blocks = properties.blocks[this.game.tetrimino.orientation];

        this.context.save();
        this.context.beginPath();

        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];
            let blockX = offset.x + (this.game.tetrimino.x + block[0]) * Renderer.BLOCK_SIZE;
            let blockY = offset.y + (this.game.tetrimino.y + block[1]) * Renderer.BLOCK_SIZE;
            blockY -= Grid.NUM_OF_HIDDEN_ROWS * Renderer.BLOCK_SIZE;

            this.context.rect(blockX, blockY, Renderer.BLOCK_SIZE, Renderer.BLOCK_SIZE);
        }

        this.context.fillStyle = properties.color;
        this.context.strokeStyle = "white";
        this.context.closePath();

        this.context.fill();
        this.context.stroke();
        this.context.restore();
    }

    drawGhostTetrimino(offset) {
        let ghostTetriminoLocation = this.game.getGhostTetriminoLocation();
        let blocks = this.game.getTransformedBlocks(0, ghostTetriminoLocation.y, 0);

        this.context.save();
        this.context.beginPath();
        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];
            let blockX = offset.x + block[0] * Renderer.BLOCK_SIZE;
            let blockY = offset.y + block[1] * Renderer.BLOCK_SIZE;
            blockY -= Grid.NUM_OF_HIDDEN_ROWS * Renderer.BLOCK_SIZE;

            this.context.rect(blockX, blockY, Renderer.BLOCK_SIZE, Renderer.BLOCK_SIZE);
        }
        this.context.closePath();

        this.context.fillStyle = "rgba(0, 0, 0, 0.4)";
        this.context.fill();
        this.context.restore();
    }

    drawPlayingField(offset) {
        this.drawGrid(offset);
        this.drawGhostTetrimino(offset);
        this.drawTetrimino(offset);
    }
}
