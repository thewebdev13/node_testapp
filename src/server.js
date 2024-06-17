const express = require('express');
const app = express();
const { Sequelize, Op } = require('sequelize');
const { User, Role, User_meta } = require('./models');
const bodyParser = require('body-parser');
const { sendEmail } = require('./mailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { getIncomingMessages, fetchNextPage } = require('./twilioController');

app.use(bodyParser.json()); // To parse JSON bodies

app.use((req, res, next) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;
  req.baseUrl = baseUrl;
  next();
});

/*Get users api*/
app.get('/', async (req, res) => {
  const users = await User.findAll({
    include: [Role, User_meta]
  });
  res.json(users);
});
/*End get user api*/

/*get role api*/
app.get('/roles', async (req, res) => {
  const roles = await Role.findOne({
    //include: [User],
    where: {
      id: 3
    },
  });
  res.json(roles);
});
/*End get role api*/

/*update role api*/
app.put('/roles/:id', async (req, res) => {
  try {
    const roleId = req.params.id;
    const {permissions} = req.body;
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    await role.update(permissions);
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/*end update role api*/

/*forget password api*/
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 1800000; // 30 minutes from now

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;

    await user.save();

    //const userEmail = user.email;
    const passwordLink = `${req.baseUrl}/reset-password/${resetToken}`;
    const userEmail = "webutopianteamupdates@gmail.com";
    const subject = "Reset password";
    const username = user.first_name+' '+user.last_name;
    const data = { name: username, resetLink: passwordLink };
    const response = await sendEmail('resetPassword', data, userEmail, subject);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/*End forget password api*/

/*Verify Token and Reset Password api*/
app.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: Date.now() } // Ensure token is not expired
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    if (!newPassword || newPassword.trim() === '') {
      return res.status(400).json({ error: 'New password must not be empty' });
    }

    // Update the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear the reset token and expiry
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    const userEmail = "webutopianteamupdates@gmail.com";
    const subject = "Password change successfully";
    const username = user.first_name+' '+user.last_name;
    const data = { name: username, loginLink: req.baseUrl };
    const response = await sendEmail('passwordConfirm', data, userEmail, subject);
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/*End Verify Token and Reset Password api*/

/*fetch incoming numbers from twilio number*/
// Example usage
app.get('/get-messages/:number', async (req, res) => {
  const phoneNumber = req.params.number;
  //const phoneNumber = '+1234567890';
  const pageSize = 20; 
  try {
      let result = await getIncomingMessages(phoneNumber, pageSize);
      let allMessages = result.messages;
      let nextPageUrl = result.nextPageUrl;

      console.log('Fetched messages:', result.messages);

      // Fetch next page manually
      /*if (nextPageUrl) {
          const nextPageResult = await fetchNextPage(nextPageUrl);
          allMessages = allMessages.concat(nextPageResult.messages);
          nextPageUrl = nextPageResult.nextPageUrl;

          console.log('Fetched next page messages:', nextPageResult.messages);
      }*/

      console.log('All incoming messages:', allMessages);
  } catch (error) {
      console.error('Error fetching messages:', error);
  }
});

/*fetch incoming numbers from twilio number*/


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
