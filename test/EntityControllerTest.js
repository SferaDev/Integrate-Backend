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

chai.use(chai_http);
const expect = chai.expect;
const mockgoose = new Mockgoose(mongoose);

// Test group
describe('Operations that involve entities', function () {

    beforeEach(function (done) {
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
        entityItem.save(function () {
            done();
        })
    });

    beforeEach(function (done) {
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
        entityItem.save(function () {
            done();
        })
    });

    beforeEach(function (done) {
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
        entityItem.save(function () {
            done();
        })
    });

    afterEach(function (done) {
        // Drop test database
        mockgoose.helper.reset().then(() => {
            done()
        });
    });

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
