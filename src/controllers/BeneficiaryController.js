'use strict';

const axios = require('axios');
const mongoose = require('mongoose');

const Beneficiary = mongoose.model('Beneficiary');

const ERROR_NIF_DUPLICATED = 11000;
const ERROR_INVALID_PASSWORD = 12000;
const STATUS_CONNECTION_OK = 200;
const STATUS_SERVER_ERROR = 500;

exports.loadBeneficiaries = function(req, res) {
    axios.get(process.env.LOCAL_ADMINISTRATION_URI + '/beneficiaries')
        .then(function (response) {
            let status = STATUS_CONNECTION_OK;
            let body = {status: 'SUCCESS'};
            response.data.forEach(function (beneficiary) {
                let newBeneficiary = new Beneficiary(beneficiary);
                newBeneficiary.save(function (error) {
                    if (error && error.code !== ERROR_NIF_DUPLICATED) {
                        status = STATUS_SERVER_ERROR;
                        body = error;
                    }
                });
            });
            res.status(status).send(body);
        })
        .catch(function (error) {
            res.status(error.response.status).send(error.response.data);
        });
};

exports.loginBeneficiary = function (req, res) {
    Beneficiary.findOne({ email: req.data.email }, function (err, beneficiary) {
        if (err) throw err;

        beneficiary.comparePassword(req.data.password, function (err, isCorrect) {
            if (err) throw err;
            if (isCorrect) {
                // TODO: Assign a new valid token for user
                // TODO: Return the valid token to response
                res.status(STATUS_CONNECTION_OK).send({ token: null});
            } else res.status(ERROR_INVALID_PASSWORD);
        })
    }).catch(function (error) {
        res.status(STATUS_SERVER_ERROR).send(error);
    });
};
