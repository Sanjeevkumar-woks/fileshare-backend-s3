const nodemailer = require('nodemailer');
const dotenv = require("dotenv").config();

//Email services 
async function sendMail({ from, to, subject, text, html }) {
    //Nodemailer configration with SMTP
    let transpoter = nodemailer.createTransport({

        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT, //465
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }

    });

    let info = await transpoter.sendMail({
        from, to, subject, text, html
    })
}

module.exports = sendMail;