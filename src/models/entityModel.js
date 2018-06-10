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
                totalSavedMoney: totalSavedMoney
            });
        });
    });
};

export const entityModel = userModel.discriminator('Entity', entitySchema);
