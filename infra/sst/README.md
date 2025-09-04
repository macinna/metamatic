# MetaMatic API – SST Infrastructure

This directory contains the SST app that deploys the MetaMatic API as a serverless REST API and the DynamoDB `Users` table.

What’s included
- DynamoDB table: `${stage}-Users` with partition key `user_id` and GSIs for `phoneNumber` and `stravaUserId`.
- REST API (API Gateway v1) with proxy routing to 4 Lambda functions:
  - ANY /auth/{proxy+} -> `api/src/handlers/auth.ts`
  - ANY /user/{proxy+} -> `api/src/handlers/user.ts`
  - ANY /strava/{proxy+} -> `api/src/handlers/strava.ts`
  - ANY /webhooks/{proxy+} -> `api/src/handlers/webhooks.ts`
- Placeholder secrets plumbed to handlers via SST Config:
  - `JWT_SECRET`, `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `SMS_PROVIDER_API_KEY`

Prereqs
- Node.js 18+ (Node 20 recommended)
- AWS credentials with permissions for API Gateway, Lambda, DynamoDB, SSM/Secrets Manager
- pnpm

Install deps
```sh
pnpm install --dir infra/sst
```

Develop locally (us-east-2)
```sh
cd infra/sst
pnpm dev
```
This runs `sst dev` and watches for changes. It uses stage `dev` by default.

Deploy
```sh
cd infra/sst
pnpm deploy -- --stage prod
```

Remove
```sh
cd infra/sst
pnpm remove -- --stage dev
```

Managing secrets
The following Config.Secrets are defined and bound to all API functions:
- JWT_SECRET
- STRAVA_CLIENT_ID
- STRAVA_CLIENT_SECRET
- SMS_PROVIDER_API_KEY

You can set their values per stage during `sst deploy` when prompted, or pre-create them using the SST CLI. In code, access them via `process.env` (SST injects them at runtime).

Outputs
- `ApiEndpoint` – the base URL for the REST API
- `UsersTableName` – the DynamoDB table name

Notes
- Region is fixed to `us-east-2` per requirements.
- Routes are proxy-style; subpaths/verbs are handled inside each function.
- Handlers are TypeScript using Node.js 20 runtime.

Next steps (not implemented here)
- Implement real auth + JWT issuance/verification
- Implement Strava OAuth flow and webhook signature verification
- Add validation, logging, and error handling conventions
- Add CI and tests