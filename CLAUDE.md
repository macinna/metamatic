# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MetaMatic is an intelligent assistant for Strava activities that automatically renames workout titles using AI-generated suggestions delivered via SMS. It uses a modern serverless architecture with three main components:

- **Web App** (`apps/web/`): Next.js 15 frontend with NextAuth for authentication
- **API Service** (`apps/api/`): Serverless Lambda handlers for user management, Strava integration, and webhooks
- **Infrastructure** (`infra/sst/`): SST v3 infrastructure-as-code for AWS deployment

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4, NextAuth v5
- **Backend**: AWS Lambda (Node.js 20.x), DynamoDB, API Gateway
- **Infrastructure**: SST v3, AWS CDK
- **Package Manager**: pnpm with workspaces

## Development Commands

### Install Dependencies
```bash
pnpm install
```

### Frontend Development (apps/web)
```bash
cd apps/web
pnpm dev          # Start Next.js dev server with Turbopack
pnpm build        # Build for production
pnpm lint         # Run ESLint
```

### Infrastructure & Backend (SST)
```bash
# From project root
sst dev           # Start SST dev mode (live Lambda development)
sst deploy        # Deploy to AWS
sst remove        # Remove AWS resources
```

### Running Tests
No test framework is currently configured. Check with the user before setting up tests.

## Architecture Overview

### API Gateway Routes
The API uses AWS API Gateway V1 with the following handler structure:
- `/auth/{proxy+}` → `apps/api/src/handlers/auth.handler`
- `/user/{proxy+}` → `apps/api/src/handlers/user.handler`
- `/strava/{proxy+}` → `apps/api/src/handlers/strava.handler`
- `/webhooks/{proxy+}` → `apps/api/src/handlers/webhooks.handler`

### Database Schema
DynamoDB table "Users" with:
- Primary key: `userId` (string)
- Global indexes: `phoneNumber-index`, `stravaUserId-index`

### Authentication Flow
1. Frontend uses NextAuth with AWS Cognito provider
2. Sessions include Cognito tokens for API Gateway authorization
3. Phone number is captured from Cognito profile for SMS functionality

### Environment Variables & Secrets
SST manages secrets for:
- `JWT_SECRET`
- `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET`
- `SMS_PROVIDER_API_KEY`

Frontend requires:
- `AUTH_COGNITO_ISSUER`
- NextAuth configuration variables

## Key Workflows

### New Activity Flow
1. Strava webhook → API `/webhooks` handler
2. API validates request and invokes Agent service
3. Agent fetches activity details, generates titles
4. SMS sent to user with title suggestions

### SMS Reply Processing
1. SMS provider → API endpoint
2. API identifies user by phone number
3. Agent processes natural language command
4. Updates Strava activity and sends confirmation SMS

## Development Guidelines

### TypeScript Configuration
- API handlers use ES modules (`"type": "module"`)
- Strict TypeScript in all workspaces
- SST generates types after first `sst dev` or `sst deploy`

### Code Organization
- Lambda handlers should be lightweight, routing to service logic
- Shared types go in `apps/api/src/types/` or `apps/web/src/types/`
- Infrastructure code stays in `infra/sst/stacks/`

### SST Development Mode
When running `sst dev`:
- Lambda functions are executed locally with live reloading
- AWS resources (DynamoDB, API Gateway) are provisioned in AWS
- Environment variables and secrets are automatically injected