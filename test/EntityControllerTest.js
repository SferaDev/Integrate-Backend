import app from "../server";
import {
    ERROR_DEFAULT,
    STATUS_BAD_REQUEST,
    STATUS_FORBIDDEN,
    STATUS_OK,
    STATUS_SERVER_ERROR,
    TOKEN_SECRET
} from "../src/constants";
import {entityModel} from "../src/models/entityModel";

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

// Test group
describe('Operations that involve entities', function() {

    beforeEach(function (done){
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

    beforeEach(function (done){
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

    beforeEach(function (done){
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

    it ('should get all entities', function (done) {
        entityModel.ensureIndexes(function () {
            //get token
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
            //test get entities
            chai.request(app)
                .get('/me/entities?token=' + token + '&longitude=2.102137&latitude=41.319359')
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_OK);
                    expect(res.body[0].name).to.equal('Colmado2');
                    expect(res.body[1].name).to.equal('Colmado3');
                    expect(res.body[2].name).to.equal('Colmado1');
                    done();
                });
        });
    });

    it('should detect database errors', function (done) {
        let token = base64url.encode(jwt.sign({
            userId: 'joanpuig@google.com',
            userType: 'Beneficiary'
        }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

        sinon.stub(mongoose.Aggregate.prototype, 'exec');
        mongoose.Aggregate.prototype.exec.yields({code:ERROR_DEFAULT, err:'Internal error'});
        chai.request(app)
            .get('/me/entities?token=' + token + '&longitude=2.102137&latitude=41.319359')
            .send()
            .then(function (res) {
                expect(res).to.have.status(STATUS_SERVER_ERROR);
                mongoose.Aggregate.prototype.exec.restore();
                done();
            });
    });

    it('should detect wrong query parameters', function(done) {
        let token = base64url.encode(jwt.sign({
            userId: 'joanpuig@google.com',
            userType: 'Beneficiary'
        }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

        chai.request(app)
            .get('/me/entities/?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(STATUS_BAD_REQUEST);
                done();
            });
    });

    it ('should not allow wrong type of user', function (done) {
        let token = base64url.encode(jwt.sign({
            userId: 'joanpuig@google.com',
            userType: 'Entity'
        }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

        chai.request(app)
            .get('/me/entities/?token=' + token + '&longitude=2.102137&latitude=41.319359')
            .send()
            .then(function (res) {
                expect(res).to.have.status(STATUS_FORBIDDEN);
                done();
            });
    });
});
