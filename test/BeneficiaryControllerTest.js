'use strict';

const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const nock = require('nock');
const sinon = require('sinon');

const app = require('../server.js');
const Beneficiary = require('../src/models/BeneficiaryModel');
const successResponse = require('./response/successResponse');

describe('Operations that involve beneficiaries', function() {

    beforeEach(function () {
        sinon.stub(Beneficiary.prototype, 'save');
    });

    afterEach(function () {
        Beneficiary.prototype.save.restore();
    });

    it('should add beneficiaries successfully', function () {
        nock(process.env.LOCAL_ADMINISTRATION_URI)
            .get('/beneficiaries')
            .reply(200, successResponse);

        Beneficiary.prototype.save.yields(null);

        return chai.request(app)
            .post('/beneficiaries')
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.status).to.equal('SUCCESS');
            })
    });

    it('should deal with duplicated beneficiaries', function () {
        nock(process.env.LOCAL_ADMINISTRATION_URI)
            .get('/beneficiaries')
            .reply(200, successResponse);

        Beneficiary.prototype.save.yields({code:11000});

        return chai.request(app)
            .post('/beneficiaries')
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body.status).to.equal('SUCCESS');
            })
    });

    it('should detect database errors', function () {
        nock(process.env.LOCAL_ADMINISTRATION_URI)
            .get('/beneficiaries')
            .reply(200, successResponse);

        Beneficiary.prototype.save.yields({code:11111, err:'Internal error'});

        return chai.request(app)
            .post('/beneficiaries')
            .then(function (res) {
                expect(res).to.have.status(500);
                expect(res.body.err).to.equal('Internal error');
            })
    });

    it('should detect external server error', function () {
        nock(process.env.LOCAL_ADMINISTRATION_URI)
            .get('/beneficiaries')
            .reply(400,{message:'ERROR'});

        return chai.request(app)
            .post('/beneficiaries')
            .catch(function (err) {
                expect(err).to.have.status(400);
                expect(err.body.message).to.equal('ERROR');
            })
    });

});