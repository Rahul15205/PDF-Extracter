const pdf = require('pdf-parse');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function extractTextFromPDF(dataBuffer) {
    const pdfData = await pdf(dataBuffer);
    return pdfData.text;
}

async function extractInvoiceData(text) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        throw new Error('GROQ_API_KEY is missing in .env file');
    }


    const prompt = `
    You are an expert data extraction assistant specialized in Indian Invoices. 
    
    RAW TEXT:
    """
    ${text}
    """

    INSTRUCTIONS:
    1. Extract fields: invoiceNumber, invoiceDate (YYYY-MM-DD), vendorName, gstin, totalAmount.
    
    2. LINE ITEMS EXTRACTION STRATEGY (HANDLING MERGED TEXT):
       - **CRITICAL ISSUE:** The Raw Text often has NO SPACES between the Description and the Numbers, or between the Numbers themselves.
       - **YOU MUST SPLIT THEM MANUALLY.**
       - LOOK FOR PATTERN: [DescriptionText][Quantity][Rate][Amount] merged together.
       
       - EXAMPLE 1: "Server Deployment & Setup25000.0010000.00"
         -> Analysis: Ends with "10000.00" (Amount). Before that is "5000.00" (Rate). Before that is "2" (Qty).
         -> Extraction: Description="Server Deployment & Setup", Qty="2", Rate="5000.00", Amount="10000.00".
       
       - EXAMPLE 2: "Frontend125000.0025000.00"
         -> Analysis: Ends with "25000.00" (Amount). Before that is "25000.00" (Rate). Before that is "1" (Qty).
         -> Extraction: Description="Frontend", Qty="1", Rate="25000.00", Amount="25000.00".

       - **RULE:** Use the decimal points (.00) as anchors to separate the numbers.
       - **STOP** at "Subtotal".

    3. VALIDATION RULE:
       - Quantity * Rate ~= Amount.
       - If the math doesn't work, tries splitting the numbers differently.

    4. Return strictly valid JSON:
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

    5. Return ONLY the JSON string.
    `;

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a helpful assistant that outputs only valid JSON." },
                { role: "user", content: prompt }
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
    extractTextFromPDF,
    extractInvoiceData
};
