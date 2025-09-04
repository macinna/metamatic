// Temporary global declarations so this file typechecks before SST generates its types.
// Once you've run `sst dev`/`sst deploy`, you can add:
// /// <reference path="../.sst/platform/config.d.ts" />
declare const sst: any;
declare const $app: { stage: string };

export function ApiStack() {
    // DynamoDB Users table
    const users = new sst.aws.Dynamo("Users", {
        fields: {
            userId: "string",
            phoneNumber: "string",
            stravaUserId: "number",
        },
        primaryIndex: { hashKey: "userId" },
        globalIndexes: {
            "phoneNumber-index": { hashKey: "phoneNumber" },
            "stravaUserId-index": { hashKey: "stravaUserId" },
        },
    });

    // Secrets
    const JWT_SECRET = new sst.Secret("JWT_SECRET");
    const STRAVA_CLIENT_ID = new sst.Secret("STRAVA_CLIENT_ID");
    const STRAVA_CLIENT_SECRET = new sst.Secret("STRAVA_CLIENT_SECRET");
    const SMS_PROVIDER_API_KEY = new sst.Secret("SMS_PROVIDER_API_KEY");

    // REST API with proxy routing per resource
    const api = new sst.aws.ApiGatewayV1("Api");

    const commonLink = [users, JWT_SECRET, STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, SMS_PROVIDER_API_KEY];

    const route = (methodPath: string, handler: string) => {
        api.route(methodPath, {
            handler,
            link: commonLink,
            environment: {
                USERS_TABLE: users.name,
                STAGE: $app.stage,
            },
        });
    };

    // Handlers are now resolved from the repo root (sst.config.ts moved to root)
    route("ANY /auth/{proxy+}", "apps/api/src/handlers/auth.handler");
    route("ANY /user/{proxy+}", "apps/api/src/handlers/user.handler");
    route("ANY /strava/{proxy+}", "apps/api/src/handlers/strava.handler");
    route("ANY /webhooks/{proxy+}", "apps/api/src/handlers/webhooks.handler");

    api.deploy();

    return {
        ApiEndpoint: api.url,
        UsersTableName: users.name,
    };
}
