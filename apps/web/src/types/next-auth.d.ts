import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: (DefaultSession["user"] & { phone?: string }) | undefined;
        cognito?: {
            idToken?: string;
            accessToken?: string;
            expiresAt?: number;
        };
    }
}
