import {userModel} from "../models/userModel";
import {goodModel} from "../models/goodModel";
import * as constants from "../constants";

export function loginUser(req, res) {
    if (req.query.email !== undefined && req.query.nif !== undefined) return res.status(constants.STATUS_UNAUTHORIZED).send({
        code: constants.ERROR_WRONG_PARAMETERS,
        status: 'Please input just one email or nif'
    });
    if (req.query.email === undefined && req.query.nif === undefined) return res.status(constants.STATUS_UNAUTHORIZED).send({
        code: constants.ERROR_WRONG_PARAMETERS,
        status: 'Please input at least one email or nif'
    });
    if (req.query.password === undefined) return res.status(constants.STATUS_UNAUTHORIZED).send({
        code: constants.ERROR_WRONG_PARAMETERS,
        status: 'Please input one password'
    });
    userModel.loginUser(req.query.email, req.query.nif, req.query.password, (err, infoUser, wasDeleted) => {
        if (err) return res.status(err.code).send(err.message);
        if (wasDeleted && infoUser.user.__t === 'Entity') goodModel.restore({'owner.id': infoUser.user._id}, function (err) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
        });
        return res.status(constants.STATUS_OK).send(infoUser);
    });
}

export function resetPassword(req, res) {
    let nif = req.body.nif || req.query.nif;
    userModel.findOne({nif: nif}, function (err, user) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
        if (user === null) return res.status(constants.STATUS_NOT_FOUND).send({message: 'User not found'});
        user.resetPassword((err, message) => {
            if (err) return res.status(err.code).send(err.message);
            return res.status(constants.STATUS_CREATED).send(message);
        });
    });
}

export function changePassword(req, res) {
    userModel.findOne({email: req.userId}, function (err, user) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send();
        user.changePassword(req.body.oldPassword, req.body.newPassword, (err, message) => {
            if (err) return res.status(err.code).send(err.message);
            return res.status(constants.STATUS_OK).send(message);
        });
    });
}

export function validateUser(req, res) {
    userModel.findOne({email: req.userId}, function (err, user) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send();
        res.send({success: true, user: user.userInfo()});
    });
}