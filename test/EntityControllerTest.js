import {entityModel} from "../src/models/UserModel";

// Chai: Assertion library
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const sinon = require('sinon');

const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

const base64url = require('base64url');
const jwt = require('jsonwebtoken');
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'randomTokenSecret';

const app = require('../server');

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
                userType: 'Entity'
            }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
            //test get entities
            return chai.request(app)
                .get('/me/entities?token=' + token)
                .send()
                .then(function (res) {
                    expect(res).to.have.status(200);
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
            userType: 'Entity'
        }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));

        sinon.stub(entityModel, 'find');
        entityModel.find.yields({code:11111, err:'Internal error'});
        return chai.request(app)
            .get('/me/entities?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(500);
                entityModel.find.restore();
            });
    });
});