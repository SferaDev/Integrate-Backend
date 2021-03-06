import mongoose from "mongoose";
import schedule from "node-schedule";
import {Mockgoose} from "mockgoose/built/mockgoose";

import {ENV, MONGODB_URI} from "../src/constants";
import {loadBeneficiaries} from "../src/controllers/beneficiaryController";

mongoose.Promise = global.Promise;

export default function constructor() {
    if (ENV === 'production') {
        mongoose.connect(MONGODB_URI, function (error) {
            if (error) console.error(error);
            else console.log('MongoDB connected');

            // Load beneficiaries for first time
            let loadBeneficiariesCallback = function (err, message) {
                if (err) console.error(message);
                else console.log(message);
            };
            loadBeneficiaries(loadBeneficiariesCallback);

            // Reload beneficiaries everyday at midnight
            schedule.scheduleJob('0 0 * * *', function () {
                loadBeneficiaries(loadBeneficiariesCallback);
            });
        });
    } else {
        const mockgoose = new Mockgoose(mongoose);
        mockgoose.prepareStorage().then(function () {
            mongoose.connect(MONGODB_URI, function (error) {
                if (error) console.error(error);
                else console.log('Mockgoose connected');
            });
        });
    }
}