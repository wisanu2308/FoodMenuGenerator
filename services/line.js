// services/line.js
const axios = require('axios');
const { LINE_ACCESS_TOKEN } = process.env;

async function replyMessage(replyToken, text) {
    try {
        await axios.post(
            'https://api.line.me/v2/bot/message/reply',
            {
                replyToken: replyToken,
                messages: [{ type: 'text', text }],
            },
            {
                headers: {
                    Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (err) {
        console.error('❌ LINE Reply Error:', err.message);
    }
}

module.exports = { replyMessage };
