#!/usr/bin/env node

const https = require('http');
const readline = require('readline');

const agentUrl = process.env.AGENT_URL || 'http://localhost:8080/invocations';
const url = new URL(agentUrl);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function sendRequest(payload) {
    return new Promise((resolve, reject) => {
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

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: responseData
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function testWorkflow(type) {
    console.log(`\n🧪 Testing ${type} workflow`);
    console.log('─'.repeat(50));

    let payload;
    const sessionId = "interactive-session-" + Date.now();

    if (type === 'new-activity') {
        payload = {
            task: "start_new_activity_flow",
            activityId: "12345678",
            sessionId: sessionId
        };
    } else if (type === 'chat') {
        const prompt = await new Promise((resolve) => {
            rl.question('💬 Enter your message to the agent: ', resolve);
        });
        payload = {
            prompt: prompt,
            sessionId: sessionId
        };
    }

    try {
        console.log('📤 Sending:', JSON.stringify(payload, null, 2));
        const response = await sendRequest(payload);

        console.log(`📊 Status: ${response.statusCode}`);

        try {
            const parsedBody = JSON.parse(response.body);
            console.log('✅ Response:');
            console.log(JSON.stringify(parsedBody, null, 2));
        } catch (e) {
            console.log('📝 Raw response:');
            console.log(response.body);
        }
    } catch (error) {
        console.error('❌ Request failed:', error.message);
        console.error('💡 Make sure the MetaMatic agent is running on', agentUrl);
    }
}

async function main() {
    console.log('🤖 MetaMatic Agent Interactive HTTP Client');
    console.log(`🎯 Target: ${agentUrl}`);
    console.log('─'.repeat(60));

    while (true) {
        console.log('\nAvailable test workflows:');
        console.log('1. New Activity Flow (deterministic)');
        console.log('2. Chat Flow (conversational)');
        console.log('3. Exit');

        const choice = await new Promise((resolve) => {
            rl.question('\n🔢 Choose an option (1-3): ', resolve);
        });

        switch (choice.trim()) {
            case '1':
                await testWorkflow('new-activity');
                break;
            case '2':
                await testWorkflow('chat');
                break;
            case '3':
                console.log('👋 Goodbye!');
                rl.close();
                process.exit(0);
                break;
            default:
                console.log('❌ Invalid choice. Please select 1, 2, or 3.');
        }
    }
}

main().catch(console.error);
