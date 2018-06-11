import mongoose from "mongoose";

import {entityModel} from "../models/entityModel";
import {beneficiaryModel} from "./beneficiaryModel";
import * as constants from "../constants";

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
    if (!categoryIndex || !orderIndex) {
        return callback({code: constants.STATUS_BAD_REQUEST, message: "Missing category/order parameters"}, null);
    } else if (orderIndex === 3 && (!latitude || !longitude)) {
        return callback({code: constants.STATUS_BAD_REQUEST, message: "Missing location parameters"}, null);
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

goodSchema.statics.getEntityGoods = function (entityEmail, callback) {
    entityModel.findOne({email: entityEmail}, function (err, entity) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        goodModel.find({'owner.id': entity._id}, function (err, goods) {
            if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
            return callback(null, goods);
        });
    });
};

goodSchema.statics.getGood = function (userType, userEmail, id, callback) {
    goodModel.findById(id, function (err, good) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        if (good === null) return callback({code: constants.STATUS_NOT_FOUND, message: "Good not found"}, null);
        if (userType === 'Beneficiary') {
            beneficiaryModel.findOne({email: userEmail}, function (err, beneficiary) {
                if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
                let goodObject = good.toObject();
                goodObject.isUsable = good.isUsable(beneficiary);
                return callback(null, goodObject);
            });
        }
        else return callback(null, good);
    });
};

goodSchema.statics.getFavouriteGoods = function (userEmail, callback) {
    beneficiaryModel.findOne({email: userEmail}, function (err, beneficiary) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        goodModel.find({_id: {$in: beneficiary.favouriteGoods}, pendingUnits: {$gt: 0}}, function (err, goods) {
            if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
            let goodsObject = [];
            for (let good of goods) {
                let goodObject = good.toObject();
                goodObject.isUsable = good.isUsable(beneficiary);
                goodsObject.push(goodObject);
            }
            return callback(null, goodsObject);
        });
    });
};

goodSchema.methods.addFavouriteGood = function (userEmail, callback) {
    let good = this;
    beneficiaryModel.findOne({email: userEmail}, function (err, beneficiary) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        let index = beneficiary.favouriteGoods.indexOf(good._id);
        if (index === -1) {
            good.numberFavs += 1;
            good.save();
            beneficiary.favouriteGoods.push(good._id);
            beneficiary.save();
            return callback(null, beneficiary.favouriteGoods);
        } else return callback({
            code: constants.STATUS_CONFLICT,
            message: "This good is already in your favourite list"
        }, null);
    });
};

goodSchema.methods.deleteFavouriteGood = function (userEmail, callback) {
    let good = this;
    beneficiaryModel.findOne({email: userEmail}, function (err, beneficiary) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        let index = beneficiary.favouriteGoods.indexOf(good._id);
        if (index === -1) {
            return callback({
                code: constants.STATUS_NOT_FOUND,
                message: "This good is not in your favourite list"
            }, null);
        } else {
            good.numberFavs -= 1;
            good.save();
            beneficiary.favouriteGoods.splice(index, 1);
            beneficiary.save();
            return callback(null, beneficiary.favouriteGoods);
        }
    });
};

export const goodModel = mongoose.model('Good', goodSchema);

