'use strict';

module.exports = function(app) {
    var test = require('../controllers/testController');

    // todoList Routes
    app.route('/test')
        .get(test.get_test)
        .post(test.post_test)
};