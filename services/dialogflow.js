// services/dialogflow.js
const axios = require('axios');
const { DIALOGFLOW_PROJECT_ID, DIALOGFLOW_LANGUAGE_CODE, DIALOGFLOW_TOKEN } = process.env;

async function detectIntent(userId, text) {
    try {
        const response = await axios.post(
            `https://dialogflow.googleapis.com/v2/projects/${DIALOGFLOW_PROJECT_ID}/agent/sessions/${userId}:detectIntent`,
            {
                queryInput: {
                    text: {
                        text,
                        languageCode: DIALOGFLOW_LANGUAGE_CODE,
                    },
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${DIALOGFLOW_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.queryResult.fulfillmentText;
    } catch (err) {
        console.error('❌ Dialogflow Error:', err.message);
        return '';
    }
}

module.exports = { detectIntent };
