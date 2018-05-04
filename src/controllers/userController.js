import passwordGenerator from "generate-random-password";

import {userModel} from "../models/userModel";
import {
    ERROR_INVALID_PASSWORD,
    ERROR_USER_DOESNT_EXIST,
    ERROR_WRONG_PARAMETERS, STATUS_CONFLICT, STATUS_CREATED, STATUS_NOT_FOUND,
    STATUS_SERVER_ERROR,
    STATUS_UNAUTHORIZED,
    TOKEN_SECRET
} from "../constants";
import {sendMail} from "../../common/mail";

const jwt = require('jsonwebtoken');
const base64url = require('base64url');

export function loginUser(req, res) {
    if ((req.query.email !== undefined && req.query.nif !== undefined) || req.query.password === undefined ||
        (req.query.email === undefined && req.query.nif === undefined))
        res.status(STATUS_UNAUTHORIZED).send({
            code: ERROR_WRONG_PARAMETERS,
            status: 'Wrong parameters'
        });
    else userModel.findOne({$or: [{email: req.query.email}, {nif: req.query.nif}]}, function (err, user) {
        if (err) return res.status(STATUS_SERVER_ERROR).send(error);
        if (user === null) res.status(STATUS_UNAUTHORIZED).send({
            code: ERROR_USER_DOESNT_EXIST,
            status: 'User doesn\'t exist'
        });
        else if (user.comparePassword(req.query.password)) {
            let token = base64url.encode(jwt.sign({
                userId: user.email,
                userType: user.__t
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
            res.send({token: token});
        } else res.status(STATUS_UNAUTHORIZED).send({code: ERROR_INVALID_PASSWORD, status: 'Invalid password'})
    });
}

export function resetPassword(req, res) {
    userModel.findOne({nif: req.body.nif}, function (err, user) {
        if (err) return res.status(STATUS_SERVER_ERROR).send();
        if (user === null) return res.status(STATUS_NOT_FOUND).send({message: 'User not found'});
        user.password = passwordGenerator.generateRandomPassword(8);
        sendMail(user.email, 'Password reset on Integrate', 'You have requested a password reset.\n\nAccount: ' +
            user.nif + '\nPassword: ' + user.password + '\n\nPlease change your password after your next login.');
        user.save();
        res.status(STATUS_CREATED).send();
    });
}
