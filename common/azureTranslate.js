import * as constants from "../src/constants";
import MSTranslator from "mstranslator";

const client = new MSTranslator({
    api_key: process.env.AZURE_API_KEY
}, true);

export function translateString(language, string, callback) {
    let validLanguages = constants.LANGUAGES.map(element => element.language);
    if (validLanguages.indexOf(language) === -1) return callback('Wrong language', null);
    if (constants.ENV !== 'production') return string;
    client.translate({text: string, to: language}, (err, data) => {
        if (err) {
            console.error(err);
            callback(err, string);
        } else {
            let result = sentenceCase(data);
            callback(null, result);
        }
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