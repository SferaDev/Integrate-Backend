import express from "express";
import mongoose from "mongoose";
import {Mockgoose} from "mockgoose";
import nodemailer from "nodemailer";
import schedule from "node-schedule";
import {EMAIL_PASS, EMAIL_SERVICE, EMAIL_USER, ENV, MONGODB_URI, PORT} from "./src/constants";

// Load Express.js
const app = express();

// Connect to the database
const mockgoose = new Mockgoose(mongoose);
mongoose.Promise = global.Promise;
if (ENV === 'production') {
    mongoose.connect(MONGODB_URI, function (error) {
        if (error) console.error(error);
        else console.log('MongoDB connected');

        // Load beneficiaries for first time
        let BeneficiaryController = require('./src/controllers/UserController');
        let loadBeneficiariesCallback = function (err, message) {
            if (err) console.error(message);
            else console.log(message);
        };
        BeneficiaryController.loadBeneficiaries(loadBeneficiariesCallback);

        // Reload beneficiaries everyday at midnight
        schedule.scheduleJob('0 0 * * *', function () {
            BeneficiaryController.loadBeneficiaries(loadBeneficiariesCallback);
        });
    });
} else {
    mockgoose.prepareStorage().then(function() {
        mongoose.connect(MONGODB_URI, function (error) {
            if (error) console.error(error);
            else console.log('Mockgoose connected');
        });
    });
}

// Apply body-parser directives
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Load routes
app.use('/', require('./src/routes/RootRoute'));
app.use('/login', require('./src/routes/LoginRoute'));
app.use('/me', require('./src/routes/APIRoute'));

// Start app
app.listen(PORT);

// Load finish
console.log('Integrate server started on: ' + PORT);

// Export app as module for testing framework
module.exports = app;
