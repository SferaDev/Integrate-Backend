import mongoose from "mongoose";
import passwordGenerator from "password-generator";
import mongoose_delete from "mongoose-delete";

import {userModel} from "./userModel";
import {goodModel} from "./goodModel";
import {orderModel} from "./orderModel";
import * as constants from "../constants";

const entitySchema = new mongoose.Schema({
    salesmanFirstName: {
        type: String,
        required: true
    },
    salesmanLastName: {
        type: String,
        required: true
    },
    validationCode: {
        type: String,
        default: passwordGenerator(6, false)
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    addressName: {
        type: String,
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    numberLikes: {
        type: Number,
        default: 0
    }
}).index({coordinates: '2dsphere'});

entitySchema.plugin(mongoose_delete, {overrideMethods: true});

entitySchema.methods.getStats = function (callback) {
    let entity = this;
    goodModel.count({'owner.id': entity._id}, function (err, goodsCreated) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        let aggregate = orderModel.aggregate();
        aggregate.match({
            entity: entity._id
        });
        aggregate.group({
            _id: {entity: '$entity', beneficiary: '$beneficiary'},
            savedMoney: {$sum: '$totalDiscount'}
        });
        aggregate.exec(function (err, records) {
            let beneficiariesHelped = records.length;
            let totalSavedMoney = 0;
            for (let record of records) {
                totalSavedMoney += record.savedMoney;
            }
            return callback(null, {
                goodsCreated: goodsCreated,
                beneficiariesHelped: beneficiariesHelped,
                totalSavedMoney: totalSavedMoney,
                numberLikes: entity.numberLikes
            });
        });
    });
};

entitySchema.statics.getEntities = function (id, beneficiary, location, callback) {
    let aggregate = entityModel.aggregate();
    aggregate.near({
        near: {type: "Point", coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)]},
        distanceField: "distance",
        spherical: true
    });
    aggregate.project({
        name: 1, description: 1, addressName: 1, coordinates: 1, phone: 1,
        picture: 1, distance: 1, numberLikes: 1
    });
    aggregate.exec(function (err, entities) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        let result = [];
        for (let entity of entities) {
            entity.isLiked = (beneficiary.likedEntities.indexOf(entity._id) !== -1);
            result.push(entity);
        }
        return callback(null, result);
    });
};

entitySchema.statics.getEntity = function (id, beneficiary, callback) {
    entityModel.findById(id, {
        name: 1, email: 1, description: 1, addressName: 1, coordinates: 1,
        phone: 1, picture: 1, distance: 1, numberLikes: 1
    }, function (err, entity) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        if (entity === null) return callback({
            code: constants.STATUS_NOT_FOUND,
            message: {message: "Entity not found"}
        }, null);
        goodModel.find({"owner.id": entity._id, pendingUnits: {$gt: 0}}, function (err, goods) {
            if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
            let result = entity.toObject();
            result.isLiked = (beneficiary.likedEntities.indexOf(entity._id) !== -1);
            let goodsObject = [];
            for (let good of goods) {
                let goodObject = good.toObject();
                goodObject.isUsable = good.isUsable(beneficiary);
                goodsObject.push(goodObject);
            }
            result.goods = goodsObject;
            return callback(null, result);
        });
    });
};

export const entityModel = userModel.discriminator('Entity', entitySchema);
