const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const routes = require('./routes');
const { sendEmail } = require('./mailer');
const { sendMessage } = require('./sendMessage');


dotenv.config();

const app = express();

app.use(express.json());

app.use(routes);

const PORT = process.env.PORT || 5000;

/*sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error('Error connecting to the database:', error));*/

  const data = { firstName: "Tester", lastName:"new", reapplyLink: "google.com", setupLink: "google.com"};

  //const emails = ["webutopianteamupdates@gmail.com", "devuthopian@gmail.com"];
  const email = "webutopianteamupdates@gmail.com";
  const subject = "New Account Submit";

  const response = sendEmail('accountSubmit', data, email, subject);

  console.log(response);

  /*const messageBody = 'Hello from Twilio! this is a test message.';
  const fromNumber ='+13254408881';

  const recipients = ['+16265398373', '+18395291710', '+12817603626'];

  app.listen(PORT, async () => {
    const result = await sendMessage(recipients, fromNumber, messageBody);
    console.log(result);
    console.log(`Server running on port ${PORT}`);
  });*/