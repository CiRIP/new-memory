class StatTracker {
    ongoing = 0;
    started = 0;
    completed = 0;
    longest = 0;
    fastest = 0;

    since;

    constructor() {
        this.since = Date.now();
    }
}

module.exports = StatTracker;
