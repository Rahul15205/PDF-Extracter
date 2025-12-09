const express = require('express');
const router = express.Router();
const multer = require('multer');
const invoiceController = require('../controllers/invoiceController');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/upload', upload.single('invoice'), invoiceController.uploadAndExtract);
router.post('/export-csv', express.json(), invoiceController.exportCsv);

module.exports = router;
