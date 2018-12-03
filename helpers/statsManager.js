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

// /**
//  * Config
//  */
// const config = require('../config');

class StatsManager {

    saveStatistics() {
        Setting.findOne()
            .then(setting => {
                let releaseId = null;
                if(setting == null) {
                    console.error("settings do not exist");
                    releaseId = "bb3a8e0b-c2b0-44e6-ab91-360dab82eb58";
                }
                else {
                    releaseId = setting.releaseId;
                }

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
    
                    const estimatedItems = data.ResultSet
                        .filter(item => /*item.Status && item.Status.Value === "Submitted" && */ 
                            parseInt(item.Fields.find(field => field.Name === "Story Points").Value))
                        .map(item => parseInt(item.Fields.find(field => field.Name === "Story Points").Value));
            
                    const estimatedItemsTotal = estimatedItems
                        .reduce((sum, item) => sum + item, 0);
                
                    const endStatuses = ["Verified", "Approved for RT"];
                
                    const doneItems = data.ResultSet
                        .filter(item => item.Status && endStatuses.includes(item.Status.Value) &&  
                        parseInt(item.Fields.find(field => field.Name === "Story Points").Value))
                        .map(item => parseInt(item.Fields.find(field => field.Name === "Story Points").Value));
                
                    const doneItemsTotal = doneItems
                        .reduce((sum, item) => sum + item, 0);    
                
                    const workLeft = estimatedItemsTotal - doneItemsTotal;

                    const today = new Date().toISOString().split('T')[0];
                    Statistic.findOne({releaseId, date: today})
                        .then(statistic => {

                            if (statistic) {
                                Statistic.update(statistic, {
                                    releaseId,
                                    date: today,
                                    workLeft
                                }).then(statistic => {
                                    debugger;
                                })
                                .catch(err => console.error(err));
                            } else {
                                Statistic.create({
                                    releaseId,
                                    date: today,
                                    workLeft
                                }).then(statistic => {
                                    debugger; 
                                })
                                .catch(err => console.error(err));
                            }
                        })
                        .catch(err => console.error(err))
                });
            })
            .catch(err => console.error(err))
    }
}

module.exports = new StatsManager();