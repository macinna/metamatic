// Temporary global declarations so this file typechecks before SST generates its types.
// Once you've run `sst dev`/`sst deploy`, you can add:
/// <reference path="../../../.sst/platform/config.d.ts" />
// declare const sst: any;
// declare const aws: any;
declare const $app: { stage: string };

export function ApiStack() {
    // DynamoDB Users table
    const users = new sst.aws.Dynamo("Users", {
        fields: {
            userId: "string",
            phoneNumber: "string",
            stravaUserId: "number",
            emailAddress: "string"
        },
        primaryIndex: { hashKey: "userId" },
        globalIndexes: {
            "phoneNumber-index": { hashKey: "phoneNumber" },
            "stravaUserId-index": { hashKey: "stravaUserId" },
            "emailAddress-index": { hashKey: "emailAddress" }
        },
    });

    // Secrets
    const JWT_SECRET = new sst.Secret("JWT_SECRET");
    const STRAVA_CLIENT_ID = new sst.Secret("STRAVA_CLIENT_ID");
    const STRAVA_CLIENT_SECRET = new sst.Secret("STRAVA_CLIENT_SECRET");
    const SMS_PROVIDER_API_KEY = new sst.Secret("SMS_PROVIDER_API_KEY");

    // Cognito configuration - these should be set as SST secrets or environment variables
    const COGNITO_USER_POOL_ID = new sst.Secret("COGNITO_USER_POOL_ID");
    const COGNITO_CLIENT_ID = new sst.Secret("COGNITO_CLIENT_ID");
    const COGNITO_CLIENT_SECRET = new sst.Secret("COGNITO_CLIENT_SECRET");
    const COGNITO_REGION = new sst.Secret("COGNITO_REGION");

    // Create IAM role for user handler with Cognito and DynamoDB permissions
    const userHandlerRole = new aws.iam.Role("UserHandlerRole", {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
            Service: "lambda.amazonaws.com"
        }),
        inlinePolicies: [
            {
                name: "CognitoPermissions",
                policy: $interpolate`{
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Action": [
                                "cognito-idp:AdminCreateUser",
                                "cognito-idp:AdminGetUser",
                                "cognito-idp:AdminUpdateUserAttributes",
                                "cognito-idp:AdminDeleteUser",
                                "cognito-idp:AdminSetUserPassword",
                                "cognito-idp:AdminConfirmSignUp"
                            ],
                            "Resource": "arn:aws:cognito-idp:${COGNITO_REGION.value}:*:userpool/${COGNITO_USER_POOL_ID.value}"
                        }
                    ]
                }`
            },
            {
                name: "DynamoDBPermissions",
                policy: $interpolate`{
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Action": [
                                "dynamodb:GetItem",
                                "dynamodb:PutItem",
                                "dynamodb:UpdateItem",
                                "dynamodb:DeleteItem",
                                "dynamodb:Query",
                                "dynamodb:Scan"
                            ],
                            "Resource": [
                                "${users.arn}",
                                "${users.arn}/index/*"
                            ]
                        }
                    ]
                }`
            },
            {
                name: "AppSyncPermissions",
                policy: $interpolate`{
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Action": [
                                "appsync:*"
                            ],
                            "Resource": [
                                "*"
                            ]
                        }
                    ]
                }`
            }

        ],
        managedPolicyArns: [
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        ]
    });

    // REST API with proxy routing per resource
    const api = new sst.aws.ApiGatewayV1("Api");

    const commonLink = [
        users,
        JWT_SECRET,
        STRAVA_CLIENT_ID,
        STRAVA_CLIENT_SECRET,
        SMS_PROVIDER_API_KEY,
        COGNITO_USER_POOL_ID,
        COGNITO_CLIENT_ID,
        COGNITO_CLIENT_SECRET,
        COGNITO_REGION
    ];

    // Helper function for routes with default role
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

    // Helper function for routes with custom role
    const routeWithRole = (methodPath: string, handler: string, role: any) => {
        api.route(methodPath, {
            handler,
            link: commonLink,
            environment: {
                USERS_TABLE: users.name,
                STAGE: $app.stage,
            },
            transform: {
                function: {
                    role: role.arn
                }
            }
        });
    };

    // Handlers are now resolved from the repo root (sst.config.ts moved to root)
    route("ANY /auth/{proxy+}", "apps/api/src/handlers/auth.handler");
    routeWithRole("ANY /user", "apps/api/src/handlers/user.handler", userHandlerRole);
    routeWithRole("ANY /user/{proxy+}", "apps/api/src/handlers/user.handler", userHandlerRole);
    route("ANY /strava/{proxy+}", "apps/api/src/handlers/strava.handler");
    route("ANY /webhooks/{proxy+}", "apps/api/src/handlers/webhooks.handler");

    api.deploy();

    return {
        ApiEndpoint: api.url,
        UsersTableName: users.name,
    };
}
