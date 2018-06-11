import mongoose from "mongoose";

import {entityModel} from "../models/entityModel";
import * as constants from "../constants";
import {beneficiaryModel} from "./beneficiaryModel";

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

goodSchema.statics.addGood = function (entityEmail, goodContent, callback) {
    entityModel.findOne({email: entityEmail}, function (err, entity) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        goodContent.owner = {id: entity._id, name: entity.name};
        goodContent.location = entity.coordinates;
        let newGood = new goodModel(goodContent);
        newGood.save(function (err, good) {
            if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
            return callback(null, good);
        });
    });
};

goodSchema.statics.getGoods = function (userEmail, categoryIndex, orderIndex, latitude, longitude, callback) {
    if ((!categoryIndex || !orderIndex) || (orderIndex === 3 && (!latitude || !longitude))) {
        return callback({code: constants.STATUS_BAD_REQUEST, message: "Missing query parameters"}, null);
    } else {
        // Build the query
        let aggregate = goodModel.aggregate();
        let filter = {pendingUnits: {$gt: 0}};
        if (categoryIndex !== "0") filter = {category: parseInt(categoryIndex), pendingUnits: {$gt: 0}};
        // Filter by location (must be the first operation of the pipeline)
        if (orderIndex === "2") {
            aggregate.near({
                near: {type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)]},
                distanceField: "distance",
                query: filter,
                spherical: true
            });
        } else {
            // Filter by category
            aggregate.match(filter);
            // Sort by update date or popularity
            let order;
            if (orderIndex === "0") order = {updatedAt: 'desc'};
            else order = {numberFavs: 'desc'};
            aggregate.sort(order);
        }
        // Execute the query
        aggregate.exec(function (err, goods) {
            if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
            beneficiaryModel.findOne({email: userEmail}, function (err, beneficiary) {
                if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
                let goodsObject = [];
                for (let good of goods) {
                    good = new goodModel(good);
                    let goodObject = good.toObject();
                    goodObject.isUsable = good.isUsable(beneficiary);
                    goodsObject.push(goodObject);
                }
                return callback(null, goodsObject);
            });
        });
    }
};

goodSchema.statics.getEntityGoods = function(entityEmail, callback) {
    entityModel.findOne({email: entityEmail}, function (err, entity) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        goodModel.find({'owner.id': entity._id}, function (err, goods) {
            if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
            return callback(null, goods);
        });
    });
};

export const goodModel = mongoose.model('Good', goodSchema);

