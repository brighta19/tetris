function Renderer(game) {
    this.game = game;
    this.canvas = this.game.canvas;
    this.context = this.canvas.getContext("2d");
    
    
    this.render = function () {
        var width = this.game.grid.cols * this.game.grid.blockSize;
        var height = this.game.grid.rows * this.game.grid.blockSize;
        
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
        this.drawTetromino(offset);
        this.drawGhostTetromino(offset);
    };
    
    this.drawGrid = function (offset) {
        
        this.context.save();
        this.context.strokeStyle = "#CCC";
    
        for (var y = 0; y < this.game.grid.rows; y++) {
            for (var x = 0; x < this.game.grid.cols; x++) {
                var block = this.game.grid.getBlock(x, y);
                
                this.context.beginPath();
                this.context.rect(offset.x + x * this.game.blockSize,
                    offset.y + y * this.game.blockSize,
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
        
        if (this.game.heldTetrominoType)
            this.drawBlocks(this.game.heldTetrominoType, 0, 35, 80, 0.6);
        
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
    
    this.drawBlocks = function (tetrominoType, rotation, x, y, scale) {
        var properties = Tetromino.Properties[tetrominoType];
        var blocks = properties.blocks[rotation];
        var color = properties.color;
        var size = this.game.grid.blockSize * (scale || 1);
        
        this.context.save();
            
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            
            this.context.fillStyle = color;
            this.context.fillRect(x + block[0] * size,
                y + block[1] * size, size, size);
        }
        
        this.context.restore();
    };
    
    this.drawTetromino = function (offset) {
        var properties = Tetromino.Properties[this.game.tetromino.type];
        var blocks = properties.blocks[this.game.tetromino.rotation];
        
        this.context.save();
        
        this.context.fillStyle = properties.color;
        this.context.strokeStyle = "white";
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            
            this.context.beginPath();
            this.context.rect(offset.x + (this.game.tetromino.x + block[0]) * this.game.grid.blockSize,
                offset.y + (this.game.tetromino.y + block[1]) * this.game.grid.blockSize,
                this.game.grid.blockSize, this.game.grid.blockSize);
            this.context.closePath();
            this.context.fill();
            this.context.stroke();
        }
    
        this.context.restore();
    };
    
    this.drawGhostTetromino = function (offset) {
        var blocks = this.game.getTransformedBlocks(0, this.game.getPredictedLandingY(), 0);
        
        this.context.save();
        this.context.beginPath();
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];

            this.context.rect(offset.x + block[0] * this.game.grid.blockSize,
                offset.y + block[1] * this.game.grid.blockSize,
                this.game.grid.blockSize, this.game.grid.blockSize);
        }
        this.context.fillStyle = "rgba(0, 0, 0, 0.4)";
        this.context.fill();
        this.context.restore();
    };
}
