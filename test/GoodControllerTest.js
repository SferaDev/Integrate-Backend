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

describe('Operations that involve goods', function () {

    let entityId;

    before(function (done) {
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
            coordinates: [2.235324, 41.145634],
            phone: '675849324',
            picture: 'picture.png'
        });

        entityItem.save(function (err, entity) {
            entityId = entity._id;
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
            'pendingUnits': '100',
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

    describe('List and filter all goods', function () {

        it('should list all goods ordered by most recent', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
            .get('/me/goods/?token=' + token + '&category=0&order=0')
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body[0].productName).to.equal('productTest3');
                expect(res.body[1].productName).to.equal('productTest2');
                expect(res.body[2].productName).to.equal('productTest1');
                done();
            });
        });

        it('should list all goods ordered by popularity', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
            .get('/me/goods/?token=' + token + '&category=0&order=1')
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body[0].productName).to.equal('productTest3');
                expect(res.body[1].productName).to.equal('productTest1');
                expect(res.body[2].productName).to.equal('productTest2');
                done();
            });
        });


        it('should list all goods ordered by proximity', function (done) {
            goodModel.ensureIndexes(function () {
                let token = base64url.encode(jwt.sign({
                    userId: 'sbrin@google.com',
                    userType: 'Beneficiary'
                }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

                chai.request(app)
                .get('/me/goods/?token=' + token + '&category=0&order=2&longitude=2.102137&latitude=41.319359')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body[0].productName).to.equal('productTest1');
                    expect(res.body[1].productName).to.equal('productTest2');
                    expect(res.body[2].productName).to.equal('productTest3');
                    done();
                });
            });
        });

        it('should filter goods by category', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
            .get('/me/goods/?token=' + token + '&category=7&order=0')
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body.length).to.equal(2);
                expect(res.body[0].productName).to.equal('productTest3');
                expect(res.body[1].productName).to.equal('productTest2');
                done();
            });
        });

        it('should detect wrong query parameters', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
            .get('/me/goods/?token=' + token + '&categoryy=7&orderr=0')
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_BAD_REQUEST);
                done();
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
            .get('/me/goods/?token=' + token + '&category=0&order=0')
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                mongoose.Aggregate.prototype.exec.restore();
                done();
            });
        });

        it('should list goods from one entity', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
            .get('/me/goods/?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body.length).to.equal(3);
                done();
            });
        });

        it('should detect database errors when finding entity', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(entityModel, 'findOne');
            entityModel.findOne.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .get('/me/goods/?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    entityModel.findOne.restore();
                    done();
                });
        });

        it('should detect database errors when finding goods', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel, 'find');
            goodModel.find.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .get('/me/goods/?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    goodModel.find.restore();
                    done();
                });
        });
    });

    describe('Get single good', function () {
        it('should get single good successfully (entity)', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/goods/' + good1Id + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.productName).to.equal('productTest1');
                    done();
                });
        });

        it('should get single good successfully (beneficiary)', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/goods/' + good1Id + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.productName).to.equal('productTest1');
                    done();
                });
        });

        it('should detect not found good', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            let id = "5afa7fbdd6239a10cea50a2e";

            chai.request(app)
                .get('/me/goods/' + id + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_NOT_FOUND);
                    done();
                });
        });

        it('should detect database errors', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel, 'findById');
            goodModel.findById.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .get('/me/goods/' + good1Id + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    goodModel.findById.restore();
                    done();
                });
        });
    });

    describe('Add new good', function () {
        it('should add good successfully', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/goods?token=' + token)
                .send({
                    'productName': 'productTest4',
                    'picture': 'picture.png',
                    'initialPrice': '100',
                    'discountType': '%',
                    'discount': '10',
                    'category': 1,
                    'reusePeriod': '7',
                    'pendingUnits': '100'
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_CREATED);
                    done();
                });
        });

        it('should detect database errors', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel.prototype, 'save');
            goodModel.prototype.save.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .post('/me/goods?token=' + token)
                .send({
                    'productName': 'productTest',
                    'picture': 'picture.png',
                    'initialPrice': '100',
                    'discountType': '%',
                    'discount': '10',
                    'category': 1,
                    'reusePeriod': '7',
                    'pendingUnits': '100'
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    goodModel.prototype.save.restore();
                    done();
                });
        });

        it('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/goods?token=' + token)
                .send({
                    'productName': 'productTest',
                    'picture': 'picture.png',
                    'initialPrice': '100',
                    'discountType': '%',
                    'discount': '10',
                    'category': 1,
                    'reusePeriod': '7',
                    'pendingUnits': '100'
                })
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe('Delete good', function () {
        let goodId4;

        before(function (done) {
            let goodItem = new goodModel({
                'owner': {
                    'id': entityId,
                    'name': 'Colmado'
                },
                'productName': 'productTest4',
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
                goodId4 = good._id;
                done();
            });
        });

        it('should delete existant good successfully', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .delete('/me/goods/' + goodId4 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    done();
                });
        });

        it('should detect database errors', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel, 'findByIdAndRemove');
            goodModel.findByIdAndRemove.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .delete('/me/goods/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    goodModel.findByIdAndRemove.restore();
                    done();
                });
        });

        it('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .delete('/me/goods/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe('Update good', function () {

        let goodItem;

        before(function (done) {
            goodItem = new goodModel({
                'owner': {
                    'id': entityId,
                    'name': 'Colmado'
                },
                'productName': 'productTest4',
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

            goodItem.save(function () {
                done();
            });
        });

        it('should update existant good successfully', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            goodItem.discount = 20;

            chai.request(app)
                .put('/me/goods/' + goodItem._id + '?token=' + token)
                .send(goodItem)
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body.discount).to.equal(20);
                    done();
                });
        });

        it('should detect database errors', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel, 'findByIdAndUpdate');
            goodModel.findByIdAndUpdate.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .put('/me/goods/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    goodModel.findByIdAndUpdate.restore();
                    done();
                });
        });

        it('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .put('/me/goods/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe('Add good to favourites', function () {

        /*
        before(function (done) {
            let beneficiaryItem = new beneficiaryModel({
                nif: '12345678F',
                firstName: 'Sergey',
                lastName: 'Brin',
                email: 'sbrin@google.com',
                password: 'myPAsswd!'
            });

            beneficiaryItem.save(function () {
                done();
            });
        });
        */

        it('should add good to favourites successfully', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/goods/favourites/' + good1Id + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_OK);
                    expect(res.body[0]).to.equal(good1Id.toString());
                    done();
                });
        });

        it('should detect database errors when finding beneficiary', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(beneficiaryModel, 'findOne');
            beneficiaryModel.findOne.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .post('/me/goods/favourites/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    beneficiaryModel.findOne.restore();
                    done();
                });
        });

        it('should detect invalid good ids', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/goods/favourites/5ae9869d1fda296beeb99d86?token=' + token)
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

            sinon.stub(goodModel, 'findById');
            goodModel.findById.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
                .post('/me/goods/favourites/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                    goodModel.findById.restore();
                    done();
                });
        });

        it('should detect duplicate goods', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/goods/favourites/' + good1Id + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_CONFLICT);
                    done();
                });
        });

        it('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/goods/favourites/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                    done();
                });
        });

    });

    describe('List favourite goods', function () {

        it('should list all favourite goods successfully', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
            .get('/me/goods/favourites/?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body[0].productName).to.equal('productTest1');
                done();
            });
        });

        it('should detect database errors when finding beneficiary', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(beneficiaryModel, 'findOne');
            beneficiaryModel.findOne.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
            .get('/me/goods/favourites/?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                beneficiaryModel.findOne.restore();
                done();
            });
        });

        it('should detect database errors when finding goods', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel, 'find');
            goodModel.find.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
            .get('/me/goods/favourites/?token=' + token)
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
            .get('/me/goods/favourites/?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                done();
            });
        });
    });

    describe('Delete good from favourites', function () {

        it('should delete good from favourites successfully', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
            .delete('/me/goods/favourites/' + good1Id + '?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                let index = res.body.indexOf(good1Id);
                expect(index).to.equal(-1);
                done();
            });
        });

        it('should detect database errors when finding beneficiary', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(beneficiaryModel, 'findOne');
            beneficiaryModel.findOne.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
            .delete('/me/goods/favourites/' + 1 + '?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                beneficiaryModel.findOne.restore();
                done();
            });
        });

        it('should detect invalid good ids', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
            .delete('/me/goods/favourites/5ae9869d1fda296beeb99d86?token=' + token)
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

            sinon.stub(goodModel, 'findById');
            goodModel.findById.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
            chai.request(app)
            .delete('/me/goods/favourites/' + 1 + '?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_SERVER_ERROR);
                goodModel.findById.restore();
                done();
            });
        });

        it('should detect non favourite goods', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
            .delete('/me/goods/favourites/' + good1Id + '?token=' + token)
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
            .delete('/me/goods/favourites/' + 1 + '?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                done();
            });
        });

    });
});
