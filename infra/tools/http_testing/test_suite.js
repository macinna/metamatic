#!/usr/bin/env node

const https = require('http');

const agentUrl = process.env.AGENT_URL || 'http://localhost:8080/invocations';
const url = new URL(agentUrl);

// Test scenarios to run
const testScenarios = [
    {
        name: "Valid New Activity Flow",
        payload: {
            task: "start_new_activity_flow",
            activityId: "12345678",
            sessionId: "test-session-valid"
        }
    },
    {
        name: "Missing ActivityId (Error Case)",
        payload: {
            task: "start_new_activity_flow",
            sessionId: "test-session-missing-id"
        }
    },
    {
        name: "Missing SessionId (Error Case)",
        payload: {
            task: "start_new_activity_flow",
            activityId: "12345678"
        }
    },
    {
        name: "Valid Chat Flow",
        payload: {
            prompt: "Show me my recent activities",
            sessionId: "test-session-chat"
        }
    },
    {
        name: "Empty Prompt (Error Case)",
        payload: {
            prompt: "",
            sessionId: "test-session-empty"
        }
    },
    {
        name: "Invalid Payload Structure",
        payload: {
            invalidField: "test"
        }
    }
];

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

async function runTestSuite() {
    console.log('🧪 MetaMatic Agent Test Suite');
    console.log(`🎯 Target: ${agentUrl}`);
    console.log('═'.repeat(60));

    for (let i = 0; i < testScenarios.length; i++) {
        const scenario = testScenarios[i];
        console.log(`\n📋 Test ${i + 1}/${testScenarios.length}: ${scenario.name}`);
        console.log('─'.repeat(50));
        console.log('📤 Payload:', JSON.stringify(scenario.payload, null, 2));

        try {
            const response = await sendRequest(scenario.payload);
            console.log(`📊 Status: ${response.statusCode}`);

            try {
                const parsedBody = JSON.parse(response.body);
                console.log('✅ Response:');
                console.log(JSON.stringify(parsedBody, null, 2));
            } catch (e) {
                console.log('📝 Raw response:');
                console.log(response.body);
            }

            // Add a small delay between requests
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error('❌ Request failed:', error.message);
        }
    }

    console.log('\n🏁 Test suite completed!');
}

runTestSuite().catch(console.error);
