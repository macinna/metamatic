import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const method = (event as any).requestContext?.http?.method || event.httpMethod || "GET";
    const path = (event as any).rawPath || event.path || "/user";
    const subpath = path.replace(/^\/user\/?/, "");

    try {
        if (method === "GET" && subpath === "profile") {
            return ok({ message: "get profile stub" });
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
