import {entityModel} from "./src/models/UserModel";

const mongoose = require('mongoose');

let MONGODB_URI = 'mongodb://heroku_3845rpl4:1bpu4atlu1hl674muddg8lmgtv@ds231559.mlab.com:31559/heroku_3845rpl4';

mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI, function (error) {
    if (error) console.error(error);
    else console.log('MongoDB connected');
});

let newEntity = new entityModel({
    id: 1,
    nif: '12345678A',
    salesmanFirstName: 'John',
    salesmanLastName: 'Doe',
    email: 'email@email.com',
    name: 'UPC',
    description: 'Universitat Politecnica de Catalunya',
    addressName: 'C/ Jordi Girona',
    addressLatitude: 41.391501,
    addressLongitude: 2.113283,
    phone: '963852741',
    picture: ''
});

newEntity.save();