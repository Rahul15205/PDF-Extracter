const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function extractInvoiceData(imageBuffer) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        throw new Error('GROQ_API_KEY is missing in .env file');
    }

    // Convert Buffer to Base64
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    console.log('--- SENDING IMAGE TO GROQ VISION API ---');

    const prompt = `
    You are an expert data extraction assistant for Indian Invoices.
    Analyze the provided invoice IMAGE.

    INSTRUCTIONS:
    1. Extract fields: invoiceNumber, invoiceDate (YYYY-MM-DD), vendorName, gstin, totalAmount.
    
    2. LINE ITEMS:
       - Look for the table in the image.
       - Extract: Description, Quantity, Rate, Amount.
       - Ensure strictly valid numbers.

    3. Return strictly valid JSON:
    {
      "invoiceNumber": "string",
      "invoiceDate": "string",
      "vendorName": "string",
      "gstin": "string",
      "totalAmount": "string",
      "lineItems": [
        { "description": "string", "quantity": "string", "rate": "string", "amount": "string" }
      ]
    }

    4. Return ONLY the JSON string.
    `;

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.2-11b-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: base64Image } }
                    ]
                }
            ],
            stream: false,
            temperature: 0
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        let content = response.data.choices[0].message.content;
        // Clean markdown code blocks if present
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(content);

    } catch (error) {
        if (error.response) {
            console.error('Groq API Error Status:', error.response.status);
            console.error('Groq API Error Data:', error.response.data);
            throw new Error(`Groq API Error: ${error.response.status}`);
        }
        throw error;
    }
}

module.exports = {
    extractInvoiceData
};
