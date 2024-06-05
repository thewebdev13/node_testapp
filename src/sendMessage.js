require('dotenv').config();
const twilio = require('twilio');

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSingleMessage(to,from, message) {
    try {
        const messageInstance = await client.messages.create({
            body: message,
            from: from,
            to: to
        });
        return [{ success: true, message: 'Message sent successfully', SID: messageInstance.sid }];
    } catch (error) {
        return [{ success: false, message: 'Failed to send message', SID: '', error: error }];
    }
}
async function sendMessage(recipients, from, message) {
    try {
        const promises = recipients.map(async (to) => {
            const messageInstance = await client.messages.create({
                body: message,
                from: from,
                to: to
            });
            return [{ success: true, message: 'Message sent successfully', SID: messageInstance.sid }];
        });

        const results = await Promise.all(promises);
        return results;
    } catch (error) {
        return [{ success: false, message: 'Failed to send message', SID: '', error: error }];
    }
}

module.exports = { sendMessage, sendSingleMessage };