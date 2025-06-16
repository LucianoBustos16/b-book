import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

// Define routes that should be public (not require authentication)
// For now, we'll assume only the root (editor page) needs protection.
// If there were specific auth pages like /sign-in, /sign-up, they'd be public.
const isPublicRoute = createRouteMatcher([
  // Add any public routes here, e.g., '/sign-in', '/sign-up'
  // We will create dedicated pages for these later if needed by Clerk's components.
]);

export default clerkMiddleware((auth, context) => {
  if (!isPublicRoute(context.request)) {
    // If the route is not public, protect it.
    // This will redirect unauthenticated users to the Clerk sign-in page.
    return auth().protect();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _astro (internal Astro files)
     * - static (public static files)
     * - favicon.ico (favicon)
     * - robots.txt (robots file)
     * - sitemap-index.xml (sitemap)
     * Feel free to add more exceptions here.
     */
    "/((?!api|_astro|static|favicon.ico|robots.txt|sitemap-index.xml).*)",
  ],
};
