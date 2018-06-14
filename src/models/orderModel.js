import mongoose from "mongoose";
import {goodModel} from "./goodModel";
import {entityModel} from "./entityModel";
import {beneficiaryModel} from "./beneficiaryModel";
import * as constants from "../constants";

const orderSchema = new mongoose.Schema({
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
}, {timestamps: true});

function validateOrder(goods, beneficiary) {
    let soldOutGoods = [];
    let nonUsableGoods = [];
    let totalDiscount = 0;
    for (let good of goods) {
        if (good.pendingUnits === 0) soldOutGoods.push(good._id);
        else {
            if (!good.isUsable(beneficiary)) {
                nonUsableGoods.push(good._id);
            }
            if (good.discountType === "%") {
                totalDiscount += good.initialPrice * (good.discount / 100);
            } else {
                totalDiscount += good.discount;
            }
        }
    }
    return [soldOutGoods, nonUsableGoods, totalDiscount];
}

orderSchema.statics.processOrder = function (userEmail, goodIds, entityId, validationCode, callback) {
    beneficiaryModel.findOne({email: userEmail}, function (err, beneficiary) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        goodModel.find({_id: {$in: goodIds}}, function (err, goods) {
            if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
            if (validationCode && entityId) {
                entityModel.findById(entityId, function (err, entity) {
                    if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
                    if (validationCode === entity.validationCode) {
                        let validation = validateOrder(goods, beneficiary);
                        let soldOutGoods = validation[0];
                        let nonUsableGoods = validation[1];
                        let totalDiscount = validation[2];
                        if (soldOutGoods.length > 0 || nonUsableGoods.length > 0) return callback({
                            code: constants.STATUS_CONFLICT, message: {
                                soldOutGoods: soldOutGoods,
                                nonUsableGoods: nonUsableGoods
                            }
                        }, null);
                        let usedGoods = beneficiary.usedGoods;
                        for (let good of goods) {
                            good.pendingUnits -= 1;
                            good.save();
                            let usedGoodIndex = usedGoods.findIndex(function (element) {
                                return element.id.toString() === good._id.toString();
                            });
                            if (usedGoodIndex !== -1) {
                                usedGoods[usedGoodIndex].date = Date.now();
                            } else {
                                usedGoods.push({
                                    id: good._id,
                                    date: Date.now()
                                });
                            }
                        }
                        beneficiary.update({
                            $set: {
                                usedGoods: usedGoods
                            }
                        }).exec();
                        let order = new orderModel({
                            entity: entityId,
                            beneficiary: beneficiary._id,
                            orderedGoods: goodIds,
                            totalDiscount: totalDiscount
                        });
                        order.save(function (err) {
                            if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
                            else return callback(null, {
                                code: constants.STATUS_CREATED,
                                body: {message: "Order processed and stored"}
                            });
                        });
                    } else return callback({code: constants.STATUS_FORBIDDEN, message: {error: "Validation code incorrect"}});
                });
            } else {
                let validation = validateOrder(goods, beneficiary);
                let soldOutGoods = validation[0];
                let nonUsableGoods = validation[1];
                let totalDiscount = validation[2];
                if (soldOutGoods.length > 0 || nonUsableGoods.length > 0) return callback({
                    code: constants.STATUS_CONFLICT, message: {
                        soldOutGoods: soldOutGoods,
                        nonUsableGoods: nonUsableGoods
                    }
                }, null);
                return callback(null, {code: constants.STATUS_OK, body: {totalDiscount: totalDiscount}});
            }
        });
    });
};

export const orderModel = mongoose.model('Order', orderSchema);