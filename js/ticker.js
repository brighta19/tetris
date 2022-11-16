class Ticker {
    constructor(maxTicks) {
        this.maxTicks = maxTicks;
        this.ticks = 0;
    }

    isDone() {
        return this.ticks >= Math.ceil(this.maxTicks);
    }

    tick() {
        this.ticks++;
    }

    reset() {
        this.ticks = 0;
    }
}
