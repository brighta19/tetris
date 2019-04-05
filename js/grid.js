function Grid() {
    this.rows = 20;
    this.cols = 10;
    
    this.init = function () {
        this.grid = [];
        
        for (var y = 0; y < this.rows; y++) {
            this.grid[y] = [];
            for (var x = 0; x < this.cols; x++) {
                this.grid[y][x] = 0;
            }
        }
    };
    
    this.setBlock = function (x, y, color) {
        this.grid[y][x] = color;
    }
    
    this.getBlock = function (x, y) {
        return this.grid[y][x];
    };
}
