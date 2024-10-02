// types.d.ts

import NextAuth from "next-auth";

// Define your user type
declare module "next-auth" {
  interface User {
    id: string; // Assuming you have an ID field
    email: string; // Add any other fields as necessary
  }

  interface Session {
    user: User;
  }
}
