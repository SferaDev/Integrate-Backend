import app from "../server";
import {
    ERROR_DEFAULT,
    STATUS_BAD_REQUEST,
    STATUS_CONFLICT,
    STATUS_CREATED,
    STATUS_FORBIDDEN,
    STATUS_NOT_FOUND,
    STATUS_OK,
    STATUS_SERVER_ERROR,
    TOKEN_SECRET
} from "../src/constants";
import {entityModel} from "../src/models/entityModel";
import {goodModel} from "../src/models/goodModel";

import chai from "chai";
import chai_http from "chai-http";
import sinon from "sinon";
import mongoose from "mongoose";
import {Mockgoose} from "mockgoose";
import base64url from "base64url";
import jwt from "jsonwebtoken";
import {beneficiaryModel} from "../src/models/beneficiaryModel";

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
            coordinates: [2.235324, 41.145634],
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

    describe('List and filter all goods', function() {

        beforeEach(function (done) {
            let goodItem = new goodModel({
                'userId': entityItem._id,
                'productName': 'productTest1',
                'picture': 'picture.png',
                'initialPrice':'100',
                'discountType':'%',
                'discount':'10',
                'category':'Alimentació',
                'reusePeriod':'7',
                'pendingUnits':'100',
                'location': [2.098851, 41.322228],
                'numberFavs': 2
            });
            //goodModel.on('location_2d', function() {
                goodItem.save(function () {
                    done();
                });
            //});
        });

        beforeEach(function (done) {
            let goodItem = new goodModel({
                'userId': entityItem._id,
                'productName': 'productTest2',
                'picture': 'picture.png',
                'initialPrice':'100',
                'discountType':'%',
                'discount':'10',
                'category':'Esports',
                'reusePeriod':'7',
                'pendingUnits':'100',
                'location': [2.092285, 41.331992],
                'numberFavs': 0
            });
            //goodModel.on('index', function() {
                goodItem.save(function () {
                    done();
                });
            //});
        });

        beforeEach(function (done) {
            let goodItem = new goodModel({
                'userId': entityItem._id,
                'productName': 'productTest3',
                'picture': 'picture.png',
                'initialPrice':'100',
                'discountType':'%',
                'discount':'10',
                'category':'Esports',
                'reusePeriod':'7',
                'pendingUnits':'100',
                'location': [2.084861, 41.340015],
                'numberFavs': 10
            });
            //goodModel.on('index', function() {
                goodItem.save(function () {
                    done();
                });
            //});
        });


        it('should list all goods ordered by most recent', function(done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/goods/?token=' + token +'&category=0&order=0')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_OK);
                    expect(res.body[0].productName).to.equal('productTest3');
                    expect(res.body[1].productName).to.equal('productTest2');
                    expect(res.body[2].productName).to.equal('productTest1');
                    done();
                });
        });

        it('should list all goods ordered by popularity', function(done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/goods/?token=' + token +'&category=0&order=1')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_OK);
                    expect(res.body[0].productName).to.equal('productTest3');
                    expect(res.body[1].productName).to.equal('productTest1');
                    expect(res.body[2].productName).to.equal('productTest2');
                    done();
                });
        });


        it('should list all goods ordered by proximity', function(done) {
            goodModel.ensureIndexes(function () {
                let token = base64url.encode(jwt.sign({
                    userId: 'joanpuig@google.com',
                    userType: 'Beneficiary'
                }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

                chai.request(app)
                    .get('/me/goods/?token=' + token +'&category=0&order=2&longitude=2.102137&latitude=41.319359')
                    .send()
                    .then(function (res) {
                        expect(res).to.have.status(STATUS_OK);
                        expect(res.body[0].productName).to.equal('productTest1');
                        expect(res.body[1].productName).to.equal('productTest2');
                        expect(res.body[2].productName).to.equal('productTest3');
                        done();
                    });
            });
        });


        it('should filter goods by category', function(done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/goods/?token=' + token +'&category=7&order=0')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_OK);
                    expect(res.body.length).to.equal(2);
                    expect(res.body[0].productName).to.equal('productTest3');
                    expect(res.body[1].productName).to.equal('productTest2');
                    done();
                });
        });

        it('should detect wrong query parameters', function(done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/goods/?token=' + token +'&categoryy=7&orderr=0')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_BAD_REQUEST);
                    done();
                });
        });

        it ('should detect database errors', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(mongoose.Aggregate.prototype, 'exec');
            mongoose.Aggregate.prototype.exec.yields({code:ERROR_DEFAULT, err:'Internal error'});
            chai.request(app)
                .get('/me/goods/?token=' + token +'&category=0&order=0')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_SERVER_ERROR);
                    mongoose.Aggregate.prototype.exec.restore();
                    done();
                });
        });

        it ('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/goods/?token=' + token +'&category=0&order=0')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe('List favourite goods', function () {
        it('should list all favourite goods successfully', function (done) {
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
                let beneficiaryItem = new beneficiaryModel({
                    nif: '12345678F',
                    firstName: 'Sergey',
                    lastName: 'Brin',
                    email: 'sbrin@google.com',
                    password: 'myPAsswd!',
                    favouriteGoods: [good._id]
                });

                beneficiaryItem.save(function () {
                    let token = base64url.encode(jwt.sign({
                        userId: 'sbrin@google.com',
                        userType: 'Beneficiary'
                    }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

                    chai.request(app)
                        .get('/me/goods/favourites/?token=' + token)
                        .send()
                        .then(function (res) {
                            expect(res).to.have.status(STATUS_OK);
                            expect(res.body[0].productName).to.equal('productTest');
                            done();
                        });
                });
            });
        });

        it ('should detect database errors when finding beneficiary', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(beneficiaryModel, 'findOne');
            beneficiaryModel.findOne.yields({code:ERROR_DEFAULT, err:'Internal error'});
            chai.request(app)
                .get('/me/goods/favourites/?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_SERVER_ERROR);
                    beneficiaryModel.findOne.restore();
                    done();
                });
        });

        it ('should detect database errors when finding goods', function (done) {
            let beneficiaryItem = new beneficiaryModel({
                nif: '12345678F',
                firstName: 'Sergey',
                lastName: 'Brin',
                email: 'sbrin@google.com',
                password: 'myPAsswd!',
                favouriteGoods: []
            });

            beneficiaryItem.save(function () {
                let token = base64url.encode(jwt.sign({
                    userId: 'sbrin@google.com',
                    userType: 'Beneficiary'
                }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

                sinon.stub(goodModel, 'find');
                goodModel.find.yields({code: ERROR_DEFAULT, err: 'Internal error'});
                chai.request(app)
                    .get('/me/goods/favourites/?token=' + token)
                    .send()
                    .then(function (res) {
                        expect(res).to.have.status(STATUS_SERVER_ERROR);
                        goodModel.find.restore();
                        done();
                    });
            });
        });

        it ('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .get('/me/goods/favourites/?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe('Add new good', function () {
        it('should add good successfully', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
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
                    done();
                });
        });

        it('should detect database errors', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel.prototype, 'save');
            goodModel.prototype.save.yields({code:ERROR_DEFAULT, err:'Internal error'});
            chai.request(app)
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
                    done();
                });
        });

        it ('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
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
                    expect(res).to.have.status(STATUS_FORBIDDEN);
                    done();
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

        it ('should detect database errors', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel, 'findByIdAndRemove');
            goodModel.findByIdAndRemove.yields({code:ERROR_DEFAULT, err:'Internal error'});
            chai.request(app)
                .delete('/me/goods/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_SERVER_ERROR);
                    goodModel.findByIdAndRemove.restore();
                    done();
                });
        });

        it ('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .delete('/me/goods/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_FORBIDDEN);
                    done();
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

        it ('should detect database errors', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(goodModel, 'findByIdAndUpdate');
            goodModel.findByIdAndUpdate.yields({code:ERROR_DEFAULT, err:'Internal error'});
            chai.request(app)
                .put('/me/goods/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_SERVER_ERROR);
                    goodModel.findByIdAndUpdate.restore();
                    done();
                });
        });

        it ('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .put('/me/goods/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_FORBIDDEN);
                    done();
                });
        });
    });

    describe ('Add good to favourites', function () {
        it ('should add good to favourites successfully', function (done) {
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
                let beneficiaryItem = new beneficiaryModel({
                    nif: '12345678F',
                    firstName: 'Sergey',
                    lastName: 'Brin',
                    email: 'sbrin@google.com',
                    password: 'myPAsswd!'
                });

                beneficiaryItem.save(function () {
                    let token = base64url.encode(jwt.sign({
                        userId: 'sbrin@google.com',
                        userType: 'Beneficiary'
                    }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

                    chai.request(app)
                        .post('/me/goods/favourites/' + good._id + '?token=' + token)
                        .send()
                        .then(function (res) {
                            expect(res).to.have.status(STATUS_OK);
                            expect(res.body[0]).to.equal(good._id.toString());
                            done();
                        });
                });
            });
        });

        it ('should detect database errors when finding beneficiary', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            sinon.stub(beneficiaryModel, 'findOne');
            beneficiaryModel.findOne.yields({code:ERROR_DEFAULT, err:'Internal error'});
            chai.request(app)
                .post('/me/goods/favourites/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_SERVER_ERROR);
                    beneficiaryModel.findOne.restore();
                    done();
                });
        });

        it ('should detect invalid good ids', function (done) {
            let beneficiaryItem = new beneficiaryModel({
                nif: '12345678F',
                firstName: 'Sergey',
                lastName: 'Brin',
                email: 'sbrin@google.com',
                password: 'myPAsswd!',
                favouriteGoods: []
            });

            beneficiaryItem.save(function () {
                let token = base64url.encode(jwt.sign({
                    userId: 'sbrin@google.com',
                    userType: 'Beneficiary'
                }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

                chai.request(app)
                    .post('/me/goods/favourites/5ae9869d1fda296beeb99d86?token=' + token)
                    .send()
                    .then(function (res) {
                        expect(res).to.have.status(STATUS_NOT_FOUND);
                        done();
                    });
            });
        });

        it ('should detect database errors when finding goods', function (done) {
            let beneficiaryItem = new beneficiaryModel({
                nif: '12345678F',
                firstName: 'Sergey',
                lastName: 'Brin',
                email: 'sbrin@google.com',
                password: 'myPAsswd!',
                favouriteGoods: []
            });

            beneficiaryItem.save(function () {
                let token = base64url.encode(jwt.sign({
                    userId: 'sbrin@google.com',
                    userType: 'Beneficiary'
                }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

                sinon.stub(goodModel, 'findById');
                goodModel.findById.yields({code: ERROR_DEFAULT, err: 'Internal error'});
                chai.request(app)
                    .post('/me/goods/favourites/' + 1 + '?token=' + token)
                    .send()
                    .then(function (res) {
                        expect(res).to.have.status(STATUS_SERVER_ERROR);
                        goodModel.findById.restore();
                        done();
                    });
            });
        });

        it ('should detect duplicate goods', function (done) {
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
                let beneficiaryItem = new beneficiaryModel({
                    nif: '12345678F',
                    firstName: 'Sergey',
                    lastName: 'Brin',
                    email: 'sbrin@google.com',
                    password: 'myPAsswd!',
                    favouriteGoods: [good._id]
                });

                beneficiaryItem.save(function () {
                    let token = base64url.encode(jwt.sign({
                        userId: 'sbrin@google.com',
                        userType: 'Beneficiary'
                    }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

                    chai.request(app)
                        .post('/me/goods/favourites/' + good._id + '?token=' + token)
                        .send()
                        .then(function (res) {
                            expect(res).to.have.status(STATUS_CONFLICT);
                            done();
                        });
                });
            });
        });

        it ('should not allow wrong type of user', function (done) {
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Entity'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

            chai.request(app)
                .post('/me/goods/favourites/' + 1 + '?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_FORBIDDEN);
                    done();
                });
        });

    });
});
