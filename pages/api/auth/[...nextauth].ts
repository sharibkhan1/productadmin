import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "@/app/firebase/config";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  pages: {
    signIn: '/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials): Promise<any> {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            (credentials as any).email || '',
            (credentials as any).password || ''
          );

          if (userCredential.user) {
            return {
              id: userCredential.user.uid, // Use uid here
              email: userCredential.user.email,
            }
          }
          return null;
        } catch (error) {
          console.error(error);
          return null; // Ensure to return null on failure
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
        // If user exists, add the id to the token
        if (user) {
            token.sub = user.id; // Ensure user.id is present in your user model
        }
        return token;
    },
    async session({ session, token }) {
        // Add id from token to session user
        if (token.sub) {
          session.user.id = token.sub;
        }     
        return session;
    },
}
};

export default NextAuth(authOptions);
