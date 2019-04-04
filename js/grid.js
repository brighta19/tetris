function Grid() {
    this.rows = 15;
    this.cols = 10;
    
    this.init = function () {
        this.grid = [];
        
        for (var y = 0; y < this.cols; y++) {
            this.grid[y] = [];
            for (var x = 0; x < this.rows.length; x++) {
                this.grid[y][x] = 0;
            }
        }
    };
    
    
}
