module.exports = function(app) {
    /*
    const beneficiaryController = require('../controllers/BeneficiaryController');

    app.route('/beneficiaries')
        .post(beneficiaryController.loadBeneficiaries)
    */
    const goodController = require('../controllers/GoodController');
    app.route('/me/goods')
        .post(goodController.addGood)
};
