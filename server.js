import express from "express";
import cors from "cors";

import database from "./common/database";
import {PORT} from "./src/constants";
import {loginRouter} from "./src/routes/loginRouter";
import {registerRouter} from "./src/routes/registerRouter";
import {apiRouter} from "./src/routes/apiRouter";
import {languageRouter} from "./src/routes/languageRouter";

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

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,token');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Load routes
app.use('/', express.static('apidoc'));
app.use('/language', languageRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/me', apiRouter);

// Start app
app.listen(PORT);

// Load finish
console.log('Integrate server started on: ' + PORT);