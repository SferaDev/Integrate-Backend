const express = require('express');
const jwt = require('jsonwebtoken');
const base64url = require('base64url');
const router = express.Router();

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'randomTokenSecret';

const goodController = require('../controllers/GoodController');

router.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
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
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

router.get('/', function (req, res) {
    res.send({success: true});
});

router.post('/goods/', function (req, res) {
    goodController.addGood(req, res);
});

router.delete('/goods/:id', function (req, res) {
    goodController.deleteGood(req, res);
});

router.put('/goods/:id', function (req, res) {
    goodController.updateGood(req, res);
});

module.exports = router;