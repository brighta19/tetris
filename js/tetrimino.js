function Tetrimino(type) {
    this.x = 3;
    this.y = 0;
    this.type = type;
    this.rotation = 0;
    
    
    this.move = function (x, y) {
        this.x += x;
        this.y += y;
    };
    
    this.rotate = function (r) {
        this.rotation += r;

        if (this.rotation < Tetrimino.Rotations.DEFAULT)
            this.rotation = Tetrimino.Rotations.LEFT;
        if (this.rotation > Tetrimino.Rotations.LEFT)
            this.rotation = Tetrimino.Rotations.DEFAULT;
    };
}
Tetrimino.getAllTypes = function () {
    return [
        Tetrimino.Types.I,
        Tetrimino.Types.O,
        Tetrimino.Types.T,
        Tetrimino.Types.L,
        Tetrimino.Types.J,
        Tetrimino.Types.S,
        Tetrimino.Types.Z,
    ];
};

Tetrimino.Types = {
    I: "I",
    O: "O",
    T: "T",
    L: "L",
    J: "J",
    S: "S",
    Z: "Z"
};
Tetrimino.Rotations = {
    DEFAULT: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
}
Tetrimino.Direction = {
    CLOCKWISE: 1,
    COUNTER_CLOCKWISE: -1,
};
Tetrimino.Properties = {
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
