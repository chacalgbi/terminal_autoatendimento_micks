const nodemailer = require("nodemailer");
require('dotenv').config()

module.exports = function email(email, titulo, msg) {
    return new Promise((resolve, reject) => {
        const user = process.env.EMAIL;
        const pass = process.env.SENHA;

        let transporter = nodemailer.createTransport({
            host: "email-ssl.com.br",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: { user, pass }
        });

        transporter.sendMail({
            from: user,
            to: email,
            subject: titulo,
            text: msg
        })
            .then((res) => {
                //console.log(res);
                resolve(res);
            })
            .catch((err) => {
                //console.log(err);
                reject(err);
            })
    });
}