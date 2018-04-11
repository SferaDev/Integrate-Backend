const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const sinon = require('sinon');

const app = require('../server');
const Good = require('../src/models/GoodModel');

describe('Operations that involve goods', function () {

    it('should add good successfully', function () {
        sinon.stub(Good.prototype, 'save');
        Good.prototype.save.yields(null);
        return chai.request(app)
            .post('/me/goods')
            .send({
                'userId': '1',
                'userType': 'Entity',
                'productName': 'productTest',
                'picture': 'picture.png',
                'discountType':'%',
                'discount':'10',
                'category':'food',
                'reusePeriod':'7',
                'pendingUnits':'100'
            })
            .then(function (res) {
                expect(res).to.have.status(201);
                Good.prototype.save.restore();
            });
    });

    it('should detect database errors', function () {
        sinon.stub(Good.prototype, 'save');
        Good.prototype.save.yields({code:11111, err:'Internal error'});
        return chai.request(app)
            .post('/me/goods')
            .send({
                'userId': '1',
                'userType': 'Entity',
                'productName': 'productTest',
                'picture': 'picture.png',
                'discountType':'%',
                'discount':'10',
                'category':'food',
                'reusePeriod':'7',
                'pendingUnits':'100'
            })
            .then(function (res) {
                expect(res).to.have.status(500);
                Good.prototype.save.restore();
            });
    });
});