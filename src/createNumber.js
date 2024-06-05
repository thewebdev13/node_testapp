require('dotenv').config();
const twilio = require('twilio');

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function purchasePhoneNumber() {
    try {
        const availableNumbers = await client.availablePhoneNumbers('US')
            .local
            .list({
                smsEnabled: true,
                voiceEnabled: true, 
                limit: 10
            });

        if (availableNumbers.length === 0) {
            return [{ success: false, message: 'No available numbers found.', error: ''}];
        }

        let purchasedNumber = null;

        for (const number of availableNumbers) {
            try {
                purchasedNumber = await client.incomingPhoneNumbers.create({ phoneNumber: number.phoneNumber });
                return [{ success: true, message: 'Successfully purchased phone number', purchasedNumber: purchasedNumber.phoneNumber}];
                break;
            } catch (error) {
                //console.error(`Failed to purchase phone number ${number.phoneNumber}:`, error.message);
            }
        }

        if (!purchasedNumber) {
            return [{ success: false, message: 'Unable to purchase any available phone numbers.', error: ''}];
        }
    } catch (error) {
        return [{ success: false, message: 'Failed to search for phone numbers.', error: error}];
    }
}

module.exports = { purchasePhoneNumber };