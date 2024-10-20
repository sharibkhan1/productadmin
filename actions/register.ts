"use server";
import { RegisterSchema } from "@/schemas";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/config";
import { v4 as uuidv4 } from 'uuid';

// Define the schema for admin registration
const ExtendedRegisterSchema = RegisterSchema.extend({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long."),
    passwordAgain: z.string().min(6, "Please confirm your password."),
    profileImage: z.string().nullable().optional(), // Optional profile image
    name: z.string().min(1, "Name is required."),
}).refine((data) => data.password === data.passwordAgain, {
    message: "Passwords must match.",
    path: ["passwordAgain"],
});

export const RetailerRegister = async (values: z.infer<typeof ExtendedRegisterSchema>) => {
    const validatedFields = ExtendedRegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, name, profileImage } = validatedFields.data;

    try {
        // Create a user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const companyId = uuidv4(); // Generate a unique company ID

        // Create an admin document in Firestore
        await setDoc(doc(db, "retailers", user.uid), {
            id: user.uid,
            email: user.email,
            name,
            profileImage: profileImage || null, // Set null if profileImage is not provided 
            role: "retailers" // Explicitly set the role here
        });

        return { success: true };
    } catch (error) {
        console.error(`Registration error: ${error}`);
        return { error: "Something went wrong!" };
    }
};
