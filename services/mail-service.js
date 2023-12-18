const nodemailer = require('nodemailer')
const emailTemplate = require('../templates/email')

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            }
        })
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: {
                name: 'Join Me',
                address: process.env.SMTP_USER
            },
            to,
            subject: 'Account activating',
            text: '',
            html: emailTemplate(link)
        })
    }
}

module.exports = new MailService();