import nodemailer from "nodemailer";

import {EMAIL_PASS, EMAIL_SERVICE, EMAIL_USER} from "../src/constants";

let mailTransporter;

if (EMAIL_SERVICE) {
    mailTransporter = nodemailer.createTransport({
        service: EMAIL_SERVICE,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
} else {
    mailTransporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
    });
}

function sendMail(recipient, subject, message) {
    mailTransporter.sendMail({
        from: EMAIL_USER,
        to: recipient,
        subject: subject,
        text: message
    }, (err, info) => {
        if (err) console.error(err);
    });
}

export function sendRegisterMail(email, nif, password) {
    sendMail(email, 'Welcome to Integrate!', 'Welcome!\n\nYour account has been successfully created.\n\nAccount: ' +
        nif + '\nPassword: ' + password + '\n\nPlease change your password after your first login.');
}

export function sendResetMail(email, nif, password) {
    sendMail(email, 'Password reset on Integrate', 'Hi there!\n\nYou have requested a password reset.\n\nAccount: ' +
        nif + '\nPassword: ' + password + '\n\nPlease change your password after your next login.');
}