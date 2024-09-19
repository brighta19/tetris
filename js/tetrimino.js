class Tetrimino {
    static Types = {
        I: "I",
        O: "O",
        T: "T",
        L: "L",
        J: "J",
        S: "S",
        Z: "Z"
    };
    static Orientation = {
        DEFAULT: 0,
        RIGHT: 1,
        DOWN: 2,
        LEFT: 3,
    }
    static Direction = {
        CLOCKWISE: 1,
        NONE: 0,
        COUNTER_CLOCKWISE: -1,
    };
    static Properties = {
        [Tetrimino.Types.Z]: {
            color: "red",
            blocks: [
                [[0, 0], [1, 0], [1, 1], [2, 1]],
                [[2, 0], [2, 1], [1, 1], [1, 2]],
                [[0, 1], [1, 1], [1, 2], [2, 2]],
                [[1, 0], [1, 1], [0, 1], [0, 2]],
            ],
        },
        [Tetrimino.Types.S]: {
            color: "lime",
            blocks: [
                [[0, 1], [1, 1], [1, 0], [2, 0]],
                [[1, 0], [1, 1], [2, 1], [2, 2]],
                [[0, 2], [1, 2], [1, 1], [2, 1]],
                [[0, 0], [0, 1], [1, 1], [1, 2]],
            ],
        },
        [Tetrimino.Types.T]: {
            color: "purple",
            blocks: [
                [[0, 1], [1, 0], [2, 1], [1, 1]],
                [[1, 0], [2, 1], [1, 2], [1, 1]],
                [[2, 1], [1, 2], [0, 1], [1, 1]],
                [[1, 2], [0, 1], [1, 0], [1, 1]],
            ],
        },
        [Tetrimino.Types.L]: {
            color: "orange",
            blocks: [
                [[0, 1], [1, 1], [2, 1], [2, 0]],
                [[1, 0], [1, 1], [1, 2], [2, 2]],
                [[0, 2], [0, 1], [1, 1], [2, 1]],
                [[0, 0], [1, 0], [1, 1], [1, 2]],
            ],
        },
        [Tetrimino.Types.J]: {
            color: "darkblue",
            blocks: [
                [[0, 0], [0, 1], [1, 1], [2, 1]],
                [[2, 0], [1, 0], [1, 1], [1, 2]],
                [[0, 1], [1, 1], [2, 1], [2, 2]],
                [[1, 0], [1, 1], [1, 2], [0, 2]],
            ],
        },
        [Tetrimino.Types.O]: {
            color: "gold",
            blocks: [
                [[1, 0], [2, 0], [1, 1], [2, 1]],
                [[1, 0], [2, 0], [1, 1], [2, 1]],
                [[1, 0], [2, 0], [1, 1], [2, 1]],
                [[1, 0], [2, 0], [1, 1], [2, 1]],
            ],
        },
        [Tetrimino.Types.I]: {
            color: "dodgerblue",
            blocks: [
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                [[2, 0], [2, 1], [2, 2], [2, 3]],
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                [[1, 0], [1, 1], [1, 2], [1, 3]],
            ],
        }
    };
    static Kicks = {
        I: {
            DEFAULT_TO_RIGHT: [ [-2, 0], [1, 0], [-2, 1], [1, -2] ],
            RIGHT_TO_DEFAULT: [ [2, 0], [-1, 0], [2, -1], [-1, 2] ],
            RIGHT_TO_DOWN: [ [-1, 0], [2, 0], [-1, -2], [2, 1] ],
            DOWN_TO_RIGHT: [ [1, 0], [-2, 0], [1, 2], [-2, -1] ],
            DOWN_TO_LEFT: [ [2, 0], [-1, 0], [2, -1], [-1, 2] ],
            LEFT_TO_DOWN: [ [-2, 0], [1, 0], [-2, 1], [1, -2] ],
            LEFT_TO_DEFAULT: [ [1, 0], [-2, 0], [1, 2], [-2, -1] ],
            DEFAULT_TO_LEFT: [ [-1, 0], [2, 0], [-1, -2], [2, 1] ],
        },
        Other: {
            DEFAULT_TO_RIGHT: [ [-1, 0], [-1, -1], [0, 2], [-1, 2] ],
            RIGHT_TO_DEFAULT: [ [1, 0], [1, 1], [0, -2], [1, -2] ],
            RIGHT_TO_DOWN: [ [1, 0], [1, 1], [0, -2], [1, -2] ],
            DOWN_TO_RIGHT: [ [-1, 0], [-1, -1], [0, 2], [-1, 2] ],
            DOWN_TO_LEFT: [ [1, 0], [1, -1], [0, 2], [1, 2] ],
            LEFT_TO_DOWN: [ [-1, 0], [-1, 1], [0, -2], [1, -2] ],
            LEFT_TO_DEFAULT: [ [-1, 0], [-1, 1], [0, -2], [-1, -2] ],
            DEFAULT_TO_LEFT: [ [1, 0], [1, -1], [0, 2], [1, 2] ],
        }
    };
    static TSpins = {
        REGULAR: 0,
        MINI: 1,
    };

    static getAllTypes() {
        return [
            Tetrimino.Types.I,
            Tetrimino.Types.O,
            Tetrimino.Types.T,
            Tetrimino.Types.L,
            Tetrimino.Types.J,
            Tetrimino.Types.S,
            Tetrimino.Types.Z,
        ];
    }

    static clone(tetrimino) {
        return new Tetrimino(tetrimino.x,tetrimino.y,tetrimino.type,tetrimino.orientation);
    }

    constructor(x, y, type, orientation = Tetrimino.Orientation.DEFAULT) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.orientation = orientation;

        this.color = Tetrimino.Properties[this.type].color;
    }

    get blocks() {
        let blocks = Tetrimino.Properties[this.type].blocks[this.orientation];

        return blocks.map(block => [
            block[0] + this.x,
            block[1] + this.y
        ]);
    }

    move(x, y) {
        this.x += x;
        this.y += y;
    }

    rotate(direction) {
        this.orientation += direction;

        if (this.orientation < Tetrimino.Orientation.DEFAULT)
            this.orientation = Tetrimino.Orientation.LEFT;
        if (this.orientation > Tetrimino.Orientation.LEFT)
            this.orientation = Tetrimino.Orientation.DEFAULT;
    }
}
