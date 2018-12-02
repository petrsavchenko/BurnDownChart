const express = require('express');
const axios = require('axios');
const fs = require('fs');
const router = express.Router();

/**
 * Get
 */
router.get('/defects/:releaseId', (req, res, next) => {
    const releaseId = req.params.releaseId;
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    axios.post('https://home.plutoratest.com/api/defects/defects/search', 
    {
        "ReleaseIds" : [releaseId],
        "NoRelease" : false,
        "PageNum" : 0,
        "RecordsPerPage" : 25,
        "SearchFilters" : [],
        "DataGridName":"Defect"
    })
    .then(result => {
        const data = result.data.Data;

        const estimatedItems = data.ResultSet
            .filter(item => /*item.Status && item.Status.Value === "Submitted" && */ 
                parseInt(item.Fields.find(field => field.Name === "Story Points").Value))
            .map(item => parseInt(item.Fields.find(field => field.Name === "Story Points").Value));
  
        const estimatedItemsTotal = estimatedItems
            .reduce((sum, item) => sum + item, 0);
    
        const average = Math.round(estimatedItemsTotal/14);
    
        const getIdealBurnData = (average, estimatedItemsTotal) => {
            const idealBurnData = [];
            while(estimatedItemsTotal > average){
                estimatedItemsTotal-=average;
                idealBurnData.push(average);
            }
            if(estimatedItemsTotal > 0) {
                idealBurnData.push(estimatedItemsTotal);
            }
            return idealBurnData;
        }  
        const idealBurnData = getIdealBurnData(average, estimatedItemsTotal);
    
        const endStatuses = ["Verified", "Approved for RT"];
    
        const doneItems = data.ResultSet
            .filter(item => item.Status && endStatuses.includes(item.Status.Value) &&  
                parseInt(item.Fields.find(field => field.Name === "Story Points").Value))
            .map(item => parseInt(item.Fields.find(field => field.Name === "Story Points").Value));
    
        const doneItemsTotal = doneItems
            .reduce((sum, item) => sum + item, 0);    
    
        const workLeft = estimatedItemsTotal - doneItemsTotal;
        const actualBurnData = [];

        fs.readFile('db.json', (err, data) => {
            if (err){
                console.log(err);
            }

            const obj = JSON.parse(data);
            const releaseObj = obj.statistics[releaseId];
            
            if (releaseObj) {
                const days = [];
                for (let date = startDate; date <= endDate; date.setDate(date.getDate()+1)){
                    const dateKey = date.toISOString().split('T')[0];
                    const todayKey = new Date().toISOString().split('T')[0];
                    actualBurnData.push(dateKey === todayKey? workLeft: releaseObj[dateKey]);
                    days.push(`${date.getDate()}/${date.getMonth()+1}`);
                    // const workLeft = releaseObj[dateKey];
                    // if (workLeft != undefined){
                    //     realBurnData.push(workLeft);
                    // } else {
                    //     // don't have statistic 
                    //     break;
                    //     // realBurnData.push(estimatedItemsTotal);
                    // }
                }
            }
            
            res.status(200).send({
                days,
                idealBurnData,
                actualBurnData
            });
        });
    })
    .catch(err => {
        res.status(500);
        console.error(err);
    });
})

module.exports = router;