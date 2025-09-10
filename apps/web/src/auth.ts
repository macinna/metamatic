import NextAuth from "next-auth";
import Cognito from "next-auth/providers/cognito";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Cognito({
            issuer: process.env.AUTH_COGNITO_ISSUER,
            authorization: { params: { scope: "openid phone email" } },
        }),
    ],
    callbacks: {
        async jwt({ token, profile, account }) {
            // Capture phone number from profile on sign-in
            if (profile && (profile as any).phone_number) {
                (token as any).phone_number = (profile as any).phone_number;
            }
            // Persist Cognito OAuth tokens on initial sign-in
            if (account) {
                const { id_token, access_token, expires_at } = account as unknown as {
                    id_token?: string;
                    access_token?: string;
                    expires_at?: number;
                };
                (token as any).cognito = {
                    idToken: id_token,
                    accessToken: access_token,
                    expiresAt: typeof expires_at === 'number' ? expires_at : undefined,
                };
            }
            return token;
        },
        async session({ session, token }) {
            const phone = (token as any).phone_number as string | undefined;
            if (phone) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any) = { ...session.user, phone };
            }
            const cognito = (token as any).cognito as
                | { idToken?: string; accessToken?: string; expiresAt?: number }
                | undefined;
            if (cognito) {
                // Expose minimal tokens needed for API Gateway (User Pool authorizer)
                (session as any).cognito = {
                    idToken: cognito.idToken,
                    accessToken: cognito.accessToken,
                    expiresAt: cognito.expiresAt,
                };
            }
            return session;
        },
        authorized({ auth, request }) {
            // Only enforce auth on /dashboard paths; allow others.
            const path = request.nextUrl.pathname;
            if (path.startsWith('/dashboard')) {
                return !!auth; // redirect handled by middleware wrapper if false
            }
            return true;
        },
    },
});
