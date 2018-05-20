import mongoose from "mongoose";
import passwordGenerator from "generate-random-password";

import {userModel} from "./userModel";

export const entityModel = userModel.discriminator('Entity', new mongoose.Schema({
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
        default: "1"//passwordGenerator.generateRandomPassword(6)
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
    enabled: {
        type: Boolean,
        default: false
    }
}).index({coordinates: '2dsphere'}));
