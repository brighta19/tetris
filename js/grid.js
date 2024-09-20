class Grid {
    static EMPTY_BLOCK = 0;
    static NUM_OF_ROWS = 22;
    static NUM_OF_COLS = 10;
    static NUM_OF_HIDDEN_ROWS = 2;

    constructor() {
        this.grid = [];
        this.numOfRowsCleared = 0;

        this.reset();
        // Grid.Setups.setup6(this.grid);
    }

    reset() {
        for (let y = 0; y < Grid.NUM_OF_ROWS; y++) {
            this.grid[y] = [];
            for (let x = 0; x < Grid.NUM_OF_COLS; x++) {
                this.grid[y][x] = Grid.EMPTY_BLOCK;
            }
        }
    }

    attemptToClearRows() {
        let y = this.grid.length - 1;
        this.numOfRowsCleared = 0;

        while (y >= 0) {
            if (this.isRowComplete(y)) {
                this.numOfRowsCleared++;
                this.grid.splice(y, 1);
                this.grid.unshift([]);

                for (let x = 0; x < Grid.NUM_OF_COLS; x++) {
                    this.grid[0][x] = Grid.EMPTY_BLOCK;
                }

            }
            else {
                y--;
            }
        }
    }

    isCellWithinBoundsAndEmpty(x, y) {
        return this.isCellWithinBounds(x, y) && this.isCellEmpty(x, y);
    }

    isCellEmpty(x, y) {
        return this.grid[y][x] == Grid.EMPTY_BLOCK;
    }

    isCellWithinBounds(x, y) {
        return (y >= 0 && y < Grid.NUM_OF_ROWS) &&
            (x >= 0 && x < Grid.NUM_OF_COLS);
    }

    isRowComplete(y) {
        return this.grid[y].indexOf(Grid.EMPTY_BLOCK) < 0;
    }

    setBlock(x, y, color) {
        this.grid[y][x] = color;
    }

    getBlock(x, y) {
        return this.grid[y][x];
    }
}

Grid.Setups = class {
    static setup1(grid) {
        console.log("Setup T-Spin Triple (1/2 kicks) test");

        const b = "black";
        const reverse = Math.random() > 0.5;
        const r = Math.random() > 0.5 ? b : 0; // true = +2kicks, false = +1kick

        grid[Grid.NUM_OF_ROWS - 6] =  [0, 0, 0, 0, 0, r, 0, 0, b, 0][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 5] =  [0, 0, 0, 0, 0, r, 0, 0, b, 0][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 4] =  [0, 0, 0, 0, 0, r, 0, 0, 0, b][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 3] =  [b, b, b, b, b, b, b, b, 0, b][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 2] =  [b, b, b, b, b, b, b, 0, 0, b][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 1] =  [b, b, b, b, b, b, b, b, 0, b][reverse ? "reverse" : "slice"]();
    }

    static setup2(grid) {
        console.log("Setup T-Spin Double / T-Spin Single / T-Spin Mini Single test");

        const b = "black";
        const r = Math.random() > 0.5 ? b : 0; // either
        const s = r == b ? 0 : b; // or
        const reverse = Math.random() > 0.5;

        grid[Grid.NUM_OF_ROWS - 3] =  [0, 0, 0, 0, 0, 0, 0, r, 0, s][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 2] =  [b, b, b, b, b, b, b, 0, 0, 0][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 1] =  [b, b, b, b, b, b, b, b, 0, b][reverse ? "reverse" : "slice"]();
    }

    static setup3(grid) {
        console.log("Setup T-Spin Single (0/1 kick) / T-Spin Mini Single (0/1 kick) / T-Spin Mini (0/1 kick) test");

        const b = "black";
        const r = Math.random() > 0.5 ? b : 0; // either
        const s = r == b ? 0 : b; // or
        const reverse = Math.random() > 0.5;

        grid[Grid.NUM_OF_ROWS - 3] =  [0, 0, 0, 0, 0, 0, b, b, 0, 0][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 2] =  [0, 0, 0, 0, 0, 0, b, 0, 0, 0][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 1] =  [b, b, b, b, b, b, b, b, 0, b][reverse ? "reverse" : "slice"]();
    }

    static setup4(grid) {
        console.log("Setup T-Spin Double (2 kicks) / T-Spin Mini Single (3 kicks) / T-Spin Mini Double (4 kicks) test");

        const b = "black";
        const reverse = Math.random() > 0.5;

        grid[Grid.NUM_OF_ROWS - 6] =  [0, 0, 0, 0, 0, b, 0, 0, b, 0][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 5] =  [0, 0, 0, 0, 0, b, 0, 0, b, 0][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 4] =  [0, 0, 0, 0, 0, b, 0, 0, 0, b][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 3] =  [b, b, b, b, b, b, b, b, 0, b][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 2] =  [b, b, b, b, b, b, b, 0, 0, b][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 1] =  [b, b, b, b, b, b, 0, 0, 0, b][reverse ? "reverse" : "slice"]();
    }

    static setup5(grid) {
        console.log("Setup T-Spin Mini Single (1kick) test");

        const b = "black";
        const reverse = Math.random() > 0.5;

        grid[Grid.NUM_OF_ROWS - 2] =  [0, 0, 0, 0, 0, 0, 0, b, 0, 0][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 1] =  [b, b, b, b, b, b, b, 0, 0, 0][reverse ? "reverse" : "slice"]();
    }

    static setup6(grid) {
        console.log("Setup T-Spin Mini Double (1kick) test");

        const b = "black";
        const r = Math.random() > 0.5 ? b : 0; // either
        const s = r == b ? 0 : b; // or
        const reverse = Math.random() > 0.5;

        grid[Grid.NUM_OF_ROWS - 6] =  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 5] =  [0, 0, 0, 0, 0, 0, 0, 0, b, b][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 4] =  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 3] =  [0, 0, 0, 0, 0, 0, 0, 0, 0, r][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 2] =  [b, b, b, b, b, b, b, s, 0, r][reverse ? "reverse" : "slice"]();
        grid[Grid.NUM_OF_ROWS - 1] =  [b, b, b, b, b, b, b, b, s, r][reverse ? "reverse" : "slice"]();
    }


    static setupCombo(grid) {
        console.log("Setup combo test")

        for (let y = Grid.NUM_OF_HIDDEN_ROWS + 3; y < Grid.NUM_OF_ROWS; y++) {
            for (let x = 0; x < Grid.NUM_OF_COLS - 2; x++) {
                grid[y][x] = "black";
            }
        }
    }
};
