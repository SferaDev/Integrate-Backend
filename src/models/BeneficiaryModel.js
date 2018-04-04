const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BeneficiarySchema = new Schema({
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

// Export Beneficiary model as module
module.exports = mongoose.model('Beneficiary', BeneficiarySchema);
