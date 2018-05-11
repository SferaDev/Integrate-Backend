import chai from "chai";
import chai_http from "chai-http";
import sinon from "sinon";
import mongoose from "mongoose";
import {Mockgoose} from "mockgoose";
import base64url from "base64url";
import jwt from "jsonwebtoken";

import {app} from "../server";
import * as constants from "../src/constants";
import {entityModel} from "../src/models/entityModel";
import {goodModel} from "../src/models/goodModel";

chai.use(chai_http);
const expect = chai.expect;
const mockgoose = new Mockgoose(mongoose);

// Test group
describe('Operations that involve entities', function () {

    let entityId1, entityId2, entityId3;

    before(function (done) {
        let entityItem = new entityModel({
            nif: '12345678F',
            salesmanFirstName: 'Joan',
            salesmanLastName: 'Puig',
            email: 'joanpuig@google.com',
            password: 'myPAsswd!',
            name: 'Colmado1',
            description: 'Botiga de queviures',
            addressName: 'C/ Jordi Girona',
            coordinates: [2.113018, 41.389165],
            phone: '675849324',
            picture: 'picture.png'
        });
        entityItem.save(function (err, entity) {
            entityId1 = entity._id;
            done();
        })
    });

    before(function (done) {
        let entityItem = new entityModel({
            nif: '12345678G',
            salesmanFirstName: 'Joan',
            salesmanLastName: 'Puig',
            email: 'joanpuig@google.com',
            password: 'myPAsswd!',
            name: 'Colmado2',
            description: 'Botiga de queviures',
            addressName: 'C/ Jordi Girona',
            coordinates: [2.092285, 41.331992],
            phone: '675849324',
            picture: 'picture.png'
        });
        entityItem.save(function (err, entity) {
            entityId2 = entity._id;
            done();
        })
    });

    before(function (done) {
        let entityItem = new entityModel({
            nif: '12345678H',
            salesmanFirstName: 'Joan',
            salesmanLastName: 'Puig',
            email: 'joanpuig@google.com',
            password: 'myPAsswd!',
            name: 'Colmado3',
            description: 'Botiga de queviures',
            addressName: 'C/ Jordi Girona',
            coordinates: [2.084861, 41.340015],
            phone: '675849324',
            picture: 'picture.png'
        });
        entityItem.save(function (err, entity) {
            entityId3 = entity._id;
            done();
        })
    });

    before(function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId1,
                'name': 'Colmado1'
            },
            'productName': 'productTest1',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'discount': '10',
            'category': 7,
            'reusePeriod': '7',
            'pendingUnits': '100',
            'location': [2.113018, 41.389165],
            'numberFavs': 10
        });

        goodItem.save(function () {
            done();
        });
    });

    before(function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId1,
                'name': 'Colmado1'
            },
            'productName': 'productTest2',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'discount': '10',
            'category': 7,
            'reusePeriod': '7',
            'pendingUnits': '100',
            'location': [2.113018, 41.389165],
            'numberFavs': 10
        });

        goodItem.save(function () {
            done();
        });
    });

    before(function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId2,
                'name': 'Colmado2'
            },
            'productName': 'productTest3',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'discount': '10',
            'category': 7,
            'reusePeriod': '7',
            'pendingUnits': '100',
            'location': [2.092285, 41.331992],
            'numberFavs': 10
        });

        goodItem.save(function () {
            done();
        });
    });

    after(function (done) {
        // Drop test database
        mockgoose.helper.reset().then(() => {
            done()
        });
    });

    describe ('Get all entities', function () {
        it('should get all entities', function (done) {
            entityModel.ensureIndexes(function () {
                //get token
                let token = base64url.encode(jwt.sign({
                    userId: 'joanpuig@google.com',
                    userType: 'Beneficiary'
                }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
                //test get entities
                chai.request(app)
                    .get('/me/entities?token=' + token + '&longitude=2.102137&latitude=41.319359')
                    .send()
                    .then(function (res) {
                        expect(res).to.have.status(constants.STATUS_OK);
                        expect(res.body[0].name).to.equal('Colmado2');
                        expect(res.body[1].name).to.equal('Colmado3');
                        expect(res.body[2].name).to.equal('Colmado1');
                        done();
                    });
            });
        });

        it ('should detect database errors', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(mongoose.Aggregate.prototype, 'exec');
            mongoose.Aggregate.prototype.exec.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .get('/me/entities?token=' + token + '&longitude=2.102137&latitude=41.319359')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    mongoose.Aggregate.prototype.exec.restore();
                    done();
                });
        });

        it('should detect wrong query parameters', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/entities/?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_BAD_REQUEST);
                    done();
                });
        });

        it('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/entities/?token=' + token + '&longitude=2.102137&latitude=41.319359')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe ('Get single Entity', function () {
        it('should get single entity', function (done) {
            //get token
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
            //test get entity
            chai.request(app)
                .get('/me/entity/'+ entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.name).to.equal('Colmado1');
                    expect(res.body.goods.length).to.equal(2);
                    expect(res.body.goods[0].productName).to.equal('productTest1');
                    expect(res.body.goods[1].productName).to.equal('productTest2');
                    done();
                });
        });

        it ('should detect database errors when finding entity', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(entityModel, "findById");
            entityModel.findById.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .get('/me/entity/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_NOT_FOUND);
                    entityModel.findById.restore();
                    done();
                });
        });

        it ('should detect database errors when finding goods', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel, "find");
            goodModel.find.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .get('/me/entity/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    goodModel.find.restore();
                    done();
                });
        });

        it('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/entity/'+ entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe ('Create new Entity', function () {
        it ('should not create new entity (missing parameter)', function (done) {
            chai.request(app)
                .post('/register')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_BAD_REQUEST);
                    done();
                });
        });

        it ('should not create new entity (error count)', function (done) {
            sinon.stub(entityModel, 'count');
            entityModel.count.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});

            chai.request(app)
                .post('/register')
                .send({
                    nif: 'random',
                    salesmanFirstName: 'Joan',
                    salesmanLastName: 'Puig',
                    email: 'joanpuig@google.com',
                    name: 'Colmado1',
                    description: 'Botiga de queviures',
                    addressName: 'C/ Jordi Girona',
                    coordinates: [2.113018, 41.389165],
                    phone: '675849324',
                    picture: 'picture.png'
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    entityModel.count.restore();
                    done();
                });
        });

        it ('should not create new entity (error create)', function (done) {
            sinon.stub(entityModel, 'create');
            entityModel.create.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});

            chai.request(app)
                .post('/register')
                .send({
                    nif: 'random',
                    salesmanFirstName: 'Joan',
                    salesmanLastName: 'Puig',
                    email: 'joanpuig@google.com',
                    name: 'Colmado1',
                    description: 'Botiga de queviures',
                    addressName: 'C/ Jordi Girona',
                    coordinates: [2.113018, 41.389165],
                    phone: '675849324',
                    picture: 'picture.png'
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    entityModel.create.restore();
                    done();
                });
        });

        it ('should not create new entity (conflict)', function (done) {
            chai.request(app)
                .post('/register')
                .send({
                    nif: '12345678F',
                    salesmanFirstName: 'Joan',
                    salesmanLastName: 'Puig',
                    email: 'joanpuig@google.com',
                    name: 'Colmado1',
                    description: 'Botiga de queviures',
                    addressName: 'C/ Jordi Girona',
                    coordinates: [2.113018, 41.389165],
                    phone: '675849324',
                    picture: 'picture.png'
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_CONFLICT);
                    done();
                });
        });

        it ('should create new entity', function (done) {
            chai.request(app)
                .post('/register')
                .send({
                    nif: 'random',
                    salesmanFirstName: 'Joan',
                    salesmanLastName: 'Puig',
                    email: 'joanpuig@google.com',
                    name: 'Colmado1',
                    description: 'Botiga de queviures',
                    addressName: 'C/ Jordi Girona',
                    coordinates: [2.113018, 41.389165],
                    phone: '675849324',
                    picture: 'picture.png'
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_CREATED);
                    done();
                });
        });
    });
});
