const moment = require('moment');

class TimeTrackingManager {
    round(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    getDiffDays(startDate, endDate) {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const diffDays = Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / (oneDay)));
        return diffDays;
    }

    isWeekend(date) {
        return date.getDay() == 6 || date.getDay() == 0;
    }

    getWeekendsCount(startDate, endDate) {
        let weekendsCount = 0;
        for (let date = new Date(startDate.getTime()); date <= endDate; date.setDate(date.getDate() + 1)) {
            if (this.isWeekend(date)) {
                weekendsCount += 1;
            }
        }
        return weekendsCount;
    }

    getIdealBurnData(average, estimatedItemsTotal, startDate, endDate) {
        const idealBurnData = [estimatedItemsTotal]; // add estimation for the first day
        const nextDayStartDate = new Date(startDate.getTime());
        nextDayStartDate.setDate(nextDayStartDate.getDate() + 1);
        for (let date = nextDayStartDate; date < endDate; date.setDate(date.getDate() + 1)) {
            if (this.isWeekend(date)) {
                idealBurnData.push(estimatedItemsTotal);
                continue;
            }
            estimatedItemsTotal -= average;
            idealBurnData.push(this.round(estimatedItemsTotal, 2));
        }

        if (estimatedItemsTotal >= 0) {
            idealBurnData.push(0);
        }
        return idealBurnData;
    }
    
    getItemsSnapshot(defects, startDate, endDate) {
        const estimatedItemsTotal = this.getEstimatedItemsTotal(defects);
        const average = this.round(estimatedItemsTotal /
            (this.getDiffDays(startDate, endDate) - this.getWeekendsCount(startDate, endDate)), 2);
        const idealBurnData = this.getIdealBurnData(average, estimatedItemsTotal, startDate, endDate);
        const workLeft = this.getWorkLeft(defects);

        return {
            workLeft,
            idealBurnData,
            estimatedItemsTotal
        }
    }

    // diff
    getEstimatedItemsTotal(defects) {

        // convertation from w1d3h4 format to hours
        const estimatedItems = defects
            .map(item => item.EstimatedMinutes);

        const estimatedItemsTotal = estimatedItems
            .reduce((sum, item) => sum + item, 0);

        return estimatedItemsTotal;
    }

    // diff
    getWorkLeft(defects) {
        const estimatedItemsTotal = this.getEstimatedItemsTotal(defects);

        const burnedMinutes = defects
            .filter(item => item.EstimatedMinutes);

        const doneItemsTotal = burnedMinutes
            .reduce((sum, item) => sum + item, 0);

        const workLeft = estimatedItemsTotal - doneItemsTotal;
        return workLeft;
    }

    getBurnDownChartData(defects, stats, startDate, endDate) {
        const defectsSnapshot = this.getItemsSnapshot(defects, startDate, endDate);
        const actualBurnData = [];
        const days = [];

        for (let date = new Date(startDate.getTime()); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateKey = date.toISOString().split('T')[0];
            const todayKey = new Date().toISOString().split('T')[0];
            const currentStat = stats.find(item => { return item.date === dateKey });

            if (dateKey === todayKey) {
                // use more up to date data
                actualBurnData.push(defectsSnapshot.workLeft);
            } else {
                actualBurnData.push(currentStat ? currentStat.workLeft : null);
            }

            days.push(`${date.getDate()}/${date.getMonth() + 1}`);
        }
        return {
            days,
            idealBurnData: defectsSnapshot.idealBurnData,
            actualBurnData
        };
    }
}

module.exports = new TimeTrackingManager();