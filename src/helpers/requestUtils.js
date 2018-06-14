import {entityModel} from "../models/entityModel";

export function getParameters(requestBody, callback) {
    let attributes = {};
    for (let key in entityModel.schema.paths) {
        if (entityModel.schema.paths.hasOwnProperty(key)) {
            let value = entityModel.schema.paths[key];
            if (value.isRequired) {
                if (requestBody[key]) attributes[key] = requestBody[key];
                else return callback({message: "Missing parameter " + key}, null);
            }
        }
    }
    return callback(null, attributes);
}