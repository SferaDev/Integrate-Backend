import {beneficiaryModel} from "../src/models/UserModel";

// Chai: Assertion library
const chai = require('chai');
const expect = chai.expect;

// Nock: Intercept http calls and provide a hard-response
const nock = require('nock');

// Sinon: Mocks and stubs
const sinon = require('sinon');

// Constants
const LOCAL_ADMINISTRATION_URI = process.env.LOCAL_ADMINISTRATION_URI || 'http://localhost:3000/administration';

// App definitions
const userController = require('../src/controllers/UserController');
const successResponse = require('./response/BeneficiaryAdministrationResponse');

// Test group
describe('Test group for BeneficiaryController', function() {

    before(function () {
        // Before each: Intercept prototype 'save' calls
        sinon.stub(beneficiaryModel.prototype, 'save');
    });

    after(function () {
        // After each: Clean up prototype 'save' results
        beneficiaryModel.prototype.save.restore();
    });

    describe('Test group for loadBeneficiaries function', function () {
        it('should add beneficiaries successfully', function () {
            nock(LOCAL_ADMINISTRATION_URI)
                .get('')
                .reply(200, successResponse);

            // Set mock behaviour as null
            beneficiaryModel.prototype.save.yields(null);

            let callback = function (err, message) {
                expect(err).to.equal(null);
                expect(message).to.equal('Beneficiaries loaded successfuly');
                sinon.assert.called(beneficiaryModel.prototype.save);
            };

            userController.loadBeneficiaries(callback);
        });

        it('should deal with duplicated beneficiaries', function () {
            nock(LOCAL_ADMINISTRATION_URI)
                .get('')
                .reply(200, successResponse);

            beneficiaryModel.prototype.save.yields({code:11000});

            let callback = function (err, message) {
                expect(err).to.equal(null);
                expect(message).to.equal('Beneficiaries loaded successfuly');
                sinon.assert.called(beneficiaryModel.prototype.save);
            };

            userController.loadBeneficiaries(callback);
        });

        it('should detect database errors', function () {
            nock(LOCAL_ADMINISTRATION_URI)
                .get('')
                .reply(200, successResponse);

            beneficiaryModel.prototype.save.yields({code:11111, err:'Internal error'});

            let callback = function (err, message) {
                expect(err.code).to.equal(11111);
                expect(message).to.equal('Error on saving beneficiary');
                sinon.assert.called(beneficiaryModel.prototype.save);
            };

            userController.loadBeneficiaries(callback);
        });

        it('should detect external server error', function () {
            nock(LOCAL_ADMINISTRATION_URI)
                .get('')
                .reply(500,{message:'ERROR'});

            let callback = function (err, message) {
                expect(err.response.status).to.equal(500);
                expect(message).to.equal('Error on fetching beneficiaries from local administration');
            };

            userController.loadBeneficiaries(callback);
        });
    });

});