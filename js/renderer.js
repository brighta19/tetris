class Renderer {
    static BLOCK_SIZE = 25;

    constructor(game) {
        this.game = game;
        this.canvas = this.game.canvas;
        this.context = this.canvas.getContext("2d");
    }


    render() {
        let width = this.game.playingField.width * Renderer.BLOCK_SIZE;

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

        this.drawBox(25, 155, 80, 240);
        this.drawLevel();
        this.drawNumberOfLinesCleared();
        this.drawScore();

        this.drawPlayingField(offset);
    }

    drawGrid(offset) {
        this.context.save();
        this.context.strokeStyle = "#CCC";

        for (let y = this.game.playingField.firstLine; y < this.game.playingField.fullHeight; y++) {
            for (let x = 0; x < this.game.playingField.width; x++) {
                let blockColor = this.game.playingField.getCell(x, y);
                let blockX = offset.x + x * Renderer.BLOCK_SIZE;
                let blockY = offset.y + y * Renderer.BLOCK_SIZE;
                blockY -= this.game.playingField.vanishZoneHeight * Renderer.BLOCK_SIZE;

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

    drawLevel() {
        this.context.save();

        this.context.textAlign = "left";
        this.context.font = "15px sans-serif";
        this.context.fillStyle = "#000";
        this.context.fillText("LEVEL", 42, 180);

        this.context.fillStyle = "#000";
        this.context.font = "18px sans-serif";
        this.context.textAlign = "center";
        this.context.fillText(this.game.level, 65, 212);

        this.context.restore();
    }

    drawNumberOfLinesCleared() {
        this.context.save();

        this.context.textAlign = "left";
        this.context.font = "15px sans-serif";
        this.context.fillStyle = "#000";
        this.context.fillText("LINES", 44, 260);

        this.context.fillStyle = "#000";
        this.context.font = "18px sans-serif";
        this.context.textAlign = "center";
        this.context.fillText(this.game.totalLinesCleared, 65, 292);

        this.context.restore();
    }

    drawScore() {
        this.context.save();

        this.context.textAlign = "left";
        this.context.font = "15px sans-serif";
        this.context.fillStyle = "#000";
        this.context.fillText("SCORE", 40, 340);

        this.context.fillStyle = "#000";
        this.context.font = "18px sans-serif";
        this.context.textAlign = "center";
        this.context.fillText(this.game.score, 65, 372);

        this.context.restore();
    }

    drawHoldQueue() {
        this.context.save();

        this.context.textAlign = "left";
        this.context.font = "15px sans-serif";
        this.context.fillStyle = "#000";
        this.context.fillText("HOLD", 44, 50);

        if (this.game.heldTetrominoType)
            this.drawBlocks(this.game.heldTetrominoType, 0, 35, 80, 0.6);

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

    drawBlocks(tetrominoType, rotation, x, y, scale = 1) {
        let properties = Tetromino.Properties[tetrominoType];
        let blocks = properties.blocks[rotation];
        let color = properties.color;
        let size = Renderer.BLOCK_SIZE * scale;

        this.context.save();

        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];

            this.context.fillStyle = color;
            this.context.fillRect(x + block[0] * size,
                y + block[1] * size, size, size);
        }

        this.context.restore();
    }

    drawTetromino(offset) {
        let blocks = this.game.tetromino.blocks;
        let color = this.game.tetromino.color;

        this.context.save();
        this.context.beginPath();

        for (let i = 0; i < blocks.length; i++) {
            let [x, y] = blocks[i];
            let rectX = offset.x + x * Renderer.BLOCK_SIZE;
            let rectY = offset.y + y * Renderer.BLOCK_SIZE;
            rectY -= this.game.playingField.vanishZoneHeight * Renderer.BLOCK_SIZE;

            this.context.rect(rectX, rectY, Renderer.BLOCK_SIZE, Renderer.BLOCK_SIZE);
        }

        this.context.fillStyle = color;
        this.context.strokeStyle = "white";
        this.context.closePath();

        this.context.fill();
        this.context.stroke();
        this.context.restore();
    }

    drawGhostTetromino(offset) {
        let ghostTetromino = this.game.getGhostTetromino();
        let blocks = ghostTetromino.blocks;

        this.context.save();
        this.context.beginPath();
        for (let i = 0; i < blocks.length; i++) {
            let [x, y] = blocks[i];
            let rectX = offset.x + x * Renderer.BLOCK_SIZE;
            let rectY = offset.y + y * Renderer.BLOCK_SIZE;
            rectY -= this.game.playingField.vanishZoneHeight * Renderer.BLOCK_SIZE;

            this.context.rect(rectX, rectY, Renderer.BLOCK_SIZE, Renderer.BLOCK_SIZE);
        }
        this.context.closePath();

        this.context.fillStyle = "rgba(0, 0, 0, 0.4)";
        this.context.fill();
        this.context.restore();
    }

    drawPlayingField(offset) {
        this.drawGrid(offset);
        this.drawGhostTetromino(offset);
        this.drawTetromino(offset);
    }
}
