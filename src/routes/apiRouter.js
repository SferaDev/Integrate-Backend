import express from "express";
import jwt from "jsonwebtoken";
import base64url from "base64url";

import * as constants from "../constants";
import * as goodController from "../controllers/goodController";
import * as entityController from "../controllers/entityController";
import * as orderController from "../controllers/orderController";
import * as userController from "../controllers/userController";
import * as languageController from "../controllers/languageController";
import * as googleTranslate from "../../common/googleTranslate";
import {translationModel} from "../models/translationModel";
import {userModel} from "../models/userModel";

export const apiRouter = express.Router();

// Middleware to verify token
apiRouter.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(base64url.decode(token), constants.TOKEN_SECRET, function (err, decoded) {
            if (err) {
                return res.status(constants.STATUS_UNAUTHORIZED).send({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.userId = decoded.userId;
                req.userType = decoded.userType;
                userModel.findOne({email: decoded.userId}, function (err, user) {
                    if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                    if (user === null) return res.status(constants.STATUS_UNAUTHORIZED).send({message: 'Invalid token user'});
                    req.userGoodLanguage = user.goodLanguage;
                    next();
                });
            }
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

// Middleware to prettify/filter/sort JSON result
apiRouter.use(function (req, res, next) {
    let oldSend = res.send;
    res.set('Content-Type', 'application/json');
    res.send = function (obj) {
        if (typeof obj === 'object') {
            let attributes = req.query.filter ? req.query.filter.split(',') : null;
            let indent = !isNaN(parseInt(req.query.indent)) ? parseInt(req.query.indent) : 0;
            if (Array.isArray(obj) && req.query.sort) {
                obj.sort(function (a, b) {
                    if (a[req.query.sort] > b[req.query.sort]) return 1;
                    else if (a[req.query.sort] < b[req.query.sort]) return -1;
                    return 0;
                });
            }
            oldSend.call(this, JSON.stringify(obj, attributes, indent));
        } else oldSend.call(this, obj);
    };
    next();
});

// Middleware to auto-translate object results
apiRouter.use(function (req, res, next) {
    let translateFunction = function (elements, callback) {
        let promises = [];
        let items = Array.isArray(elements) ? elements : [elements];
        items.forEach(item => {
            constants.TRANSLATABLE.forEach(property => {
                // Check if result contains desired property
                if (item[property] !== undefined) {
                    // Check if content was already translated on our cache
                    promises.push(translationModel.findOne({input: item[property]}, function (err, translation) {
                        if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                        if (translation === null) {
                            // If translation is not present on our database fetch and store
                            let userGoodLanguage = req.userGoodLanguage || 'en';
                            promises.push(googleTranslate.translateString(userGoodLanguage, item[property], (err, response) => {
                                if (err === null) {
                                    translationModel.create({
                                        input: item[property],
                                        language: userGoodLanguage,
                                        output: response
                                    });
                                    item[property] = response;
                                }
                            }));
                        } else {
                            // If translation is already present, output local copy
                            item[property] = translation.output;
                        }
                    }));
                }
            });
        });
        Promise.all(promises).then(() => callback(Array.isArray(elements) ? items : items[0]));
    };
    let oldSend = res.send;
    res.send = function (obj) {
        if (typeof obj === 'object') {
            translateFunction(obj, (newObj) => {
                oldSend.call(this, newObj);
            });
        } else oldSend.call(this, obj);
    };
    next();
});

/**
 * @api {get} /me Token validation
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 */
apiRouter.get('/', function (req, res) {
    userController.validateUser(req, res);
});

/**
 * @api {put} /me/password Token validation
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 */
apiRouter.put('/password', function (req, res) {
    userController.changePassword(req, res);
});

/**
 * @api {get} /goods List all goods
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
apiRouter.get('/goods', function (req, res) {
    goodController.getGoods(req, res);
});

/**
 * @api {post} /goods Add new Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
apiRouter.post('/goods', function (req, res) {
    goodController.addGood(req, res);
});

/**
 * @api {delete} /goods/:id Delete existing Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
apiRouter.delete('/goods/:id', function (req, res) {
    goodController.deleteGood(req, res);
});

/**
 * @api {put} /goods/:id Update existing Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
apiRouter.put('/goods/:id', function (req, res) {
    goodController.updateGood(req, res);
});

/**
 * @api {get} /goods/favourites List favourite goods
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
apiRouter.get('/goods/favourites', function (req, res) {
    goodController.getFavouriteGoods(req, res)
});

/**
 * @api {post} /goods/favourites/:id Add favourite Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
apiRouter.post('/goods/favourites/:id', function (req, res) {
    goodController.addFavouriteGood(req, res)
});

/**
 * @api {delete} /goods/favourites/:id Delete favourite Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
apiRouter.delete('/goods/favourites/:id', function (req, res) {
    goodController.deleteFavouriteGood(req, res)
});

/**
 * @api {get} /entities List all entities
 * @apiVersion 1.0.0
 * @apiGroup Entities
 */
apiRouter.get('/entities', function (req, res) {
    entityController.getEntities(req, res);
});

/**
 * @api {get} /goods/:id Get single Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
apiRouter.get('/goods/:id', function (req, res) {
    goodController.getGood(req, res);
});

/**
 * @api {get} /entity Get single entity
 * @apiVersion 1.0.0
 * @apiGroup Entities
 */
apiRouter.get('/entity/:id', function (req, res) {
    entityController.getEntity(req, res);
});

/**
 * @api {post} /orders Validate and create order
 * @apiVersion 1.0.0
 * @apiGroup Orders
 */
apiRouter.post('/orders', function (req, res) {
    orderController.processOrder(req,res);
});

apiRouter.get('/stats', function (req, res) {
    entityController.getEntityStats(req, res);
});

apiRouter.get('/language/interface', function (req, res) {
    languageController.getUserInterfaceLanguage(req, res);
});

apiRouter.put('/language/interface', function (req, res) {
    languageController.setUserInterfaceLanguage(req, res);
});

apiRouter.get('/language/goods', function (req, res) {
    languageController.getUserGoodLanguage(req, res);
});

apiRouter.put('/language/goods', function (req, res) {
    languageController.setUserGoodLanguage(req, res);
});