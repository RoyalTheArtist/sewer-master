export class Timer {
    private time = 0
    private targetTime = 0
    private isRunning = false

    get done() { return this.time >= this.targetTime  }
    get running() { return this.isRunning }
    update(delta: number) {
        if (!this.isRunning) return
        this.time += delta
        if (this.time > this.targetTime) this.isRunning = false
    }
    get elapsed() { return this.time }

    start(millesecond: number) {
        this.time = 0
        this.targetTime = millesecond
        this.isRunning = true
    }
}
