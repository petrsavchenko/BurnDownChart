const axios = require('axios');

/**
 * Config
 */
const config = require('../config');

const Statistic = require('../models/statistic');


class DefectsManager {
    getIdealBurnData(average, estimatedItemsTotal) {

        const idealBurnData = [];
        idealBurnData.push(estimatedItemsTotal);
        while (estimatedItemsTotal >= average){
            estimatedItemsTotal -= average;
            idealBurnData.push(estimatedItemsTotal);
        }
        return idealBurnData;
    }  

    getDiffDays(startDate, endDate) {

        const oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        const diffDays = Math.round(Math.abs((startDate.getTime() - endDate.getTime())/(oneDay)));
        return diffDays;
    }

    getItemsSnapshot(defects, startDate, endDate) {

        const estimatedItemsTotal = this.getEstimatedItemsTotal(defects);
        const average = estimatedItemsTotal/this.getDiffDays(startDate, endDate);
        const idealBurnData = this.getIdealBurnData(average, estimatedItemsTotal);    
        const workLeft = this.getWorkLeft(defects);
  
        return {
            workLeft,
            idealBurnData,
            estimatedItemsTotal
        }
    }

    getEstimatedItemsTotal(defects) {

        const estimatedItems = defects
            .filter(item => parseInt(item.Fields.find(field => field.Name === "Story Points").Value))
            .map(item => parseInt(item.Fields.find(field => field.Name === "Story Points").Value));

        const estimatedItemsTotal = estimatedItems
            .reduce((sum, item) => sum + item, 0);

        return estimatedItemsTotal;
    }

    getWorkLeft(defects) {

        const estimatedItemsTotal = this.getEstimatedItemsTotal(defects);
        const endStatuses = ["Verified", "Approved for RT"];

        const doneItems = defects
            .filter(item => item.Status && endStatuses.includes(item.Status.Value) &&  
                parseInt(item.Fields.find(field => field.Name === "Story Points").Value))
            .map(item => parseInt(item.Fields.find(field => field.Name === "Story Points").Value));

        const doneItemsTotal = doneItems
            .reduce((sum, item) => sum + item, 0);    

        const workLeft = estimatedItemsTotal - doneItemsTotal;
        return workLeft;
    }

    getBurnDownChartData (defects, stats, startDate, endDate) {
        const defectsSnapshot = this.getItemsSnapshot(defects, startDate, endDate);
        const actualBurnData = [];
        const days = [];

        for (let date = new Date(startDate.getTime()); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateKey = date.toISOString().split('T')[0];
            const todayKey = new Date().toISOString().split('T')[0];
            const currentStat = stats.find(item => { item.date === dateKey });
            
            if (dateKey === todayKey) {
                // use more up to date data
                actualBurnData.push(defectsSnapshot.workLeft);
            } else {
                actualBurnData.push(currentStat? currentStat.workLeft: null);
            }

            days.push(`${date.getDate()}/${date.getMonth()+1}`);
        }
        return {
            days,
            idealBurnData: defectsSnapshot.idealBurnData,
            actualBurnData
        };
    }
}

module.exports = new DefectsManager();