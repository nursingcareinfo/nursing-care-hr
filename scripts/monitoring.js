/**
 * Monitoring System
 * Tracks workflow performance and data accuracy metrics.
 */

class MonitoringSystem {
    constructor() {
        this.stats = {
            totalProcessed: 0,
            successful: 0,
            failed: 0,
            accuracyHits: 0 // Records processed without manual correction
        };
    }

    recordSuccess(isCleanFirstPass = true) {
        this.stats.totalProcessed++;
        this.stats.successful++;
        if (isCleanFirstPass) this.stats.accuracyHits++;
    }

    recordFailure() {
        this.stats.totalProcessed++;
        this.stats.failed++;
    }

    getReport() {
        const accuracyRate = (this.stats.accuracyHits / this.stats.successful * 100) || 0;
        const successRate = (this.stats.successful / this.stats.totalProcessed * 100) || 0;

        return {
            ...this.stats,
            successRate: `${successRate.toFixed(2)}%`,
            accuracyRate: `${accuracyRate.toFixed(2)}%`
        };
    }
}

module.exports = new MonitoringSystem();
