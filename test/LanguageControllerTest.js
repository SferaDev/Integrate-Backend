import base64url from "base64url/dist/base64url";
import jwt from "jsonwebtoken";
import chai from "chai";
import {Mockgoose} from "mockgoose";
import mongoose from "mongoose";
import {app} from "../server";
import {beneficiaryModel} from "../src/models/beneficiaryModel";
import * as constants from "../src/constants";
import * as googleTranslate from "../common/googleTranslate";

const expect = chai.expect;
const mockgoose = new Mockgoose(mongoose);

describe("Test group for language calls", function () {
    before(function (done) {
        // Create a dummy user
        let beneficiaryItem = new beneficiaryModel({
            nif: '12345678F',
            firstName: 'Sergey',
            lastName: 'Brin',
            email: 'sbrin@google.com',
            password: 'myPAsswd!'
        });

        beneficiaryItem.save(function () {
            done();
        });
    });

    after(function (done) {
        // Drop test database
        mockgoose.helper.reset().then(() => {
            done();
        });
    });

    it("should get interface language", function (done) {
        let token = base64url.encode(jwt.sign({
            userId: 'sbrin@google.com',
            userType: 'Beneficiary'
        }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
        chai.request(app)
            .get('/me/language/interface?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body.interfaceLanguage).to.equal('en');
                done();
            });
    });

    it("should update interface language", function (done) {
        let token = base64url.encode(jwt.sign({
            userId: 'sbrin@google.com',
            userType: 'Beneficiary'
        }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
        chai.request(app)
            .put('/me/language/interface?token=' + token)
            .send({interfaceLanguage: 'es'})
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body.interfaceLanguage).to.equal('es');
                done();
            });
    });

    it("should not update interface language", function (done) {
        let token = base64url.encode(jwt.sign({
            userId: 'sbrin@google.com',
            userType: 'Beneficiary'
        }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
        chai.request(app)
            .put('/me/language/interface?token=' + token)
            .send({interfaceLanguage: 'random'})
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_BAD_REQUEST);
                done();
            });
    });

    it("should get goods language", function (done) {
        let token = base64url.encode(jwt.sign({
            userId: 'sbrin@google.com',
            userType: 'Beneficiary'
        }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
        chai.request(app)
            .get('/me/language/goods?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body.goodLanguage).to.equal('en');
                done();
            });
    });

    it("should update goods language", function (done) {
        let token = base64url.encode(jwt.sign({
            userId: 'sbrin@google.com',
            userType: 'Beneficiary'
        }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
        chai.request(app)
            .put('/me/language/goods?token=' + token)
            .send({goodLanguage: 'es'})
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body.goodLanguage).to.equal('es');
                done();
            });
    });

    it("should not update good language", function (done) {
        let token = base64url.encode(jwt.sign({
            userId: 'sbrin@google.com',
            userType: 'Beneficiary'
        }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
        chai.request(app)
            .put('/me/language/goods?token=' + token)
            .send({goodLanguage: 'random'})
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_BAD_REQUEST);
                done();
            });
    });

    it('should not translate string (invalid language)', function (done) {
        googleTranslate.translateString('random', 'Hello friend', function (err, response) {
            expect(err).to.equal('Wrong language');
            done();
        });
    });
});