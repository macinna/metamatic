import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const method = (event as any).requestContext?.http?.method || event.httpMethod || "GET";
    const path = (event as any).rawPath || event.path || "/auth";
    const subpath = path.replace(/^\/auth\/?/, "");

    // Placeholder secrets/env
    //void process.env.USERS_TABLE;
    //void process.env.STAGE;

    try {
        if (method === "POST" && subpath === "login") {
            return ok({ message: "login stub" });
        }
        if (method === "POST" && subpath === "register") {
            return ok({ message: "register stub" });
        }
        if (method === "POST" && subpath === "verify") {
            return ok({ message: "verify stub" });
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
