const OpenAI = require('openai-api');
const OPENAI_API_KEY = "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";
const openai = new OpenAI(OPENAI_API_KEY);
const express = require('express');
const app = express();

app.use(express.json());


async function gptCompletion(userMessage) {
    try {
        const gptResponse = await openai.chat({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an AI chatbot that provides information in Singapore on Financial Assistance Schemes for Persons with Disabilities as well as search for information on publicly available resources for support. Keep your responses short and concise. Limit to no more than 300 characters for each response."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            temperature: 0,
        });
        return gptResponse.data.choices[0].message.content;
    } catch (error) {
        console.error('Error from OpenAI:', error);
        throw error;
    }
}


app.post('/api/message', async (req, res) => {
    const userMessage = req.body.message;
    try {
        const botReply = await gptCompletion(userMessage);
        console.log("botReply", botReply);
        res.send(botReply);
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).send('Error getting a response from the bot');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
