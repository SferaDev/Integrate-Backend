import express from "express";
import * as userController from "../controllers/userController"
import * as entityController from "../controllers/entityController";

const router = express.Router();

/**
 * @api {post} /register Create new Entity
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 */
router.post('/', function (req, res) {
    entityController.createNewEntity(req, res);
});

/**
 * @api {post} /register/reset Request user password reset
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 */
router.post('/reset', function (req, res) {
    userController.resetPassword(req, res);
});

module.exports = router;