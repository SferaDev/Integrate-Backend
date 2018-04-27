import express from "express";
import cors from "cors";
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
app.use(cors());

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
