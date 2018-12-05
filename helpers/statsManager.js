const axios = require('axios');

const Setting = require('../models/setting');
const Statistic = require('../models/statistic');

const defectsManager = require('./defectsManager');

/**
 * Config
 */
const config = require('../config');

class StatsManager {

    saveStatistics() {
        Setting.findOne()
            .then(setting => {
                if(setting == null) {
                    console.error("Release was not selected");
                    return;
                }
                const releaseId = setting.releaseId;

                axios.post(config.external.getTicketsUrl, 
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

                    const workLeft = defectsManager.getWorkLeft(data.ResultSet);

                    const today = new Date().toISOString().split('T')[0];

                    const stat = {
                        releaseId,
                        date: today,
                        workLeft
                    };

                    // Statistic.findOneAndUpdate({releaseId, date: today}, stat, { upsert: true }, (err, res) => {
                    //     if (err) {
                    //         console.log(err);
                    //     }
                    // });
                });
            })
            .catch(err => console.error(err))
    }
}

module.exports = new StatsManager();