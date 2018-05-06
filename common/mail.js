// Create mail service
import {EMAIL_PASS, EMAIL_SERVICE, EMAIL_USER} from "../src/constants";
import nodemailer from "nodemailer";

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
    })
}


export function sendMail(recipient, subject, message) {
    mailTransporter.sendMail({
        from: EMAIL_USER,
        to: recipient,
        subject: subject,
        text: message
    }, (err, info) => {
        if (err) console.error(err);
    });
}