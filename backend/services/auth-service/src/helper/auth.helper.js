const crypto = require('crypto');
class AuthHelper {
    generateOTP() {
        return crypto.randomInt(100000, 999999);
    }
    sendOTP(email, otp) {
        return `Your OTP is ${otp}`;
    }
    sendResetPasswordEmail(email, otp) {
        return `Your reset password OTP is ${otp}`;
    }
    async sendEmail(email, subject, text) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'YOUR_EMAIL_ADDRESS',
                    pass: 'YOUR_EMAIL_PASSWORD'
                }
            });

            await transporter.sendMail({
                from: 'YOUR_EMAIL_ADDRESS',
                to: email,
                subject: subject,
                text: text
            });

            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }   
}
module.exports = new AuthHelper();  