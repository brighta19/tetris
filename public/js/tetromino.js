function Tetromino(type) {
    this.MAX_ROTATION = 3;
    this.Direction = {
        LEFT: 0,
        RIGHT: 1,
    };
    
    this.type = type;
    this.x = 3;
    this.y = 0;
    this.rotation = 0;
    
    
    this.move = function (x, y) {
        this.x += x;
        this.y += y;
    };
    
    this.rotate = function (r) {
        this.rotation += r;

        if (this.rotation < 0)
            this.rotation = this.MAX_ROTATION;
        if (this.rotation > this.MAX_ROTATION)
            this.rotation = 0;
    };
}
Tetromino.getAllTypes = function () {
    return [
        Tetromino.Types.I,
        Tetromino.Types.O,
        Tetromino.Types.T,
        Tetromino.Types.L,
        Tetromino.Types.J,
        Tetromino.Types.S,
        Tetromino.Types.Z,
    ];
};

Tetromino.Types = {
    I: "I",
    O: "O",
    T: "T",
    L: "L",
    J: "J",
    S: "S",
    Z: "Z"
};
Tetromino.Rotations = {
    DEFAULT: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    
    CLOCKWISE: 1,
    COUNTER_CLOCKWISE: -1,
};
Tetromino.Properties = {
    Z: {
        color: "red",
        blocks: [
            [[0, 0], [1, 0], [1, 1], [2, 1]],
            [[2, 0], [2, 1], [1, 1], [1, 2]],
            [[0, 1], [1, 1], [1, 2], [2, 2]],
            [[1, 0], [1, 1], [0, 1], [0, 2]],
        ],
    },
    S: {
        color: "lime",
        blocks: [
            [[0, 1], [1, 1], [1, 0], [2, 0]],
            [[1, 0], [1, 1], [2, 1], [2, 2]],
            [[0, 2], [1, 2], [1, 1], [2, 1]],
            [[0, 0], [0, 1], [1, 1], [1, 2]],
        ],
    },
    T: {
        color: "purple",
        blocks: [
            [[0, 1], [1, 0], [2, 1], [1, 1]],
            [[1, 0], [2, 1], [1, 2], [1, 1]],
            [[2, 1], [1, 2], [0, 1], [1, 1]],
            [[1, 2], [0, 1], [1, 0], [1, 1]],
        ],
    },
    L: {
        color: "orange",
        blocks: [
            [[0, 1], [1, 1], [2, 1], [2, 0]],
            [[1, 0], [1, 1], [1, 2], [2, 2]],
            [[0, 2], [0, 1], [1, 1], [2, 1]],
            [[0, 0], [1, 0], [1, 1], [1, 2]],
        ],
    },
    J: {
        color: "darkblue",
        blocks: [
            [[0, 0], [0, 1], [1, 1], [2, 1]],
            [[2, 0], [1, 0], [1, 1], [1, 2]],
            [[0, 1], [1, 1], [2, 1], [2, 2]],
            [[1, 0], [1, 1], [1, 2], [0, 2]],
        ],
    },
    O: {
        color: "gold",
        blocks: [
            [[1, 0], [2, 0], [1, 1], [2, 1]],
            [[1, 0], [2, 0], [1, 1], [2, 1]],
            [[1, 0], [2, 0], [1, 1], [2, 1]],
            [[1, 0], [2, 0], [1, 1], [2, 1]],
        ],
    },
    I: {
        color: "dodgerblue",
        blocks: [
            [[0, 1], [1, 1], [2, 1], [3, 1]],
            [[2, 0], [2, 1], [2, 2], [2, 3]],
            [[0, 2], [1, 2], [2, 2], [3, 2]],
            [[1, 0], [1, 1], [1, 2], [1, 3]],
        ],
    }

};
