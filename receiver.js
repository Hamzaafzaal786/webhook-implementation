const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Store received webhooks (for demo purposes)
let receivedWebhooks = [];

// Webhook endpoint - this is where the main server will send data
app.post('/webhook', (req, res) => {
    console.log('========================================');
    console.log('📨 WEBHOOK RECEIVED!');
    console.log('========================================');
    console.log('Event Type:', req.body.event);
    console.log('Data:', JSON.stringify(req.body.data, null, 2));
    console.log('========================================');
    
    // Store the received webhook
    receivedWebhooks.push({
        receivedAt: new Date().toISOString(),
        ...req.body
    });
    
    // Send acknowledgment
    res.status(200).json({
        status: 'success',
        message: 'Webhook received successfully!',
        received: req.body
    });
});

// Endpoint to view all received webhooks
app.get('/webhooks', (req, res) => {
    res.json({
        total: receivedWebhooks.length,
        webhooks: receivedWebhooks
    });
});

// Endpoint to clear webhooks
app.delete('/webhooks', (req, res) => {
    receivedWebhooks = [];
    res.json({ message: 'All webhooks cleared' });
});

// Start the receiver server on port 5000
app.listen(5000, () => {
    console.log('========================================');
    console.log('📡 Webhook Receiver is running!');
    console.log('========================================');
    console.log('📍 Webhook URL: http://localhost:5000/webhook');
    console.log('📊 View all webhooks: http://localhost:5000/webhooks');
    console.log('========================================');
    console.log('Waiting for webhooks...');
    console.log('========================================');
});