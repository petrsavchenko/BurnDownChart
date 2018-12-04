class DefectsManager {
    getIdealBurnData(average, estimatedItemsTotal) {
        const idealBurnData = [];
        while (estimatedItemsTotal > average){
            estimatedItemsTotal -= average;
            idealBurnData.push(estimatedItemsTotal);
        }
        if (estimatedItemsTotal > 0) {
            idealBurnData.push(estimatedItemsTotal);
        }
        return idealBurnData;
    }  

    getDiffDays(startDate, endDate){
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
}

module.exports = new DefectsManager();