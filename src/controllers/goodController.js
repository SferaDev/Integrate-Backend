import {goodModel} from "../models/goodModel";
import * as constants from "../constants";

export function getGoods(req, res) {
    if (req.userType === 'Beneficiary') {
        goodModel.getGoods(req.userId, req.query.category, req.query.order, req.query.latitude, req.query.longitude, (err, goods) => {
            if (err) return res.status(err.code).send(err.message);
            return res.status(constants.STATUS_OK).send(goods);
        });
    } else {
        goodModel.getEntityGoods(req.userId, (err, goods) => {
            if (err) return res.status(err.code).send(err.message);
            return res.status(constants.STATUS_OK).send(goods);
        });
    }
}

export function getGood(req, res) {
    goodModel.getGood(req.userType, req.userId, req.params.id, (err, good) => {
        if (err) return res.status(err.code).send(err.message);
        return res.status(constants.STATUS_OK).send(good);
    });
}

export function getFavouriteGoods(req, res) {
    if (req.userType === 'Beneficiary') {
        goodModel.getFavouriteGoods(req.userId, (err, goods) => {
            if (err) return res.status(err.code).send(err.message);
            return res.status(constants.STATUS_OK).send(goods);
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function addGood(req, res) {
    if (req.userType === 'Entity') {
        goodModel.addGood(req.userId, req.body, (err, good) => {
            if (err) return res.status(err.code).send(err.message);
            return res.status(constants.STATUS_CREATED).send(good);
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function deleteGood(req, res) {
    if (req.userType === 'Entity') {
        let id = req.params.id;
        goodModel.findByIdAndRemove(id, function (err) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            res.status(constants.STATUS_OK).send({message: "Good with id: " + id + " successfully deleted"});
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function updateGood(req, res) {
    if (req.userType === 'Entity') {
        let id = req.params.id;
        goodModel.findByIdAndUpdate(id, req.body, {new: true}, function (err, good) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            res.status(constants.STATUS_OK).send(good);
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function addFavouriteGood(req, res) {
    if (req.userType === 'Beneficiary') {
        let id = req.params.id;
        goodModel.findById(id, function (err, good) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            if (!good) return res.status(constants.STATUS_NOT_FOUND).send({error: "Good doesn't exist"});
            good.addFavouriteGood(req.userId, (err, favouriteGoods) => {
                if (err) return res.status(err.code).send(err.message);
                return res.status(constants.STATUS_OK).send(favouriteGoods);
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function deleteFavouriteGood(req, res) {
    if (req.userType === 'Beneficiary') {
        let id = req.params.id;
        goodModel.findById(id, function (err, good) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            if (!good) return res.status(constants.STATUS_NOT_FOUND).send({error: "Good doesn't exist"});
            good.deleteFavouriteGood(req.userId, (err, favouriteGoods) => {
                if (err) return res.status(err.code).send(err.message);
                return res.status(constants.STATUS_OK).send(favouriteGoods);
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}
