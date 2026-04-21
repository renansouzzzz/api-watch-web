import NextAuth from "next-auth";

// Extends NextAuth's built-in types to include our custom fields
declare module "next-auth" {
  interface Session {
    accessToken: string;  // the JWT from our .NET API
    user: {
      name: string;
      email: string;
      planName: string;
    };
  }

  interface User {
    accessToken: string;
    planName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    planName: string;
  }
}
