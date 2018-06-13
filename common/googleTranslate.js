import * as constants from "../src/constants";
import translate from "google-translate-api";

export function translateString(language, string, callback) {
    let validLanguages = constants.LANGUAGES.map(element => element.language);
    if (validLanguages.indexOf(language) === -1) return callback('Wrong language', null);
    if (constants.ENV !== 'production') return callback(null, string);
    translate(string, {to: language}).then(res => {
        if (res.from.language.iso === language) return callback(null, string);
        let result = sentenceCase(res.text);
        callback(null, result);
    }).catch(err => {
        callback(err, null);
    });
}

function sentenceCase(string) {
    // Remove duplicated spacings
    let result = string.replace(/\s+/g, ' ').replace(/^\s+|\s+$/, '');
    // Upper case first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);
    // Upper case after periods, question marks...
    result = result.replace(/([!?.]\s+)([a-z])/g, (m, $1, $2) => {
        return $1 + $2.toUpperCase();
    });
    return result;
}