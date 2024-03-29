const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
        // html: 'Welcome to the app, <strong>${name}</strong>. Let me know how you get along with the app.'
    }).then(r => {
        console.log(r)
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SENDER_EMAIL,
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometimes soon.`,
    }).then(r => {
        console.log(r)
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}