import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from "@/app/firebase/config";

export default {  providers: [
    Credentials({
      async authorize(credentials): Promise<any> {
        console.log("Received credentials:", credentials); // Log credentials

        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            (credentials as any).email || '',
            (credentials as any).password || ''
          );

          if (userCredential.user) {
            return {
              id: userCredential.user.uid,
              email: userCredential.user.email,
            };
          }
          return null;
        } catch (error) {
          console.error("Authorization error: ", error);
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],
} satisfies NextAuthConfig