require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const { detectIntent } = require('./services/dialogflow');
const { replyMessage } = require('./services/line');

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

app.post('/webhook', async (req, res) => {
    const events = req.body.events;
    for (const event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
            const userMessage = event.message.text;
            const replyToken = event.replyToken;
            const { fulfillmentText } = await detectIntent(event.source.userId, userMessage);

            // สุ่ม fallback ถ้า Dialogflow ไม่ตอบ
            let replyText = fulfillmentText || fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];

            await replyMessage(replyToken, replyText);
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