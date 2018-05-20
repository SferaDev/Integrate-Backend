import mongoose from "mongoose";

export const orderModel = mongoose.model('Order', new mongoose.Schema({
    entity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity'
    },
    beneficiary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Beneficiary'
    },
    orderedGoods: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Good'
    }],
    totalDiscount: {
        type: Number
    }
}, {timestamps: true}));