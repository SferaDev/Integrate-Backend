import mongoose from "mongoose";

import {LANGUAGES} from '../constants';

const translationSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true
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

translationSchema.index({input: 1, language: 2}, {unique: true});

export const translationModel = mongoose.model('Translation', translationSchema);