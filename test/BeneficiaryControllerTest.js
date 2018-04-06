// Chai: Assertion library
const chai = require('chai');
const expect = chai.expect;

// Nock: Intercept http calls and provide a hard-response
const nock = require('nock');

// Sinon: Mocks and stubs
const sinon = require('sinon');

// Constants
const LOCAL_ADMINISTRATION_URI = process.env.LOCAL_ADMINISTRATION_URI || 'localhost/administration';

// App definitions
const beneficiary = require('../src/models/BeneficiaryModel');
const beneficiaryController = require('../src/controllers/BeneficiaryController');
const successResponse = require('./response/BeneficiaryAdministrationResponse');

// Test group
describe('Operations that involve beneficiaries', function() {

    before(function () {
        // Before each: Intercept prototype 'save' calls
        sinon.stub(beneficiary.prototype, 'save');
    });

    after(function () {
        // After each: Clean up prototype 'save' results
        beneficiary.prototype.save.restore();
    });

    it('should add beneficiaries successfully', function () {
        nock(LOCAL_ADMINISTRATION_URI)
            .get('')
            .reply(200, successResponse);

        // Set mock behaviour as null
        beneficiary.prototype.save.yields(null);

        let callback = function (err, message) {
            expect(err).to.equal(null);
            expect(message).to.equal('Beneficiaries loaded successfuly');
            sinon.assert.called(beneficiary.prototype.save);
        };

        beneficiaryController.loadBeneficiaries(callback);
    });

    it('should deal with duplicated beneficiaries', function () {
        nock(LOCAL_ADMINISTRATION_URI)
            .get('')
            .reply(200, successResponse);

        beneficiary.prototype.save.yields({code:11000});

        let callback = function (err, message) {
            expect(err).to.equal(null);
            expect(message).to.equal('Beneficiaries loaded successfuly');
            sinon.assert.called(beneficiary.prototype.save);
        };

        beneficiaryController.loadBeneficiaries(callback);
    });

    it('should detect database errors', function () {
        nock(LOCAL_ADMINISTRATION_URI)
            .get('')
            .reply(200, successResponse);

        beneficiary.prototype.save.yields({code:11111, err:'Internal error'});

        let callback = function (err, message) {
            expect(err.code).to.equal(11111);
            expect(message).to.equal('Error on saving beneficiary');
            sinon.assert.called(beneficiary.prototype.save);
        };

        beneficiaryController.loadBeneficiaries(callback);
    });

    it('should detect external server error', function () {
        nock(LOCAL_ADMINISTRATION_URI)
            .get('')
            .reply(500,{message:'ERROR'});

        let callback = function (err, message) {
            expect(err.response.status).to.equal(500);
            expect(message).to.equal('Error on fetching beneficiaries from local administration');
        };

        beneficiaryController.loadBeneficiaries(callback);
    });

});