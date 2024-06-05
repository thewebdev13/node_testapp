const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// General function to send email
const sendEmail = async (templateName, data, to, subject) => {
  try {
    const templatePath = path.join(__dirname, 'templates/emails', `${templateName}.ejs`);
    const template = await ejs.renderFile(templatePath, data);

    // If 'to' is an array, join the elements into a comma-separated string
    const recipients = Array.isArray(to) ? to.join(', ') : to;

    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: recipients,
      subject,
      html: template,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    return { success: false, message: 'Error sending email', error: error };
  }
};

module.exports = {
  sendEmail
};
