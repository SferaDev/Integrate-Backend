import {entityModel} from "../src/models/entityModel";
import {goodModel} from "../src/models/goodModel";
import {beneficiaryModel} from "../src/models/beneficiaryModel";

import mongoose from "mongoose";
import {Mockgoose} from "mockgoose";
import chai from "chai";

const mockgoose = new Mockgoose(mongoose);
const expect = chai.expect;

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
            addressName: 'C/ Jordi Girona',
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

    it('should store a valid good', function (done) {
        let goodItem = new goodModel({
            'userId': userId,
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
            done();
        });
    });

    it('should not store a good without required attributes', function (done) {
        let goodItem = new goodModel({
            'userId': userId,
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
            done();
        });
    });

    it ('should not store a good with a reference to a non Entity user', function (done) {

        let beneficiaryItem = new beneficiaryModel({
            nif: '00000000F',
            firstName: 'Sergey',
            lastName: 'Brin',
            email: 'sbrin@google.com',
            password: 'randomPassword'
        });

        beneficiaryItem.save(function (err, beneficiary) {
            let goodItem = new goodModel({
                'userId': beneficiary._id,
                'productName': 'productTest',
                'picture': 'picture.png',
                'initialPrice':'100',
                'discountType':'%',
                'discount':'10',
                'category':'food',
                'reusePeriod':'7',
                'pendingUnits':'100'
            });
            goodItem.save(function (err) {
                expect(err).not.to.equal(null);
                done();
            });
        });
    });

});
