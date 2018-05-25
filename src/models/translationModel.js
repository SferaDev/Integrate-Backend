import mongoose from "mongoose";

import {LANGUAGES} from '../constants';

const translationSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true,
        unique: true
    },
    language: {
        type: String,
        required: true,
        enum: LANGUAGES.map(element => element.language)
    },
    output: {
        type: String,
        required: true
    }
});

export const translationModel = mongoose.model('Translation', translationSchema);