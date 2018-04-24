import app from "../server";
import {ERROR_DEFAULT, STATUS_CREATED, STATUS_OK, STATUS_SERVER_ERROR, TOKEN_SECRET} from "../src/constants";
import {entityModel} from "../src/models/entityModel";
import {goodModel} from "../src/models/goodModel";

import chai from "chai";
import chai_http from "chai-http";
import sinon from "sinon";
import mongoose from "mongoose";
import {Mockgoose} from "mockgoose";
import base64url from "base64url";
import jwt from "jsonwebtoken";

chai.use(chai_http);
const expect = chai.expect;
const mockgoose = new Mockgoose(mongoose);

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
            addressName: 'C/ Jordi Girona',
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

    describe('List all goods', function() {
        it('should list all goods successfully', function(done) {
            let goodItem = new goodModel({
                'userId': entityItem._id,
                'productName': 'productTest',
                'picture': 'picture.png',
                'initialPrice':'100',
                'discountType':'%',
                'discount':'10',
                'category':'food',
                'reusePeriod':'7',
                'pendingUnits':'100'
            });
            goodItem.save(function () {
                let token = base64url.encode(jwt.sign({
                    userId: 'joanpuig@google.com',
                    userType: 'Beneficiary'
                }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

                chai.request(app)
                    .get('/me/goods/?token=' + token)
                    .send()
                    .then(function (res) {
                        expect(res).to.have.status(STATUS_OK);
                        expect(res.body[0].productName).to.equal('productTest');
                        done();
                    });
            });
        });

        it ('should detect database errors', function () {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel, 'find');
            goodModel.find.yields({code:ERROR_DEFAULT, err:'Internal error'});
            return chai.request(app)
                .get('/me/goods/?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_SERVER_ERROR);
                    goodModel.find.restore();
                });
        });
    });

    describe('Add new good', function () {
        it('should add good successfully', function () {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel.prototype, 'save');
            goodModel.prototype.save.yields(null);
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
                    expect(res).to.have.status(STATUS_CREATED);
                    goodModel.prototype.save.restore();
                });
        });

        it('should detect database errors', function () {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel.prototype, 'save');
            goodModel.prototype.save.yields({code:ERROR_DEFAULT, err:'Internal error'});
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
                    expect(res).to.have.status(STATUS_SERVER_ERROR);
                    goodModel.prototype.save.restore();
                });
        });
    });

    describe('Delete good', function () {
        it('should delete existant good successfully', function (done) {
            let goodItem = new goodModel({
                'userId': entityItem._id,
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
                let token = base64url.encode(jwt.sign({
                    userId: 'joanpuig@google.com',
                    userType: 'Entity'
                }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

                chai.request(app)
                    .delete('/me/goods/' + good._id + '?token=' + token)
                    .send()
                    .then(function (res) {
                        expect(res).to.have.status(STATUS_OK);
                        done();
                    });
            });
        });

        it ('should detect database errors', function () {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel, 'findByIdAndRemove');
            goodModel.findByIdAndRemove.yields({code:ERROR_DEFAULT, err:'Internal error'});
            return chai.request(app)
                .delete('/me/goods/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_SERVER_ERROR);
                    goodModel.findByIdAndRemove.restore();
                });
        });
    });

    describe('Update good', function () {
        it('should update existant good successfully', function (done) {
            let goodItem = new goodModel({
                'userId': entityItem._id,
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
                let token = base64url.encode(jwt.sign({
                    userId: 'joanpuig@google.com',
                    userType: 'Entity'
                }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

                goodItem.discount = 20;

                chai.request(app)
                    .put('/me/goods/' + good._id + '?token=' + token)
                    .send(goodItem)
                    .then(function (res) {
                        expect(res).to.have.status(STATUS_OK);
                        expect(res.body.discount).to.equal(20);
                        done();
                    });
            });
        });

        it ('should detect database errors', function () {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel, 'findByIdAndUpdate');
            goodModel.findByIdAndUpdate.yields({code:ERROR_DEFAULT, err:'Internal error'});
            return chai.request(app)
                .put('/me/goods/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_SERVER_ERROR);
                    goodModel.findByIdAndUpdate.restore();
                });
        });
    });
});
