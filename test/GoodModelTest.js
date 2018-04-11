// Mongoose: MongoDB connector
const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

// Chai: Assertion library
const chai = require('chai');
const expect = chai.expect;

// App definitions
const good = require('../src/models/GoodModel');
const beneficiary = require('../src/models/BeneficiaryModel');
const Beneficiary = mongoose.model('Beneficiary');

// Test group
describe('Test group for GoodModel', function() {

    let userId;

    beforeEach(function (done) {
        let beneficiaryItem = new beneficiary({
            nif: '00000000F',
            firstName: 'Sergey',
            lastName: 'Brin',
            email: 'sbrin@google.com',
            password: 'randomPassword'
        });
        beneficiaryItem.save(function (err, beneficiary) {
            userId = beneficiary._id;
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