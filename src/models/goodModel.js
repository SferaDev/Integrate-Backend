import {entityModel} from "../models/entityModel";

const mongoose = require('mongoose');

export const goodModel = mongoose.model('Good', new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        validate: {
            isAsync: true,
            validator: function (id, cb) {
                entityModel.findOne({_id: id}, function (err, entity) {
                    let correct = true;
                    let message = null;
                    if (!entity) {
                        correct = false;
                        message = "The owner must be a registered Entity";
                    }
                    cb(correct, message);
                });
            }
        },
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
