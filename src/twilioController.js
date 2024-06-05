require('dotenv').config();
const twilio = require('twilio');

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function getIncomingMessages(phoneNumber, pageSize = 20) {
    try {
        const response = await client.messages.list({
            to: phoneNumber, // Filter messages sent to this phone number
            pageSize: pageSize // Number of messages per page
        });

        const incomingMessages = response.filter(message => message.direction === 'inbound');

        return {
            messages: incomingMessages,
            nextPageUrl: response.nextPageUrl // URL to fetch the next page of results
        };
    } catch (error) {
        console.error('Failed to retrieve messages:', error);
        throw error;
    }
}

async function fetchNextPage(nextPageUrl) {
    try {
        const url = new URL(nextPageUrl);
        const params = {
            PageToken: url.searchParams.get('PageToken')
        };

        const response = await client.request({
            method: 'GET',
            uri: nextPageUrl,
            params
        });

        const incomingMessages = response.body.messages.filter(message => message.direction === 'inbound');

        return {
            messages: incomingMessages,
            nextPageUrl: response.body.next_page_url // URL to fetch the next page of results
        };
    } catch (error) {
        console.error('Failed to fetch next page:', error);
        throw error;
    }
}

// Export the functions
module.exports = { getIncomingMessages, fetchNextPage };
