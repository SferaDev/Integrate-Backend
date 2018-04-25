import express from "express";
import {PORT} from "./src/constants";
import database from "./common/database";

// Load Express.js
const app = express();

// Load project common modules
database();

// Apply body-parser directives
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// Load routes
app.use('/', express.static('apidoc'));
app.use('/login', require('./src/routes/loginRoute'));
app.use('/me', require('./src/routes/apiRoute'));

// Start app
app.listen(PORT);

// Load finish
console.log('Integrate server started on: ' + PORT);

// Export app as module for testing framework
module.exports = app;
