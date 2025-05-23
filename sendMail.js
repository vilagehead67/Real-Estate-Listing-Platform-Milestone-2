
const nodemailer = require("nodemailer")

const sendForgottenPasswordEmail = async (email, token) => {
     try {
        const mailTransport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: `${process.env.EMAIL}`,
                pass: `${process.env.EMAIL_PASSWORD}`
            }
        })

        const mailDetails = {
            from: `${process.env.EMAIL}`,
            to: `${email}`,
            subject: "Reset Password Notification",
            html: `<html>Here is a token to reset your password. CLICK on the link below
                   <a href='https://www.examplaza.com/reset-password/${token}>Reset Password</a>

                   if the button does not work for any reason, please click on link below
                   <a href='https://www.examplaza.com/reset-password/${token}>Reset Password</a>
            </html>`
        }
        await mailTransport.sendMail(mailDetails)
     } catch (error) {
        console.log(error)
     }
} 

    const validEmail = (email) =>{
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return re.test(String(email).toLowerCase())
    }

    module.exports = {
        sendForgottenPasswordEmail,
        validEmail
    }