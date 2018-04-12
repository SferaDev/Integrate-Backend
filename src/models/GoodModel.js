const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const goodSchema = new Schema({
    userId: {
        // TODO
        //type: {type: Schema.Types.ObjectId, ref: 'Entity'},
        type: Schema.Types.ObjectId,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    picture: {
        type: String
    },
    initialPrice: {
        type: Number,
        required: true
    },
    discountType: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    reusePeriod: {
        type: Number,
        required: true
    },
    pendingUnits: {
        type: Number,
        required: true
    }
}, {timestamps: true});

// Export Good model as module
module.exports = mongoose.model('Good', goodSchema);