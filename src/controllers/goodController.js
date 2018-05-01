import {entityModel} from "../models/entityModel";
import {beneficiaryModel} from "../models/beneficiaryModel";
import {goodModel} from "../models/goodModel";
import {
    CATEGORIES,
    STATUS_BAD_REQUEST,
    STATUS_CREATED,
    STATUS_FORBIDDEN,
    STATUS_OK,
    STATUS_SERVER_ERROR
} from "../constants";

exports.getGoods = function (req, res) {
    if (req.userType === 'Beneficiary') {
        // Query params
        let categoryIndex = req.query.category;
        let orderIndex = req.query.order;
        let latitude = req.query.latitude;
        let longitude = req.query.longitude;
        if ((!categoryIndex || !orderIndex) || (orderIndex === 3 && (!latitude || !longitude)))
            res.status(STATUS_BAD_REQUEST).send({message: "Missing query parameters"});
        else {
            // Build the query
            let aggregate = goodModel.aggregate();
            let category;
            if (categoryIndex !== "0") category = {category: CATEGORIES[categoryIndex]};
            // Filter by location (must be the first operation of the pipeline)
            if (orderIndex === "2") {
                aggregate.near({
                    near: {type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    distanceField: "dist",
                    // Add the category query
                    query: category,
                    spherical: true
                });
            }
            else {
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
                if (err) res.status(STATUS_SERVER_ERROR).send(err);
                else res.status(STATUS_OK).send(goods);
            });
        }
    } else {
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
    } else {
        res.status(STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
};

exports.addGood = function (req, res) {
    if (req.userType === 'Entity') {
        entityModel.findOne({email: req.userId}, function (err, entity) {
            if (err == null)
                req.body.userId = entity._id;
                req.body.location = [entity.addressLongitude, entity.addressLatitude];
            let newGood = new goodModel(req.body);
            newGood.save(function (err, good) {
                if (err) res.status(STATUS_SERVER_ERROR).send(err);
                else res.status(STATUS_CREATED).send(good);
            });
        });
    } else {
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
    } else {
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
    } else {
        res.status(STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
};