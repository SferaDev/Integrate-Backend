// Test environment
export const PORT = process.env.PORT || 3000;
export const ENV = process.env.NODE_ENV || 'test';

// MongoDB
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/Integrate';

export const LOCAL_ADMINISTRATION_URI = process.env.LOCAL_ADMINISTRATION_URI || 'http://localhost:3000/administration';
export const TOKEN_SECRET = process.env.TOKEN_SECRET || 'randomTokenSecret';

// Database error codes
export const ERROR_DEFAULT = 10000;
export const ERROR_NIF_DUPLICATED = 11000;
export const ERROR_INVALID_PASSWORD = 12000;
export const ERROR_USER_DOESNT_EXIST = 13000;
export const ERROR_WRONG_PARAMETERS = 14000;

// HTTP status codes
export const STATUS_OK = 200;
export const STATUS_CREATED = 201;
export const STATUS_BAD_REQUEST = 400;
export const STATUS_UNAUTHORIZED = 401;
export const STATUS_FORBIDDEN = 403;
export const STATUS_NOT_FOUND = 404;
export const STATUS_CONFLICT = 409;
export const STATUS_SERVER_ERROR = 500;

// Nodemailer
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE || '';
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS || '';

// Translate languages
export const TRANSLATABLE = [
    'description',
    'productName',
    'message'
];
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