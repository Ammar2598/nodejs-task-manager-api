const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "ammar.yasser2598@gmail.com",
    subject: "Thanks for joining us!",
    text: `welcome to the App, ${name}.let me know how you get along with the App`,
  });
};

const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "ammar.yasser2598@gmail.com",
    subject: "Sorry to see you go",
    text: `Goodby, ${name} !!i hope to see you back soon!`,
  });
};
module.exports = {
  sendWelcomeEmail,
  sendCancelEmail,
};
