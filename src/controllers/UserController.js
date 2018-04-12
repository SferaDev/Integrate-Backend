import {beneficiaryModel, userModel, entityModel} from "../models/UserModel";

const axios = require('axios');
const jwt = require('jsonwebtoken');
const base64url = require('base64url');

const LOCAL_ADMINISTRATION_URI = process.env.LOCAL_ADMINISTRATION_URI || 'localhost';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'randomTokenSecret';

const ERROR_NIF_DUPLICATED = 11000;
const ERROR_INVALID_PASSWORD = 12000;
const ERROR_USER_DOESNT_EXIST = 13000;

const STATUS_SERVER_ERROR = 500;

exports.loadBeneficiaries = function (callback) {
    axios.get(LOCAL_ADMINISTRATION_URI)
        .then(function (response) {
            let message = 'Beneficiaries loaded successfuly';
            let err = null;
            response.data.forEach(function (beneficiary) {
                let newBeneficiary = new beneficiaryModel(beneficiary);
                newBeneficiary.save(function (error) {
                    if (error && error.code !== ERROR_NIF_DUPLICATED) {
                        err = error;
                        message = 'Error on saving beneficiary';
                    }
                });
            });
            callback(err, message);
        })
        .catch(function (error) {
            let message = 'Error on fetching beneficiaries from local administration';
            callback(error, message);
        });
};

exports.loginUser = function (req, res) {
    userModel.findOne({email: req.query.email}, function (err, user) {
        if (err) throw err;
        if (user === null) res.send({code: ERROR_USER_DOESNT_EXIST, status: 'User doesn\'t exist'});
        else if (user.comparePassword(req.query.password)) {
            let token = base64url.encode(jwt.sign({
                userId: user.email,
                userType: user.__type
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
            res.send({token: token});
        } else res.send({code: ERROR_INVALID_PASSWORD, status: 'Invalid password'})
    }).catch(function (error) {
        res.status(STATUS_SERVER_ERROR).send(error);
    });
};

exports.getEntities = function (req, res) {
    entityModel.find(function (err, entities) {
        if (err)
            res.status(500).send(err);
        else
            res.status(200).send(entities);
    });
};