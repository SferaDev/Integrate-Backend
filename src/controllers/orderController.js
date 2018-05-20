import * as constants from "../constants";
import {goodModel} from "../models/goodModel";
import {beneficiaryModel} from "../models/beneficiaryModel";
import {entityModel} from "../models/entityModel";
import {orderModel} from "../models/orderModel";

export function processOrder (req, res) {
    if (req.userType === 'Beneficiary') {
        let userEmail = req.userId;
        beneficiaryModel.findOne({email: userEmail}, function (err, beneficiary) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            goodModel.find({_id: {$in: req.body.goodIds}}, function (err, goods) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
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
                if (soldOutGoods.length > 0 || nonUsableGoods.length > 0) return res.status(constants.STATUS_CONFLICT).send({soldOutGoods: soldOutGoods, nonUsableGoods: nonUsableGoods});
                if (req.query.validationCode && req.query.entityId) {
                    entityModel.findById(req.query.entityId, function (err, entity) {
                        if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                        if (req.query.validationCode === entity.validationCode) {
                            for (let good of goods) {
                                good.pendingUnits -= 1;
                                good.save();
                                let usedGoodIndex = beneficiary.usedGoods.findIndex(function (element) {
                                    return element.id === good._id;
                                });
                                if (usedGoodIndex !== -1) {
                                    beneficiary.usedGoods[usedGoodIndex].date = Date.now();
                                } else {
                                    beneficiary.usedGoods.push({
                                        id: good._id,
                                        date: Date.now()
                                    });
                                }
                                //beneficiary.save();
                            }
                            let order = new orderModel({
                                entity: req.query.entityId,
                                beneficiary: beneficiary._id,
                                orderedGoods: req.body.goodIds,
                                totalDiscount: totalDiscount
                            });
                            order.save(function (err) {
                                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                                else return res.status(constants.STATUS_CREATED).send({message: "Order processed and stored"});
                            });
                        }
                        else return res.status(constants.STATUS_FORBIDDEN).send({message: "Validation code incorrect"});
                    });
                }
                else return res.status(constants.STATUS_OK).send({totalDiscount: totalDiscount});
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}
