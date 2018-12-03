const Setting = require('../models/setting');
const Statistic = require('../models/statistic');

class DefectsManager {
    getIdealBurnData(average, estimatedItemsTotal) {
        const idealBurnData = [];
        while (estimatedItemsTotal > average){
            estimatedItemsTotal -= average;
            idealBurnData.push(average);
        }
        if (estimatedItemsTotal > 0) {
            idealBurnData.push(estimatedItemsTotal);
        }
        return idealBurnData;
    }  

    getItemsSnapshot(defects) {
        const estimatedItems = defects
            .filter(item => /*item.Status && item.Status.Value === "Submitted" && */ 
                parseInt(item.Fields.find(field => field.Name === "Story Points").Value))
            .map(item => parseInt(item.Fields.find(field => field.Name === "Story Points").Value));

        const estimatedItemsTotal = estimatedItems
            .reduce((sum, item) => sum + item, 0);

        const average = Math.round(estimatedItemsTotal/14); // TO DO

        const idealBurnData = getIdealBurnData(average, estimatedItemsTotal);

        const endStatuses = ["Verified", "Approved for RT"];

        const doneItems = data.ResultSet
            .filter(item => item.Status && endStatuses.includes(item.Status.Value) &&  
                parseInt(item.Fields.find(field => field.Name === "Story Points").Value))
            .map(item => parseInt(item.Fields.find(field => field.Name === "Story Points").Value));

        const doneItemsTotal = doneItems
            .reduce((sum, item) => sum + item, 0);    

        const workLeft = estimatedItemsTotal - doneItemsTotal;
  
        return {
            workLeft,
            idealBurnData
        }
    }
}

module.exports = new DefectsManager();