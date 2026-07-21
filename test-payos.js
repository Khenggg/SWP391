const crypto = require('crypto');

const clientId = 'c166c566-3e1b-4d2e-8467-6befb1d2b902';
const apiKey = 'e1180476-093a-40b7-81fa-276ea66cad4c';
const checksumKey = '01d687c39f1fe9d5eaaf7d3d5d716fe43d048d0cebf2e2518ed10d4861af79c9';

const body = {
    orderCode: Math.floor(Math.random() * 1000000),
    amount: 10000,
    description: 'TEST PAYOS',
    cancelUrl: 'http://localhost:5173',
    returnUrl: 'http://localhost:5173'
};

const dataStr = `amount=${body.amount}&cancelUrl=${body.cancelUrl}&description=${body.description}&orderCode=${body.orderCode}&returnUrl=${body.returnUrl}`;
const signature = crypto.createHmac('sha256', checksumKey).update(dataStr).digest('hex');
body.signature = signature;

fetch('https://api-merchant.payos.vn/v2/payment-requests', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-api-key': apiKey
    },
    body: JSON.stringify(body)
}).then(res => res.json()).then(data => {
    console.log(JSON.stringify(data, null, 2));
}).catch(console.error);