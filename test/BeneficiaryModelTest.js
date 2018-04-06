// Chai: Assertion library
const chai = require('chai');
const expect = chai.expect;

// Nock: Intercept http calls and provide a hard-response
const nock = require('nock');

// Sinon: Mocks and stubs
const sinon = require('sinon');

// App definitions
// TODO: Empty

// Test group
describe('Test group for BeneficiaryModel', function() {

    before(function () {
        // Connect to a test database
        mongoose.connect('mongodb://localhost/testDatabase');
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error'));
        db.once('open', function() {
            console.log('We are connected to test database!');
            done();
        });
    });

    after(function () {
        // Drop test database
        mongoose.connection.db.dropDatabase(function(){
            mongoose.connection.close(done);
        });
    });

});