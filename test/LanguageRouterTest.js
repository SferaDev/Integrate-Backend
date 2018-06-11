import chai from "chai";

import {app} from "../server";
import * as constants from "../src/constants";

const expect = chai.expect;

describe("Test group for language calls", function () {
    it("should get list of valid languages", function (done) {
        chai.request(app)
            .get('/language')
            .send()
            .then(function (res) {
                expect(res).to.have.status(constants.STATUS_OK);
                done();
            });
    });
});