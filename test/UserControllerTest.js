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
describe('Operations that involve users', function() {
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

    afterEach(function (done) {
        // Drop test database
        mockgoose.helper.reset().then(() => {
            done()
        });
    });

    it ('should not reset password (not found)', function (done) {
        chai.request(app)
        .post('/register/reset')
        .send({
            nif: 'random'
        })
        .then(function (res) {
            expect(res).to.have.status(constants.STATUS_NOT_FOUND);
            done();
        });
    });
    
    it ('should not reset password (error)', function (done) {
        sinon.stub(userModel, 'findOne');
        userModel.findOne.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});
        
        chai.request(app)
        .post('/register/reset')
        .send({
            nif: 'random'
        })
        .then(function (res) {
            expect(res).to.have.status(constants.STATUS_NOT_FOUND);
            done();
        });
    });

    it ('should reset password', function (done) {
        chai.request(app)
        .post('/register/reset')
        .send({
            nif: '12345678F'
        })
        .then(function (res) {
            expect(res).to.have.status(constants.STATUS_CREATED);
            done();
        });
    });

});
