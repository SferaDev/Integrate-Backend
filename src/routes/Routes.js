'use strict';

module.exports = function(app) {
    var beneficiary = require('../controllers/BeneficiaryController');

    // todoList Routes
    app.route('/beneficiaries')
        .post(beneficiary.loadBeneficiaries)
};