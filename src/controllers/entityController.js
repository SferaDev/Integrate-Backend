import passwordGenerator from "password-generator";

import {sendMail} from "../../common/mail";
import {entityModel} from "../models/entityModel";
import * as constants from "../constants";
import {goodModel} from "../models/goodModel";
import {beneficiaryModel} from "../models/beneficiaryModel";
import {orderModel} from "../models/orderModel";
import moment from "moment";

export function getEntities(req, res) {
    if (req.userType === 'Beneficiary') {
        let latitude = req.query.latitude;
        let longitude = req.query.longitude;
        if (!latitude || !longitude)
            res.status(constants.STATUS_BAD_REQUEST).send({message: "Missing query parameters"});
        else {
            // Build the query
            let aggregate = entityModel.aggregate();
            aggregate.near({
                near: {type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)]},
                distanceField: "distance",
                spherical: true
            });
            aggregate.project({
                name: 1,
                description: 1,
                addressName: 1,
                coordinates: 1,
                phone: 1,
                picture: 1,
                distance: 1,
                numberLikes: 1
            });
            // Execute the query
            aggregate.exec(function (err, entities) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                let userEmail = req.userId;
                beneficiaryModel.findOne({email: userEmail}, function (err, beneficiary) {
                    if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                    let entitiesObjects = [];
                    for (let entity of entities) {
                        entity.isLiked = (beneficiary.likedEntities.indexOf(entity._id) !== -1);
                        entitiesObjects.push(entity);
                    }
                    res.status(constants.STATUS_OK).send(entitiesObjects);
                });
            });
        }
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function getEntity(req, res) {
    if (req.userType === 'Beneficiary') {
        let id = req.params.id;
        let entityParams = {
            name: 1,
            email: 1,
            description: 1,
            addressName: 1,
            coordinates: 1,
            phone: 1,
            picture: 1,
            distance: 1,
            numberLikes: 1
        };
        entityModel.findById(id, entityParams, function (err, entity) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            if (entity === null) return res.status(constants.STATUS_NOT_FOUND).send({message: "Entity not found"});
            beneficiaryModel.findOne({email: req.userId}, function (err, beneficiary) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                goodModel.find({"owner.id": entity._id, pendingUnits: {$gt: 0}}, function (err, goods) {
                    if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                    let entityJSON = entity.toObject();
                    entityJSON.isLiked = (beneficiary.likedEntities.indexOf(entity._id) !== -1);
                    let goodsObject = [];
                    for (let good of goods) {
                        let goodObject = good.toObject();
                        goodObject.isUsable = good.isUsable(beneficiary);
                        goodsObject.push(goodObject);
                    }
                    entityJSON.goods = goodsObject;
                    return res.status(constants.STATUS_OK).send(entityJSON);
                });
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function createNewEntity(req, res) {
    let attributes = {};
    for (let key in entityModel.schema.paths) {
        if (entityModel.schema.paths.hasOwnProperty(key)) {
            let value = entityModel.schema.paths[key];
            if (value.isRequired) {
                if (req.body[key]) attributes[key] = req.body[key];
                else return res.status(constants.STATUS_BAD_REQUEST).send({message: "Missing parameter " + key});
            }
        }
    }
    entityModel.create(attributes, function (err, entity) {
        if (err) {
            if (err.code === 11000) return res.status(constants.STATUS_CONFLICT).send({message: 'NIF or email already exists'});
            return res.status(constants.STATUS_SERVER_ERROR).send(err);
        }
        entity.password = passwordGenerator(8, false);
        sendMail(entity.email, 'Welcome to Integrate!', 'Welcome!\n\nYour account has been successfully created.\n\nAccount: ' +
            entity.nif + '\nPassword: ' + entity.password + '\n\nPlease change your password after your first login.');
        entity.save();
        res.status(constants.STATUS_CREATED).send();
    });
}

export function getEntityStats(req, res) {
    if (req.userType === 'Entity') {
        entityModel.findOne({email: req.userId}, function (err, entity) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            entity.getStats((err, stats) => {
                if (err) return res.status(err.code).send(err.message);
                return res.status(constants.STATUS_OK).send(stats);
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function getSalesChart(req, res) {
    if (req.userType === 'Entity') {
        entityModel.findOne({email: req.userId}, function (err, entity) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            let interval = req.query.interval;
            let beginingDate, endDate;
            endDate = moment();
            if (interval === "Day") beginingDate = moment().subtract(1, 'days');
            else if (interval === "Week") beginingDate = moment().subtract(1, 'weeks');
            else if (interval === "Month") beginingDate = moment().subtract(1, 'months');
            else if (interval === "Year") beginingDate = moment().subtract(1, 'years');
            else return res.status(constants.STATUS_BAD_REQUEST).send({message: "Incorrect interval"});
            orderModel.find({
                entity: entity._id,
                createdAt: {
                    "$gte": beginingDate,
                    "$lte": endDate
                }
            }, function (err, orders) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                let stats = new Map();
                for (let order of orders) {
                    let date = moment(order.createdAt);
                    date = date.startOf('date').format("YYYY-MM-DD");
                    if (req.query.good) {
                        let orderedGoodIndex = order.orderedGoods.findIndex(function (element) {
                            return element.toString() === req.query.good;
                        });
                        if (orderedGoodIndex !== -1) {
                            if (stats.has(date)) stats.set(date, stats.get(date) + 1);
                            else stats.set(date, 1);
                        }
                    }
                    else {
                        if (stats.has(date)) stats.set(date, stats.get(date) + order.orderedGoods.length);
                        else stats.set(date, order.orderedGoods.length);
                    }
                }
                res.status(constants.STATUS_OK).send({stats: Array.from(stats)});
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function likeEntity(req, res) {
    if (req.userType === 'Beneficiary') {
        let id = req.params.id;
        entityModel.findById(id, function (err, entity) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            if (entity === null) return res.status(constants.STATUS_NOT_FOUND).send({message: "Entity not found"});
            beneficiaryModel.findOne({email: req.userId}, function (err, beneficiary) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                let index = beneficiary.likedEntities.indexOf(entity._id);
                if (index === -1) {
                    entity.numberLikes += 1;
                    entity.save();
                    beneficiary.likedEntities.push(entity._id);
                    beneficiary.save();
                    return res.status(constants.STATUS_OK).send({numberLikes: entity.numberLikes});
                } else {
                    return res.status(constants.STATUS_CONFLICT).send({message: "You already like this entity"});
                }
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function dislikeEntity(req, res) {
    if (req.userType === 'Beneficiary') {
        let id = req.params.id;
        entityModel.findById(id, function (err, entity) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            if (entity === null) return res.status(constants.STATUS_NOT_FOUND).send({message: "Entity not found"});
            beneficiaryModel.findOne({email: req.userId}, function (err, beneficiary) {
                if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                let index = beneficiary.likedEntities.indexOf(entity._id);
                if (index !== -1) {
                    entity.numberLikes -= 1;
                    entity.save();
                    beneficiary.likedEntities.splice(index, 1);
                    beneficiary.save();
                    return res.status(constants.STATUS_OK).send({numberLikes: entity.numberLikes});
                } else {
                    return res.status(constants.STATUS_CONFLICT).send({message: "You do not like this entity yet"});
                }
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function deactivateEntity(req, res) {
    if (req.userType === 'Entity') {
        entityModel.delete({email: req.userId}, function (err, result) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            res.status(constants.STATUS_OK).send({message: "Entity deactivation with result: " + result});
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}
