import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Routes that require specific roles
const protectedRoutes: Record<string, string[]> = {
  "/trainee": ["trainee"],
  "/trainer": ["trainer"],
  "/admin": ["admin"],
  "/api/trainee": ["trainee"],
  "/api/trainer": ["trainer"],
  "/api/admin": ["admin"],
};

// Routes that are always public
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/courses",
  "/api/auth",
  "/api/courses", // public course listing
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow all public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    // But /api/courses POST should be protected (handled in the route itself)
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // No session → return 401 for APIs or redirect to login for pages
  if (!session?.user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = (session.user as any).role;
  const userStatus = (session.user as any).status;

  // Check if user is approved (pending users can't access dashboards)
  if (userStatus !== "approved" && !pathname.startsWith("/api/auth")) {
    // Allow pending users to see the pending page
    if (pathname === "/pending") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/pending", req.nextUrl.origin));
  }

  // Check role-based access
  for (const [routePrefix, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(userRole)) {
        // Wrong role → redirect to their own dashboard
        const redirectUrl =
          userRole === "admin"
            ? "/admin/dashboard"
            : userRole === "trainer"
            ? "/trainer/dashboard"
            : userRole === "trainee"
            ? "/trainee/dashboard"
            : "/login";
        return NextResponse.redirect(new URL(redirectUrl, req.nextUrl.origin));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match everything except static files and _next
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
