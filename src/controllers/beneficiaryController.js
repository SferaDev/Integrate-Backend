import axios from "axios";

import {beneficiaryModel} from "../models/beneficiaryModel";
import {ERROR_NIF_DUPLICATED, LOCAL_ADMINISTRATION_URI} from "../constants";

export function loadBeneficiaries(callback) {
    axios.get(LOCAL_ADMINISTRATION_URI).then(function (response) {
        let promises = [];
        response.data.forEach(function (beneficiary) {
            let newBeneficiary = new beneficiaryModel(beneficiary);
            promises.push(newBeneficiary.save(function (err) {
                if (err && err.code !== ERROR_NIF_DUPLICATED) {
                    throw err;
                }
            }));
        });
        Promise.all(promises)
            .then(() => callback(null, 'Beneficiaries loaded successfully'));
    }).catch(function (err) {
        callback(err, 'Error on fetching beneficiaries from local administration');
    });
}
