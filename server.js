const express = require('express');
const axios = require('axios');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Webhook configuration
const WEBHOOK_URL = 'http://localhost:5000/webhook';  // The receiver URL

// In-memory database (mock)
let orders = [];
let orderId = 1;

// Function to send webhook notification
async function sendWebhook(event, data) {
    try {
        const payload = {
            event: event,
            data: data,
            timestamp: new Date().toISOString()
        };
        
        console.log('🚀 Sending webhook...');
        console.log('Event:', event);
        console.log('Data:', data);
        
        // Send POST request to the receiver
        const response = await axios.post(WEBHOOK_URL, payload);
        
        console.log('✅ Webhook sent successfully!');
        console.log('Response:', response.data.message);
        return response.data;
        
    } catch (error) {
        console.error('❌ Webhook failed:', error.message);
        return { error: 'Webhook failed' };
    }
}

// API Endpoint: Create a new order (triggers a webhook)
app.post('/orders', async (req, res) => {
    const { product, quantity, customer } = req.body;
    
    // Create new order
    const newOrder = {
        id: orderId++,
        product: product,
        quantity: quantity,
        customer: customer,
        status: 'created',
        createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    console.log('📦 New order created:', newOrder);
    
    // TRIGGER WEBHOOK - Notify receiver about new order
    await sendWebhook('order.created', newOrder);
    
    res.status(201).json({
        message: 'Order created and webhook sent!',
        order: newOrder
    });
});

// API Endpoint: Update order status (triggers a webhook)
app.put('/orders/:id', async (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    const oldStatus = order.status;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    console.log('📦 Order updated:', order);
    
    // TRIGGER WEBHOOK - Notify receiver about status change
    await sendWebhook('order.updated', {
        order: order,
        oldStatus: oldStatus,
        newStatus: status
    });
    
    res.json({
        message: 'Order updated and webhook sent!',
        order: order
    });
});

// API Endpoint: Get all orders
app.get('/orders', (req, res) => {
    res.json({
        total: orders.length,
        orders: orders
    });
});

// API Endpoint: Manual trigger - send a test webhook
app.post('/test-webhook', async (req, res) => {
    const testData = {
        message: 'This is a test webhook',
        timestamp: new Date().toISOString()
    };
    
    await sendWebhook('test.event', testData);
    
    res.json({
        message: 'Test webhook sent!',
        data: testData
    });
});

// Start the main server on port 3000
app.listen(3000, () => {
    console.log('========================================');
    console.log('🚀 Webhook Main Server is running!');
    console.log('========================================');
    console.log('📍 Server URL: http://localhost:3000');
    console.log('========================================');
    console.log('Available Endpoints:');
    console.log('  📦 POST /orders - Create new order (triggers webhook)');
    console.log('  📦 PUT /orders/:id - Update order (triggers webhook)');
    console.log('  📊 GET /orders - View all orders');
    console.log('  🔔 POST /test-webhook - Send test webhook');
    console.log('========================================');
    console.log(`📡 Sending webhooks to: ${WEBHOOK_URL}`);
    console.log('========================================');
});