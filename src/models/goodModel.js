import mongoose from "mongoose";

import {entityModel} from "../models/entityModel";

const briefEntitySchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity',
        validate: {
            isAsync: true,
            validator: function (id, next) {
                entityModel.findOne({_id: id}, function (err, entity) {
                    let correct = true;
                    let message = null;
                    if (!entity) {
                        correct = false;
                        message = "The owner must be a registered Entity";
                    }
                    next(correct, message);
                });
            }
        },
        required: true
    },
    name: {
        type: String,
        required: true
    }
}, {_id: false});

const goodSchema = new mongoose.Schema({
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
        enum: ["%", "€"],
        required: true,
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
}, {timestamps: true}).index({location: '2dsphere'});

function daysToMilliseconds(days) {
    return days * 24 * 60 * 60 * 1000;
}

goodSchema.methods.isUsable = function (beneficiary) {
    for (let usedGood of beneficiary.usedGoods) {
        if (usedGood.id.toString() === this._id.toString() && usedGood.date + daysToMilliseconds(this.reusePeriod) > Date.now()) {
            return false;
        }
    }
    return true;
};

export const goodModel = mongoose.model('Good', goodSchema);

