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

    // In Vercel/Production (Read-Only FS), this might fail. We handle it gracefully.
    try {
        if (fs.existsSync(LOG_FILE)) {
            try {
                logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
            } catch (e) {
                logs = [];
            }
        }
        logs.push(logEntry);
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    } catch (error) {
        // Fallback for Vercel or read-only environments
        console.log('[LOG-FALLBACK]', JSON.stringify(logEntry));
    }
}

module.exports = {
    logAction
};
