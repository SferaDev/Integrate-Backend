// Mongoose: MongoDB connector
const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

// App definitions
const beneficiary = require('../src/models/BeneficiaryModel');

// Test group
describe('Test group for BeneficiaryModel', function() {
    before(function () {
        // Connect to a test database
        mockgoose.prepareStorage().then(function() {
            mongoose.Promise = global.Promise;
            mongoose.connect('mongodb://localhost/Integrate', function (err) {
                if (err) console.error(err);
                else console.log('MongoDB connected');
            });
        });
    });

    afterEach(function () {
        // Drop test database
        mockgoose.helper.reset();
        console.log("Database reset");
    });

    describe('Test group for password storage', function () {
        it('should store a hashed password', function () {
            let beneficiaryItem = new beneficiary({
                nif: '00000000F',
                firstName: 'Sergey',
                lastName: 'Brin',
                email: 'sbrin@google.com',
                password: 'randomPassword'
            });

            beneficiaryItem.save(function (err, obj) {
                console.log('Test');
                expect(obj.password).not.to.equal('randomPassword');
            });

        });

        it('should compare a correct plain text password with a hashed one', function () {
            let beneficiaryItem = new beneficiary({
                nif: '00000000F',
                firstName: 'Sergey',
                lastName: 'Brin',
                email: 'sbrin@google.com',
                password: 'randomPassword'
            });

            beneficiaryItem.save(function (err, obj) {
                console.log('Test');
                expect(obj.comparePassword('randomPassword')).to.equal(true);
            });
        });

        it('should compare an incorrect plain text password with a hashed one', function () {
            let beneficiaryItem = new beneficiary({
                nif: '00000000F',
                firstName: 'Sergey',
                lastName: 'Brin',
                email: 'sbrin@google.com',
                password: 'randomPassword'
            });

            beneficiaryItem.save(function (err, obj) {
                console.log('Test');
                expect(obj.comparePassword('nullPassword')).to.equal(false);
            });
        });
    });
});