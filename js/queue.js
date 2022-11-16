class Queue {
    constructor() {
        this.queue = [];
    }

    generateNextSet() {
        var types = Tetrimino.getAllTypes();

        while (types.length > 0) {
            var randomIndex = Math.floor(Math.random() * types.length);

            this.queue.push(types[randomIndex]);
            types.splice(randomIndex, 1);
        }
    }

    getNextThree() {
        if (this.queue.length < 3)
            this.generateNextSet();

        return [this.queue[0], this.queue[1], this.queue[2]];
    }

    getNextTetriminoType() {
        if (this.queue.length == 0)
            this.generateNextSet();

        return this.queue.splice(0, 1)[0];
    }
}
