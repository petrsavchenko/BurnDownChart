const mongoose = require('mongoose');
require('mongoose-type-url');

var Schema = mongoose.Schema;

var SettingSchema = new Schema({

    // Start Date of sprint 
    startDate: { 
        type: Date, 
        required: true, 
    },

    // End Date of sprint 
    endDate: { 
        type: Date, 
        required: true, 
    },
    
    // Selected Release in PT 
    releaseId: {
        type: String, 
        required: true
    },

    // Select type of burndown: Storypoints based or remaining Time estimate
    chartType: {
        type: String,
        enum: ['Storypoints', 'Time']
    }
});

// Export model.
module.exports = mongoose.model('Setting', SettingSchema);
