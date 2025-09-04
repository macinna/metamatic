# MetaMatic Agent HTTP Testing Tools

This directory contains HTTP client tools for testing the MetaMatic AI agent's `/invocations` endpoint. These tools allow you to easily test both the deterministic workflow (new activity flow) and conversational workflow (chat-based interactions) of your agent.

## 📁 Files Overview

### JavaScript Clients
- **`test_new_activity.js`** - Tests the deterministic new activity workflow
- **`test_chat.js`** - Tests conversational chat functionality  
- **`test_rename_activity.js`** - Tests activity renaming via chat
- **`test_privacy_update.js`** - Tests privacy setting updates via chat
- **`interactive_client.js`** - Interactive client for custom testing
- **`test_suite.js`** - Comprehensive test suite with error scenarios

### Python Client
- **`test_client.py`** - Python-based HTTP client with interactive mode

### Shell Script
- **`test_agent.sh`** - Convenient shell script wrapper for all testing tools

### REST Client File
- **`metamatic_tests.http`** - REST Client extension file with predefined requests

## 🚀 Usage from VS Code

### Prerequisites
1. Start the MetaMatic agent using the **"Debug MetaMatic Agent"** configuration
2. Ensure the agent is listening on `http://localhost:8080`

### Running Tests
1. Open the **Run and Debug** panel (`Ctrl+Shift+D`)
2. Select one of the HTTP test configurations:
   - **HTTP: Test New Activity Flow** - Quick test of activity name generation
   - **HTTP: Test Chat Flow** - Test conversational interactions
   - **HTTP: Test Activity Rename** - Test activity renaming functionality
   - **HTTP: Test Privacy Update** - Test privacy setting changes
   - **HTTP: Interactive Client** - Interactive mode for custom testing
   - **HTTP: Run Test Suite** - Run all test scenarios including error cases
   - **HTTP: Python Interactive Client** - Python-based interactive testing

3. Click the **▷ Start Debugging** button or press `F5`

### Using REST Client Extension
1. Install the **REST Client** extension for VS Code
2. Open `metamatic_tests.http`
3. Click **"Send Request"** above any HTTP request block

## 💻 Command Line Usage

### Shell Script (Recommended)

The easiest way to run tests from the command line:

```bash
# Navigate to the http_testing directory
cd scripts/http_testing

# Quick tests
./test_agent.sh new-activity    # Test new activity flow
./test_agent.sh chat           # Test chat functionality  
./test_agent.sh rename         # Test activity renaming
./test_agent.sh privacy        # Test privacy updates
./test_agent.sh interactive    # Interactive Node.js client
./test_agent.sh python         # Python interactive client
./test_agent.sh suite          # Run comprehensive test suite

# Help
./test_agent.sh help
```

### JavaScript Clients

```bash
# Navigate to the http_testing directory
cd scripts/http_testing

# Test new activity flow
node test_new_activity.js

# Test chat functionality
node test_chat.js

# Test activity renaming
node test_rename_activity.js

# Test privacy updates
node test_privacy_update.js

# Run interactive client
node interactive_client.js

# Run comprehensive test suite
node test_suite.js
```

### Python Client

```bash
# Navigate to the http_testing directory
cd scripts/http_testing

# Activate your virtual environment first
source ../../.venv/bin/activate

# Interactive mode (default)
python test_client.py

# Test specific workflows
python test_client.py new-activity
python test_client.py chat
```

### Using cURL (Manual Testing)

```bash
# Test new activity flow
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{
    "task": "start_new_activity_flow",
    "activityId": "12345678",
    "sessionId": "curl-test-session"
  }'

# Test chat flow
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Show me my recent activities",
    "sessionId": "curl-chat-session"
  }'
```

## 🔧 Configuration

### Environment Variables
All clients respect the `AGENT_URL` environment variable:

```bash
# Default (if not set)
AGENT_URL=http://localhost:8080/invocations

# Custom endpoint
export AGENT_URL=http://your-agent-host:8080/invocations
node test_new_activity.js
```

### Agent Workflows Supported

#### 1. Deterministic Workflow (New Activity)
**Payload:**
```json
{
  "task": "start_new_activity_flow",
  "activityId": "string",
  "sessionId": "string"
}
```
**Purpose:** Triggers automatic generation of creative activity names

#### 2. Conversational Workflow (Chat)
**Payload:**
```json
{
  "prompt": "string", 
  "sessionId": "string"
}
```
**Purpose:** Natural language interactions with the agent

## 🎯 Test Scenarios Covered

- ✅ Valid new activity flow
- ✅ Valid chat interactions
- ✅ Activity renaming requests
- ✅ Privacy setting updates
- ✅ Recent activity requests
- ✅ User preference queries
- ❌ Missing required parameters (error cases)
- ❌ Invalid payload structures (error cases)
- ❌ Empty prompts (error cases)

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Refused**
   - ❓ **Cause:** Agent not running
   - ✅ **Solution:** Start the agent with "Debug MetaMatic Agent" configuration

2. **404 Not Found**
   - ❓ **Cause:** Wrong URL or path
   - ✅ **Solution:** Verify agent is listening on `/invocations`

3. **500 Internal Server Error**
   - ❓ **Cause:** Agent error or missing dependencies
   - ✅ **Solution:** Check agent logs and ensure environment is configured

### Debug Tips

1. **Enable detailed logging** in the agent by setting `LOG_LEVEL=DEBUG`
2. **Check agent terminal output** for error messages
3. **Verify environment variables** are set correctly
4. **Test with simple payloads first** before complex scenarios

## 🔄 Adding New Test Scenarios

### To add a new JavaScript client:
1. Create a new `.js` file in this directory
2. Use existing files as templates
3. Add a new configuration to `.vscode/launch.json`

### To add a new test to the suite:
1. Edit `test_suite.js`
2. Add your scenario to the `testScenarios` array

### To add a new REST Client request:
1. Edit `metamatic_tests.http`
2. Add a new `### Test Name` section with your request

## 📚 Related Documentation

- Agent source code: `services/agents/metamatic/src/metamatic_agent.py`
- Launch configurations: `.vscode/launch.json`
- Agent tests: `services/agents/metamatic/tests/`
