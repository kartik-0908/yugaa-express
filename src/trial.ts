require('dotenv').config();

function trying() {
    console.log('PORT:', process.env.AZURE_OPENAI_API_KEY);
}

trying();
