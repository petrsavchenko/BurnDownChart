const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * Get
 */
router.get('/defects/:releaseId', (req, res, next) => {
    axios.post('https://home.plutoratest.com/api/defects/defects/search', 
    {
        "ReleaseIds":[req.params.releaseId],
        "NoRelease":false,
        "PageNum":0,
        "RecordsPerPage":25,
        "SearchFilters":[
            {
                "Direction":null,
                "FilterOrder":0,
                "Operator":"IsWithin",
                "Property":"EntityFieldValues.Status",
                "Value":"Submitted",
                "ComplexValue":null,
                "ColumnType":"Preset"
            }
        ],
        "DataGridName":"Defect"
    })
    .then(result => {
        res.send(200, result.data.Data);
    })
    .catch(err => {
        res.send(500);
        console.error(err);
    });
})

module.exports = router;