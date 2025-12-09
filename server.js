const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));

app.use('/', invoiceRoutes);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
