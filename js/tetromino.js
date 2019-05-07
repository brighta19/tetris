function Tetromino(tetrimino) {
    this.type = tetrimino.type;
    this.color = tetrimino.color;
    this.blocks = tetrimino.blocks;
    this.rotation = 0;
    this.x = 4;
    this.y = 0;
    
    this.translateBlocks = function (x, y) {
        this.x += x;
        this.y += y;
    };
    
    this.rotateBlocks = function (rot) {
        var rotation = this.rotation + rot;
        
        if (rotation > this.blocks.length - 1)
            rotation = 0;
        if (rotation < 0)
            rotation = this.blocks.length - 1;
            
        this.rotation = rotation;
    };
    
    this.getTranslatedBlocks = function (x, y, rot) {
        var rotation = this.rotation,
            blocks = [];
        
        if (rot != undefined)
            rotation += rot;
        
        if (rotation > this.blocks.length - 1)
            rotation = 0;
        if (rotation < 0)
            rotation = this.blocks.length - 1;
        
        for (var i = 0; i < this.blocks[rotation].length; i++) {
            var block = this.blocks[rotation][i];
            blocks[i] = {
                x: block[0] + this.x + x,
                y: block[1] + this.y + y,
            };
        }
        
        return blocks;
    };
    
    this.getRotatedBlocks = function (rot) {
        return this.getTranslatedBlocks(0, 0, rot);
    };
    
    this.getBlocks = function () {
        return this.getTranslatedBlocks(0, 0);
    };
}

Tetromino.Z = {
    type: "Z",
    color: "red",
    blocks: [
        [[0, 0], [1, 0], [1, 1], [2, 1]],
        [[2, 0], [2, 1], [1, 1], [1, 2]],
        [[0, 1], [1, 1], [1, 2], [2, 2]],
        [[1, 0], [1, 1], [0, 1], [0, 2]],
    ],
};
Tetromino.S = {
    type: "S",
    color: "lime",
    blocks: [
        [[0, 1], [1, 1], [1, 0], [2, 0]],
        [[1, 0], [1, 1], [2, 1], [2, 2]],
        [[0, 2], [1, 2], [1, 1], [2, 1]],
        [[0, 0], [0, 1], [1, 1], [1, 2]],
    ],
};
Tetromino.T = {
    type: "T",
    color: "purple",
    blocks: [
        [[0, 1], [1, 0], [2, 1], [1, 1]],
        [[1, 0], [2, 1], [1, 2], [1, 1]],
        [[2, 1], [1, 2], [0, 1], [1, 1]],
        [[1, 2], [0, 1], [1, 0], [1, 1]],
    ],
};
Tetromino.L = {
    type: "L",
    color: "orange",
    blocks: [
        [[0, 1], [1, 1], [2, 1], [2, 0]],
        [[1, 0], [1, 1], [1, 2], [2, 2]],
        [[0, 2], [0, 1], [1, 1], [2, 1]],
        [[0, 0], [1, 0], [1, 1], [1, 2]],
    ],
};
Tetromino.J = {
    type: "J",
    color: "darkblue",
    blocks: [
        [[0, 0], [0, 1], [1, 1], [2, 1]],
        [[2, 0], [1, 0], [1, 1], [1, 2]],
        [[0, 1], [1, 1], [2, 1], [2, 2]],
        [[1, 0], [1, 1], [1, 2], [0, 2]],
    ],
};
Tetromino.O = {
    type: "O",
    color: "gold",
    blocks: [
        [[0, 0], [1, 0], [0, 1], [1, 1]]
    ],
};
Tetromino.I = {
    type: "I",
    color: "dodgerblue",
    blocks: [
        [[0, 1], [1, 1], [2, 1], [3, 1]],
        [[2, 0], [2, 1], [2, 2], [2, 3]],
        [[0, 2], [1, 2], [2, 2], [3, 2]],
        [[1, 0], [1, 1], [1, 2], [1, 3]],
    ],
};

Tetromino.getTetrominoes = function () {
    return [
        Tetromino.I,
        Tetromino.J,
        Tetromino.L,
        Tetromino.O,
        Tetromino.S,
        Tetromino.T,
        Tetromino.Z,
    ];
};
