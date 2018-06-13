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
    let token = req.body.token || req.query.token || req.headers.token;
    if (token) {
        let decodedToken = base64url.decode(token);
        jwt.verify(decodedToken, constants.TOKEN_SECRET, function (err, decoded) {
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
            if (context.isLeaf && constants.TRANSLATABLE.includes(context.key)) {
                // Check if content was already translated on our cache
                let userGoodLanguage = req.userGoodLanguage || 'en';
                let parent = context.parent.node;
                parent[context.key + '_original'] = item;
                context.parent.update(parent);
                promises.push(translationModel.findOne({input: item, language: userGoodLanguage},
                    function (err, translation) {
                        if (err) return console.error(err);
                        if (translation === null) {
                            // If translation is not present, fetch and store it
                            promises.push(googleTranslate.translateString(userGoodLanguage, item, (err, response) => {
                                if (err) console.error(err);
                                else {
                                    translationModel.create({
                                        input: item,
                                        language: userGoodLanguage,
                                        output: response
                                    });
                                    context.update(response, true);
                                }
                            }));
                        } else {
                            // If translation is already present, output local copy
                            context.update(translation.output, true);
                        }
                    })
                );
            }
        });
        Promise.all(promises).then(() => callback(elements));
    };
    let oldSend = res.send;
    res.send = function (obj) {
        if (typeof obj === 'object') {
            let result = JSON.parse(JSON.stringify(obj));
            translateFunction(result, (newObj) => {
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
 * @api {delete} /me Deactivate entity
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 */
apiRouter.delete('/', function (req, res) {
    entityController.deactivateEntity(req, res);
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
    goodController.getFavouriteGoods(req, res);
});

/**
 * @api {post} /goods/favourites/:id Add favourite Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
apiRouter.post('/goods/favourites/:id', function (req, res) {
    goodController.addFavouriteGood(req, res);
});

/**
 * @api {delete} /goods/favourites/:id Delete favourite Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
apiRouter.delete('/goods/favourites/:id', function (req, res) {
    goodController.deleteFavouriteGood(req, res);
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
 * @api {post} /entities/likes/:id Like one entity
 * @apiVersion 1.0.0
 * @apiGroup Entities
 */
apiRouter.post('/entities/likes/:id', function (req, res) {
    entityController.likeEntity(req, res);
});

/**
 * @api {delete} /entities/likes/:id Dislike one entity
 * @apiVersion 1.0.0
 * @apiGroup Entities
 */
apiRouter.delete('/entities/likes/:id', function (req, res) {
    entityController.dislikeEntity(req, res);
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
    orderController.processOrder(req, res);
});

/**
 * @api {get} /stats View stats
 * @apiVersion 1.0.0
 * @apiGroup Stats
 */
apiRouter.get('/stats', function (req, res) {
    entityController.getEntityStats(req, res);
});

/**
 * @api {get} /salesChart View sales chart
 * @apiVersion 1.0.0
 * @apiGroup Stats
 */
apiRouter.get('/salesChart', function (req, res) {
    entityController.getSalesChart(req, res);
});

/**
 * @api {get} /language/interface Get interface language
 * @apiVersion 1.0.0
 * @apiGroup Language
 */
apiRouter.get('/language/interface', function (req, res) {
    languageController.getUserInterfaceLanguage(req, res);
});

/**
 * @api {put} /language/interface Update interface language
 * @apiVersion 1.0.0
 * @apiGroup Language
 */
apiRouter.put('/language/interface', function (req, res) {
    languageController.setUserInterfaceLanguage(req, res);
});

/**
 * @api {get} /language/goods Get good language
 * @apiVersion 1.0.0
 * @apiGroup Language
 */
apiRouter.get('/language/goods', function (req, res) {
    languageController.getUserGoodLanguage(req, res);
});

/**
 * @api {put} /language/goods Update good language
 * @apiVersion 1.0.0
 * @apiGroup Language
 */
apiRouter.put('/language/goods', function (req, res) {
    languageController.setUserGoodLanguage(req, res);
});