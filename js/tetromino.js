class Tetromino {
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
        [Tetromino.Types.Z]: {
            color: "red",
            blocks: [
                [[0, 0], [1, 0], [1, 1], [2, 1]],
                [[2, 0], [2, 1], [1, 1], [1, 2]],
                [[0, 1], [1, 1], [1, 2], [2, 2]],
                [[1, 0], [1, 1], [0, 1], [0, 2]],
            ],
        },
        [Tetromino.Types.S]: {
            color: "lime",
            blocks: [
                [[0, 1], [1, 1], [1, 0], [2, 0]],
                [[1, 0], [1, 1], [2, 1], [2, 2]],
                [[0, 2], [1, 2], [1, 1], [2, 1]],
                [[0, 0], [0, 1], [1, 1], [1, 2]],
            ],
        },
        [Tetromino.Types.T]: {
            color: "purple",
            blocks: [
                [[0, 1], [1, 0], [2, 1], [1, 1]],
                [[1, 0], [2, 1], [1, 2], [1, 1]],
                [[2, 1], [1, 2], [0, 1], [1, 1]],
                [[1, 2], [0, 1], [1, 0], [1, 1]],
            ],
        },
        [Tetromino.Types.L]: {
            color: "orange",
            blocks: [
                [[0, 1], [1, 1], [2, 1], [2, 0]],
                [[1, 0], [1, 1], [1, 2], [2, 2]],
                [[0, 2], [0, 1], [1, 1], [2, 1]],
                [[0, 0], [1, 0], [1, 1], [1, 2]],
            ],
        },
        [Tetromino.Types.J]: {
            color: "darkblue",
            blocks: [
                [[0, 0], [0, 1], [1, 1], [2, 1]],
                [[2, 0], [1, 0], [1, 1], [1, 2]],
                [[0, 1], [1, 1], [2, 1], [2, 2]],
                [[1, 0], [1, 1], [1, 2], [0, 2]],
            ],
        },
        [Tetromino.Types.O]: {
            color: "gold",
            blocks: [
                [[1, 0], [2, 0], [1, 1], [2, 1]],
                [[1, 0], [2, 0], [1, 1], [2, 1]],
                [[1, 0], [2, 0], [1, 1], [2, 1]],
                [[1, 0], [2, 0], [1, 1], [2, 1]],
            ],
        },
        [Tetromino.Types.I]: {
            color: "dodgerblue",
            blocks: [
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                [[2, 0], [2, 1], [2, 2], [2, 3]],
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                [[1, 0], [1, 1], [1, 2], [1, 3]],
            ],
        }
    };
    static WallKicks = {
        I: {
            [Tetromino.Orientation.DEFAULT]: {
                [Tetromino.Direction.CLOCKWISE]: [ [-2, 0], [1, 0], [-2, 1], [1, -2] ],
                [Tetromino.Direction.COUNTER_CLOCKWISE]: [ [-1, 0], [2, 0], [-1, -2], [2, 1] ]
            },
            [Tetromino.Orientation.RIGHT]: {
                [Tetromino.Direction.CLOCKWISE]: [ [-1, 0], [2, 0], [-1, -2], [2, 1] ],
                [Tetromino.Direction.COUNTER_CLOCKWISE]: [ [2, 0], [-1, 0], [2, -1], [-1, 2] ]
            },
            [Tetromino.Orientation.DOWN]: {
                [Tetromino.Direction.CLOCKWISE]: [ [2, 0], [-1, 0], [2, -1], [-1, 2] ],
                [Tetromino.Direction.COUNTER_CLOCKWISE]: [ [1, 0], [-2, 0], [1, 2], [-2, -1] ]
            },
            [Tetromino.Orientation.LEFT]: {
                [Tetromino.Direction.CLOCKWISE]: [ [1, 0], [-2, 0], [1, 2], [-2, -1] ],
                [Tetromino.Direction.COUNTER_CLOCKWISE]: [ [-2, 0], [1, 0], [-2, 1], [1, -2] ]
            },
        },
        Other: {
            [Tetromino.Orientation.DEFAULT]: {
                [Tetromino.Direction.CLOCKWISE]: [ [-1, 0], [-1, -1], [0, 2], [-1, 2] ],
                [Tetromino.Direction.COUNTER_CLOCKWISE]: [ [1, 0], [1, -1], [0, 2], [1, 2] ]
            },
            [Tetromino.Orientation.RIGHT]: {
                [Tetromino.Direction.CLOCKWISE]: [ [1, 0], [1, 1], [0, -2], [1, -2] ],
                [Tetromino.Direction.COUNTER_CLOCKWISE]: [ [1, 0], [1, 1], [0, -2], [1, -2] ]
            },
            [Tetromino.Orientation.DOWN]: {
                [Tetromino.Direction.CLOCKWISE]: [ [1, 0], [1, -1], [0, 2], [1, 2] ],
                [Tetromino.Direction.COUNTER_CLOCKWISE]: [ [-1, 0], [-1, -1], [0, 2], [-1, 2] ]
            },
            [Tetromino.Orientation.LEFT]: {
                [Tetromino.Direction.CLOCKWISE]: [ [-1, 0], [-1, 1], [0, -2], [-1, -2] ],
                [Tetromino.Direction.COUNTER_CLOCKWISE]: [ [-1, 0], [-1, 1], [0, -2], [1, -2] ]
            },
        },
    };
    static TSpins = {
        REGULAR: 0,
        MINI: 1,
    };

    static getAllTypes() {
        return [
            Tetromino.Types.I,
            Tetromino.Types.O,
            Tetromino.Types.T,
            Tetromino.Types.L,
            Tetromino.Types.J,
            Tetromino.Types.S,
            Tetromino.Types.Z,
        ];
    }

    static clone(tetromino) {
        return new Tetromino(tetromino.x,tetromino.y,tetromino.type,tetromino.orientation);
    }

    constructor(x, y, type, orientation = Tetromino.Orientation.DEFAULT) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.orientation = orientation;

        this.color = Tetromino.Properties[this.type].color;
    }

    get blocks() {
        let blocks = Tetromino.Properties[this.type].blocks[this.orientation];

        return blocks.map(block => [
            block[0] + this.x,
            block[1] + this.y
        ]);
    }

    getWallKicks(intendedRotationDirection) {
        switch (this.type) {
            case Tetromino.Types.O:
                return [];
            case Tetromino.Types.I:
                return Tetromino.WallKicks.I[this.orientation][intendedRotationDirection];
            default:
                return Tetromino.WallKicks.Other[this.orientation][intendedRotationDirection];
        }
    }

    move(x, y) {
        this.x += x;
        this.y += y;
    }

    rotate(direction) {
        this.orientation += direction;

        if (this.orientation < Tetromino.Orientation.DEFAULT)
            this.orientation = Tetromino.Orientation.LEFT;
        if (this.orientation > Tetromino.Orientation.LEFT)
            this.orientation = Tetromino.Orientation.DEFAULT;
    }
}
