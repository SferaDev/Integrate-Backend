'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BeneficiarySchema = new Schema({
    nif: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Beneficiary', BeneficiarySchema);