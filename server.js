const express = require('express');
const mongoose = require('mongoose');
const schedule = require('node-schedule');

// Load Express.js
const app = express();
const port = process.env.PORT || 3000;

// Connect to the database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/Integrate';
mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI, function (error) {
    if (error) console.error(error);
    else console.log('MongoDB connected');

    // Load beneficiaries for first time
    let BeneficiaryController = require('./src/controllers/BeneficiaryController');
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

// Apply body-parser directives
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Load models and routes
let models = require('./src/models/Models');
let routes = require('./src/routes/Routes');

// Start app
routes(app);
app.listen(port);

// Load finish
console.log('Integrate server started on: ' + port);

// Export app as module for testing framework
module.exports = app;
