import express from "express";
import jwt from "jsonwebtoken";
import base64url from "base64url";
import {STATUS_FORBIDDEN, TOKEN_SECRET} from "../constants";
import * as goodController from "../controllers/goodController";
import * as entityController from "../controllers/entityController";

const router = express.Router();

router.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(base64url.decode(token), TOKEN_SECRET, function (err, decoded) {
            if (err) {
                return res.json({
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
        return res.status(STATUS_FORBIDDEN).send({
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
router.get('/', function (req, res) {
    res.send({success: true});
});

/**
 * @api {get} /goods List all goods
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
router.get('/goods/', function (req, res) {
    goodController.getGoods(req, res);
});

/**
 * @api {post} /goods Add new Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
router.post('/goods/', function (req, res) {
    goodController.addGood(req, res);
});

/**
 * @api {delete} /goods/:id Delete existing Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
router.delete('/goods/:id', function (req, res) {
    goodController.deleteGood(req, res);
});

/**
 * @api {put} /goods/:id Update existing Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
router.put('/goods/:id', function (req, res) {
    goodController.updateGood(req, res);
});

/**
 * @api {get} /goods/favourites List favourite goods
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
router.get('/goods/favourites', function (req, res) {
    goodController.getFavouriteGoods(req, res)
});

/**
 * @api {post} /goods/favourites/:id Add favourite Good
 * @apiVersion 1.0.0
 * @apiGroup Goods
 */
router.delete('/goods/favourites/:id', function (req, res) {
    goodController.deleteFavouriteGood(req,res)
});

/**
 * @api {get} /entities List all entities
 * @apiVersion 1.0.0
 * @apiGroup Entities
 */
router.get('/entities/', function (req, res) {
    entityController.getEntities(req, res);
});

module.exports = router;
