import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const method = (event as any).requestContext?.http?.method || event.httpMethod || "GET";
    const path = (event as any).rawPath || event.path || "/webhooks";
    const subpath = path.replace(/^\/webhooks\/?/, "");

    try {
        if (subpath !== "strava") return notFound();

        if (method === "GET") {
            // Strava webhook verification handshake expects echo of 'hub.challenge'
            const challenge = event.queryStringParameters?.["hub.challenge"] as string | undefined;
            if (challenge) {
                return {
                    statusCode: 200,
                    headers: cors(),
                    body: JSON.stringify({ "hub.challenge": challenge }),
                };
            }
            return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: "Missing hub.challenge" }) };
        }

        if (method === "POST") {
            // Stub: validate signature, route to agent, etc.
            return ok({ message: "webhook received" });
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
function error(err: unknown): APIGatewayProxyResult {
    console.error(err);
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: "Internal Server Error" }) };
}
function cors() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
    };
}
