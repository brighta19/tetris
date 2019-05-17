function Grid() {
    this.EMPTY_BLOCK = 0;

    this.rows = 20;
    this.cols = 10;
    this.grid = [];
    this.blockSize = 25;
    this.linesCleared = [];
    
    
    for (var y = 0; y < this.rows; y++) {
        this.grid[y] = [];
        for (var x = 0; x < this.cols; x++) {
            this.grid[y][x] = this.EMPTY_BLOCK;
        }
    }
    

    this.tryClearingLines = function () {
        var i = this.grid.length - 1;
        this.linesCleared = [];
        
        while (i >= 0) {
            if (this.isLineFull(i)) {
                this.grid.splice(i, 1);
                
                this.grid.unshift([]);
                for (var x = 0; x < this.cols; x++) {
                    this.grid[0][x] = this.EMPTY_BLOCK;
                }
                
                this.linesCleared.push(i);
            }
            else {
                i--;
            }
        }
    };
    
    this.isEmpty = function (x, y) {
        return (y >= 0 && y < this.rows) &&
            (x >= 0 && x < this.cols) &&
            this.grid[y][x] == this.EMPTY_BLOCK;
    };
    
    this.isLineFull = function (y) {
        return this.grid[y].indexOf(this.EMPTY_BLOCK) < 0;
    };
    
    this.setBlock = function (x, y, color) {
        this.grid[y][x] = color;
    };
    
    this.getBlock = function (x, y) {
        return this.grid[y][x];
    };
}
