# MetaMatic

MetaMatic is an intelligent assistant for your Strava activities that transforms your workout titles from generic to engaging. It automatically renames your newly uploaded activities using a "voice" that you choose, adding personality and fun to your fitness journey.

Beyond just renaming, MetaMatic acts as a conversational assistant for your activities, allowing you to manage them through simple text messages.

### Core Features

* **Automatic Title Suggestions**: As soon as your workout is uploaded to Strava, MetaMatic springs into action, crafting creative and relevant titles based on your activity's data.
* **Personalized "Voices"**: You choose the personality for your titles. Whether you want them to be witty, data-driven, factual, or sound like a famous movie star, MetaMatic adapts to your style.
* **Simple SMS-Based Interaction**: All interactions happen over text message. There's no app to install or website to log into after the initial setup.
* **Conversational Activity Management**: Need to make a change? Just tell MetaMatic what to do in plain English.

### Example Use Cases

#### Use Case 1: The Creative Renaming

* **Situation**: Sarah finishes her 5-mile morning run. As usual, Strava automatically names it "Morning Run."
* **MetaMatic in Action**: A moment later, her phone buzzes with an SMS from MetaMatic:
  > "Choose a title for your recent run:
  >
  > 1. The Dawn Patrol Conquered
  >
  > 2. Five Miles Before Breakfast
  >
  > 3. Chasing the Sunrise"
* **Result**: Sarah replies with "2". She checks her Strava profile, and her activity is now perfectly named, ready to be shared with friends.

#### Use Case 2: Ad-Hoc Conversational Management

* **Situation**: David finishes a long bike ride and gets his title suggestions from MetaMatic via SMS. He realizes he forgot to mark the activity as private before it was uploaded.
* **MetaMatic in Action**: Instead of just choosing a title, he replies to the same text message conversation:
  > "Actually, can you make this ride private for me?"
* **Result**: MetaMatic replies a moment later: "Done! I've set your ride to private. Anything else?" David was able to manage his activity's privacy settings without ever opening the Strava app.

## Technical Overview

MetaMatic is built on a modern, microservice-based architecture composed of three primary components: the **Web** client, the **API** service, and the **Agent** service. This separation allows the system to be scalable, secure, and maintainable.

### Major Components

* **Web**: The user-facing website that acts as the control panel for the service. This is where users perform the initial, one-time setup: registering with their phone number, verifying their account, and securely linking their Strava profile. It is a client-side application that communicates with the API to manage user settings.
* **API**: The central nervous system of the application. This is a serverless API that serves as the single, secure entry point for all requests. Its primary responsibilities are to handle user authentication, manage user data, and act as a secure router for events coming from both the web client and external services like Strava.
* **Agents**: The intelligent core of MetaMatic. This is a containerized, AI-powered service that contains all the complex business logic. The agent is responsible for both executing predefined workflows (like the title generation process) and using its reasoning capabilities to understand and act on a user's natural language SMS messages.

### How It Works: Common Use Cases

The components work together in a seamless sequence to provide the user experience.

#### Sequence 1: A New Activity is Uploaded

This flow is kicked off by Strava and is largely automated.

1. **Webhook Trigger**: A user finishes a workout and saves it. Strava immediately sends a webhook notification to a specific endpoint on our **API**.
2. **API Routing**: The **API** receives this notification, validates that it came from Strava, and identifies the user. It then invokes the **Agent** with a simple command: "start the new activity flow" for this specific user and activity.
3. **Agent Execution**: The **Agent** executes a deterministic workflow. It uses its tools to fetch the full activity details from Strava, generate three creative titles, and then triggers the SMS service to send these suggestions to the user's phone.

#### Sequence 2: A User Replies via SMS

This flow is conversational and driven by the agent's reasoning abilities.

1. **SMS Ingestion**: A user replies to the suggestion text with a command like, "Choose number 3 and make it private." The SMS provider forwards this message to the **API**.
2. **API Routing**: The **API** receives the text, identifies the user by their phone number, and invokes the **Agent**, passing the raw text message as a prompt.
3. **Agent Reasoning (ReAct Loop)**: The **Agent** enters its conversational mode. It analyzes the prompt and understands there are two separate intents:
   * It first selects its `update_activity_name` tool to rename the activity to the third suggestion.
   * It then selects its `update_activity_privacy` tool to change the visibility to private.
4. **Confirmation**: After successfully executing both actions, the agent formulates a natural language response (e.g., "Got it. I've renamed your activity and set it to private.") and sends it back to the user as a final confirmation SMS.