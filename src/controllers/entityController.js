import {entityModel} from "../models/entityModel";
import {STATUS_OK, STATUS_SERVER_ERROR} from "../constants";

exports.getEntities = function (req, res) {
    entityModel.find({}, {
        name: 1,
        description: 1,
        addressName: 1,
        addressLatitude: 1,
        addressLongitude: 1,
        phone: 1,
        picture: 1
    }, function (err, entities) {
        if (err) res.status(STATUS_SERVER_ERROR).send(err);
        else res.status(STATUS_OK).send(entities);
    });
};