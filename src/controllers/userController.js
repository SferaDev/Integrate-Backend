import passwordGenerator from "password-generator";
import jwt from "jsonwebtoken";
import base64url from "base64url";

import {sendMail} from "../../common/mail";
import {userModel} from "../models/userModel";
import * as constants from "../constants";

export function loginUser(req, res) {
    if ((req.query.email !== undefined && req.query.nif !== undefined) || req.query.password === undefined ||
        (req.query.email === undefined && req.query.nif === undefined))
        res.status(constants.STATUS_UNAUTHORIZED).send({
            code: constants.ERROR_WRONG_PARAMETERS,
            status: 'Wrong parameters'
        });
    else userModel.findOne({$or: [{email: req.query.email}, {nif: req.query.nif}]}, function (err, user) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
        if (user === null) return res.status(constants.STATUS_UNAUTHORIZED).send({
            code: constants.ERROR_USER_DOESNT_EXIST,
            status: 'User doesn\'t exist'
        });
        if (user.comparePassword(req.query.password)) {
            let token = base64url.encode(jwt.sign({
                userId: user.email
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
            res.send({token: token, user: userInfo(user)});
        } else res.status(constants.STATUS_UNAUTHORIZED).send({
            code: constants.ERROR_INVALID_PASSWORD,
            status: 'Invalid password'
        });
    });
}

export function resetPassword(req, res) {
    let nif = req.body.nif || req.query.nif;
    userModel.findOne({nif: nif}, function (err, user) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send();
        if (user === null) return res.status(constants.STATUS_NOT_FOUND).send({message: 'User not found'});
        user.password = passwordGenerator(8, false);
        let newPassword = user.password;
        user.save(function (err) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send();
            sendMail(user.email, 'Password reset on Integrate', 'Hi there!\n\nYou have requested a password reset.\n\nAccount: ' +
                user.nif + '\nPassword: ' + newPassword + '\n\nPlease change your password after your next login.');
            res.status(constants.STATUS_CREATED).send();
        });
    });
}

export function changePassword(req, res) {
    userModel.findOne({email: req.userId}, function (err, user) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send();
        if (user.comparePassword(req.body.oldPassword)) {
            user.password = req.body.newPassword;
            user.save(function (err) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send();
                return res.status(constants.STATUS_OK).send({message: 'Password changed'});
            });
        } else return res.status(constants.STATUS_BAD_REQUEST).send({message: 'Invalid old password'});
    });
}

export function validateUser(req, res) {
    userModel.findOne({email: req.userId}, function (err, user) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send();
        res.send({success: true, user: userInfo(user)});
    });
}

function userInfo(user) {
    let userObject = user.toObject();
    delete userObject._id;
    delete userObject.password;
    delete userObject.createdAt;
    delete userObject.updatedAt;
    delete userObject.__v;
    if (userObject.hasOwnProperty('validationCode')) delete userObject.validationCode;
    return userObject;
}