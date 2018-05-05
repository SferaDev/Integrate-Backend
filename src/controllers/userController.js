import passwordGenerator from "generate-random-password";
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
                userId: user.email,
                userType: user.__t
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
            res.send({token: token});
        } else res.status(constants.STATUS_UNAUTHORIZED).send({
            code: constants.ERROR_INVALID_PASSWORD,
            status: 'Invalid password'
        })
    });
}

export function resetPassword(req, res) {
    userModel.findOne({nif: req.body.nif}, function (err, user) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send();
        if (user === null) return res.status(constants.STATUS_NOT_FOUND).send({message: 'User not found'});
        user.password = passwordGenerator.generateRandomPassword(8);
        sendMail(user.email, 'Password reset on Integrate', 'You have requested a password reset.\n\nAccount: ' +
            user.nif + '\nPassword: ' + user.password + '\n\nPlease change your password after your next login.');
        user.save();
        res.status(constants.STATUS_CREATED).send();
    });
}
