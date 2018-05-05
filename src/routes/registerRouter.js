import express from "express";
import * as userController from "../controllers/userController"
import * as entityController from "../controllers/entityController";

export const registerRouter = express.Router();

/**
 * @api {post} /register Create new Entity
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 */
registerRouter.post('/', function (req, res) {
    entityController.createNewEntity(req, res);
});

/**
 * @api {post} /register/reset Request user password reset
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 */
registerRouter.post('/reset', function (req, res) {
    userController.resetPassword(req, res);
});
