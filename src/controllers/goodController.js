import {entityModel} from "../models/entityModel";
import {beneficiaryModel} from "../models/beneficiaryModel";
import {goodModel} from "../models/goodModel";
import {STATUS_CREATED, STATUS_FORBIDDEN, STATUS_OK, STATUS_SERVER_ERROR} from "../constants";

exports.getGoods = function (req, res) {
    if (req.userType === 'Beneficiary') {
        goodModel.find(function(err, goods) {
            if (err) res.status(STATUS_SERVER_ERROR).send(err);
            else res.status(STATUS_OK).send(goods);
        });
    }
    else {
        res.status(STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
};

exports.getFavouriteGoods = function (req, res) {
    if (req.userType === 'Beneficiary') {
        beneficiaryModel.findOne({email: req.userId}, function (err, beneficiary) {
            if (err) res.status(STATUS_SERVER_ERROR).send(err);
            else {
                goodModel.find({_id: {$in: beneficiary.favouriteGoods}}, function (err, goods) {
                if (err) res.status(STATUS_SERVER_ERROR).send(err);
                else res.status(STATUS_OK).send(goods);
                });
            }
        });
    }
    else {
        res.status(STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
};

exports.addGood = function (req, res) {
    if (req.userType === 'Entity') {
        entityModel.findOne({email: req.userId}, function (err, entity) {
            if (err == null)
                req.body.userId = entity._id;
            let newGood = new goodModel(req.body);
            newGood.save(function (err, good) {
                if (err) res.status(STATUS_SERVER_ERROR).send(err);
                else res.status(STATUS_CREATED).send(good);
            });
        });
    }
    else {
        res.status(STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
};

exports.deleteGood = function (req, res) {
    if (req.userType === 'Entity') {
        let id = req.params.id;
        goodModel.findByIdAndRemove(id, function (err) {
            if (err) res.status(STATUS_SERVER_ERROR).send(err);
            else res.status(STATUS_OK).send({message: "Good with id: " + id + " successfuly deleted"});
        });
    }
    else {
        res.status(STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
};

exports.updateGood = function (req, res) {
    if (req.userType === 'Entity') {
        let id = req.params.id;
        goodModel.findByIdAndUpdate(id, req.body, {new: true}, function (err, good) {
            if (err) res.status(STATUS_SERVER_ERROR).send(err);
            else res.status(STATUS_OK).send(good);
        });
    }
    else {
        res.status(STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
};