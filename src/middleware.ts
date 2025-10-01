import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const refreshToken = req.cookies.get('refresh_token')?.value;

    const isAuthPage =
        pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

    if (refreshToken) {
        if (isAuthPage || pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        return NextResponse.next();
    }

    if (!refreshToken) {
        if (
            !isAuthPage &&
            !pathname.startsWith('/_next') &&
            !pathname.startsWith('/public')
        ) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
