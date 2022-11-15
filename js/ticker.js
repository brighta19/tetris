function Ticker(maxTicks) {
    this.maxTicks = maxTicks;
    this.ticks = 0;
    
    this.isDone = function () {
        return this.ticks >= Math.ceil(this.maxTicks);
    };
    
    this.tick = function () {
        this.ticks++;
    };
    
    this.reset = function () {
        this.ticks = 0;
    };
}
