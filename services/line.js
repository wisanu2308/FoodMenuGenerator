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

async function replyYesNo(replyToken, text) {
    try {
        await axios.post(
            'https://api.line.me/v2/bot/message/reply',
            {
                replyToken: replyToken,
                messages: [{
                    type: 'text',
                    text: text,
                    quickReply: {
                        items: [
                            {
                                type: 'action',
                                action: {
                                    type: 'message',
                                    label: 'ใช่',
                                    text: 'ใช่'
                                }
                            },
                            {
                                type: 'action',
                                action: {
                                    type: 'message',
                                    label: 'ไม่ใช่',
                                    text: 'ไม่ใช่'
                                }
                            }
                        ]
                    }
                }],
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

async function replySticker(replyToken, packageId = '11537', stickerId = '52002734') {
    try {
        await axios.post(
            'https://api.line.me/v2/bot/message/reply',
            {
                replyToken: replyToken,
                messages: [{
                    type: 'sticker',
                    packageId,
                    stickerId
                }],
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

module.exports = { replyMessage, replyYesNo, replySticker };
