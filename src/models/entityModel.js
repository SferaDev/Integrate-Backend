import mongoose from "mongoose";
import passwordGenerator from "password-generator";
import mongoose_delete from "mongoose-delete";

import {userModel} from "./userModel";

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

export const entityModel = userModel.discriminator('Entity', entitySchema);
