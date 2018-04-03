'use strict';

const axios = require('axios');

var mongoose = require('mongoose'),
    Beneficiary = mongoose.model('Beneficiary');

exports.loadBeneficiaries = function(req, res) {
    axios.get(process.env.LOCAL_ADMINISTRATION_URI + '/beneficiaries')
        .then(function (response) {
            var status = 200;
            var body = {status:'SUCCESS'};
            response.data.forEach(function (beneficiary) {
                var newBeneficiary = new Beneficiary(beneficiary);
                newBeneficiary.save(function (error) {
                    var nifDuplicatedErrorCode = 11000;
                    if (error && error.code !== nifDuplicatedErrorCode) {
                        status = 500;
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