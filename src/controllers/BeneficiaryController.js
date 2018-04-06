const axios = require('axios');
const mongoose = require('mongoose');

const Beneficiary = mongoose.model('Beneficiary');

const ERROR_NIF_DUPLICATED = 11000;

exports.loadBeneficiaries = function(callback) {
    axios.get(process.env.LOCAL_ADMINISTRATION_URI)
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
