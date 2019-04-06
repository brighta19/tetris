function Grid() {
    this.rows = 20;
    this.cols = 10;
    
    this.init = function (blockSize) {
        this.grid = [];
        this.blockSize = blockSize;
        
        for (var y = 0; y < this.rows; y++) {
            this.grid[y] = [];
            for (var x = 0; x < this.cols; x++) {
                this.grid[y][x] = 0;
            }
        }
        
        this.width = this.cols * this.blockSize;
        this.height = this.rows * this.blockSize;
    };
    
    this.tryClearingLines = function () {
        var i = this.grid.length - 1;
        while (i >= 0) {
            if (this.grid[i].indexOf(0) < 0) {
                this.grid.splice(i, 1);
                
                this.grid.unshift([]);
                for (var x = 0; x < this.cols; x++) {
                    this.grid[0][x] = 0;
                }
            }
            else {
                i--;
            }
        }
    };
    
    this.setBlock = function (x, y, color) {
        this.grid[y][x] = color;
    };
    
    this.getBlock = function (x, y) {
        return this.grid[y][x];
    };
}
