const express = require('express');
const axios = require('axios');
const router = express.Router();

const Setting = require('../models/setting');
const defectsManager = require('../helpers/defectsManager');


/**
 * Config
 */
const config = require('../config');

/**
 * Get
 */
router.get('/settings', (req, res, next) => {
    debugger
    axios.post(config.external.getRelasesUrl, 
    {
        "PageNum": 0,
        "RecordsPerPage": 1000,
        "Text": "tents",
        "SuggestionType": "Release",
        "IncludeChildren": false
    })
    .then(result => {
        const releases = result.data.Data.ResultSet;
        Setting.findOne()
            .then(setting => {
                if(!setting) {
                    console.log("settings do not exist");
                    res.send(200, { releases });
                } else {
                    const startDate = setting.startDate;
                    const endDate = setting.endDate;
                    const selectedRelease = releases.find(item => item.Id === setting.releaseId);
                    const response = {
                        releases,
                        startDate,
                        endDate
                    }
                    if (selectedRelease) {
                        selectedRelease.Selected = true;
                        const chartData =  defectsManager.getBurnDownChartData(selectedRelease.Id,
                            startDate, endDate);
                        response.chartData = chartData;
                    }
                    res.send(200, response);
                }
            })
            .catch(err => console.error(err));        
    })
    .catch(err => {
        console.error(err);
        res.send(500);
    });
})

module.exports = router;