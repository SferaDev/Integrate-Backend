const express = require('express');
const router = express.Router();

import * as userController from "../controllers/userController"

// Handle login route endpoint
router.get('/', function (req, res) {
    userController.loginUser(req, res);
});

module.exports = router;