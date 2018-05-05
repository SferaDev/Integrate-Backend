import passwordGenerator from "generate-random-password";

import {sendMail} from "../../common/mail";
import {entityModel} from "../models/entityModel";
import * as constants from "../constants";

export function getEntities(req, res) {
    if (req.userType === 'Beneficiary') {
        let latitude = req.query.latitude;
        let longitude = req.query.longitude;
        if (!latitude || !longitude)
            res.status(constants.STATUS_BAD_REQUEST).send({message: "Missing query parameters"});
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
                if (err) res.status(constants.STATUS_SERVER_ERROR).send(err);
                else res.status(constants.STATUS_OK).send(entities);
            });
        }
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function createNewEntity(req, res) {
    let attributes = {};
    for (let key in entityModel.schema.paths) {
        if (entityModel.schema.paths.hasOwnProperty(key)) {
            let value = entityModel.schema.paths[key];
            if (value.isRequired) {
                if (req.body[key]) attributes[key] = req.body[key];
                else return res.status(constants.STATUS_BAD_REQUEST).send({message: "Missing parameter " + key});
            }
        }
    }
    entityModel.count({nif: req.body.nif}, function (err, count) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
        if (count > 0) return res.status(constants.STATUS_CONFLICT).send({message: 'NIF already exists'});
        entityModel.create(attributes, function (err, entity) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            entity.password = passwordGenerator.generateRandomPassword(8);
            sendMail(entity.email, 'Welcome to Integrate!', 'Welcome!\n\nYour account has been successfully created.\n\nAccount: ' +
                entity.nif + '\nPassword: ' + entity.password + '\n\nPlease change your password after your first login.');
            entity.save();
            res.status(constants.STATUS_CREATED).send();
        });
    });
}
