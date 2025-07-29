require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function enviarCorreo(destinatario, asunto, cuerpo) {
  const opcionesMail = {
    from: `"SIGB" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: asunto,
    text: cuerpo,
  };
  return transporter.sendMail(opcionesMail);
}
module.exports = { enviarCorreo };
