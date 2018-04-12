const mongoose = require('mongoose');
const Good = mongoose.model('Good');

exports.addGood = function (req, res) {
    if (req.userType === 'Entity') {
        let newGood = new Good(req.body);
        newGood.save(function (err, good) {
            if (err)
                res.status(500).send(err);
            res.status(201).send(good);
        });
    }
};