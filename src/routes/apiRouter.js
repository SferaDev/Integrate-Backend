import express from "express";
import jwt from "jsonwebtoken";
import base64url from "base64url";
import traverse from "traverse";

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

// Middleware to auto-translate object results
apiRouter.use(function (req, res, next) {
    let translateFunction = function (elements, callback) {
        let promises = [];
        traverse(elements).forEach(function (item) {
            let context = this;
            if (context.key !== undefined && context.isLeaf && constants.TRANSLATABLE.includes(context.key)) {
                console.log('Traverse ' + context.key + ' with value ' + item);
                // Check if content was already translated on our cache
                let userGoodLanguage = req.userGoodLanguage || 'en';
                let parent = context.parent.node;
                parent[context.key + '_original'] = item;
                context.parent.update(parent);
                promises.push(translationModel.findOne({input: item, language: userGoodLanguage},
                    function (err, translation) {
                        if (err) return res.status(constants.STATUS_SERVER_ERROR).send(err);
                        if (translation !== null) {
                            // If translation is already present, output local copy
                            context.update(translation.output);
                            console.log('Translation local: ' + translation.output);
                        } else {
                            // If translation is not present, fetch and store it
                            promises.push(googleTranslate.translateString(userGoodLanguage, item, (err, response) => {
                                if (err === null) {
                                    translationModel.create({
                                        input: item,
                                        language: userGoodLanguage,
                                        output: response
                                    });
                                    context.update(response);
                                    console.log('Translation remote: ' + response);
                                }
                            }));
                        }
                    })
                );
            }
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