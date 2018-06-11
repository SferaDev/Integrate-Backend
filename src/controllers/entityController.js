import passwordGenerator from "password-generator";
import moment from "moment";

import {entityModel} from "../models/entityModel";
import {beneficiaryModel} from "../models/beneficiaryModel";
import {orderModel} from "../models/orderModel";

import * as constants from "../constants";
import * as mailUtils from "../../common/mail";
import * as requestUtils from "../helpers/requestUtils";

export function getEntities(req, res) {
    if (req.userType === 'Beneficiary') {
        beneficiaryModel.findOne({email: req.userId}, function (err, beneficiary) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            let location = {latitude: req.query.latitude, longitude: req.query.longitude};
            if (!location.latitude || !location.longitude)
                return res.status(constants.STATUS_BAD_REQUEST).send({message: "Missing location parameters"});
            entityModel.getEntities(req.params.id, beneficiary, location, function (err, entities) {
                if (err) return res.status(err.code).send(err.message);
                return res.status(constants.STATUS_OK).send(entities);
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function getEntity(req, res) {
    if (req.userType === 'Beneficiary') {
        beneficiaryModel.findOne({email: req.userId}, function (err, beneficiary) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            entityModel.getEntity(req.params.id, beneficiary, function (err, entity) {
                if (err) return res.status(err.code).send(err.message);
                return res.status(constants.STATUS_OK).send(entity);
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function createNewEntity(req, res) {
    requestUtils.getParameters(req.body, (err, attributes) => {
        if (err) return res.status(constants.STATUS_BAD_REQUEST).send(err);
        entityModel.create(attributes, function (err, entity) {
            if (err) {
                if (err.code === 11000) return res.status(constants.STATUS_CONFLICT).send({message: 'NIF or email already exists'});
                return res.status(constants.STATUS_SERVER_ERROR).send(err);
            }
            entity.password = passwordGenerator(8, false);
            mailUtils.sendRegisterMail(entity.email, entity.nif, entity.password);
            entity.save();
            res.status(constants.STATUS_CREATED).send();
        });
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
        beneficiaryModel.findOne({email: req.userId}, function (err, beneficiary) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            beneficiary.likeEntity(req.params.id, (err, likes) => {
                if (err) return res.status(err.code).send(err.message);
                return res.status(constants.STATUS_OK).send(likes);
            });
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({message: "You are not allowed to do this action"});
    }
}

export function dislikeEntity(req, res) {
    if (req.userType === 'Beneficiary') {
        beneficiaryModel.findOne({email: req.userId}, function (err, beneficiary) {
            if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
            beneficiary.dislikeEntity(req.params.id, (err, likes) => {
                if (err) return res.status(err.code).send(err.message);
                return res.status(constants.STATUS_OK).send(likes);
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
