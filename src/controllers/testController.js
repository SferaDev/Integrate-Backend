'use strict';

var mongoose = require('mongoose'),
    Test = mongoose.model('Test');

exports.get_test = function(req, res) {
    Test.find({}, function(err, test) {
        if (err)
            res.send(err);
        res.json(test);
    });
};

exports.post_test = function(req, res) {
    var new_test = new Test(req.body);
    new_test.save(function(err, test) {
        if (err)
            res.send(err);
        res.json(test);
    });
};