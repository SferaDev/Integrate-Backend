const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);
const schedule = require('node-schedule');

const express = require('express');

// Load Express.js
const app = express();
const port = process.env.PORT || 3000;

// Connect to the database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/Integrate';
const ENV = process.env.NODE_ENV || 'test';

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
app.listen(port);

// Load finish
console.log('Integrate server started on: ' + port);

// Export app as module for testing framework
module.exports = app;
