import json
import os
from datetime import datetime
from strands import Agent, tool
from strands.models import BedrockModel
from bedrock_agentcore import BedrockAgentCoreApp

from clients.strava_client import StravaClientInterface, StravaClient, MockStravaClient
from models.strava_models import StravaActivity
from agent_utils import initialize_env

initialize_env()

SYSTEM_PROMPT = """
You are MetaMatic, a helpful and creative assistant for the Strava fitness app.
Your primary job is to help users manage their activities by renaming them or changing their settings.
When a user provides a number, assume they are choosing one of the suggested titles.
When a user makes a request in natural language, determine their intent and use the correct tool to help them.
You are conversational, but efficient.
"""


def create_strava_client() -> StravaClientInterface:
    """Factory function to create the appropriate Strava client based on configuration"""
    if os.getenv('STRAVA_CLIENT_MODE', 'mock') == 'mock':
        return MockStravaClient()
    else:   
        return StravaClient(os.getenv('STRAVA_ACCESS_TOKEN', ''))


@tool
def get_activity_details(activity_id: str, session_id: str) -> str:
    """Fetch details for a specific Strava activity with comprehensive schema matching Strava API v3"""
    try:
        # Create the appropriate Strava client based on configuration
        strava_client = create_strava_client()
        
        # Get activity details using the client
        activity = strava_client.get_activity_details(activity_id)
        
        # Convert to JSON string for the LLM
        return activity.model_dump_json(indent=2)
    except Exception as e:
        return json.dumps({"error": f"Failed to fetch activity details: {str(e)}"})

@tool
def generate_creative_names(activity_details: str) -> str:
    """Generate three creative names for a Strava activity based on its details"""
    try:
        details = json.loads(activity_details)
        activity_type = details.get("type", "Activity").lower()
        distance = details.get("distance", 0)
        location = details.get("location", "")
        
        # Generate creative names based on activity details
        creative_names = []
        
        if activity_type == "run":
            creative_names = [
                f"Morning Miles in {location}" if location else "Dawn Dash Adventure",
                f"{distance}K Rhythm & Flow",
                "Pavement Poetry Session"
            ]
        elif activity_type == "ride" or activity_type == "cycling":
            creative_names = [
                f"Spinning Through {location}" if location else "Wind & Wheels Journey",
                f"{distance}K Pedal Power",
                "Two-Wheel Therapy"
            ]
        else:
            creative_names = [
                f"Epic {activity_type} Adventure",
                f"{distance}K Challenge Conquered",
                "Personal Victory Lap"
            ]
        
        return json.dumps({"creative_names": creative_names})
    except Exception as e:
        return json.dumps({"error": f"Failed to generate creative names: {str(e)}"})

@tool
def update_activity_name(activity_id: str, new_name: str, session_id: str) -> str:
    """Update the name of a Strava activity"""
    try:
        # Mock implementation - replace with actual Strava API call
        result = {
            "success": True,
            "activity_id": activity_id,
            "old_name": "Morning Run",
            "new_name": new_name,
            "message": f"Activity renamed to '{new_name}'"
        }
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"error": f"Failed to update activity name: {str(e)}"})

@tool
def update_activity_privacy(activity_id: str, privacy_setting: str, session_id: str) -> str:
    """Update the privacy setting of a Strava activity"""
    try:
        valid_settings = ["public", "private", "followers_only"]
        if privacy_setting.lower() not in valid_settings:
            return json.dumps({"error": f"Invalid privacy setting. Must be one of: {valid_settings}"})
        
        # Mock implementation - replace with actual Strava API call
        result = {
            "success": True,
            "activity_id": activity_id,
            "privacy_setting": privacy_setting.lower(),
            "message": f"Activity privacy updated to '{privacy_setting}'"
        }
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"error": f"Failed to update activity privacy: {str(e)}"})

@tool
def get_recent_activities(session_id: str, limit: int = 5) -> str:
    """Get user's recent Strava activities"""
    try:
        # Mock implementation - replace with actual Strava API call
        activities = []
        for i in range(limit):
            activities.append({
                "id": f"activity_{i+1}",
                "name": f"Activity {i+1}",
                "type": "Run" if i % 2 == 0 else "Ride",
                "distance": 5.0 + i,
                "start_date": f"2024-01-{15-i}T07:30:00Z"
            })
        
        return json.dumps({"activities": activities})
    except Exception as e:
        return json.dumps({"error": f"Failed to fetch recent activities: {str(e)}"})

@tool
def get_user_preferences(session_id: str) -> str:
    """Get user's preferences and settings"""
    try:
        # Mock implementation - replace with actual user preferences
        preferences = {
            "default_privacy": "public",
            "auto_naming": True,
            "preferred_units": "metric",
            "notification_settings": {
                "activity_suggestions": True,
                "privacy_reminders": False
            }
        }
        return json.dumps(preferences)
    except Exception as e:
        return json.dumps({"error": f"Failed to fetch user preferences: {str(e)}"})

# Create an AgentCore app
app = BedrockAgentCoreApp()

# Create a non-streaming Bedrock model
bedrock_model = BedrockModel(
    model_id="us.amazon.nova-lite-v1:0",
    streaming=False,  # Disable streaming
    region_name="us-west-2"  # Explicitly set region
)

agent = Agent(
    model=bedrock_model,
    system_prompt=SYSTEM_PROMPT,
    tools=[
        get_activity_details,
        generate_creative_names,
        update_activity_name,
        update_activity_privacy,
        get_recent_activities,
        get_user_preferences,
    ],
)

@app.entrypoint
def invoke(payload):
    """Handler for agent invocation"""
    
    # Check if this is a deterministic workflow (new activity trigger)
    if payload.get("task") == "start_new_activity_flow":
        activity_id = payload.get("activityId")
        session_id = payload.get("sessionId")
        
        if not activity_id or not session_id:
            return json.dumps({"error": "Missing required parameters: activityId and sessionId"})
        
        try:
            # Execute deterministic workflow
            # 1. Get activity details
            activity_details = get_activity_details(activity_id, session_id)
            
            # 2. Generate creative names
            creative_names_result = generate_creative_names(activity_details)
            creative_names_data = json.loads(creative_names_result)
            
            if "error" in creative_names_data:
                return json.dumps(creative_names_data)
            
            # Return the generated names for sending to user
            return json.dumps({
                "activity_id": activity_id,
                "creative_names": creative_names_data["creative_names"],
                "message": "Here are 3 creative name suggestions for your activity. Reply with 1, 2, or 3 to choose one, or tell me what you'd like to name it!"
            })
            
        except Exception as e:
            return json.dumps({"error": f"Failed to process new activity: {str(e)}"})
    
    # Handle conversational workflow (user SMS)
    elif "prompt" in payload:
        user_message = payload.get("prompt")
        session_id = payload.get("sessionId")
        
        if not user_message:
            return "No prompt found in input, please provide a message."
        
        # Add session context to the user message if available
        if session_id:
            contextual_message = f"[Session: {session_id}] {user_message}"
        else:
            contextual_message = user_message
        
        try:
            response = agent(contextual_message)
            return response.message["content"][0]["text"]
        except Exception as e:
            return f"Sorry, I encountered an error processing your request: {str(e)}"
    
    else:
        return json.dumps({
            "error": "Invalid payload structure. Expected either 'task' for deterministic workflow or 'prompt' for conversational workflow."
        })

if __name__ == "__main__":
    app.run()