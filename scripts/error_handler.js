/**
 * Error Handler Utility
 * Logs errors to a staging sheet and optionally sends notifications.
 */

const axios = require('axios');

class ErrorHandler {
    static async logError(context, error, data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            context,
            message: error.message || error,
            data: JSON.stringify(data)
        };

        console.error(`[Error][${context}] ${logEntry.message}`);

        // In a real n8n environment, this would push to a "System Logs" sheet
        // or trigger a WhatsApp notification to the HR Manager.
        if (process.env.ERROR_WEBHOOK_URL) {
            try {
                await axios.post(process.env.ERROR_WEBHOOK_URL, {
                    text: `*HR System Alert*\n*Context:* ${context}\n*Error:* ${logEntry.message}\n*Time:* ${timestamp}`
                });
            } catch (e) {
                console.error('Failed to send error notification:', e.message);
            }
        }

        return logEntry;
    }
}

module.exports = ErrorHandler;
