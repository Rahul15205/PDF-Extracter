const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../logs.json');

function logAction(status, filename, details = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        filename,
        status,
        ...details
    };

    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
        try {
            logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        } catch (e) {
            logs = [];
        }
    }
    logs.push(logEntry);
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

module.exports = {
    logAction
};
