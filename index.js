require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const axios = require('axios');

const { detectIntent } = require('./services/dialogflow');
const { replyMessage, replyYesNo, replySticker, replyTextWithQuickReply } = require('./services/line');

const app = express();
app.use(bodyParser.json());

const {
    LINE_CHANNEL_SECRET,
} = process.env;

const validateSignature = (req) => {
    const signature = crypto
        .createHmac('sha256', LINE_CHANNEL_SECRET)
        .update(JSON.stringify(req.body))
        .digest('base64');
    return signature === req.headers['x-line-signature'];
};

const fallbackReplies = [
    'ขออภัยค่ะ ขอคำถามใหม่อีกครั้งได้ไหมคะ',
    'ขอโทษค่ะ ยังไม่เข้าใจ ลองถามอีกทีนะคะ',
    'ขออภัยค่ะ ช่วยอธิบายเพิ่มเติมได้ไหมคะ',
    'ขอโทษค่ะ ฉันยังตอบไม่ได้ ลองถามใหม่อีกครั้งนะคะ',
    'ขออภัยค่ะ ขอรายละเอียดเพิ่มเติมหน่อยค่ะ',
    'หากต้องการแนะนำเมนูอาหาร กรุณาพิมพ์ "แนะนำเมนู" หรือถามสิ่งที่อยากกินได้เลยค่ะ',
    'ลองบอกประเภทอาหารหรือชื่อเมนูที่สนใจได้นะคะ'
];

const greetedUsers = {}; // userId: true

async function getUserProfile(userId) {
    try {
        const res = await axios.get(`https://api.line.me/v2/bot/profile/${userId}`, {
            headers: {
                Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`
            }
        });
        return res.data.displayName || '';
    } catch (err) {
        console.error('❌ Get Profile Error:', err.message);
        return '';
    }
}

app.post('/webhook', async (req, res) => {
    const events = req.body.events;
    for (const event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
            const userMessage = event.message.text;
            const replyToken = event.replyToken;
            const userId = event.source.userId;

            // ถ้ายังไม่เคยทักทาย user นี้
            if (!greetedUsers[userId]) {
                greetedUsers[userId] = true;
                const displayName = await getUserProfile(userId);
                await replyTextWithQuickReply(
                    replyToken,
                    `สวัสดีครับคุณ ${displayName} 👋🍜
หิวแล้วใช่มั้ย? ไม่รู้จะกินอะไรดีใช่ป่ะ 🤔

พิมพ์ "แนะนำเมนู" มาได้เลย!

เราพร้อมเสิร์ฟเมนูเด็ดๆ ให้ทุกวัน 🍛🍣🍲
อยากได้จานเดียว กับข้าว 
หรือของหวานก็มีครบ 🍰🍢

ลองเลย แล้วจะรู้ว่า "กินอะไรดี" ไม่ใช่ปัญหาอีกต่อไป! 😋`,
                    {
                        items: [
                            {
                                type: 'action',
                                action: {
                                    type: 'message',
                                    label: 'แนะนำเมนู',
                                    text: 'แนะนำเมนู'
                                }
                            }
                        ]
                    }
                );
                continue; // จบที่ทักทายก่อน
            }

            // หลังจากทักทายแล้ว ให้ทำงานปกติ
            const { fulfillmentText, intent } = await detectIntent(userId, userMessage);
            console.log('Intent:', intent, 'Fulfillment:', fulfillmentText);

            // ตัวอย่าง: ถ้า fulfillmentText มีคำว่า "ใช่หรือไม่" ให้ส่ง quick reply yes/no
            if (fulfillmentText && fulfillmentText.includes('ใช่หรือไม่')) {
                await replyYesNo(replyToken, fulfillmentText);
            }
            // ตัวอย่าง: ถ้า fulfillmentText มีคำว่า "ส่งสติ๊กเกอร์" ให้ส่งสติ๊กเกอร์
            else if (fulfillmentText && fulfillmentText.includes('ส่งสติ๊กเกอร์')) {
                await replySticker(replyToken);
            }
            // ปกติ: ตอบข้อความ
            else {
                let replyText = fulfillmentText || fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
                await replyTextWithQuickReply(
                    replyToken, 
                    replyText,
                    {
                        items: [
                            {
                                type: 'action',
                                action: {
                                    type: 'message',
                                    label: 'แนะนำเมนูเพิ่มเติม',
                                    text: 'แนะนำเมนู'
                                }
                            }
                        ]
                    }
                );
            }
        }
    }
    res.sendStatus(200);
});

// สร้างไฟล์ Service Account จาก ENV BASE64 (สำหรับ Render)
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
    const fs = require('fs');
    const path = './chatbot-bmi-khyf-daedf8164ece.json';
    fs.writeFileSync(
        path,
        Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf-8')
    );
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path;
}

app.listen(3000, () => {
    console.log('🚀 Webhook server is running on port 3000');
});