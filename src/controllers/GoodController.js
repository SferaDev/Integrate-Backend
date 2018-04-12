import {entityModel} from "../models/UserModel";

const mongoose = require('mongoose');
const Good = mongoose.model('Good');

exports.addGood = function (req, res) {
    if (req.userType === 'Entity') {
        entityModel.findOne({email: req.userId}, function (err, entity) {
            if (err == null)
                req.body.userId = entity._id;
            let newGood = new Good(req.body);
            console.log(newGood);
            newGood.save(function (err, good) {
                if (err)
                    res.status(500).send(err);
                res.status(201).send(good);
            });
        });
    }
};