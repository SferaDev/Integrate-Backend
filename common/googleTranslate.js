import * as constants from "../src/constants";
import translate from "google-translate-api";

export function translateString(language, string, callback) {
    let validLanguages = constants.LANGUAGES.map(element => element.language);
    if (validLanguages.indexOf(language) === -1) return callback('Wrong language', null);
    if (constants.ENV !== 'production') return string;
    translate(string, {to: language}).then(res => {
        if (res.from.language.iso === language) return string;
        callback(null, sentenceCase(res.text));
    }).catch(err => {
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