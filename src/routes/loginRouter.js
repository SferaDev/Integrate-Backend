import express from "express";

import * as userController from "../controllers/userController"

export const loginRouter = express.Router();

/**
 * @api {get} /login Token generation
 * @apiVersion 1.0.0
 * @apiGroup Authentication
 *
 * @apiParam {String} email User email
 * @apiParam {String} nif User NIF
 * @apiParam {String} password User password
 *
 * @apiSuccess {String} token User token for API calls
 *
 * @apiError {Integer} code Error code
 * @apiError {String} status Error details
 */
loginRouter.get('/', function (req, res) {
    userController.loginUser(req, res);
});