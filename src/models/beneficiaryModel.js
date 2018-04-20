import {userModel} from "./userModel";
import mongoose from "mongoose";

export const beneficiaryModel = userModel.discriminator('Beneficiary', new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    }
}));