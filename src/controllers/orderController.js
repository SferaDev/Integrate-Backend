import * as constants from "../constants";
import {goodModel} from "../models/goodModel";
import {beneficiaryModel} from "../models/beneficiaryModel";
import {entityModel} from "../models/entityModel";
import {orderModel} from "../models/orderModel";

export function processOrder(req, res) {
    if (req.userType === 'Beneficiary') {
        orderModel.processOrder(req.userId, req.body.goodIds, req.query.entityId, req.query.validationCode, (err, result) => {
            if (err) return res.status(err.code).send(err.message);
            return res.status(result.code).send(result.body);
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}
