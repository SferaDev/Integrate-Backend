// Mongoose: MongoDB connector
import {entityModel} from "../src/models/UserModel";

const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

// Chai: Assertion library
const chai = require('chai');
const expect = chai.expect;

// App definitions
const good = require('../src/models/GoodModel');

// Test group
describe('Test group for GoodModel', function() {

    let userId;

    before(function (done) {
        // Connect to a test database
        mockgoose.prepareStorage().then(function () {
            mongoose.Promise = global.Promise;
            mongoose.connect('mongodb://localhost/Integrate', function (error) {
                if (error) console.error(error);
                done();
            });
        });
    });

    beforeEach(function (done) {
        // Create a dummy user
        let entityItem = new entityModel({
            nif: '12345678F',
            salesmanFirstName: 'Joan',
            salesmanLastName: 'Puig',
            email: 'joanpuig@google.com',
            password: 'myPAsswd!',
            name: 'Colmado',
            description: 'Botiga de queviures',
            addressLatitude: 41.145634,
            addressLongitude: 2.235324,
            phone: '675849324',
            picture: 'picture.png'
        });

        entityItem.save(function (err, entity) {
            userId = entity._id;
            done();
        });
    });

    afterEach(function (done) {
        // Drop test database
        mockgoose.helper.reset().then(() => {
            done()
        });
    });

    it('should store a valid good', function () {
        let goodItem = new good({
            'userId': userId,
            'userType': 'Entity',
            'productName': 'productTest',
            'picture': 'picture.png',
            'initialPrice':'100',
            'discountType':'%',
            'discount':'10',
            'category':'food',
            'reusePeriod':'7',
            'pendingUnits':'100'
        });

        goodItem.save(function (err, good) {
            expect(err).to.equal(null);
            expect(good).to.equal(goodItem);
        });
    });

    it('should not store a good without required attributes', function () {
        let goodItem = new good({
            'userId': userId,
            'userType': 'Entity',
            'productName': 'productTest',
            'picture': 'picture.png',
            'initialPrice':'100',
            'discountType':'%',
            'category':'food',
            'reusePeriod':'7',
            'pendingUnits':'100'
        });

        goodItem.save(function (err) {
            expect(err).not.to.equal(null);
        });
    });

});