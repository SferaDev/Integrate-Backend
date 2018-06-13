import * as constants from "../src/constants";
import translate from "google-translate-api";

export function translateString(language, string, callback) {
    let validLanguages = constants.LANGUAGES.map(element => element.language);
    if (validLanguages.indexOf(language) === -1) return callback('Wrong language', null);
    if (constants.ENV !== 'production') return string;
    translate(string, {to: language}).then(res => {
        if (res.from.language.iso === language) return string;
        let result = sentenceCase(res.text);
        callback(null, result);
    }).catch(err => {
        callback(error, null);
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

export const LANGUAGES = [
    {
        "language": "af"
    },
    {
        "language": "am"
    },
    {
        "language": "ar"
    },
    {
        "language": "az"
    },
    {
        "language": "be"
    },
    {
        "language": "bg"
    },
    {
        "language": "bn"
    },
    {
        "language": "bs"
    },
    {
        "language": "ca"
    },
    {
        "language": "ceb"
    },
    {
        "language": "co"
    },
    {
        "language": "cs"
    },
    {
        "language": "cy"
    },
    {
        "language": "da"
    },
    {
        "language": "de"
    },
    {
        "language": "el"
    },
    {
        "language": "en"
    },
    {
        "language": "eo"
    },
    {
        "language": "es"
    },
    {
        "language": "et"
    },
    {
        "language": "eu"
    },
    {
        "language": "fa"
    },
    {
        "language": "fi"
    },
    {
        "language": "fr"
    },
    {
        "language": "fy"
    },
    {
        "language": "ga"
    },
    {
        "language": "gd"
    },
    {
        "language": "gl"
    },
    {
        "language": "gu"
    },
    {
        "language": "ha"
    },
    {
        "language": "haw"
    },
    {
        "language": "hi"
    },
    {
        "language": "hmn"
    },
    {
        "language": "hr"
    },
    {
        "language": "ht"
    },
    {
        "language": "hu"
    },
    {
        "language": "hy"
    },
    {
        "language": "id"
    },
    {
        "language": "ig"
    },
    {
        "language": "is"
    },
    {
        "language": "it"
    },
    {
        "language": "iw"
    },
    {
        "language": "ja"
    },
    {
        "language": "jw"
    },
    {
        "language": "ka"
    },
    {
        "language": "kk"
    },
    {
        "language": "km"
    },
    {
        "language": "kn"
    },
    {
        "language": "ko"
    },
    {
        "language": "ku"
    },
    {
        "language": "ky"
    },
    {
        "language": "la"
    },
    {
        "language": "lb"
    },
    {
        "language": "lo"
    },
    {
        "language": "lt"
    },
    {
        "language": "lv"
    },
    {
        "language": "mg"
    },
    {
        "language": "mi"
    },
    {
        "language": "mk"
    },
    {
        "language": "ml"
    },
    {
        "language": "mn"
    },
    {
        "language": "mr"
    },
    {
        "language": "ms"
    },
    {
        "language": "mt"
    },
    {
        "language": "my"
    },
    {
        "language": "ne"
    },
    {
        "language": "nl"
    },
    {
        "language": "no"
    },
    {
        "language": "ny"
    },
    {
        "language": "pa"
    },
    {
        "language": "pl"
    },
    {
        "language": "ps"
    },
    {
        "language": "pt"
    },
    {
        "language": "ro"
    },
    {
        "language": "ru"
    },
    {
        "language": "sd"
    },
    {
        "language": "si"
    },
    {
        "language": "sk"
    },
    {
        "language": "sl"
    },
    {
        "language": "sm"
    },
    {
        "language": "sn"
    },
    {
        "language": "so"
    },
    {
        "language": "sq"
    },
    {
        "language": "sr"
    },
    {
        "language": "st"
    },
    {
        "language": "su"
    },
    {
        "language": "sv"
    },
    {
        "language": "sw"
    },
    {
        "language": "ta"
    },
    {
        "language": "te"
    },
    {
        "language": "tg"
    },
    {
        "language": "th"
    },
    {
        "language": "tl"
    },
    {
        "language": "tr"
    },
    {
        "language": "uk"
    },
    {
        "language": "ur"
    },
    {
        "language": "uz"
    },
    {
        "language": "vi"
    },
    {
        "language": "xh"
    },
    {
        "language": "yi"
    },
    {
        "language": "yo"
    },
    {
        "language": "zh"
    },
    {
        "language": "zh-TW"
    },
    {
        "language": "zu"
    }
];
