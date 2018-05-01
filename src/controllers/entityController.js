import {entityModel} from "../models/entityModel";
import {STATUS_FORBIDDEN, STATUS_OK, STATUS_SERVER_ERROR} from "../constants";

exports.getEntities = function (req, res) {
    if (req.userType === 'Beneficiary') {
        entityModel.find({}, {
            name: 1,
            description: 1,
            addressName: 1,
            coordinates: 1,
            phone: 1,
            picture: 1
        }, function (err, entities) {
            if (err) res.status(STATUS_SERVER_ERROR).send(err);
            else res.status(STATUS_OK).send(entities);
        });
    } else {
        res.status(STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
};