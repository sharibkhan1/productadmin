"use server";

import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LoginSchema } from "@/schemas";
import { z } from "zod";
import { auth, db } from "@/app/firebase/config";

// Updated login function
export const Adminlogin = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
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
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);

        if (!adminDoc.exists()) {
            // If the user does not exist, return an error
            return { error: "Unauthorized access. Admin privileges required." };
        }
        
        const adminData = adminDoc.data();
        
        // Now access the company as a single object
        const companies = adminData.companies || [];
        const companyName = companies.length > 0 ? companies[0].name : null;
        
        if (!companyName) {
            return { error: "No associated company found." };
        }
        // Return success response with company name
        return { success: "Login successful!", companyName };

    } catch (error) {
        if (error === "auth/wrong-password") {
            return { error: "Invalid credentials!" };
        } else {
            console.error(error);
            return { error: "Something went wrong!" };
        }
    }
};

