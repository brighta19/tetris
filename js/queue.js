function Queue() {
    this.queue = [];
    
    this.generateNextSet = function () {
        var types = Tetrimino.getAllTypes();

        while (types.length > 0) {
            var randomIndex = Math.floor(Math.random() * types.length);
            
            this.queue.push(types[randomIndex]);
            types.splice(randomIndex, 1);
        }
    };
    
    this.getNextThree = function () {
        if (this.queue.length < 3)
            this.generateNextSet();
        
        return [ this.queue[0], this.queue[1], this.queue[2] ];
    };
    
    this.getNextTetriminoType = function () {
        if (this.queue.length == 0)
            this.generateNextSet();

        return this.queue.splice(0, 1)[0];
    };
}
