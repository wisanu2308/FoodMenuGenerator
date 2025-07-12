// services/dialogflow.js
const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const { DIALOGFLOW_PROJECT_ID, DIALOGFLOW_LANGUAGE_CODE } = process.env;

const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

async function detectIntent(userId, text) {
    try {
        const client = await auth.getClient();
        const token = await client.getAccessToken();
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
                    Authorization: `Bearer ${token.token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // console.log('Dialogflow API raw response:', JSON.stringify(response.data, null, 2));
        
        const result = response.data.queryResult;
        return {
            fulfillmentText: result.fulfillmentText,
            intent: result.intent ? result.intent.displayName : null
        };
    } catch (err) {
        console.error('❌ Dialogflow Error:', err.message);
        return { fulfillmentText: '', intent: null };
    }
}

module.exports = { detectIntent };
