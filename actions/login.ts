"use server";

import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LoginSchema } from "@/schemas";
import { z } from "zod";
import { auth, db } from "@/app/firebase/config";

// Updated login function
export const login = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, code } = validatedFields.data;

    try {
        // Attempt to sign in with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // After successful login, check if user already exists in Firestore
        const userDocRef = doc(db, "retailers", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // If the user does not exist, create a new user document
            await setDoc(userDocRef, {
                id: user.uid,
                email: user.email,
                name: user.displayName || "Unnamed User", // Include user's name
            });
        }

        // Returning the callbackUrl to redirect after successful login
        return { success: "Login successful!", callbackUrl: "/retialers" || "/" };

    } catch (error) {
        if (error === "auth/wrong-password") {
            return { error: "Invalid credentials!" };
        } else {
            console.error(error);
            return { error: "Something went wrong!" };
        }
    }
};
