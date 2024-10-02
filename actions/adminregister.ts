"use server";
import { RegisterSchema } from "@/schemas";
import * as z from "zod";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/config";
import { v4 as uuidv4 } from 'uuid'; // Import UUID for unique ID generation

// Define the schema for admin registration
const ExtendedRegisterSchema = RegisterSchema.extend({
    companyName: z.string().min(1, "Company name must be at least 1 character long."),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long."),
    passwordAgain: z.string().min(6, "Please confirm your password."),
    profileImage: z.string().nullable().optional(), // Optional profile image
    name: z.string().min(1, "Name is required."),

}).refine((data) => data.password === data.passwordAgain, {
    message: "Passwords must match.",
    path: ["passwordAgain"],
  });

export const AdminRegister = async (values: z.infer<typeof ExtendedRegisterSchema>) => {
    const validatedFields = ExtendedRegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, name, passwordAgain, profileImage,companyName } = validatedFields.data;

    // Check if passwords match
    if (password !== passwordAgain) {
        return { error: "Passwords do not match!" };
    }
    try {
        // Create a user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const companyId = uuidv4(); // Generate a unique company ID

        // Optionally send an email verification
        // await sendEmailVerification(user);

        // Create an admin document in Firestore
        await setDoc(doc(db, "admins", user.uid), {
            id: user.uid,
            email: user.email,
            name,
            password,// Do not store the password here
            profileImage: profileImage || null, // Set null if profileImage is not provided
            companies: [
                {
                    id: companyId,
                    name: companyName,
                },
            ],        });

        return { success: true };

    } catch (error) {
        // Handle specific Firebase errors
        if (error === "auth/email-already-in-use") {
            return { error: "Email already in use!" };
        } else {
            console.error(`Registration error: ${error}`);
            return { error: "Something went wrong!" };
        }
    }
};
