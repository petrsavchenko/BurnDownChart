const express = require('express');
const axios = require('axios');
const router = express.Router();
// const fs = require('fs');

const Setting = require('../models/setting');
const Statistic = require('../models/statistic');

/**
 * Get
 */
router.get('/settings', (req, res, next) => {
    axios.post('https://home.plutoratest.com/api/suggestion/suggest', 
    {
        "PageNum": 0,
        "RecordsPerPage": 10,
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
                    res.send(200, {
                        releases
                    });
                } else {
                    const startDate = setting.startDate;
                    const endDate = setting.endDate;
                    const selectedRelease = releases.find(item => item.Id === setting.releaseId);
                    if (selectedRelease) {
                        selectedRelease.Selected = true;
                    }
                    res.send(200, {
                        releases,
                        startDate,
                        endDate
                    });
                }
            })
            .catch(err => console.error(err))
        


        // fs.readFile('db.json', (err, data) => {
        //     if (err){
        //         console.log(err);
        //     }

        //     const obj = JSON.parse(data);
        //     const startDate = obj.startDate;
        //     const endDate = obj.endDate;
        //     const selectedRelease = releases.find(item => item.Id === obj.releaseId);
        //     if (selectedRelease) {
        //         selectedRelease.Selected = true;
        //     }
        //     res.send(200, {
        //         releases,
        //         startDate,
        //         endDate
        //     });
        // });

        
    })
    .catch(err => {
        res.send(500);
        console.error(err);
    });
})

module.exports = router;