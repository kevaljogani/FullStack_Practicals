const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Path to the log file
const LOG_FILE = path.join(__dirname, 'logs', 'error.txt');

// Route to view logs
app.get('/logs', (req, res) => {
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err.message);

            if (err.code === 'ENOENT') {
                return res.status(404).send(`
                    <html>
                        <head><title>Log Not Found</title></head>
                        <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                            <h1>Error: Log file not found</h1>
                            <p>Please ensure the file <strong>error.txt</strong> exists in the <code>logs/</code> folder.</p>
                            <p><a href="/">Go back to home</a></p>
                        </body>
                    </html>
                `);
            }

          
            return res.status(500).send(`
                <html>
                    <head><title>Error</title></head>
                    <body style="font-family: sans-serif;">
                        <h1>Unable to read log file</h1>
                        <p>${err.message}</p>
                        <p><a href="/">Go back to home</a></p>
                    </body>
                </html>
            `);
        }

        
        res.send(`
            <html>
                <head><title>Error Logs</title></head>
                <body style="font-family: monospace; white-space: pre-wrap;">
                    <h1>Error Logs</h1>
                    <pre>${data}</pre>
                </body>
            </html>
        `);
    });
});

// Home route
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Log Viewer</h1><p>Go to <a href="/logs">/logs</a> to view error logs.</p>');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
