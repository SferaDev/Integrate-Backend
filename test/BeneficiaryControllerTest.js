import nock from "nock";
import sinon from "sinon";
import chai from "chai";

import {beneficiaryModel} from "../src/models/beneficiaryModel";
import * as userController from "../src/controllers/beneficiaryController";
import * as successResponse from "./response/BeneficiaryAdministrationResponse";
import * as constants from "../src/constants";

const expect = chai.expect;

// Test group
describe('Test group for BeneficiaryController', function () {

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
            nock(constants.LOCAL_ADMINISTRATION_URI)
            .get('')
            .reply(constants.STATUS_OK, successResponse.default);

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
            nock(constants.LOCAL_ADMINISTRATION_URI)
            .get('')
            .reply(constants.STATUS_OK, successResponse.default);

            beneficiaryModel.prototype.save.yields({code: constants.ERROR_NIF_DUPLICATED});

            let callback = function (err, message) {
                expect(err).to.equal(null);
                expect(message).to.equal('Beneficiaries loaded successfuly');
                sinon.assert.called(beneficiaryModel.prototype.save);
            };

            userController.loadBeneficiaries(callback);
        });

        it('should detect database errors', function () {
            nock(constants.LOCAL_ADMINISTRATION_URI)
            .get('')
            .reply(constants.STATUS_OK, successResponse.default);

            beneficiaryModel.prototype.save.yields({code: constants.ERROR_DEFAULT, err: 'Internal error'});

            let callback = function (err, message) {
                expect(err.code).to.equal(constants.ERROR_DEFAULT);
                expect(message).to.equal('Error on saving beneficiary');
                sinon.assert.called(beneficiaryModel.prototype.save);
            };

            userController.loadBeneficiaries(callback);
        });

        it('should detect external server error', function () {
            nock(constants.LOCAL_ADMINISTRATION_URI)
            .get('')
            .reply(constants.STATUS_SERVER_ERROR, {message: 'ERROR'});

            let callback = function (err, message) {
                expect(err.response.status).to.equal(constants.STATUS_SERVER_ERROR);
                expect(message).to.equal('Error on fetching beneficiaries from local administration');
            };

            userController.loadBeneficiaries(callback);
        });
    });

});
