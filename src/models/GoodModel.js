const mongoose = require('mongoose');

export const goodModel = mongoose.model('Good', new mongoose.Schema({
    userId: {
        // TODO
        //type: {type: Schema.Types.ObjectId, ref: 'Entity'},
        type: mongoose.Schema.Types.ObjectId,
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
}, {timestamps: true}));