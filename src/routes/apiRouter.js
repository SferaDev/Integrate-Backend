import express from "express";
import jwt from "jsonwebtoken";
import base64url from "base64url";

import * as constants from "../constants";
import * as goodController from "../controllers/goodController";
import * as entityController from "../controllers/entityController";

export const apiRouter = express.Router();

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
                next();
            }
        });
    } else {
        res.status(constants.STATUS_FORBIDDEN).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

/**
 * @api {get} /me Token validation
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 */
apiRouter.get('/', function (req, res) {
    res.send({success: true});
});

/**
 * @api {get} /goods List all goods
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
apiRouter.get('/goods/', function (req, res) {
    goodController.getGoods(req, res);
});

/**
 * @api {post} /goods Add new Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
apiRouter.post('/goods/', function (req, res) {
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
apiRouter.get('/entities/', function (req, res) {
    entityController.getEntities(req, res);
});
