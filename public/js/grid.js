function Grid() {
    const EMPTY_BLOCK = 0;

    this.numOfRows = 20;
    this.numOfCols = 10;
    this.grid = [];
    this.numOfRowsCleared = 0;
    
    
    for (var y = 0; y < this.numOfRows; y++) {
        this.grid[y] = [];
        for (var x = 0; x < this.numOfCols; x++) {
            this.grid[y][x] = EMPTY_BLOCK;
        }
    }
    

    this.attemptToClearRow = function () {
        var y = this.grid.length - 1;
        this.numOfRowsCleared = 0;
        
        while (y >= 0) {
            if (this.isRowComplete(y)) {
                this.numOfRowsCleared++;
                this.grid.splice(y, 1);
                this.grid.unshift([]);

                for (var x = 0; x < this.numOfCols; x++) {
                    this.grid[0][x] = EMPTY_BLOCK;
                }
                
            }
            else {
                y--;
            }
        }
    };
    
    this.isEmpty = function (x, y) {
        return (y >= 0 && y < this.numOfRows) &&
            (x >= 0 && x < this.numOfCols) &&
            this.grid[y][x] == EMPTY_BLOCK;
    };
    
    this.isRowComplete = function (y) {
        return this.grid[y].indexOf(EMPTY_BLOCK) < 0;
    };
    
    this.setBlock = function (x, y, color) {
        this.grid[y][x] = color;
    };
    
    this.getBlock = function (x, y) {
        return this.grid[y][x];
    };
}
