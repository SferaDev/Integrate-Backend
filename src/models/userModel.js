import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import mongoose_delete from "mongoose-delete";

import * as constants from '../constants';
import {LANGUAGES} from '../constants';
import base64url from "base64url";
import jwt from "jsonwebtoken";
import passwordGenerator from "password-generator/index";
import * as mailUtils from "../../common/mail";

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

userSchema.statics.loginUser = function (email, nif, password, callback) {
    userModel.findOneWithDeleted({$or: [{email: email}, {nif: nif}]}, function (err, user) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        if (user === null) return callback({
            code: constants.STATUS_UNAUTHORIZED, message: {
                code: constants.ERROR_USER_DOESNT_EXIST,
                status: "User doesn't exist"
            }
        }, null);
        if (user.deleted) user.restore();
        if (user.comparePassword(password)) {
            let token = base64url.encode(jwt.sign({
                userId: user.email,
                userType: user.__t
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
            return callback(null, {token: token, user: user.userInfo()});
        } else return callback({
            code: constants.STATUS_UNAUTHORIZED, message: {
                code: constants.ERROR_INVALID_PASSWORD,
                status: 'Invalid password'
            }
        }, null);
    });
};

userSchema.methods.resetPassword = function (callback) {
    let user = this;
    user.password = passwordGenerator(8, false);
    let newPassword = user.password;
    user.save(function (err) {
        if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
        mailUtils.sendResetMail(user.email, user.nif, newPassword);
        return callback(null, {message: 'Password updated'});
    });
};

userSchema.methods.changePassword = function (oldPassword, newPassword, callback) {
    let user = this;
    if (user.comparePassword(oldPassword)) {
        user.password = newPassword;
        user.save(function (err) {
            if (err) return callback({code: constants.STATUS_SERVER_ERROR, message: err}, null);
            return callback(null, {message: 'Password changed'});
        });
    } else return callback({code: constants.STATUS_BAD_REQUEST, message: {message: 'Invalid old password'}}, null);
};

userSchema.methods.userInfo = function () {
    let userObject = this.toObject();
    delete userObject._id;
    delete userObject.password;
    delete userObject.createdAt;
    delete userObject.updatedAt;
    delete userObject.__v;
    return userObject;
};

export const userModel = mongoose.model('User', userSchema);
