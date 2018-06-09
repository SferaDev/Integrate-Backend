import {entityModel} from "../models/entityModel";
import {beneficiaryModel} from "../models/beneficiaryModel";
import {goodModel} from "../models/goodModel";
import * as constants from "../constants";

export function getGoods(req, res) {
    if (req.userType === 'Beneficiary') {
        // Query params
        let categoryIndex = req.query.category;
        let orderIndex = req.query.order;
        let latitude = req.query.latitude;
        let longitude = req.query.longitude;
        if ((!categoryIndex || !orderIndex) || (orderIndex === 3 && (!latitude || !longitude))) {
            res.status(constants.STATUS_BAD_REQUEST).send({message: "Missing query parameters"});
        } else {
            // Build the query
            let aggregate = goodModel.aggregate();
            let category;
            if (categoryIndex !== "0") category = {category: parseInt(categoryIndex), pendingUnits: {$gt: 0}};
            // Filter by location (must be the first operation of the pipeline)
            if (orderIndex === "2") {
                aggregate.near({
                    near: {type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)]},
                    distanceField: "distance",
                    query: category,
                    spherical: true
                });
            } else {
                // Filter by category
                if (category) aggregate.match(category);
                // Sort by update date or popularity
                let order;
                if (orderIndex === "0") order = {updatedAt: 'desc'};
                else order = {numberFavs: 'desc'};
                aggregate.sort(order);
            }
            // Execute the query
            aggregate.exec(function (err, goods) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                let userEmail = req.userId;
                beneficiaryModel.findOne({email: userEmail}, function (err, beneficiary) {
                    if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                    let goodsObject = [];
                    for (let good of goods) {
                        good = new goodModel(good);
                        let goodObject = good.toObject();
                        goodObject.isUsable = good.isUsable(beneficiary);
                        goodsObject.push(goodObject);
                    }
                    res.status(constants.STATUS_OK).send(goodsObject);
                });
            });
        }
    } else {
        entityModel.findOne({email: req.userId}, function (err, entity) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            goodModel.find({'owner.id': entity._id}, function (err, goods) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                res.status(constants.STATUS_OK).send(goods);
            });
        });
    }
}

export function getGood (req, res) {
    goodModel.findById(req.params.id, function (err, good) {
        if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
        if (good === null) return res.status(constants.STATUS_NOT_FOUND).send({message: "Good not found"});
        if (req.userType === 'Beneficiary') {
            let userEmail = req.userId;
            beneficiaryModel.findOne({email: userEmail}, function (err, beneficiary) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                let goodObject = good.toObject();
                goodObject.isUsable = good.isUsable(beneficiary);
                return res.status(constants.STATUS_OK).send(goodObject);
            });
        }
        else res.status(constants.STATUS_OK).send(good);
    });
}

export function getFavouriteGoods(req, res) {
    if (req.userType === 'Beneficiary') {
        beneficiaryModel.findOne({email: req.userId}, function (err, beneficiary) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            goodModel.find({_id: {$in: beneficiary.favouriteGoods}, pendingUnits: {$gt: 0}}, function (err, goods) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                let goodsObject = [];
                for (let good of goods) {
                    let goodObject = good.toObject();
                    goodObject.isUsable = good.isUsable(beneficiary);
                    goodsObject.push(goodObject);
                }
                res.status(constants.STATUS_OK).send(goodsObject);
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function addGood(req, res) {
    if (req.userType === 'Entity') {
        entityModel.findOne({email: req.userId}, function (err, entity) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            req.body.owner = {id: entity._id, name: entity.name};
            req.body.location = entity.coordinates;
            let newGood = new goodModel(req.body);
            newGood.save(function (err, good) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                res.status(constants.STATUS_CREATED).send(good);
            });
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
        beneficiaryModel.findOne({email: req.userId}, function (err, beneficiary) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            let id = req.params.id;
            goodModel.findById(id, function (err, good) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                if (!good) return res.status(constants.STATUS_NOT_FOUND).send({error: "Good doesn't exist"});
                let index = beneficiary.favouriteGoods.indexOf(good._id);
                if (index === -1) {
                    good.numberFavs = good.numberFavs + 1;
                    good.save();
                    beneficiary.favouriteGoods.push(good._id);
                    beneficiary.save();
                    res.status(constants.STATUS_OK).send(beneficiary.favouriteGoods);
                } else res.status(constants.STATUS_CONFLICT).send({error: "This good is already in your favourite list"});
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function deleteFavouriteGood(req, res) {
    if (req.userType === 'Beneficiary') {
        beneficiaryModel.findOne({email: req.userId}, function (err, beneficiary) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            let id = req.params.id;
            goodModel.findById(id, function (err, good) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                if (!good) return res.status(constants.STATUS_NOT_FOUND).send({error: "Good doesn't exist"});
                let index = beneficiary.favouriteGoods.indexOf(good._id);
                if (index !== -1) {
                    good.numberFavs = good.numberFavs - 1;
                    good.save();
                    beneficiary.favouriteGoods.splice(index,1);
                    beneficiary.save();
                    res.status(constants.STATUS_OK).send(beneficiary.favouriteGoods);
                } else {
                    res.status(constants.STATUS_NOT_FOUND).send({error: "This good is not in your favourite list"});
                }
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}
