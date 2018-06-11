import base64url from "base64url/dist/base64url";
import jwt from "jsonwebtoken";
import chai from "chai";
import {Mockgoose} from "mockgoose";
import {app} from "../server";
import * as constants from "../src/constants";
import {beneficiaryModel} from "../src/models/beneficiaryModel";
import mongoose from "mongoose";

const expect = chai.expect;
const mockgoose = new Mockgoose(mongoose);

describe("Test group for api calls", function () {
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

    it("should verify correct token", function (done) {
        let token = base64url.encode(jwt.sign({
            userId: 'sbrin@google.com',
            userType: 'Beneficiary'
        }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
        chai.request(app)
            .get('/me?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body.success).to.equal(true);
                done();
            });
    });

    it("should detect incorrect token", function (done) {
        let token = "abcde";
        chai.request(app)
            .get('/me?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_UNAUTHORIZED);
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal("Failed to authenticate token.");
                done();
            });
    });

    it("should detect call without token", function (done) {
        chai.request(app)
            .get('/me')
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal("No token provided.");
                done();
            });
    });
});