import {entityModel} from "../models/entityModel";
import {STATUS_BAD_REQUEST, STATUS_FORBIDDEN, STATUS_OK, STATUS_SERVER_ERROR} from "../constants";

export function getEntities(req, res) {
    if (req.userType === 'Beneficiary') {
        let latitude = req.query.latitude;
        let longitude = req.query.longitude;
        if (!latitude || !longitude)
            res.status(STATUS_BAD_REQUEST).send({message: "Missing query parameters"});
        else {
            // Build the query
            let aggregate = entityModel.aggregate();
            aggregate.near({
                near: {type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)]},
                distanceField: "distance",
                spherical: true
            });
            aggregate.project({
                name: 1,
                description: 1,
                addressName: 1,
                coordinates: 1,
                phone: 1,
                picture: 1,
                distance: 1
            });
            // Execute the query
            aggregate.exec(function (err, entities) {
                if (err) res.status(STATUS_SERVER_ERROR).send(err);
                else res.status(STATUS_OK).send(entities);
            });
        }
    } else {
        res.status(STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}