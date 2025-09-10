import {
    AdminCreateUserCommand,
    AdminGetUserCommand,
    CognitoIdentityProviderClient,
    MessageActionType
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Resource } from "sst";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const method = (event as any).requestContext?.http?.method || event.httpMethod || "GET";
    const path = (event as any).rawPath || event.path || "/user";
    const subpath = path.replace(/^\/user\/?/, "").replace(/\/+$/, "");

    try {
        // POST /user - Create new user
        if (method === "POST" && !subpath) {
            const body = JSON.parse(event.body || "{}");
            const { phoneNumber, emailAddress, selectedVoiceId } = body;

            // Validate required fields
            if (!phoneNumber || !emailAddress || !selectedVoiceId) {
                return badRequest({ error: "Missing required fields: phoneNumber, emailAddress, and selectedVoiceId" });
            }

            // Validate phone number format (E.164)
            if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
                return badRequest({ error: "Invalid phone number format. Must be E.164 format (e.g., +12125551234)" });
            }

            // Validate email format
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
                return badRequest({ error: "Invalid email address format" });
            }

            try {
                // Get Cognito configuration from SST secrets
                const cognitoRegion = Resource.COGNITO_REGION.value || "us-west-2";
                const userPoolId = Resource.COGNITO_USER_POOL_ID.value;

                if (!userPoolId) {
                    return internalError("COGNITO_USER_POOL_ID is not configured");
                }

                // Initialize Cognito client
                const cognitoClient = new CognitoIdentityProviderClient({
                    region: cognitoRegion
                });

                // Check if user already exists in Cognito
                let userExists = false;
                let cognitoUserId = "";

                try {
                    const getUserResult = await cognitoClient.send(new AdminGetUserCommand({
                        UserPoolId: userPoolId,
                        Username: emailAddress
                    }));
                    userExists = true;
                    cognitoUserId = getUserResult.UserAttributes?.find(attr => attr.Name === "sub")?.Value || "";
                } catch (err: any) {
                    if (err.name !== "UserNotFoundException") {
                        throw err;
                    }
                    // User doesn't exist, which is what we want
                }

                if (userExists) {
                    return badRequest({ error: "User with this phone number already exists" });
                }

                // Create user in Cognito without sending SMS
                const createUserResult = await cognitoClient.send(new AdminCreateUserCommand({
                    UserPoolId: userPoolId,
                    Username: emailAddress,
                    UserAttributes: [
                        { Name: "phone_number", Value: phoneNumber },
                        { Name: "phone_number_verified", Value: "true" }, // Auto-verify since we're not sending SMS
                        { Name: "email", Value: emailAddress },
                        { Name: "email_verified", Value: "true" } // Auto-verify since we're not sending email verification
                    ],
                    MessageAction: MessageActionType.SUPPRESS, // Don't send welcome message
                    DesiredDeliveryMediums: [] // No delivery mediums
                }));

                cognitoUserId = createUserResult.User?.Attributes?.find(attr => attr.Name === "sub")?.Value || "";

                // Save user to DynamoDB
                const tableName = process.env.USERS_TABLE;
                if (!tableName) {
                    return internalError("USERS_TABLE environment variable is not set");
                }

                const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

                const userItem = {
                    userId: cognitoUserId,
                    phoneNumber,
                    emailAddress,
                    selectedVoiceId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await ddb.send(new PutCommand({
                    TableName: tableName,
                    Item: userItem,
                    ConditionExpression: "attribute_not_exists(userId)" // Ensure we don't overwrite
                }));

                return ok({
                    success: true,
                    userId: cognitoUserId,
                    message: "User created successfully"
                });

            } catch (err: any) {
                console.error("Error creating user:", err);

                if (err.name === "ConditionalCheckFailedException") {
                    return badRequest({ error: "User already exists" });
                }

                if (err.name === "UsernameExistsException") {
                    return badRequest({ error: "User with this phone number already exists" });
                }

                return internalError(`Failed to create user: ${err.message}`);
            }
        }

        // GET /user/profile/{user_id}
        if (method === "GET" && (subpath.startsWith("profile/") || subpath === "profile")) {
            const parts = subpath.split("/");
            const rawUserId = parts.length > 1 ? parts[1] : "";
            if (!rawUserId) {
                return badRequest({ error: "Missing user_id in path. Expected /user/profile/{user_id}" });
            }

            const userId = decodeURIComponent(rawUserId);
            const tableName = process.env.USERS_TABLE;
            if (!tableName) {
                return internalError("USERS_TABLE environment variable is not set");
            }

            const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
            const result = await ddb.send(new GetCommand({ TableName: tableName, Key: { userId } }));

            if (!result.Item) {
                return notFoundWithMessage(`User not found: ${userId}`);
            }
            return ok(result.Item);
        }
        // PUT /user/{user_id}/voice - Update user's voice selection
        if (method === "PUT" && subpath.includes("/voice")) {
            const parts = subpath.split("/");
            const rawUserId = parts[0];

            if (!rawUserId) {
                return badRequest({ error: "Missing user_id in path. Expected /user/{user_id}/voice" });
            }

            const userId = decodeURIComponent(rawUserId);
            const body = JSON.parse(event.body || "{}");
            const { selectedVoiceId } = body;

            if (!selectedVoiceId) {
                return badRequest({ error: "Missing selectedVoiceId in request body" });
            }

            const tableName = process.env.USERS_TABLE;
            if (!tableName) {
                return internalError("USERS_TABLE environment variable is not set");
            }

            try {
                const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

                // Update the user's voice selection
                const result = await ddb.send(new UpdateCommand({
                    TableName: tableName,
                    Key: { userId },
                    UpdateExpression: "SET selectedVoiceId = :voiceId, updatedAt = :now",
                    ExpressionAttributeValues: {
                        ":voiceId": selectedVoiceId,
                        ":now": new Date().toISOString()
                    },
                    ConditionExpression: "attribute_exists(userId)",
                    ReturnValues: "ALL_NEW"
                }));

                return ok({
                    success: true,
                    user: result.Attributes,
                    message: "Voice preference updated successfully"
                });

            } catch (err: any) {
                if (err.name === "ConditionalCheckFailedException") {
                    return notFoundWithMessage(`User not found: ${userId}`);
                }
                throw err;
            }
        }

        if (method === "PUT" && subpath === "settings") {
            return ok({ message: "update settings stub" });
        }
        return notFound();
    } catch (err) {
        return error(err);
    }
}

function ok(body: unknown): APIGatewayProxyResult {
    return { statusCode: 200, headers: cors(), body: JSON.stringify(body) };
}
function notFound(): APIGatewayProxyResult {
    return { statusCode: 404, headers: cors(), body: JSON.stringify({ error: "Not Found" }) };
}
function notFoundWithMessage(message: string): APIGatewayProxyResult {
    return { statusCode: 404, headers: cors(), body: JSON.stringify({ error: "Not Found", message }) };
}
function badRequest(body: unknown): APIGatewayProxyResult {
    return { statusCode: 400, headers: cors(), body: JSON.stringify(body) };
}
function internalError(message: string): APIGatewayProxyResult {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: "Internal Server Error", message }) };
}
function error(err: unknown): APIGatewayProxyResult {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: "Internal Server Error", message }) };
}
function cors() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
    };
}
