import mongoose from "mongoose";
import mongoose_delete from "mongoose-delete";

import {userModel} from "./userModel";

const briefGoodSchema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Good'
    },
    date: {
        type: Number
    }
},{_id: false});

const beneficiarySchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    favouriteGoods: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Good'
    }],
    likedEntities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entity'
    }],
    usedGoods: [briefGoodSchema]
});

beneficiarySchema.plugin(mongoose_delete, { overrideMethods: true });

export const beneficiaryModel = userModel.discriminator('Beneficiary', beneficiarySchema);
