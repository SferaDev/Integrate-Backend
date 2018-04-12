import {entityModel} from "../src/models/UserModel";

const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const sinon = require('sinon');

const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

const base64url = require('base64url');
const jwt = require('jsonwebtoken');

const app = require('../server');
const Good = require('../src/models/GoodModel');

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'randomTokenSecret';

describe('Operations that involve goods', function () {

    let entityItem;

    beforeEach(function (done) {
        // Create a dummy user
        entityItem = new entityModel({
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

        entityItem.save(function () {
            done();
        });
    });

    afterEach(function (done) {
        // Drop test database
        mockgoose.helper.reset().then(() => {
            done()
        });
    });

    it('should add good successfully', function () {
        let token = base64url.encode(jwt.sign({
            userId: 'joanpuig@google.com',
            userType: 'Entity'
        }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

        sinon.stub(Good.prototype, 'save');
        Good.prototype.save.yields(null);
        return chai.request(app)
            .post('/me/goods?token=' + token)
            .send({
                'productName': 'productTest',
                'picture': 'picture.png',
                'initialPrice': '100',
                'discountType':'%',
                'discount':'10',
                'category':'food',
                'reusePeriod':'7',
                'pendingUnits':'100'
            })
            .then(function (res) {
                expect(res).to.have.status(201);
                Good.prototype.save.restore();
            });
    });

    it('should detect database errors', function () {
        let token = base64url.encode(jwt.sign({
            userId: 'joanpuig@google.com',
            userType: 'Entity'
        }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

        sinon.stub(Good.prototype, 'save');
        Good.prototype.save.yields({code:11111, err:'Internal error'});
        return chai.request(app)
            .post('/me/goods?token=' + token)
            .send({
                'productName': 'productTest',
                'picture': 'picture.png',
                'initialPrice':'100',
                'discountType':'%',
                'discount':'10',
                'category':'food',
                'reusePeriod':'7',
                'pendingUnits':'100'
            })
            .then(function (res) {
                expect(res).to.have.status(500);
                Good.prototype.save.restore();
            });
    });

    /*
    it('should delete existant good successfully', function () {
        let goodItem = new good({
            'userId': entityItem._id,
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
        goodItem.save();


    })
    */
});