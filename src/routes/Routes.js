'use strict';

module.exports = function(app) {
    const beneficiaryController = require('../controllers/BeneficiaryController');

    app.route('/beneficiaries')
        .post(beneficiaryController.loadBeneficiaries);

    app.route('/login')
        .post(beneficiaryController.loginBeneficiary);
};
