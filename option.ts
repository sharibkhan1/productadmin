import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from "@/app/firebase/config"; // Ensure you import your Firestore db
import GoogleProvider from "next-auth/providers/google";
import { getDoc, doc } from "firebase/firestore"; // Import Firestore functions

export const { handlers:{ GET, POST } } = NextAuth({ 
     pages: {
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
            };
          }
          return null;
        } catch (error) {
          console.error("Authorization error: ", error);
          throw new Error("Invalid email or password");          return null; // Ensure to return null on failure
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

        // Fetch role from Firestore
        const userDocRef = doc(db, "admins", token.sub); // Attempt to get the admin
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          token.role = userDoc.data().role; // Assign role from admin document
        } else {
          // If not an admin, check retailer
          const retailerDocRef = doc(db, "retailers", token.sub);
          const retailerDoc = await getDoc(retailerDocRef);

          if (retailerDoc.exists()) {
            token.role = retailerDoc.data().role; // Assign role from retailer document
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add id and role from token to session user
      if (token.sub) {
        session.user.id = token.sub;
      }
      if (token.role) {
        session.user.role = token.role; // Include the role in session
      }
      return session;
    },
  },
});

// types.d.ts