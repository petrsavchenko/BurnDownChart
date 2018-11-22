const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * Get
 */
router.get('/releases', (req, res, next) => {
    axios.post('https://home.plutoratest.com/api/suggestion/suggest', 
    {
        "PageNum": 0,
        "RecordsPerPage": 10,
        "Text": "tents",
        "SuggestionType": "Release",
        "IncludeChildren": false
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