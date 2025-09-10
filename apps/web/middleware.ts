import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    if (!req.auth) {
        const loginRedirect = new URL('/', req.nextUrl);
        return NextResponse.redirect(loginRedirect);
    }
    return NextResponse.next();
});

export const config = {
    matcher: ["/dashboard/:path*"],
};
