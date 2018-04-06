// Mongoose: MongoDB connector
const mongoose = require('mongoose');

// Chai: Assertion library
const chai = require('chai');
const expect = chai.expect;

// App definitions
const beneficiary = require('../src/models/BeneficiaryModel');

// Test group
describe('Test group for BeneficiaryModel', function() {
    before(function (done) {
        // Connect to a test database
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/Test', function (error) {
            if (error) console.error(error);
            done();
        });
    });

    beforeEach(function (done) {
        // Drop test database
        mongoose.connection.db.dropDatabase();
        done();
    });

    after(function (done) {
        // Drop test database
        mongoose.connection.db.dropDatabase();
        done();
    });

    describe('Test group for password storage', function () {
        it('should store a hashed password', function (done) {
            let beneficiaryItem = new beneficiary({
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
            let beneficiaryItem = new beneficiary({
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
            let beneficiaryItem = new beneficiary({
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
            let beneficiaryItem = new beneficiary({
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