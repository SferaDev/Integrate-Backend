const express = require('express');
const router = express.Router();

import * as userController from "../controllers/userController"

/**
 * @api {get} /login Login user
 * @apiVersion 1.0.0
 * @apiGroup Login
 *
 * @apiParam {String} email User email
 * @apiParam {String} nif User NIF
 * @apiParam {String} password User password
 *
 * @apiSuccess {String} token User token for API calls
 *
 * @apiError {Integer} code Error code
 * @apiError {String} status Error details
 *
 */
router.get('/', function (req, res) {
    userController.loginUser(req, res);
});

module.exports = router;