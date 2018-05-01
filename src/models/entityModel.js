import {userModel} from "./userModel";
import mongoose from "mongoose";

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
        type: String
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
    location: {
        // longitude and latitude
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
}));