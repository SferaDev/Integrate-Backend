import {entityModel} from "../models/entityModel";
import {goodModel} from "../models/goodModel";
import {STATUS_CREATED, STATUS_OK, STATUS_SERVER_ERROR} from "../constants";

exports.getGoods = function (req, res) {
    if (req.userType === 'Beneficiary') {
        goodModel.find(function(err, goods) {
            if (err) res.status(STATUS_SERVER_ERROR).send(err);
            else res.status(STATUS_OK).send(goods);
        });
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
};

exports.deleteGood = function (req, res) {
    if (req.userType === 'Entity') {
        let id = req.params.id;
        goodModel.findByIdAndRemove(id, function (err) {
            if (err) res.status(STATUS_SERVER_ERROR).send(err);
            else res.status(STATUS_OK).send({message: "Good with id: " + id + " successfuly deleted"});
        });
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
};