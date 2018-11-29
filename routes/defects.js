const express = require('express');
const axios = require('axios');
const router = express.Router();
const fs = require('fs');

/**
 * Get
 */
router.get('/defects/:releaseId', (req, res, next) => {
    const releaseId = req.params.releaseId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    axios.post('https://home.plutoratest.com/api/defects/defects/search', 
    {
        "ReleaseIds" : [releaseId],
        "NoRelease" : false,
        "PageNum" : 0,
        "RecordsPerPage" : 25,
        "SearchFilters" : [
            {
                "Direction" : null,
                "FilterOrder" : 0,
                "Operator" : "IsWithin",
                "Property" : "EntityFieldValues.Status",
                "Value" : "Submitted",
                "ComplexValue" : null,
                "ColumnType" : "Preset"
            }
        ],
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
        const realBurnData = [];

        fs.readFile('db.json', (err, data) => {
            if (err){
                console.log(err);
            }

            const obj = JSON.parse(data);
            const releaseObj = obj.statistics[releaseId];
            for (let date = startDate; date < endDate; date.setDate(date.getDate() + 1)){
                const dateKey = date.toISOString().split('T')[0];
                realBurnData.push(releaseObj[dateKey]);
                // const workLeft = releaseObj[dateKey];
                // if (workLeft != undefined){
                //     realBurnData.push(workLeft);
                // } else {
                //     // don't have statistic 
                //     break;
                //     // realBurnData.push(estimatedItemsTotal);
                // }
            }

            res.status(200).send({
                idealBurnData,
                realBurnData
            });
        });

 

        // // save to file
        // fs.readFile('db.json', (err, data) => {
        //     const today = new Date().toISOString().split('T')[0];

        //     if (err){
        //         if (err.code === 'ENOENT') {
        //             var obj = {
        //                 statistics: {}
        //             };
        //             obj.statistics[releaseId] = { [today] : workLeft};
        //             const jsonString = JSON.stringify(obj);
        //             fs.writeFile('db.json', jsonString);
        //         }
        //         console.log(err);
        //     } else {

        //     const obj = JSON.parse(data);
        //     const releaseObj = obj.statistics[releaseId];
        //     if (releaseObj) {
        //         releaseObj[today] = workLeft;

        //         // TODO: handle error case if today was exist before
        //         // const todayObj = releaseObj[today];
        //         // if (todayObj) {
        //         // } else {
        //         // }

        //     } else{
        //         obj.statistics.push({releaseId : {today : workLeft}});
        //     }
        //     const jsonString = JSON.stringify(obj);
        //     fs.writeFile('db.json', jsonString);
        // }});

    })
    .catch(err => {
        res.status(500);
        console.error(err);
    });
})

module.exports = router;