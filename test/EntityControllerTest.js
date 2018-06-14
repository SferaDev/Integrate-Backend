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
import {beneficiaryModel} from "../src/models/beneficiaryModel";
import {orderModel} from "../src/models/orderModel";
import moment from "moment";

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
        });
    });

    before(function (done) {
        let entityItem = new entityModel({
            nif: '12345678G',
            salesmanFirstName: 'Joan',
            salesmanLastName: 'Puig',
            email: 'joanpuig2@google.com',
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
        });
    });

    before(function (done) {
        let entityItem = new entityModel({
            nif: '12345678H',
            salesmanFirstName: 'Joan',
            salesmanLastName: 'Puig',
            email: 'joanpuig3@google.com',
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
        });
    });

    let good1Id;

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

        goodItem.save(function (err, good) {
            good1Id = good._id;
            done();
        });
    });

    let good2Id;

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

        goodItem.save(function (err, good) {
            good2Id = good._id;
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

    let beneficiary1Id;

    before(function (done) {
        let beneficiaryItem = new beneficiaryModel({
            nif: '12345678Z',
            firstName: 'Sergey',
            lastName: 'Brin',
            email: 'sbrin@google.com',
            password: 'myPAsswd!',
            usedGoods: [{
                id: good1Id,
                date: Date.now()
            },
                {
                    id: good2Id,
                    date: Date.now()
                }]
        });

        beneficiaryItem.save(function (err, beneficiary) {
            beneficiary1Id = beneficiary._id;
            done();
        });
    });

    before(function (done) {
        let orderItem = new orderModel({
            entity: entityId1,
            beneficiary: beneficiary1Id,
            orderedGoods: [good1Id],
            totalDiscount: 10
        });

        orderItem.save(function () {
            done();
        });
    });

    before(function (done) {
        let orderItem = new orderModel({
            entity: entityId1,
            beneficiary: beneficiary1Id,
            orderedGoods: [good2Id],
            totalDiscount: 10
        });

        orderItem.save(function () {
            done();
        });
    });

    after(function (done) {
        // Drop test database
        mockgoose.helper.reset().then(() => {
            done();
        });
    });

    describe('Get all entities', function () {
        it('should get all entities', function (done) {
            entityModel.ensureIndexes(function () {
                //get token
                let token = base64url.encode(jwt.sign({
                    userId: 'sbrin@google.com',
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

        it('should detect database errors', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
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
                userId: 'sbrin@google.com',
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

    describe('Get single Entity', function () {
        it('should get single entity', function (done) {
            //get token
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
            //test get entity
            chai.request(app)
                .get('/me/entity/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.name).to.equal('Colmado1');
                    expect(res.body.email).to.equal('joanpuig@google.com');
                    expect(res.body.goods.length).to.equal(2);
                    expect(res.body.goods[0].productName).to.equal('productTest1');
                    expect(res.body.goods[0].isUsable).to.equal(false);
                    expect(res.body.goods[1].productName).to.equal('productTest2');
                    expect(res.body.goods[1].isUsable).to.equal(false);
                    done();
                });
        });

        it('should detect database errors when finding entity', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(entityModel, "findById");
            entityModel.findById.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .get('/me/entity/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    entityModel.findById.restore();
                    done();
                });
        });

        it('should detect not found entity', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            let id = "5afa7fbdd6239a10cea50a2e";
            chai.request(app)
                .get('/me/entity/' + id + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_NOT_FOUND);
                    done();
                });
        });

        it('should detect database errors when finding goods', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
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
                userId: 'sbrin@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/entity/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe('Create/Deactivate Entity', function () {
        it('should not create new entity (missing parameter)', function (done) {
            chai.request(app)
                .post('/register')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_BAD_REQUEST);
                    done();
                });
        });

        it('should not create new entity (error create)', function (done) {
            sinon.stub(entityModel, 'create');
            entityModel.create.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});

            chai.request(app)
                .post('/register')
                .send({
                    nif: 'random',
                    salesmanFirstName: 'Joan',
                    salesmanLastName: 'Puig',
                    email: 'joanpuig4@google.com',
                    name: 'Colmado4',
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

        it('should not create new entity (conflict)', function (done) {
            chai.request(app)
                .post('/register')
                .send({
                    nif: '12345678F',
                    salesmanFirstName: 'Joan',
                    salesmanLastName: 'Puig',
                    email: 'joanpuig4@google.com',
                    name: 'Colmado4',
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

        it('should create new entity', function (done) {
            chai.request(app)
                .post('/register')
                .send({
                    nif: 'random',
                    salesmanFirstName: 'Joan',
                    salesmanLastName: 'Puig',
                    email: 'joanpuig4@google.com',
                    name: 'Colmado4',
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

        it('should deactivate existing entity', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig4@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .delete('/me' + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    let promises = [];
                    promises.push(entityModel.count({email: 'joanpuig4@google.com'}, function (err, count) {
                        expect(count).to.equal(0);
                    }));
                    promises.push(entityModel.countWithDeleted({email: 'joanpuig4@google.com'}, function (err, count) {
                        expect(count).to.equal(1);
                    }));
                    Promise.all(promises).then(() => done());
                });
        });
    });

    describe('Get entity stats', function () {
        it('should return stats of an entity successfully', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/stats/?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.goodsCreated).to.equal(2);
                    expect(res.body.beneficiariesHelped).to.equal(1);
                    expect(res.body.totalSavedMoney).to.equal(20);
                    done();
                });
        });

        it('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/stats/?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe('Get sales chart', function () {
        before(function (done) {
            let orderItem = new orderModel({
                entity: entityId1,
                beneficiary: beneficiary1Id,
                orderedGoods: [good2Id],
                totalDiscount: 10
            });

            orderItem.save(function () {
                done();
            });
        });

        before(function (done) {
            let orderItem = new orderModel({
                entity: entityId1,
                beneficiary: beneficiary1Id,
                orderedGoods: [good1Id],
                totalDiscount: 10,
                createdAt: moment().subtract(2, 'days'),
                updatedAt: moment().subtract(2, 'days')
            });

            orderItem.save(function () {
                done();
            });
        });

        before(function (done) {
            let orderItem = new orderModel({
                entity: entityId1,
                beneficiary: beneficiary1Id,
                orderedGoods: [good2Id],
                totalDiscount: 10,
                createdAt: moment().subtract(2, 'weeks'),
                updatedAt: moment().subtract(2, 'weeks')
            });

            orderItem.save(function () {
                done();
            });
        });

        before(function (done) {
            let orderItem = new orderModel({
                entity: entityId1,
                beneficiary: beneficiary1Id,
                orderedGoods: [good2Id],
                totalDiscount: 10,
                createdAt: moment().subtract(2, 'months'),
                updatedAt: moment().subtract(2, 'months')
            });

            orderItem.save(function () {
                done();
            });
        });

        before(function (done) {
            let orderItem = new orderModel({
                entity: entityId1,
                beneficiary: beneficiary1Id,
                orderedGoods: [good2Id],
                totalDiscount: 10,
                createdAt: moment().subtract(2, 'years'),
                updatedAt: moment().subtract(2, 'years')
            });

            orderItem.save(function () {
                done();
            });
        });

        function isArrayInArray(arr, item) {
            let itemString = JSON.stringify(item);

            return arr.some(function (ele) {
                return JSON.stringify(ele) === itemString;
            });
        }

        it('should return global stats for one day', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/salesChart/?interval=Day&token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.stats.length).to.equal(1);
                    let date = moment();
                    let dateFormat = date.startOf('date').format("YYYY-MM-DD").toString();
                    expect(isArrayInArray(res.body.stats, [dateFormat, 3])).to.equal(true);
                    done();
                });
        });

        it('should return global stats for one week', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/salesChart/?interval=Week&token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.stats.length).to.equal(2);
                    let date = moment().subtract(2, 'days');
                    let dateFormat = date.startOf('date').format("YYYY-MM-DD").toString();
                    expect(isArrayInArray(res.body.stats, [dateFormat, 1])).to.equal(true);
                    done();
                });
        });

        it('should return global stats for one month', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/salesChart/?interval=Month&token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.stats.length).to.equal(3);
                    let date = moment().subtract(2, 'weeks');
                    let dateFormat = date.startOf('date').format("YYYY-MM-DD").toString();
                    expect(isArrayInArray(res.body.stats, [dateFormat, 1])).to.equal(true);
                    done();
                });
        });

        it('should return global stats for one year', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/salesChart/?interval=Year&token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.stats.length).to.equal(4);
                    let date = moment().subtract(2, 'months');
                    let dateFormat = date.startOf('date').format("YYYY-MM-DD").toString();
                    expect(isArrayInArray(res.body.stats, [dateFormat, 1])).to.equal(true);
                    done();
                });
        });

        it('should return single good stats for one day', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/salesChart/?interval=Day&good=' + good2Id + '&token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.stats.length).to.equal(1);
                    let date = moment();
                    let dateFormat = date.startOf('date').format("YYYY-MM-DD").toString();
                    expect(isArrayInArray(res.body.stats, [dateFormat, 2])).to.equal(true);
                    done();
                });
        });

        it('should return single good stats for one week', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/salesChart/?interval=Week&good=' + good1Id + '&token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.stats.length).to.equal(2);
                    let date = moment().subtract(2, 'days');
                    let dateFormat = date.startOf('date').format("YYYY-MM-DD").toString();
                    expect(isArrayInArray(res.body.stats, [dateFormat, 1])).to.equal(true);
                    done();
                });
        });

        it('should return single good stats for one month', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/salesChart/?interval=Month&good=' + good2Id + '&token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.stats.length).to.equal(2);
                    let date = moment().subtract(2, 'weeks');
                    let dateFormat = date.startOf('date').format("YYYY-MM-DD").toString();
                    expect(isArrayInArray(res.body.stats, [dateFormat, 1])).to.equal(true);
                    done();
                });
        });

        it('should return single good stats for one year', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/salesChart/?interval=Year&good=' + good2Id + '&token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.stats.length).to.equal(3);
                    let date = moment().subtract(2, 'months');
                    let dateFormat = date.startOf('date').format("YYYY-MM-DD").toString();
                    expect(isArrayInArray(res.body.stats, [dateFormat, 1])).to.equal(true);
                    done();
                });
        });

        it('should detect incorrect interval', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/salesChart/?interval=Century&token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_BAD_REQUEST);
                    done();
                });
        });

        it('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/salesChart/?interval=Day&token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe('Like one entity', function () {
        it('should like entity successfully', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/entities/likes/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.numberLikes).to.equal(1);
                    done();
                });
        });

        it('should show liked status when entity requested', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/entity/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res.body.isLiked).to.equal(true);
                    done();
                });
        });

        it('should show liked status when all entities requested', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/entities?token=' + token + '&longitude=2.102137&latitude=41.319359')
                .send()
                .then(function (res) {
                    expect(res.body[2].isLiked).to.equal(true);
                    done();
                });
        });

        it('should not like entity already liked', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/entities/likes/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_CONFLICT);
                    entityModel.findById(entityId1, function (err, entity) {
                        expect(entity.numberLikes).to.equal(1);
                        done();
                    });
                });
        });

        it('should detect wrong entity id', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            let id = "5afa7fbdd6239a10cea50a2e";

            chai.request(app)
                .post('/me/entities/likes/' + id + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_NOT_FOUND);
                    done();
                });
        });

        it('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/entities/likes/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe('Dislike one entity', function () {
        it('should dislike entity successfully', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .delete('/me/entities/likes/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.numberLikes).to.equal(0);
                    done();
                });
        });

        it('should show disliked status when entity requested', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/entity/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res.body.isLiked).to.equal(false);
                    done();
                });
        });

        it('should show disliked status when all entities requested', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/entities?token=' + token + '&longitude=2.102137&latitude=41.319359')
                .send()
                .then(function (res) {
                    expect(res.body[2].isLiked).to.equal(false);
                    done();
                });
        });

        it('should not dislike entity not liked', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .delete('/me/entities/likes/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_CONFLICT);
                    entityModel.findById(entityId1, function (err, entity) {
                        expect(entity.numberLikes).to.equal(0);
                        done();
                    });
                });
        });

        it('should detect wrong entity id', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            let id = "5afa7fbdd6239a10cea50a2e";

            chai.request(app)
                .delete('/me/entities/likes/' + id + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_NOT_FOUND);
                    done();
                });
        });

        it('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .delete('/me/entities/likes/' + entityId1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe('Deactivate entity and its goods', function () {
        it('should deactivate entity successfully', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .delete('/me?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    done();
                });
        });

        it('should hide deactivated entity', function (done) {
            entityModel.ensureIndexes(function () {
                let token = base64url.encode(jwt.sign({
                    userId: 'sbrin@google.com',
                    userType: 'Beneficiary'
                }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

                chai.request(app)
                    .get('/me/entities?token=' + token + '&longitude=2.102137&latitude=41.319359')
                    .send()
                    .then(function (res) {
                        expect(res).to.have.status(constants.STATUS_OK);
                        expect(res.body.length).to.equal(2);
                        expect(res.body[0].name).to.equal('Colmado2');
                        expect(res.body[1].name).to.equal('Colmado3');
                        done();
                    });
            });
        });

        it('should hide goods from deactivated entity', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/goods/?token=' + token + '&category=0&order=0')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.length).to.equal(1);
                    expect(res.body[0].productName).to.equal('productTest3');
                    done();
                });
        });

        it('should reactivate entity successully', function (done) {
            chai.request(app)
                .get('/login?email=joanpuig@google.com&password=myPAsswd!')
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.token).not.to.equal(null);
                    done();
                });
        });

        it('should show reactivated entity', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/entities?token=' + token + '&longitude=2.102137&latitude=41.319359')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.length).to.equal(3);
                    expect(res.body[0].name).to.equal('Colmado2');
                    expect(res.body[1].name).to.equal('Colmado3');
                    expect(res.body[2].name).to.equal('Colmado1');
                    done();
                });
        });

        it('should show goods from reactivated entity', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/goods/?token=' + token + '&category=0&order=0')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.length).to.equal(3);
                    expect(res.body[0].productName).to.equal('productTest3');
                    expect(res.body[1].productName).to.equal('productTest2');
                    expect(res.body[2].productName).to.equal('productTest1');
                    done();
                });
        });
    });
});
