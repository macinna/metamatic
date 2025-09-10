# MetaMatic API Service

## Overview

This is the central API service for the MetaMatic application. It is a serverless application built with AWS API Gateway and Lambda that acts as the secure, unified entry point for all client and server interactions.

The API is responsible for three core domains:
1.  **User Authentication & Management**: Handles the entire user lifecycle, from registration and passwordless login to managing user settings and profiles.
2.  **External Service Integration**: Manages all interactions with third-party services, most notably the secure OAuth 2.0 flow with the Strava API.
3.  **Event Routing**: Acts as the primary ingestion point for external events, such as webhooks from Strava and inbound SMS messages, validating them and routing them to the appropriate backend service (like the MetaMatic Agent).

All authenticated endpoints are secured using stateless JSON Web Tokens (JWT).

---

## Data Persistence: DynamoDB

The API service is the sole owner of the application's user data, which is persisted in a DynamoDB NoSQL table.

### Table Naming

The table is named dynamically based on the deployment environment to ensure strict data isolation.
* **Development**: `dev-Users`
* **Production**: `prod-Users`

### Schema and Indexes

The table's physical structure is defined in the SST infrastructure code. We only define the attributes that DynamoDB needs to manage its keys and indexes. All other attributes are managed by the application code (schema-on-read).

* **Partition Key**: `user_id` (String) - The unique identifier for each user in the MetaMatic system.
* **Global Secondary Index (GSI)**: `phoneNumber-index` - Allows for efficient lookups by the user's `phoneNumber`.
* **Global Secondary Index (GSI)**: `stravaUserId-index` - Allows for efficient lookups by the user's `stravaUserId`.

### Main User Attributes (Managed by Application Code)

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `userId` | String (UUID) | **Primary Key**. Unique MetaMatic user ID. |
| `phoneNumber` | String | User's phone number in E.164 format. |
| `stravaUserId` | Number | The user's unique numeric ID from Strava. |
| `stravaRefreshToken`| String | The long-lived, encrypted token for refreshing Strava access. |
| `stravaTokenExpiresAt`| Number | The Unix timestamp for when the current access token expires. |
| `selectedVoiceId` | String | The identifier for the user's chosen voice style. |
| `status` | String | The user's account status (e.g., `ACTIVE`, `INACTIVE`). |
| `createdAt` | String (ISO 8601)| Timestamp of account creation. |
| `updatedAt` | String (ISO 8601)| Timestamp of the last profile modification. |

---

## API Structure and Responsibilities



The API is divided into four logical resource groups: Authentication, User Management, Strava Integration, and Webhooks.

| Endpoint | HTTP Method | Authorization | Responsibility |
| :--- | :--- | :--- | :--- |
| **Authentication** | | | |
| `/auth/login` | **POST** | Public | Kicks off the passwordless login flow. Takes a `phoneNumber`, validates that the user exists, and triggers the sending of a one-time verification code via SMS. |
| `/auth/register` | **POST** | Public | Begins the new user registration flow. Takes a `phoneNumber`, validates that the user does *not* already exist, and triggers the sending of a one-time verification code via SMS. |
| `/auth/verify` | **POST** | Public | Verifies the one-time code sent to the user's phone. On success, it generates and returns a stateless **JWT (JSON Web Token)** that acts as the user's session for all subsequent authenticated requests. |
| **User Management** | | | |
| `/user/profile` | **GET** | **JWT Required** | Retrieves the complete profile for the currently authenticated user. The user is identified by the `user_id` within their JWT. This returns their phone number, Strava connection status, and current settings. |
| `/user/settings` | **PUT** | **JWT Required** | Updates the settings for the authenticated user. The primary use case is to change the `selected_voice_id` for activity renaming. |
| **Strava Integration** | | | |
| `/strava/oauth/url` | **GET** | **JWT Required** | Generates and returns the unique Strava OAuth URL. Your frontend redirects the user to this URL so they can grant MetaMatic permission to access their Strava account. |
| `/strava/oauth/callback` | **POST** | **JWT Required** | The endpoint that Strava redirects the user back to after they grant permission. This handler takes the temporary `code` from Strava, securely exchanges it for permanent access/refresh tokens, and saves them to the user's record in the database. |
| **Webhooks** | | | |
| `/webhooks/strava` | **GET** | Public | Used **only** for the one-time subscription handshake with Strava. It receives a challenge from Strava and must echo it back to validate the webhook endpoint. |
| `/webhooks/strava` | **POST** | Public | This is the main entry point for your agentic workflow. It receives notifications from Strava about new activities. Its **only** responsibility is to validate the incoming request and then **invoke your backend agent service**, passing along the activity and user information. It should respond immediately with a `200 OK`. |