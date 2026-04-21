import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.API_URL ?? "http://localhost:5000";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Call our .NET API — if login succeeds, we get back the JWT
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) return null;

        const data = await res.json();

        // Return the user object — NextAuth will store this in the JWT cookie
        return {
          id: data.email,
          name: data.name,
          email: data.email,
          accessToken: data.token,  // our .NET JWT
          planName: data.planName,
        };
      },
    }),
  ],

  callbacks: {
    // jwt callback: called when the session token is created or updated
    // We copy our custom fields into the NextAuth token
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.planName = user.planName;
      }
      return token;
    },

    // session callback: called whenever a session is accessed
    // We expose the custom fields to the client via useSession()
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.planName = token.planName;
      return session;
    },
  },

  pages: {
    signIn: "/login",  // redirect here when login is required
  },

  session: {
    strategy: "jwt",  // store session in JWT cookie, not server-side
  },
};
