import {entityModel} from "../models/entityModel";

const mongoose = require('mongoose');

const briefEntitySchema = new mongoose.Schema ({
    id: {
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
    name: {
        type: String,
        required: true
    }
});

export const goodModel = mongoose.model('Good', new mongoose.Schema({
    owner: briefEntitySchema,
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
        type: Number,
        min: 1,
        max: 9,
        required: true
    },
    reusePeriod: {
        type: Number,
        required: true
    },
    pendingUnits: {
        type: Number,
        required: true
    },
    numberFavs: {
        type: Number,
        default: 0
    },
    location: {
        type: [Number]
    }
}, {timestamps: true}).index({location: '2dsphere'}));
