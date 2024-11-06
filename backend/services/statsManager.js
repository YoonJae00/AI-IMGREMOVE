class StatsManager {
    constructor() {
        this.stats = {
            totalRequests: 0,
            totalImages: 0,
            backgroundRemoval: {
                requests: 0,
                images: 0
            },
            studio: {
                requests: 0,
                images: 1
            }
        };
    }

    incrementBackgroundRemoval(imageCount) {
        this.stats.totalRequests++;
        this.stats.totalImages += imageCount;
        this.stats.backgroundRemoval.requests++;
        this.stats.backgroundRemoval.images += imageCount;
    }

    incrementStudio() {
        this.stats.totalRequests++;
        this.stats.totalImages++;
        this.stats.studio.requests++;
        this.stats.studio.images++;
    }

    getStats() {
        return this.stats;
    }
}

module.exports = new StatsManager();