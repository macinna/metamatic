import { auth } from "@/auth";

export type ApiClientOptions = {
    baseUrl: string; // e.g., https://abc123.execute-api.us-east-1.amazonaws.com/prod
};

export type ApiRequestInit = Omit<RequestInit, "headers"> & {
    headers?: Record<string, string>;
};

// Creates a server-side fetch wrapper that attaches the Cognito id token.
export function createApiClient(opts: ApiClientOptions) {
    const { baseUrl } = opts;

    async function request(path: string, init: ApiRequestInit = {}) {
        // Server-side: read session and id token
        const session = await auth();
        const idToken = (session as any)?.cognito?.idToken as string | undefined;
        if (!idToken) {
            throw new Error("Not authenticated: missing Cognito idToken in session");
        }

        const headers: Record<string, string> = {
            ...(init.headers ?? {}),
            Authorization: `Bearer ${idToken}`,
        };

        const res = await fetch(`${baseUrl}${path}`, {
            ...init,
            headers,
        });

        if (!res.ok) {
            const body = await safeText(res);
            throw new Error(`API ${res.status}: ${body}`);
        }
        return res;
    }

    return {
        get: (path: string, init: ApiRequestInit = {}) =>
            request(path, { ...init, method: "GET" }),
        post: (path: string, body?: unknown, init: ApiRequestInit = {}) =>
            request(path, {
                ...init,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(init.headers ?? {}),
                },
                body: body !== undefined ? JSON.stringify(body) : undefined,
            }),
        put: (path: string, body?: unknown, init: ApiRequestInit = {}) =>
            request(path, {
                ...init,
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(init.headers ?? {}),
                },
                body: body !== undefined ? JSON.stringify(body) : undefined,
            }),
        del: (path: string, init: ApiRequestInit = {}) =>
            request(path, { ...init, method: "DELETE" }),
    };
}

async function safeText(res: Response) {
    try {
        return await res.text();
    } catch {
        return "";
    }
}

// Convenience: create a client using an env var base URL.
export function getDefaultApiClient() {
    // Prefer existing project var NEXT_PUBLIC_API_URL, fallback to NEXT_PUBLIC_API_BASE_URL
    const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        throw new Error(
            "Missing NEXT_PUBLIC_API_URL (or NEXT_PUBLIC_API_BASE_URL) env var"
        );
    }
    return createApiClient({ baseUrl });
}
