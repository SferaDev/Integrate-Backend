const express = require('express');
const router = express.Router();

const userController = require('../controllers/UserController');

// Handle login route endpoint
router.get('/', function (req, res) {
    userController.loginUser(req, res);
});

module.exports = router;