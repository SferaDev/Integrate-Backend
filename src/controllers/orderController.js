import * as constants from "../constants";
import {goodModel} from "../models/goodModel";
import {beneficiaryModel} from "../models/beneficiaryModel";

function daysToMilliseconds (days) {
    return days * 24 * 60 * 60 * 1000;
}

export function checkOrder (req, res) {
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
                        for (let usedGood of beneficiary.usedGoods) {
                            if (usedGood.id.toString() === good._id.toString() && usedGood.date + daysToMilliseconds(good.reusePeriod) > Date.now()) {
                                nonUsableGoods.push(good._id);
                            }
                        }
                        if (good.discountType === "%") {
                            totalDiscount += good.initialPrice * (good.discount / 100);
                        }
                        else {
                            totalDiscount += good.discount;
                        }
                    }
                }
                if (soldOutGoods.length > 0 || nonUsableGoods.length > 0) return res.status(constants.STATUS_CONFLICT).send({soldOutGoods: soldOutGoods, nonUsableGoods: nonUsableGoods});
                return res.status(constants.STATUS_OK).send({totalDiscount: totalDiscount});
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}