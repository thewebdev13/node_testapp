const express = require('express');
const app = express();
const { Sequelize, Op } = require('sequelize');
const { User, Role, User_meta, Vault, Image, Communities, Community_users } = require('./models');
const bodyParser = require('body-parser');
const { sendEmail } = require('./mailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { getIncomingMessages, fetchNextPage } = require('./twilioController');

const { sendMessage, sendSingleMessage, sendMediaMessage } = require('./sendMessage');

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
        include: [ { model: Communities, as: 'CreatedCommunities' }]
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

/*Send message on single number*/
app.post('/send-message', async (req, res) => {
    try {
        const { to,from,message,mediaUrl } = req.body;
        const response = await sendMediaMessage(to,from, message, mediaUrl);
        console.log(response);
        
        

        res.json({ message: 'message sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/*End send message on single number*/

/*Save Vaults content*/
app.post('/save-vault', async (req, res) => {
    try {
        const { user_id, contents } = req.body;

        // Validate input
        if (!user_id || !contents || !Array.isArray(contents) || contents.length === 0) {
            return res.status(400).json({ message: 'Please fill all required fields and ensure contents is a non-empty array.' });
        }
        
        // Prepare the vault entries
        const vaultEntries = contents.map(content => ({
            user_id: user_id,
            content_id: content.content_id,
            content_type: content.content_type || null // Default to null if content_type is not provided
        }));

        // Bulk create the vault entries
        await Vault.bulkCreate(vaultEntries);

        res.json({ status: 200, message: 'Added successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*End Save Vaults content*/

/*get Vaults content*/
app.get('/get-vaults', async (req, res) => {
    const { user_id, content_type } = req.query;

    if (!user_id) {
        return res.status(400).json({ message: 'user id is required' });
    }

    let whereClause = { user_id };

    if (content_type) {
        whereClause.content_type = content_type;
    }

    try {
        const vaults = await Vault.findAll({
            where: whereClause,
            include: [
                { model: Image, attributes: ['id', 'filename', 'filepath'] }
            ]
        });

        res.status(200).json(vaults);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vaults', error: error.message });
    }
});
/*End get Vaults content*/

/*Delete vault content*/
app.delete('/vault-delete', async (req, res) => {
    const { vault_id } = req.body;

    if (!vault_id) {
        return res.status(400).json({ message: 'vault_id is required' });
    }

    // Simplified whereClause assignment
    const whereClause = { id: vault_id };

    try {
        const deleteCount = await Vault.destroy({
            where: whereClause
        });

        if (deleteCount === 0) {
            return res.status(404).json({ message: 'No vaults found to delete' });
        }

        res.status(200).json({ message: 'Vaults deleted successfully', deleted: deleteCount });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vaults', error });
    }
});
/*End Delete vault content*/

/*Create new community*/
app.post('/create-community', async (req, res) => {
    const { name, fans, image=null, gender=null, age=null, location=null, user_ids, created_by } = req.body;

    if (!name || !fans || !created_by || !Array.isArray(user_ids)) {
        return res.status(400).json({ message: 'Name is required, created_by is required and user_ids should be an array.' });
    }

    try {
        const community = await Communities.create({
            name,
            created_by,
            image,
            fans,
            gender,
            age,
            location
        });
        if (community.id) {
            const community_id = community.id;
            const existingCommunityUsers = await Community_users.findAll({ where: { community_id } });
            const existingUserIds = existingCommunityUsers.map(cu => cu.user_id);

            // Step 3: Determine Changes
            const userIdsToAdd = user_ids.filter(userId => !existingUserIds.includes(userId));
            const userIdsToRemove = existingUserIds.filter(userId => !user_ids.includes(userId));

            // Step 4: Update the Associations
            if (userIdsToAdd.length > 0) {
                const communityUsersToAdd = userIdsToAdd.map(user_id => ({ user_id, community_id }));
                await Community_users.bulkCreate(communityUsersToAdd);
            }

            if (userIdsToRemove.length > 0) {
                await Community_users.destroy({ where: { user_id: userIdsToRemove, community_id } });
            }
        }
        res.status(200).json({ message: 'Community created successfully.', communityId: community.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/*End Create new community*/

/*Update community*/
app.put('/update-community/:id', async (req, res) => {
    const { id } = req.params;
    const { name, image, fans, gender, age, location, user_ids } = req.body;

    if (!Array.isArray(user_ids)) {
        return res.status(400).json({ message: 'user_ids should be an array.' });
    }

    try {
        // Find the community by ID
        const community = await Communities.findByPk(id);

        if (!community) {
            return res.status(404).json({ message: 'Community not found.' });
        }

        // Update community attributes
        community.name = name || community.name;
        community.image = image || community.image;
        community.fans = fans || community.fans;
        community.gender = gender || community.gender;
        community.age = age || community.age;
        community.location = location || community.location;

        // Save the updated community
        await community.save();

        const community_id = id;
        const existingCommunityUsers = await Community_users.findAll({ where: { community_id } });
        const existingUserIds = existingCommunityUsers.map(cu => cu.user_id);

        // Step 3: Determine Changes
        const userIdsToAdd = user_ids.filter(userId => !existingUserIds.includes(userId));
        const userIdsToRemove = existingUserIds.filter(userId => !user_ids.includes(userId));

        // Step 4: Update the Associations
        if (userIdsToAdd.length > 0) {
            const communityUsersToAdd = userIdsToAdd.map(user_id => ({ user_id, community_id }));
            await Community_users.bulkCreate(communityUsersToAdd);
        }

        if (userIdsToRemove.length > 0) {
            await Community_users.destroy({ where: { user_id: userIdsToRemove, community_id } });
        }

        res.status(200).json({ message: 'Community updated successfully.', community });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/*Update community*/

/*Get all communities with user count*/
app.get('/communities/:created_by', async (req, res) => {
    const { created_by } = req.params;
    const whereClause = { created_by: created_by };
 
    try {
        const communities = await Communities.findAll({
            where: whereClause,
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                          SELECT COUNT(*)
                          FROM Community_users AS cu
                          WHERE cu.community_id = Communities.id
                        )`),
                        'userCount'
                    ]
                ]
            }
        });
        res.status(200).json(communities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/*End Get all communities with user count*/

/*Delete community*/
app.delete('/delete-community/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Communities.destroy({
            where: { id }
        });

        if (result) {
            res.status(200).json({ message: 'Community deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Community not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*End delete community*/

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
