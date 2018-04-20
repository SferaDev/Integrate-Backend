// Test environment
export const PORT = process.env.PORT || 3000;
export const ENV = process.env.NODE_ENV || 'test';

// MongoDB
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/Integrate';

// Nodemailer
export const EMAIL_SERVICE = 'gmail';
export const EMAIL_USER = 'integrate.upc@gmail.com';
export const EMAIL_PASS = '';