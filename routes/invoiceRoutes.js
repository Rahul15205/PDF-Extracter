const express = require('express');
const router = express.Router();
const multer = require('multer');
const invoiceController = require('../controllers/invoiceController');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/upload', (req, res, next) => {
    upload.single('invoice')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: 'File upload error: ' + err.message });
        }
        next();
    });
}, invoiceController.uploadAndExtract);
router.post('/export-csv', express.json(), invoiceController.exportCsv);

module.exports = router;
