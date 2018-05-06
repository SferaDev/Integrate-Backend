import mongoose from "mongoose";
import {Mockgoose} from "mockgoose";
import base64url from "base64url";
import jwt from "jsonwebtoken";
import chai from "chai";
import chai_http from "chai-http";

import {app} from "../server";
import {beneficiaryModel} from "../src/models/beneficiaryModel";
import * as constants from "../src/constants";

chai.use(chai_http);
const expect = chai.expect;
const mockgoose = new Mockgoose(mongoose);

// Test group
describe('Test group for BeneficiaryModel', function () {

    before(function (done) {
        // Connect to a test database
        mockgoose.prepareStorage().then(function () {
            mongoose.Promise = global.Promise;
            mongoose.connect('mongodb://localhost/Integrate', function (error) {
                if (error) console.error(error);
                done();
            });
        });
    });

    afterEach(function (done) {
        // Drop test database
        mockgoose.helper.reset().then(() => {
            done()
        });
    });

    describe('Test group for user tokens', function () {
        beforeEach(function (done) {
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

        it('should retrieve a non empty token (email)', function () {
            return chai.request(app)
            .get('/login?email=sbrin@google.com&password=myPAsswd!')
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body.token).not.to.equal(null);
            });
        });

        it('should retrieve a non empty token (nif)', function () {
            return chai.request(app)
            .get('/login?nif=12345678F&password=myPAsswd!')
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body.token).not.to.equal(null);
            });
        });

        it('should not retrieve a non empty token (two identifiers)', function () {
            return chai.request(app)
            .get('/login?email=sbrin@google.com&nif=12345678F&password=myPAsswd!')
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_UNAUTHORIZED);
                expect(res.body.code).to.equal(constants.ERROR_WRONG_PARAMETERS);
                expect(res.body.status).to.equal('Wrong parameters');
            });
        });

        it('should not retrieve a non empty token (no identifiers)', function () {
            return chai.request(app)
            .get('/login?password=myPAsswd!')
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_UNAUTHORIZED);
                expect(res.body.code).to.equal(constants.ERROR_WRONG_PARAMETERS);
                expect(res.body.status).to.equal('Wrong parameters');
            });
        });

        it('should not retrieve a non empty token (no password)', function () {
            return chai.request(app)
            .get('/login?email=sbrin@google.com&nif=12345678F')
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_UNAUTHORIZED);
                expect(res.body.code).to.equal(constants.ERROR_WRONG_PARAMETERS);
                expect(res.body.status).to.equal('Wrong parameters');
            });
        });

        it('should not retrieve a token (invalid password)', function () {
            return chai.request(app)
            .get('/login?email=sbrin@google.com&password=muuu!')
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_UNAUTHORIZED);
                expect(res.body.code).to.equal(constants.ERROR_INVALID_PASSWORD);
                expect(res.body.status).to.equal('Invalid password');
            });
        });

        it('should not retrieve a token (user doesn\'t exist)', function () {
            return chai.request(app)
            .get('/login?email=mikerooss@google.com&password=nullPass!')
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_UNAUTHORIZED);
                expect(res.body.code).to.equal(constants.ERROR_USER_DOESNT_EXIST);
                expect(res.body.status).to.equal('User doesn\'t exist');
            });
        });

        it('should not access /me/ without a token', function () {
            return chai.request(app)
            .get('/me')
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_FORBIDDEN);
                expect(res.body.success).to.equal(false);
                expect(res.body.message).to.equal('No token provided.');
            })
        });

        it('should access /me/ with a token', function () {
            let token = base64url.encode(jwt.sign({
                userId: 'sbrin@google.com',
                userType: 'Beneficiary'
            }, constants.TOKEN_SECRET, {expiresIn: 60 * 60 * 24 * 365}));
            return chai.request(app)
            .get('/me?token=' + token)
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                expect(res.body.success).to.equal(true);
            });
        });
    });

    describe('Test group for password storage', function () {
        it('should store a hashed password', function (done) {
            let beneficiaryItem = new beneficiaryModel({
                nif: '00000000F',
                firstName: 'Sergey',
                lastName: 'Brin',
                email: 'sbrin@google.com',
                password: 'randomPassword'
            });

            beneficiaryItem.save(function (err, obj) {
                expect(obj.password).not.to.equal('randomPassword');
                done();
            });

        });

        it('should compare a correct plain text password with a hashed one', function (done) {
            let beneficiaryItem = new beneficiaryModel({
                nif: '00000000F',
                firstName: 'Sergey',
                lastName: 'Brin',
                email: 'sbrin@google.com',
                password: 'randomPassword'
            });

            beneficiaryItem.save(function (err, obj) {
                expect(obj.comparePassword('randomPassword')).to.equal(true);
                done();
            });
        });

        it('should compare an incorrect plain text password with a hashed one', function (done) {
            let beneficiaryItem = new beneficiaryModel({
                nif: '00000000F',
                firstName: 'Sergey',
                lastName: 'Brin',
                email: 'sbrin@google.com',
                password: 'randomPassword'
            });

            beneficiaryItem.save(function (err, obj) {
                expect(obj.comparePassword('nullPassword')).to.equal(false);
                done();
            });

        });

        it('should not update password when editing element', function (done) {
            let beneficiaryItem = new beneficiaryModel({
                nif: '00000000F',
                firstName: 'Sergey',
                lastName: 'Brin',
                email: 'sbrin@google.com',
                password: 'randomPassword'
            });

            beneficiaryItem.save(function (err, obj) {
                obj.firstName = 'WhoCares';
                let originalPass = obj.password;
                obj.save(function (err, obj2) {
                    expect(obj2.password).to.equal(originalPass);
                    done();
                });
            });
        });
    });
});
