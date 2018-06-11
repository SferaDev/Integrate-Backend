import mongoose from "mongoose";
import mongoose_delete from "mongoose-delete";

import {userModel} from "./userModel";
import {entityModel} from "./entityModel";
import * as constants from "../constants";

const briefGoodSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Good'
    },
    date: {
        type: Number
    }
}, {_id: false});

const beneficiarySchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    favouriteGoods: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Good'
    }],
    likedEntities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity'
    }],
    usedGoods: [briefGoodSchema]
});

beneficiarySchema.plugin(mongoose_delete, {overrideMethods: true});

beneficiarySchema.methods.likeEntity = function (id, callback) {
    let beneficiary = this;
    entityModel.findById(id, function (err, entity) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err});
        if (entity === null) return callback({
            code: constants.STATUS_NOT_FOUND,
            message: {message: "Entity not found"}
        });
        let index = beneficiary.likedEntities.indexOf(entity._id);
        if (index === -1) {
            entity.numberLikes += 1;
            entity.save();
            beneficiary.likedEntities.push(entity._id);
            beneficiary.save();
            return callback(null, {numberLikes: entity.numberLikes});
        } else {
            return callback({code: constants.STATUS_CONFLICT, message: {message: "You already like this entity"}});
        }
    });
};

beneficiarySchema.methods.dislikeEntity = function (id, callback) {
    let beneficiary = this;
    entityModel.findById(id, function (err, entity) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err});
        if (entity === null) return callback({
            code: constants.STATUS_NOT_FOUND,
            message: {message: "Entity not found"}
        });
        let index = beneficiary.likedEntities.indexOf(entity._id);
        if (index === -1) {
            return callback({code: constants.STATUS_CONFLICT, message: {message: "You do not like this entity yet"}});
        } else {
            entity.numberLikes -= 1;
            entity.save();
            beneficiary.likedEntities.splice(index, 1);
            beneficiary.save();
            return callback(null, {numberLikes: entity.numberLikes});
        }
    });
};

export const beneficiaryModel = userModel.discriminator('Beneficiary', beneficiarySchema);
