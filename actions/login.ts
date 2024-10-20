"use server";

import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LoginSchema } from "@/schemas";
import { z } from "zod";
import { auth, db } from "@/app/firebase/config";
import { signIn } from "next-auth/react";

// Updated login function
export const login = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password } = validatedFields.data;

    try {
        // Attempt to sign in with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // After successful login, check if user already exists in Firestore
        const retailerDocRef = doc(db, "retailers", user.uid);
        const retailerDoc = await getDoc(retailerDocRef);
        if (!retailerDoc.exists()) {
            return { error: "User does not exist in Firestore!" };
        }

        // Sign in the user with NextAuth
        const result = await signIn('credentials', {
            email,
            password,
            callbackUrl: "/retailers",
        });
        if (result?.error) {
            return { error: result.error }; // Return NextAuth error
        }
        // Returning the callbackUrl to redirect after successful login
        return { success: "Login successful!", callbackUrl: "/retailers" };
    } catch (error) {
        if (error === "auth/wrong-password") {
            return { error: "Invalid credentials!" };
        } else {
            console.error(error);
            return { error: "Something went wrong!" };
        }
    }
};
