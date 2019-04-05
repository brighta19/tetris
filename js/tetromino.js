function Tetromino(tetrimino) {
    this.color = tetrimino.color;
    this.rotation = 0;
    this.blocks = tetrimino.blocks;
    this.x = 4;
    this.y = 0;
    
    this.translateBlocks = function (x, y) {
        this.x += x;
        this.y += y;
    };
    
    this.rotateBlocks = function (x) {
        this.rotation += x;
        
        if (this.rotation > this.blocks.length - 1)
            this.rotation = 0;
        if (this.rotation < 0)
            this.rotation = this.blocks.length - 1;
    };
    
    this.getTranslatedBlocks = function (x, y, rot) {
        var rotation = rot || this.rotation,
            blocks = [];
        
        for (var i = 0; i < this.blocks[rotation].length; i++) {
            var block = this.blocks[rotation][i];
            blocks[i] = {
                x: block[0] + this.x + x,
                y: block[1] + this.y + y,
            };
        }
        
        return blocks;
    };
    
    this.getRotatedBlocks = function (x) {
        var rotation = this.rotation + x;
        
        if (rotation > this.blocks.length - 1)
            rotation = 0;
        if (rotation < 0)
            rotation = this.blocks.length - 1;
            
        return this.getTranslatedBlocks(0, 0, rotation);
    };
    
    this.getBlocks = function () {
        return this.getTranslatedBlocks(0, 0);
    };
}

Tetromino.Z = {
    color: "red",
    blocks: [
        [[0, 0], [1, 0], [1, 1], [2, 1]],
        [[2, 0], [2, 1], [1, 1], [1, 2]],
        [[0, 1], [1, 1], [1, 2], [2, 2]],
        [[1, 0], [1, 1], [0, 1], [0, 2]],
    ],
};
Tetromino.S = {
    color: "lime",
    blocks: [
        [[0, 1], [1, 1], [1, 0], [2, 0]],
        [[1, 0], [1, 1], [2, 1], [2, 2]],
        [[0, 2], [1, 2], [1, 1], [2, 1]],
        [[0, 0], [0, 1], [1, 1], [1, 2]],
    ],
};
Tetromino.T = {
    color: "purple",
    blocks: [
        [[0, 1], [1, 0], [2, 1], [1, 1]],
        [[1, 0], [2, 1], [1, 2], [1, 1]],
        [[2, 1], [1, 2], [0, 1], [1, 1]],
        [[1, 2], [0, 1], [1, 0], [1, 1]],
    ],
};
Tetromino.L = {
    color: "orange",
    blocks: [
        [[0, 1], [1, 1], [2, 1], [2, 0]],
        [[1, 0], [1, 1], [1, 2], [2, 2]],
        [[0, 2], [0, 1], [1, 1], [2, 1]],
        [[0, 0], [1, 0], [1, 1], [1, 2]],
    ],
};
Tetromino.J = {
    color: "darkblue",
    blocks: [
        [[0, 0], [0, 1], [1, 1], [2, 1]],
        [[2, 0], [1, 0], [1, 1], [1, 2]],
        [[0, 1], [1, 1], [2, 1], [2, 2]],
        [[1, 0], [1, 1], [1, 2], [0, 2]],
    ],
};
Tetromino.O = {
    color: "gold",
    blocks: [
        [[0, 0], [1, 0], [0, 1], [1, 1]]
    ],
};
Tetromino.I = {
    color: "dodgerblue",
    blocks: [
        [[0, 1], [1, 1], [2, 1], [3, 1]],
        [[2, 0], [2, 1], [2, 2], [2, 3]],
        [[0, 2], [1, 2], [2, 2], [3, 2]],
        [[1, 0], [1, 1], [1, 2], [1, 3]],
    ],
};
