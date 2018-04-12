import {entityModel} from "../models/UserModel";

const mongoose = require('mongoose');
const Good = mongoose.model('Good');

exports.addGood = function (req, res) {
    if (req.userType === 'Entity') {
        entityModel.findOne({email: req.userId}, function (err, entity) {
            if (err == null)
                req.body.userId = entity._id;
            let newGood = new Good(req.body);
            newGood.save(function (err, good) {
                if (err)
                    res.status(500).send(err);
                else
                    res.status(201).send(good);
            });
        });
    }
};

exports.deleteGood = function (req, res) {
    if (req.userType === 'Entity') {
        let id = req.params.id;
        Good.findByIdAndRemove(id, function (err) {
            if (err)
                res.status(500).send(err);
            else
                res.status(200).send({message: "Good with id: "+id+" successfuly deleted"});
        });
    }
};

exports.updateGood = function (req, res) {
    if (req.userType === 'Entity') {
        let id = req.params.id;
        Good.findByIdAndUpdate(id, req.body, {new:true}, function (err, good) {
            if (err)
                res.status(500).send(err);
            else
                res.status(200).send(good);
        });
    }
};