import { NextResponse, type NextRequest } from "next/server";

// English is served without a prefix by rewriting to /en internally.
// /en/* is redirected to the clean URL so there's one canonical address per page.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/hi" || pathname.startsWith("/hi/")) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|admin|_next|demo|favicon.ico|icon|apple-icon|robots.txt|sitemap.xml|manifest.webmanifest|og|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
