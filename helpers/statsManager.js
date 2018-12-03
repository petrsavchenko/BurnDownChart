// // Crowling
// const needle = require('needle');
// const cheerio = require('cheerio');
// const winston = require('winston');

// const User = require('../models/user');
// const Crawler = require('../models/crawler');

const Setting = require('../models/setting');
const Statistic = require('../models/statistic');

const axios = require('axios');
const fs = require('fs');

const defectsManager = require('./defectsManager');

// /**
//  * Config
//  */
// const config = require('../config');

class StatsManager {

    saveStatistics() {
        Setting.findOne()
            .then(setting => {
                if(setting == null) {
                    console.error("Release was not selected");
                    return;
                    // releaseId = "bb3a8e0b-c2b0-44e6-ab91-360dab82eb58";
                }
                const releaseId = setting.releaseId;

                axios.post('https://home.plutoratest.com/api/defects/defects/search', 
                {
                    "ReleaseIds" : [releaseId],
                    "NoRelease" : false,
                    "PageNum" : 0,
                    "RecordsPerPage" : 1000,
                    "SearchFilters" : [
                    ],
                    // "SearchFilters" : [
                    //     {
                    //         "Direction" : null,
                    //         "FilterOrder" : 0,
                    //         "Operator" : "IsWithin",
                    //         "Property" : "EntityFieldValues.Status",
                    //         "Value" : "Submitted",
                    //         "ComplexValue" : null,
                    //         "ColumnType" : "Preset"
                    //     }
                    // ],
                    "DataGridName":"Defect"
                })
                .then(result => {
                    const data = result.data.Data;

                    const workLeft = defectsManager.getItemsSnapshot(data.ResultSet).workLeft;

                    const today = new Date().toISOString().split('T')[0];

                    const stat = {
                        releaseId,
                        date: today,
                        workLeft
                    };

                    Statistic.findOneAndUpdate({releaseId, date: today}, stat, { upsert: true }, (err, res) => {
                        debugger;
                        // Deal with the response data/error
                    });

                //     Statistic.findOne({releaseId, date: today})
                //         .then(statistic => {
                //             // if (statistic) {
                //             //     Statistic.update(statistic, {
                //             //         releaseId,
                //             //         date: today,
                //             //         workLeft
                //             //     }).then(statistic => {
                //             //         debugger;
                //             //     })
                //             //     .catch(err => console.error(err));
                //             // } else {
                //             //     Statistic.create({
                //             //         releaseId,
                //             //         date: today,
                //             //         workLeft
                //             //     }).then(statistic => {
                //             //         debugger; 
                //             //     })
                //             //     .catch(err => console.error(err));
                //             // }
                //         })
                //         .catch(err => console.error(err))
                });
            })
            .catch(err => console.error(err))
    }
}

module.exports = new StatsManager();