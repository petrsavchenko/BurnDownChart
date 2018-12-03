const express = require('express');
const axios = require('axios');
// const fs = require('fs');
const router = express.Router();

const Setting = require('../models/setting');
const Statistic = require('../models/statistic');

const defectsManager = require('../helpers/defectsManager');


/**
 * Get
 */
router.get('/defects/:releaseId', (req, res, next) => {
    const releaseId = req.params.releaseId;
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    const isValidDate  = (d) => d instanceof Date && !isNaN(d);

    if (!releaseId || !isValidDate(startDate) || !isValidDate(endDate)){
        res.status(422);
    }

    const setting = { releaseId, startDate, endDate };

    Setting.findOneAndUpdate({}, setting, { upsert: true }, (err, res) => {
        debugger;
        // Deal with the response data/error
    });


    // Setting.create({
    //     releaseId,
    //     startDate : startDate.toISOString().split('T')[0],
    //     endDate : endDate.toISOString().split('T')[0],
    // }).then(statistic => {
    //     debugger; 
    // })
    // .catch(err => console.error(err));

    axios.post('https://home.plutoratest.com/api/defects/defects/search', 
    {
        "ReleaseIds" : [releaseId],
        "NoRelease" : false,
        "PageNum" : 0,
        "RecordsPerPage" : 1000,
        "SearchFilters" : [],
        "DataGridName":"Defect"
    })
    .then(result => {
        const data = result.data.Data;

        const defectsSnapshot = defectsManager.getItemsSnapshot(data.ResultSet);
        const actualBurnData = [];

        Statistic.find({releaseId})
            .then(stats => {
                const days = [];
                for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
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
                res.status(200).send({
                    days,
                    idealBurnData: defectsSnapshot.idealBurnData,
                    actualBurnData
                });
            })
            .catch(err => console.error(err));
    })
    .catch(err => {
        res.status(500);
        console.error(err);
    });
})

module.exports = router;