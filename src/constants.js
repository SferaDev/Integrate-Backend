// Test environment
export const ENV = process.env.NODE_ENV || 'test';
export const PORT = process.env.PORT || 3000;

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

// Intervals
export const INTERVALS = {
    Day: 'days',
    Week: 'weeks',
    Month: 'months',
    Year: 'years'
};

// Translate languages
export const TRANSLATABLE = [
    'description',
    'productName',
    'message'
];

export const LANGUAGES = [
    {language: 'af'},
    {language: 'ar'},
    {language: 'bn'},
    {language: 'bg'},
    {language: 'ca'},
    {language: 'yue'},
    {language: 'hr'},
    {language: 'cs'},
    {language: 'da'},
    {language: 'nl'},
    {language: 'en'},
    {language: 'et'},
    {language: 'fj'},
    {language: 'fil'},
    {language: 'fi'},
    {language: 'fr'},
    {language: 'de'},
    {language: 'el'},
    {language: 'ht'},
    {language: 'he'},
    {language: 'hi'},
    {language: 'mww'},
    {language: 'hu'},
    {language: 'is'},
    {language: 'id'},
    {language: 'it'},
    {language: 'ja'},
    {language: 'sw'},
    {language: 'tlh'},
    {language: 'ko'},
    {language: 'lv'},
    {language: 'lt'},
    {language: 'mg'},
    {language: 'ms'},
    {language: 'mt'},
    {language: 'yua'},
    {language: 'no'},
    {language: 'otq'},
    {language: 'fa'},
    {language: 'pl'},
    {language: 'pt'},
    {language: 'ro'},
    {language: 'ru'},
    {language: 'sm'},
    {language: 'sk'},
    {language: 'sl'},
    {language: 'es'},
    {language: 'sv'},
    {language: 'ty'},
    {language: 'ta'},
    {language: 'th'},
    {language: 'to'},
    {language: 'tr'},
    {language: 'uk'},
    {language: 'ur'},
    {language: 'vi'},
    {language: 'cy'}
];
