import * as constants from "../src/constants";
import axios from "axios/index";

export function translateString(language, string, callback) {
    let validLanguages = constants.LANGUAGES.map(element => element.language);
    if (validLanguages.indexOf(language) === -1) return callback('Wrong language', null);
    if (constants.ENV !== 'production') return string;
    return axios.get("https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" +
        language + "&dt=t&q=" + encodeURI(string))
    .then(function (response) {
        callback(null, sentenceCase(response.data[0][0][0]));
    }).catch(function (error) {
        callback(error, null);
    });
}

function sentenceCase(string) {
    // Remove duplicated spacings
    string = string.replace(/\s+/g,' ').replace(/^\s+|\s+$/,'');
    // Upper case first letter
    string = string.charAt(0).toUpperCase() + string.slice(1);
    // Upper case after periods, question marks...
    string = string.replace(/([!?.]\s+)([a-z])/g, (m, $1, $2) => $1 + $2.toUpperCase());
    return string;
}