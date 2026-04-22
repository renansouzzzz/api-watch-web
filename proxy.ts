import { withAuth } from "next-auth/middleware";

// Protects routes — redirects to /login if the user has no valid session
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Apply only to these routes — login, register, and pricing remain public
export const config = {
  matcher: ["/", "/dashboard/:path*", "/billing"],
};
