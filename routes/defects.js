const express = require('express');
const axios = require('axios');
const router = express.Router();

const Setting = require('../models/setting');
const Statistic = require('../models/statistic');

const defectsManager = require('../helpers/defectsManager');

/**
 * Config
 */
const config = require('../config');

/**
 * Get
 */
router.get('/defects/:releaseId', (req, res, next) => {

    debugger
    const releaseId = req.params.releaseId;
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    const isValidDate  = (d) => d instanceof Date && !isNaN(d);

    if (!releaseId || !isValidDate(startDate) || !isValidDate(endDate)){
        res.status(422);
    }

    const setting = { releaseId, startDate, endDate };

    Setting.findOneAndUpdate({}, setting, { upsert: true }, (err, res) => {
        if (err) {
            console.log(err);
        }            
    });

    axios.post(config.external.getTicketsUrl, 
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
        
        Statistic.find({releaseId})
            .then(stats => {
                const chartData = defectsManager.getBurnDownChartData(data.ResultSet, stats,
                    startDate, endDate);
                res.status(200).send(chartData);
            })
            .catch(err => console.error(err));
    })
    .catch(err => {
        console.error(err);
        res.status(500);
    });
})

module.exports = router;