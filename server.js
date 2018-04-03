const express = require('express');
const mongoose = require('mongoose');

// Load Express.js
const app = express();
const port = process.env.PORT || 3000;

// Connect to the database
mongoose.Promise = global.Promise;
const mongodb_uri = process.env.MONGODB_URI || 'mongodb://localhost/Integrate';
mongoose.connect(mongodb_uri, function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

// Apply body-parser directives
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Load models and routes
const test = require('./src/models/BeneficiaryModel');
const routes = require('./src/routes/Routes');

// Start app
routes(app);
app.listen(port);

// Load finish
console.log('Integrate server started on: ' + port);

module.exports = app;