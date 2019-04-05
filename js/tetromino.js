function Tetromino(tetrimino) {
    this.color = tetrimino.color;
    this.blocks = tetrimino.blocks;
    this.x = 4;
    this.y = 0;
    
    this.translateBlocks = function (x, y) {
        this.x += x;
        this.y += y;
    };
    
    this.getTranslatedBlocks = function (x, y) {
        var blocks = [];
        
        for (var i = 0; i < this.blocks.length; i++) {
            var block = this.blocks[i];
            blocks[i] = {
                x: block[0] + this.x + x,
                y: block[1] + this.y + y,
            };
        }
        
        return blocks;
    };
    
    this.getRotatedBlocks = function () {
        
    };
    
    this.getBlocks = function () {
        return this.getTranslatedBlocks(0, 0);
    };
}

Tetromino.Z = {
    color: "red",
    blocks: [[0, 0], [1, 0], [1, 1], [2, 1]],
};
Tetromino.S = {
    color: "lime",
    blocks: [[0, 1], [1, 1], [1, 0], [2, 0]],
};
Tetromino.T = {
    color: "purple",
    blocks: [[0, 0], [0, 1], [0, 2], [1, 1]],
};
Tetromino.L = {
    color: "orange",
    blocks: [[0, 0], [0, 1], [0, 2], [1, 2]],
};
Tetromino.J = {
    color: "blue",
    blocks: [[1, 0], [1, 1], [1, 2], [0, 2]],
};
Tetromino.O = {
    color: "gold",
    blocks: [[0, 0], [1, 0], [0, 1], [1, 1]],
};
Tetromino.I = {
    color: "dodgerblue",
    blocks: [[-1, 0], [0, 0], [1, 0], [2, 0]],
};
