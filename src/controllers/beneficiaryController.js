import axios from "axios";

import {beneficiaryModel} from "../models/beneficiaryModel";
import {ERROR_NIF_DUPLICATED, LOCAL_ADMINISTRATION_URI} from "../constants";

export function loadBeneficiaries(callback) {
    axios.get(LOCAL_ADMINISTRATION_URI).then(function (response) {
        let message = 'Beneficiaries loaded successfully';
        let err = null;
        response.data.forEach(function (beneficiary) {
            let newBeneficiary = new beneficiaryModel(beneficiary);
            newBeneficiary.save(function (error) {
                if (error && error.code !== ERROR_NIF_DUPLICATED) {
                    err = error;
                    message = 'Error on saving beneficiary';
                }
            });
        });
        callback(err, message);
    }).catch(function (error) {
        callback(error, 'Error on fetching beneficiaries from local administration');
    });
}
