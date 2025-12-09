const { extractTextFromPDF, extractInvoiceData } = require('../services/extractionService');
const { logAction } = require('../models/logModel');
const { createObjectCsvStringifier } = require('csv-writer');

exports.uploadAndExtract = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        console.log(`Processing file: ${req.file.originalname}`);
        const dataBuffer = req.file.buffer;

        const text = await extractTextFromPDF(dataBuffer);

        const extractionResult = await extractInvoiceData(text);

        logAction('SUCCESS', req.file.originalname);

        res.json({
            success: true,
            data: extractionResult,
            rawText: `Raw text length: ${text.length} chars`
        });

    } catch (error) {
        console.error('Extraction Error:', error.message);
        logAction('FAILURE', req.file.originalname, { error: error.message });
        res.status(500).json({ error: 'Failed to extract data.', details: error.message });
    }
};

exports.exportCsv = (req, res) => {
    const { invoiceNumber, invoiceDate, vendorName, totalAmount, lineItems } = req.body;

    if (!lineItems || lineItems.length === 0) {
        return res.status(400).send('No data to export');
    }

    const csvStringifier = createObjectCsvStringifier({
        header: [
            { id: 'invoiceNumber', title: 'Invoice #' },
            { id: 'invoiceDate', title: 'Date' },
            { id: 'vendorName', title: 'Vendor' },
            { id: 'gstin', title: 'GSTIN' },
            { id: 'description', title: 'Description' },
            { id: 'quantity', title: 'Qty' },
            { id: 'rate', title: 'Rate' },
            { id: 'amount', title: 'Amount' },
            { id: 'totalAmount', title: 'Total Invoice Amt' }
        ]
    });

    const records = lineItems.map(item => ({
        invoiceNumber,
        invoiceDate,
        vendorName,
        gstin: req.body.gstin || '',
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        totalAmount
    }));

    const header = csvStringifier.getHeaderString();
    const recordsString = csvStringifier.stringifyRecords(records);

    res.header('Content-Type', 'text/csv');
    res.attachment(`invoice-${invoiceNumber || 'export'}.csv`);
    res.send(header + recordsString);
};
