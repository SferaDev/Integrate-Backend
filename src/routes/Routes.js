'use strict';

module.exports = function(app) {
    var beneficiary = require('../controllers/BeneficiaryController');

    app.route('/beneficiaries')
        .post(beneficiary.loadBeneficiaries)
};
