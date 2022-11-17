class Grid {
    static EMPTY_BLOCK = 0;
    static NUM_OF_ROWS = 22;
    static NUM_OF_COLS = 10;
    static NUM_OF_HIDDEN_ROWS = 2;

    constructor() {
        this.grid = [];
        this.numOfRowsCleared = 0;

        this.reset();
    }

    reset() {
        for (let y = 0; y < Grid.NUM_OF_ROWS; y++) {
            this.grid[y] = [];
            for (let x = 0; x < Grid.NUM_OF_COLS; x++) {
                this.grid[y][x] = Grid.EMPTY_BLOCK;
            }
        }
    }

    attemptToClearRow() {
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

    isWithinBoundsAndEmpty(x, y) {
        return this.isWithinBounds(x, y) && this.isEmpty(x, y);
    }

    isEmpty(x, y) {
        return this.grid[y][x] == Grid.EMPTY_BLOCK;
    }

    isWithinBounds(x, y) {
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
