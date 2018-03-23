'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    Created_date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Test', TestSchema);