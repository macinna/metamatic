#!/bin/bash

# MetaMatic Agent HTTP Testing Script
# This script provides easy command-line access to HTTP testing tools

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_URL="${AGENT_URL:-http://localhost:8080/invocations}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function print_header() {
    echo -e "${BLUE}🤖 MetaMatic Agent HTTP Testing Tools${NC}"
    echo -e "${BLUE}🎯 Target: ${AGENT_URL}${NC}"
    echo "════════════════════════════════════════════════════════════"
}

function print_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  new-activity    Test new activity flow (deterministic)"
    echo "  chat           Test chat flow (conversational)"
    echo "  rename         Test activity renaming"
    echo "  privacy        Test privacy updates"
    echo "  interactive    Run interactive Node.js client"
    echo "  python         Run Python interactive client"
    echo "  suite          Run comprehensive test suite"
    echo "  help           Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  AGENT_URL      Agent endpoint (default: http://localhost:8080/invocations)"
    echo ""
    echo "Examples:"
    echo "  $0 new-activity"
    echo "  AGENT_URL=http://my-server:8080/invocations $0 chat"
}

function check_agent() {
    echo -e "${YELLOW}🔍 Checking if agent is running...${NC}"
    if curl -s -f "${AGENT_URL}" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Agent is responding${NC}"
    else
        echo -e "${RED}❌ Agent not responding at ${AGENT_URL}${NC}"
        echo -e "${YELLOW}💡 Start the agent with VS Code's 'Debug MetaMatic Agent' configuration${NC}"
        echo ""
    fi
}

function run_node_script() {
    local script_name="$1"
    local description="$2"
    
    echo -e "${GREEN}🚀 ${description}${NC}"
    echo "────────────────────────────────────────────────────────────"
    AGENT_URL="${AGENT_URL}" node "${SCRIPT_DIR}/${script_name}"
}

function run_python_script() {
    local args="$1"
    local description="$2"
    
    echo -e "${GREEN}🐍 ${description}${NC}"
    echo "────────────────────────────────────────────────────────────"
    
    # Try to activate virtual environment if it exists
    if [[ -f "../../.venv/bin/activate" ]]; then
        source ../../.venv/bin/activate
    fi
    
    AGENT_URL="${AGENT_URL}" python "${SCRIPT_DIR}/test_client.py" ${args}
}

# Main script logic
case "${1:-help}" in
    "new-activity")
        print_header
        check_agent
        run_node_script "test_new_activity.js" "Testing New Activity Flow"
        ;;
    "chat")
        print_header
        check_agent
        run_node_script "test_chat.js" "Testing Chat Flow"
        ;;
    "rename")
        print_header
        check_agent
        run_node_script "test_rename_activity.js" "Testing Activity Rename"
        ;;
    "privacy")
        print_header
        check_agent
        run_node_script "test_privacy_update.js" "Testing Privacy Update"
        ;;
    "interactive")
        print_header
        check_agent
        run_node_script "interactive_client.js" "Running Interactive Client"
        ;;
    "python")
        print_header
        check_agent
        run_python_script "" "Running Python Interactive Client"
        ;;
    "suite")
        print_header
        check_agent
        run_node_script "test_suite.js" "Running Comprehensive Test Suite"
        ;;
    "help"|"-h"|"--help")
        print_header
        print_usage
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        print_usage
        exit 1
        ;;
esac
