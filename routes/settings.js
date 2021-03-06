const express = require('express');
const axios = require('axios');
const router = express.Router();

const Setting = require('../models/setting');
const Statistic = require('../models/statistic');

const statsManager = require('../helpers/statsManager');
const timeTrackingManager = require('../helpers/timeTrackingManager');
const storypointsManager = require('../helpers/storypointsManager');

/**
 * Config
 */
const config = require('../config');

/**
 * Get
 */
router.get('/settings', (req, res, next) => {
    statsManager.saveStatistics();

    axios.post(config.external.getRelasesUrl, 
    {
        "PageNum": 0,
        "RecordsPerPage": 1000,
        "Text": "customer",
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
                    const chartType = setting.chartType;
                    const startDate = setting.startDate;
                    const endDate = setting.endDate;
                    const selectedRelease = releases.find(item => item.Id === setting.releaseId);
                    const response = {
                        chartType,
                        startDate,
                        endDate,
                        releases,
                    }
                    if (selectedRelease) {
                        selectedRelease.Selected = true;

                        axios.post(config.external.getTicketsUrl, 
                            {
                                "ReleaseIds" : [selectedRelease.Id],
                                "NoRelease" : false,
                                "PageNum" : 0,
                                "RecordsPerPage" : 1000,
                                "SearchFilters" : [],
                                "DataGridName":"Defect"
                            })
                            .then(result => {
                                const data = result.data.Data;
                                
                                Statistic.find({releaseId: selectedRelease.Id})
                                    .then(stats => {
                                        response.chartData = setting.chartType === 'Time' ? 
                                            timeTrackingManager.getBurnDownChartData(data.ResultSet, stats, startDate, endDate) :
                                            storypointsManager.getBurnDownChartData(data.ResultSet, stats, startDate, endDate);
                                        res.status(200).send(response);
                                    })
                                    .catch(err => console.error(err));
                            })
                            .catch(err => {
                                console.error(err);
                                res.status(500);
                            });                        
                    } else {
                        res.send(200, response);
                    }
                    
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