const mongoose = require('mongoose');
require('mongoose-type-url');

var Schema = mongoose.Schema;

var StatisticSchema = new Schema({
    
    // count of workLeft for this date in toISOString
    date: { 
        type: String, 
        required: true, 
    },

    // count of Story Points left for end of the sprint
    workLeft: {
        type: Number, 
        min: 0, 
        required: true
    },

    // Selected Release in PT 
    releaseId: {
        type: String, 
        required: true
    }
});

// Export model.
module.exports = mongoose.model('Statistic', StatisticSchema);
