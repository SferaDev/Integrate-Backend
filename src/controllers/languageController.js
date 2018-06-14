import ISO6391 from "iso-639-1";

import * as constants from "../constants";
import {userModel} from "../models/userModel";

export function getAllLanguages(req, res) {
    let result = [];
    constants.LANGUAGES.forEach(function (element) {
        element.name = ISO6391.getName(element.language);
        element.nativeName = ISO6391.getNativeName(element.language);
        if (element.name !== '') result.push(element);
    });
    res.status(constants.STATUS_OK).send(result);
}

export function getUserInterfaceLanguage(req, res) {
    userModel.findOne({email: req.userId}, function (err, user) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
        res.status(constants.STATUS_OK).send({interfaceLanguage: user.interfaceLanguage});
    });
}

export function getUserGoodLanguage(req, res) {
    userModel.findOne({email: req.userId}, function (err, user) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
        res.status(constants.STATUS_OK).send({goodLanguage: user.goodLanguage});
    });
}

export function setUserInterfaceLanguage(req, res) {
    userModel.findOne({email: req.userId}, function (err, user) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
        let validOptions = userModel.schema.tree['interfaceLanguage']['enum'];
        if (validOptions.indexOf(req.body.interfaceLanguage) === -1)
            return res.status(constants.STATUS_BAD_REQUEST).send({message: 'Invalid language'});
        user.interfaceLanguage = req.body.interfaceLanguage;
        user.save(function (err2, user2) {
            if (err2) return res.status(constants.STATUS_SERVER_ERROR).send(err2);
            res.status(constants.STATUS_OK).send({success: true, interfaceLanguage: user2.interfaceLanguage});
        });
    });
}

export function setUserGoodLanguage(req, res) {
    userModel.findOne({email: req.userId}, function (err, user) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
        let validOptions = userModel.schema.tree['goodLanguage']['enum'];
        if (validOptions.indexOf(req.body.goodLanguage) === -1)
            return res.status(constants.STATUS_BAD_REQUEST).send({message: 'Invalid language'});
        user.goodLanguage = req.body.goodLanguage;
        user.save(function (err2, user2) {
            if (err2) return res.status(constants.STATUS_SERVER_ERROR).send(err2);
            res.status(constants.STATUS_OK).send({success: true, goodLanguage: user2.goodLanguage});
        });
    });
}
