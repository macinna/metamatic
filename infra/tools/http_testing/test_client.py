#!/usr/bin/env python3

import json
import os
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

AGENT_URL = os.getenv('AGENT_URL', 'http://localhost:8080/invocations')

def send_request(payload):
    """Send HTTP POST request to the agent"""
    try:
        data = json.dumps(payload).encode('utf-8')
        
        req = Request(
            AGENT_URL,
            data=data,
            headers={
                'Content-Type': 'application/json',
                'Content-Length': str(len(data))
            },
            method='POST'
        )
        
        with urlopen(req) as response:
            return {
                'status_code': response.getcode(),
                'headers': dict(response.headers),
                'body': response.read().decode('utf-8')
            }
    except HTTPError as e:
        return {
            'status_code': e.code,
            'headers': dict(e.headers) if hasattr(e, 'headers') else {},
            'body': e.read().decode('utf-8') if hasattr(e, 'read') else str(e)
        }
    except URLError as e:
        raise Exception(f"Connection failed: {e.reason}")

def print_separator(char='─', length=50):
    print(char * length)

def print_response(response):
    """Pretty print the response"""
    print(f"📊 Status Code: {response['status_code']}")
    print(f"📋 Headers: {response['headers']}")
    print_separator()
    
    try:
        parsed_body = json.loads(response['body'])
        print('✅ Response:')
        print(json.dumps(parsed_body, indent=2))
    except json.JSONDecodeError:
        print('📝 Raw response:')
        print(response['body'])

def test_new_activity_flow():
    """Test the new activity deterministic flow"""
    print('🆕 Testing New Activity Flow')
    payload = {
        "task": "start_new_activity_flow",
        "activityId": "87654321",
        "sessionId": f"python-test-{int(time.time())}"
    }
    
    print('📤 Sending payload:')
    print(json.dumps(payload, indent=2))
    print(f'🎯 Target URL: {AGENT_URL}')
    print_separator()
    
    try:
        response = send_request(payload)
        print_response(response)
    except Exception as e:
        print(f'❌ Request failed: {e}')
        print('💡 Make sure the MetaMatic agent is running')

def test_chat_flow():
    """Test the conversational chat flow"""
    print('💬 Testing Chat Flow')
    payload = {
        "prompt": "I want to see my recent activities and rename one of them",
        "sessionId": f"python-test-{int(time.time())}"
    }
    
    print('📤 Sending payload:')
    print(json.dumps(payload, indent=2))
    print(f'🎯 Target URL: {AGENT_URL}')
    print_separator()
    
    try:
        response = send_request(payload)
        print_response(response)
    except Exception as e:
        print(f'❌ Request failed: {e}')
        print('💡 Make sure the MetaMatic agent is running')

def interactive_mode():
    """Interactive mode for custom testing"""
    print('🤖 MetaMatic Agent Python HTTP Client')
    print(f'🎯 Target: {AGENT_URL}')
    print_separator('═', 60)
    
    while True:
        print('\nAvailable test options:')
        print('1. Test New Activity Flow')
        print('2. Test Chat Flow')  
        print('3. Custom Chat Message')
        print('4. Exit')
        
        try:
            choice = input('\n🔢 Choose an option (1-4): ').strip()
            
            if choice == '1':
                print()
                test_new_activity_flow()
            elif choice == '2':
                print()
                test_chat_flow()
            elif choice == '3':
                custom_message = input('\n💬 Enter your message: ').strip()
                if custom_message:
                    payload = {
                        "prompt": custom_message,
                        "sessionId": f"python-custom-{int(time.time())}"
                    }
                    print('\n📤 Sending custom message...')
                    print_separator()
                    try:
                        response = send_request(payload)
                        print_response(response)
                    except Exception as e:
                        print(f'❌ Request failed: {e}')
            elif choice == '4':
                print('👋 Goodbye!')
                break
            else:
                print('❌ Invalid choice. Please select 1-4.')
                
        except KeyboardInterrupt:
            print('\n👋 Goodbye!')
            break
        except Exception as e:
            print(f'❌ Error: {e}')

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_type = sys.argv[1].lower()
        if test_type == 'new-activity':
            test_new_activity_flow()
        elif test_type == 'chat':
            test_chat_flow()
        else:
            print(f'❌ Unknown test type: {test_type}')
            print('Available types: new-activity, chat')
    else:
        interactive_mode()
