import {STATUS_FORBIDDEN, STATUS_OK, STATUS_UNAUTHORIZED, TOKEN_SECRET} from "../src/constants";
import base64url from "base64url/dist/base64url";
import jwt from "jsonwebtoken";
import app from "../server";
import chai from "chai";

const expect = chai.expect;

describe("Test group for api calls", function(){
    it ("should verify correct token", function(done) {
        let token = base64url.encode(jwt.sign({
            userId: 'joanpuig@google.com',
            userType: 'Beneficiary'
        }, TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
        chai.request(app)
            .get('/me?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(STATUS_OK);
                expect(res.body.success).to.equal(true);
                done();
            });
    });

    it ("should detect incorrect token", function(done) {
        let token = "abcde";
        chai.request(app)
            .get('/me?token=' + token)
            .send()
            .then(function (res) {
                expect(res).to.have.status(STATUS_UNAUTHORIZED);
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal("Failed to authenticate token.");
                done();
            });
    });

    it ("should detect call without token", function(done) {
        chai.request(app)
            .get('/me')
            .send()
            .then(function (res) {
                expect(res).to.have.status(STATUS_FORBIDDEN);
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal("No token provided.");
                done();
            });
    });
});