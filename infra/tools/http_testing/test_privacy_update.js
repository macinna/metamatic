#!/usr/bin/env node

const https = require('http');

const agentUrl = process.env.AGENT_URL || 'http://localhost:8080/invocations';
const url = new URL(agentUrl);

const payload = {
    prompt: "Please change the privacy of activity 12345678 to private",
    sessionId: "test-session-" + Date.now()
};

const postData = JSON.stringify(payload);

const options = {
    hostname: url.hostname,
    port: url.port || 8080,
    path: url.pathname,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('🔒 Testing Privacy Update');
console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));
console.log('🎯 Target URL:', agentUrl);
console.log('─'.repeat(50));

const req = https.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    console.log('─'.repeat(50));

    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        try {
            const parsedResponse = JSON.parse(responseData);
            console.log('✅ Response received:');
            console.log(JSON.stringify(parsedResponse, null, 2));
        } catch (e) {
            console.log('📝 Raw response:');
            console.log(responseData);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    console.error('💡 Make sure the MetaMatic agent is running on', agentUrl);
});

req.write(postData);
req.end();
