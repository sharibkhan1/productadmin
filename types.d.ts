// types.d.ts

import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

// Define your user type with role

export type ExtendedUser = DefaultSession["retailer"]&{
  role: 'admin' | 'retailer'; // Make role optional
  id: string; // Include ID

}
declare module "next-auth" {
  interface Session {
    user: ExtendedUser; // Ensure session has the user type defined
  }
}
