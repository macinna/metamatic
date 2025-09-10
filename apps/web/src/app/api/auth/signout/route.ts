import { auth, signOut } from "@/auth";
import { NextResponse } from "next/server";

// Two-step signout: clear local session, then redirect user to Cognito global logout.
export async function GET() {
    // Ensure there is an active session (optional sanity)
    const session = await auth();
    // Always attempt to clear local session
    await signOut({ redirect: false });

    const domain = process.env.COGNITO_HOSTED_UI_DOMAIN; // e.g. https://your-domain.auth.<region>.amazoncognito.com
    const clientId = process.env.AUTH_COGNITO_ID;
    const postLogout = process.env.COGNITO_POST_LOGOUT_REDIRECT_URI || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    if (domain && clientId) {
        // Cognito Hosted UI logout
        const logoutUrl = new URL(`${domain}/logout`);
        logoutUrl.searchParams.set('client_id', clientId);
        logoutUrl.searchParams.set('logout_uri', postLogout);
        return NextResponse.redirect(logoutUrl.toString(), { status: 302 });
    }
    return NextResponse.redirect('/', { status: 302 });
}
