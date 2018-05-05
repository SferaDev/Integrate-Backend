import express from "express";
import cors from "cors";

import {PORT} from "./src/constants";
import {loginRouter} from "./src/routes/loginRouter";
import {apiRouter} from "./src/routes/apiRouter";
import database from "./common/database";

// Load Express.js
export const app = express();

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
app.use('/login', loginRouter);
app.use('/me', apiRouter);

// Start app
app.listen(PORT);

// Load finish
console.log('Integrate server started on: ' + PORT);