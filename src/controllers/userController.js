import {userModel} from "../models/userModel";
import {
    ERROR_INVALID_PASSWORD,
    ERROR_USER_DOESNT_EXIST,
    ERROR_WRONG_PARAMETERS,
    STATUS_SERVER_ERROR,
    STATUS_UNAUTHORIZED,
    TOKEN_SECRET
} from "../constants";

const jwt = require('jsonwebtoken');
const base64url = require('base64url');

exports.loginUser = function (req, res) {
    if ((req.query.email !== undefined && req.query.nif !== undefined) || req.query.password === undefined ||
        (req.query.email === undefined && req.query.nif === undefined))
        res.status(STATUS_UNAUTHORIZED).send({
            code: ERROR_WRONG_PARAMETERS,
            status: 'Wrong parameters'
        });
    else userModel.findOne({$or: [{email: req.query.email}, {nif: req.query.nif}]}, function (err, user) {
        if (err) throw err;
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
    }).catch(function (error) {
        res.status(STATUS_SERVER_ERROR).send(error);
    });
};
