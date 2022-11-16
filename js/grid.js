class Grid {
    static EMPTY_BLOCK = 0;

    constructor() {
        this.numOfRows = 20;
        this.numOfCols = 10;
        this.grid = [];
        this.numOfRowsCleared = 0;

        for (var y = 0; y < this.numOfRows; y++) {
            this.grid[y] = [];
            for (var x = 0; x < this.numOfCols; x++) {
                this.grid[y][x] = Grid.EMPTY_BLOCK;
            }
        }
    }

    attemptToClearRow() {
        var y = this.grid.length - 1;
        this.numOfRowsCleared = 0;

        while (y >= 0) {
            if (this.isRowComplete(y)) {
                this.numOfRowsCleared++;
                this.grid.splice(y, 1);
                this.grid.unshift([]);

                for (var x = 0; x < this.numOfCols; x++) {
                    this.grid[0][x] = Grid.EMPTY_BLOCK;
                }

            }
            else {
                y--;
            }
        }
    }

    isEmpty(x, y) {
        return (y >= 0 && y < this.numOfRows) &&
            (x >= 0 && x < this.numOfCols) &&
            this.grid[y][x] == Grid.EMPTY_BLOCK;
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
