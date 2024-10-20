"use server";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LoginSchema } from "@/schemas";
import { z } from "zod";
import { auth, db } from "@/app/firebase/config";
import { signIn } from "next-auth/react";

// Updated login function
export const Adminlogin = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
    const validatedFields = LoginSchema.safeParse(values);
    
    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password } = validatedFields.data;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const adminDocRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);

        if (!adminDoc.exists()) {
            return { error: "Unauthorized access. Admin privileges required." };
        }

        const adminData = adminDoc.data();
        const companies = adminData.companies || [];
        const companyName = companies.length > 0 ? companies[0].name : null;

        if (!companyName) {
            return { error: "No associated company found." };
        }

        // Set up the session properly
        await signIn("credentials", { email, password, callbackUrl:"/admin" }); // Call NextAuth signIn here
        
        return { success: "Login successful!", companyName, role: adminData.role };

    } catch (error) {
        console.error(error);
        return { error: "Something went wrong!" };
    }
};
