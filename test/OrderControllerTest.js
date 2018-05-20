import chai from "chai";
import chai_http from "chai-http";
import sinon from "sinon";
import mongoose from "mongoose";
import {Mockgoose} from "mockgoose";
import base64url from "base64url";
import jwt from "jsonwebtoken";

import {app} from "../server";
import {entityModel} from "../src/models/entityModel";
import {goodModel} from "../src/models/goodModel";
import {beneficiaryModel} from "../src/models/beneficiaryModel";
import * as constants from "../src/constants";

chai.use(chai_http);
const expect = chai.expect;
const mockgoose = new Mockgoose(mongoose);

describe ("Operations that involve orders", function () {

    let entityId;
    let entityValidationCode;

    before(function (done) {
        let entityItem = new entityModel({
            nif: '12345678F',
            salesmanFirstName: 'Joan',
            salesmanLastName: 'Puig',
            email: 'joanpuig@google.com',
            password: 'myPAsswd!',
            name: 'Colmado',
            description: 'Botiga de queviures',
            addressName: 'C/ Jordi Girona',
            coordinates: [2.235324, 41.145634],
            phone: '675849324',
            picture: 'picture.png'
        });

        entityItem.save(function (err, entity) {
            entityId = entity._id;
            entityValidationCode = entity.validationCode;
            done();
        });
    });

    let good1Id;

    before(function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId,
                'name': 'Colmado'
            },
            'productName': 'productTest1',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'discount': '10',
            'category': 1,
            'reusePeriod': '7',
            'pendingUnits': '100',
            'location': [2.098851, 41.322228],
            'numberFavs': 2
        });

        goodItem.save(function (err, good) {
            good1Id = good._id;
            done();
        });
    });

    let good2Id;

    before(function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId,
                'name': 'Colmado'
            },
            'productName': 'productTest2',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'discount': '10',
            'category': 7,
            'reusePeriod': '7',
            'pendingUnits': '0',
            'location': [2.092285, 41.331992],
            'numberFavs': 0
        });

        goodItem.save(function (err, good) {
            good2Id = good._id;
            done();
        });
    });

    let good3Id;

    before(function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId,
                'name': 'Colmado'
            },
            'productName': 'productTest3',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'discount': '10',
            'category': 7,
            'reusePeriod': '7',
            'pendingUnits': '100',
            'location': [2.084861, 41.340015],
            'numberFavs': 10
        });

        goodItem.save(function (err, good) {
            good3Id = good._id;
            done();
        });
    });

    let good4Id;

    before(function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId,
                'name': 'Colmado'
            },
            'productName': 'productTest4',
            'picture': 'picture.png',
            'initialPrice': '50',
            'discountType': '€',
            'discount': '10',
            'category': 1,
            'reusePeriod': '7',
            'pendingUnits': '100',
            'location': [2.098851, 41.322228],
            'numberFavs': 2
        });

        goodItem.save(function (err, good) {
            good4Id = good._id;
            done();
        });
    });

    before(function (done) {
        let beneficiaryItem = new beneficiaryModel({
            nif: '12345678F',
            firstName: 'Sergey',
            lastName: 'Brin',
            email: 'sbrin@google.com',
            password: 'myPAsswd!',
            usedGoods: [{
                id: good3Id,
                date: Date.now()
            }]
        });

        beneficiaryItem.save(function () {
            done();
        });
    });

    after(function (done) {
        // Drop test database
        mockgoose.helper.reset().then(() => {
            done()
        });
    });

    describe ("Check order", function () {
        it ("should check usability of goods (success)", function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/orders' + '?token=' + token)
                .send({
                    goodIds: [good1Id, good4Id]
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.totalDiscount).to.equal(10 + 10);
                    done();
                });
        });

        it ("should check usability of goods (sold out goods)", function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/orders' + '?token=' + token)
                .send({
                    goodIds: [good1Id, good2Id]
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_CONFLICT);
                    expect(res.body.soldOutGoods.length).to.equal(1);
                    expect(res.body.soldOutGoods[0]).to.equal(good2Id.toString());
                    done();
                });
        });

        it ("should check usability of goods (non usable goods)", function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/orders' + '?token=' + token)
                .send({
                    goodIds: [good1Id, good3Id]
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_CONFLICT);
                    expect(res.body.nonUsableGoods.length).to.equal(1);
                    expect(res.body.nonUsableGoods[0]).to.equal(good3Id.toString());
                    done();
                });
        });

        it ("should detect database errors when finding beneficiary", function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(beneficiaryModel, 'findOne');
            beneficiaryModel.findOne.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .post('/me/orders' + '?token=' + token)
                .send({
                    goodIds: [good1Id, good3Id]
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    beneficiaryModel.findOne.restore();
                    done();
                });
        });

        it ("should detect database errors when finding goods", function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel, 'find');
            goodModel.find.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .post('/me/orders' + '?token=' + token)
                .send({
                    goodIds: [good1Id, good3Id]
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    goodModel.find.restore();
                    done();
                });
        });

        it ("should not allow wrong type of user", function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/orders' + '?token=' + token)
                .send({
                    goodIds: [good3Id]
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe ("Check and store order", function () {
        it ("should check and store order successfully", function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/orders' + '?entityId=' + entityId + '&validationCode=' + entityValidationCode + '&token=' + token)
                .send({
                    goodIds: [good1Id, good4Id]
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_CREATED);
                    done();
                });
        });
    });
});