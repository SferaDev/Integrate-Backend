import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import mongoose_delete from "mongoose-delete";

import {LANGUAGES} from '../constants';

const baseOptions = {
    timestamps: true
};

const userSchema = new mongoose.Schema({
    nif: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    interfaceLanguage: {
        type: String,
        enum: ['en', 'es', 'ca'],
        default: 'en'
    },
    goodLanguage: {
        type: String,
        enum: LANGUAGES.map(element => element.language),
        default: 'en'
    }
}, baseOptions);

userSchema.plugin(mongoose_delete, {overrideMethods: true});

userSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

// Compare Password async with a callback(error, isMatch)
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compareSync(candidatePassword, this.password);
};

export const userModel = mongoose.model('User', userSchema);
