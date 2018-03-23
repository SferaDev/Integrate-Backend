const express = require('express');
const mongoose = require('mongoose');

// Load Express.js
const app = express();
const port = process.env.PORT || 3000;

// Connect to the database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Test');

// Apply body-parser directives
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Load models and routes
const test = require('./backend/models/testModel');
const routes = require('./backend/routes/testRoutes');

// Start app
routes(app);
app.listen(port);

// Load finish
console.log('Integrate server started on: ' + port);