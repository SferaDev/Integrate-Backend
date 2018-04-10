const axios = require('axios');
const mongoose = require('mongoose');

const Beneficiary = mongoose.model('Beneficiary');

const LOCAL_ADMINISTRATION_URI = process.env.LOCAL_ADMINISTRATION_URI || 'localhost/administration';
const ERROR_NIF_DUPLICATED = 11000;

const ERROR_INVALID_PASSWORD = 12000;
const STATUS_CONNECTION_OK = 200;
const STATUS_SERVER_ERROR = 500;

exports.loadBeneficiaries = function(callback) {
    axios.get(LOCAL_ADMINISTRATION_URI)
        .then(function (response) {
            let message = 'Beneficiaries loaded successfuly';
            let err = null;
            response.data.forEach(function (beneficiary) {
                let newBeneficiary = new Beneficiary(beneficiary);
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
            callback(error,message);
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
