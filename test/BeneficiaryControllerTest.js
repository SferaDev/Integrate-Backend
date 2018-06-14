import nock from "nock";
import sinon from "sinon";
import chai from "chai";

import {beneficiaryModel} from "../src/models/beneficiaryModel";
import * as beneficiaryController from "../src/controllers/beneficiaryController";
import * as successResponse from "./response/BeneficiaryAdministrationResponse";
import * as constants from "../src/constants";

const expect = chai.expect;

// Test group
describe('Test group for BeneficiaryController', function () {
    before(function (done) {
        // Before each: Intercept prototype 'save' calls
        sinon.stub(beneficiaryModel.prototype, 'save');
        done();
    });

    after(function (done) {
        // After each: Clean up prototype 'save' results
        beneficiaryModel.prototype.save.restore();
        done();
    });

    describe('Test group for loadBeneficiaries function', function () {
        it('should add beneficiaries successfully', function (done) {
            nock(constants.LOCAL_ADMINISTRATION_URI)
                .get('')
                .reply(constants.STATUS_OK, successResponse.default);

            // Set mock behaviour as null
            beneficiaryModel.prototype.save.yields(null);

            beneficiaryController.loadBeneficiaries((err, message) => {
                expect(err).to.equal(null);
                expect(message).to.equal('Beneficiaries loaded successfully');
                sinon.assert.called(beneficiaryModel.prototype.save);
                done();
            });
        });

        it('should deal with duplicated beneficiaries', function (done) {
            nock(constants.LOCAL_ADMINISTRATION_URI)
                .get('')
                .reply(constants.STATUS_OK, successResponse.default);

            beneficiaryModel.prototype.save.yields({code: constants.ERROR_NIF_DUPLICATED});

            beneficiaryController.loadBeneficiaries((err, message) => {
                expect(err).to.equal(null);
                expect(message).to.equal('Beneficiaries loaded successfully');
                sinon.assert.called(beneficiaryModel.prototype.save);
                done();
            });
        });

        it('should detect database errors', function (done) {
            nock(constants.LOCAL_ADMINISTRATION_URI)
                .get('')
                .reply(constants.STATUS_OK, successResponse.default);

            beneficiaryModel.prototype.save.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});

            beneficiaryController.loadBeneficiaries((err, message) => {
                expect(err.code).to.equal(constants.ERROR_DEFAULT);
                expect(message).to.equal('Error on fetching beneficiaries from local administration');
                sinon.assert.called(beneficiaryModel.prototype.save);
                done();
            });
        });

        it('should detect external server error', function (done) {
            nock(constants.LOCAL_ADMINISTRATION_URI)
                .get('')
                .reply(constants.STATUS_SERVER_ERROR, {message: 'ERROR'});

            beneficiaryController.loadBeneficiaries((err, message) => {
                expect(err.response.status).to.equal(constants.STATUS_SERVER_ERROR);
                expect(message).to.equal('Error on fetching beneficiaries from local administration');
                done();
            });
        });
    });

});
