import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "pagepal_session";
const PUBLIC_ROUTES = new Set(["/", "/login", "/register", "/forgot-password"]);

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!hasSession && !isPublicRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    const nextPath = `${pathname}${search}`;
    if (nextPath !== "/") {
      loginUrl.searchParams.set("next", nextPath);
    }

    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
