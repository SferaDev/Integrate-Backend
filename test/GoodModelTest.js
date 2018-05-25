import mongoose from "mongoose";
import {Mockgoose} from "mockgoose";
import chai from "chai";

import {entityModel} from "../src/models/entityModel";
import {goodModel} from "../src/models/goodModel";
import {beneficiaryModel} from "../src/models/beneficiaryModel";

const mockgoose = new Mockgoose(mongoose);
const expect = chai.expect;

// Test group
describe('Test group for GoodModel', function () {
    let entityId;
    let entityName;

    before(function (done) {
        // Create a dummy user
        let entityItem = new entityModel({
            nif: '12345678F',
            salesmanFirstName: 'Joan',
            salesmanLastName: 'Puig',
            email: 'joanpuig@google.com',
            password: 'myPAsswd!',
            name: 'Colmado',
            description: 'Botiga de queviures',
            addressName: 'C/ Jordi Girona',
            coordinates: [2.235324, 41.145634],
            phone: '675849324',
            picture: 'picture.png'
        });

        entityItem.save(function (err, entity) {
            entityId = entity._id;
            entityName = entity.name;
            done();
        });
    });

    let beneficiaryObject;

    before (function (done) {
        let beneficiaryItem = new beneficiaryModel({
            nif: '00000000F',
            firstName: 'Sergey',
            lastName: 'Brin',
            email: 'sbrin@google.com',
            password: 'randomPassword',
            usedGoods: []
        });

        beneficiaryItem.save(function (err, beneficiary) {
            beneficiaryObject = beneficiary;
            done();
        });
    });

    after(function (done) {
        // Drop test database
        mockgoose.helper.reset().then(() => {
            done()
        });
    });

    it('should store a valid good', function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId,
                'name': entityName
            },
            'productName': 'productTest',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'discount': '10',
            'category': 1,
            'reusePeriod': '7',
            'pendingUnits': '100'
        });

        goodItem.save(function (err, good) {
            expect(err).to.equal(null);
            expect(good).to.equal(goodItem);
            done();
        });
    });

    it('should not store a good without required attributes', function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId,
                'name': entityName
            },
            'productName': 'productTest',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'category': 1,
            'reusePeriod': '7',
            'pendingUnits': '100'
        });

        goodItem.save(function (err) {
            expect(err).not.to.equal(null);
            done();
        });
    });

    it('should not store a good with invalid category (minor)', function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId,
                'name': entityName
            },
            'productName': 'productTest',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'category': 0,
            'reusePeriod': '7',
            'pendingUnits': '100'
        });

        goodItem.save(function (err) {
            expect(err).not.to.equal(null);
            done();
        });
    });

    it('should not store a good with invalid category (major)', function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId,
                'name': entityName
            },
            'productName': 'productTest',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'category': 10,
            'reusePeriod': '7',
            'pendingUnits': '100'
        });

        goodItem.save(function (err) {
            expect(err).not.to.equal(null);
            done();
        });
    });

    it('should not store a good with a reference to a non Entity user', function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': beneficiaryObject._id,
                'name': entityName
            },
            'productName': 'productTest',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'discount': '10',
            'category': 1,
            'reusePeriod': '7',
            'pendingUnits': '100'
        });
        goodItem.save(function (err) {
            expect(err).not.to.equal(null);
            done();
        });
    });

    it('should detect usability of good', function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId,
                'name': entityName
            },
            'productName': 'productTest',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'discount': '10',
            'category': 1,
            'reusePeriod': '7',
            'pendingUnits': '100'
        });

        goodItem.save(function (err, good) {
            expect(err).to.equal(null);
            expect(good.isUsable(beneficiaryObject)).to.equal(true);
            done();
        });
    });

    it('should detect non usability of good', function (done) {
        let goodItem = new goodModel({
            'owner': {
                'id': entityId,
                'name': entityName
            },
            'productName': 'productTest',
            'picture': 'picture.png',
            'initialPrice': '100',
            'discountType': '%',
            'discount': '10',
            'category': 1,
            'reusePeriod': '7',
            'pendingUnits': '100'
        });

        beneficiaryObject.usedGoods.push({
            id: goodItem._id,
            date: Date.now()
        });

        beneficiaryObject.save(function () {
            goodItem.save(function (err, good) {
                expect(err).to.equal(null);
                expect(good.isUsable(beneficiaryObject)).to.equal(false);
                done();
            });
        });
    });
});
