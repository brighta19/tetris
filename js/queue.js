function Queue() {
    this.queue = [];

    this.generateSetOfBlocks = function () {
        var blocks = Tetromino.getTetrominoes();

        while (blocks.length > 0) {
            var randomIndex = Math.floor(Math.random() * blocks.length);
            
            this.queue.push(blocks[randomIndex]);
            blocks.splice(randomIndex, 1);
        }
    };

    this.getNextBlock = function () {
        if (this.queue.length == 0) {
            this.generateSetOfBlocks();
        }

        return this.queue.splice(this.queue.length - 1, 1)[0];
    };
}
