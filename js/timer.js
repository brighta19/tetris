function Timer(duration) {
    this.duration = duration;
    
    this.isDone = function () {
        return this.startTime == undefined || (Date.now() - this.startTime) >= duration;
    };
    
    this.reset = function () {
        this.startTime = Date.now();
    };
}
