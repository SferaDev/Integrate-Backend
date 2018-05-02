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
export const STATUS_SERVER_ERROR = 500;

// Nodemailer
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE || '';
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS || '';

// Good attributes
export const CATEGORIES = ["Totes", "Alimentació", "Cultura", "Formació", "Mobilitat", "Tecnologia", "Salut", "Esports", "Lleure", "Altres"];
export const ORDER = ["Recents", "Popularitat", "Proximitat"];