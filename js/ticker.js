function Ticker(maxTicks) {
    this.maxTicks = maxTicks;
    
    this.isDone = function () {
        return this.ticks == undefined || this.ticks >= this.maxTicks;
    };
    
    this.tick = function () {
        this.ticks++;
    };
    
    this.reset = function () {
        this.ticks = 0;
    };
}
