import app from "../server";
import {ERROR_DEFAULT, STATUS_OK, STATUS_SERVER_ERROR, TOKEN_SECRET} from "../src/constants";
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

    it ('should get all entities', function (done) {
        // Populate database
        let entityItem = new entityModel({
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
            //get token
            let token = base64url.encode(jwt.sign({
                userId: 'joanpuig@google.com',
                userType: 'Beneficiary'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
            //test get entities
            return chai.request(app)
                .get('/me/entities?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(STATUS_OK);
                    expect(res.body.length).to.equal(1);
                    mockgoose.helper.reset().then(() => {
                        done();
                    });
                });
        });
    });

    it('should detect database errors', function () {
        let token = base64url.encode(jwt.sign({
            userId: 'joanpuig@google.com',
            userType: 'Beneficiary'
        }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

        sinon.stub(entityModel, 'find');
        entityModel.find.yields({code:ERROR_DEFAULT, err:'Internal error'});
        return chai.request(app)
            .get('/me/entities?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(STATUS_SERVER_ERROR);
                entityModel.find.restore();
            });
    });
});
