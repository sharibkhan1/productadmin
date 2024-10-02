"use server";
import { RegisterSchema } from "@/schemas";
import * as z from "zod";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/app/firebase/config";

// Define the Product schema allowing null values
const ProductSchema = z.object({
    CompanyName: z.string().nullable(), // Company name can be null
    ProductName: z.string().nullable(), // Product name can be null
    Details: z.object({
        Category: z.string().nullable(),         // Category can be null
        Description: z.string().nullable(),      // Description can be null
        NutrientsScore: z.string().nullable(),   // Nutrients score can be null
        Photo: z.string().nullable(),             // Photo can be null
    }).nullable(), // Details can be null
}).nullable(); // ProductSchema itself can be null


export const RegisterSchemaa = z.object({
    email: z.string().email({ message: 'Incorrect email format' }),
    password: z
        .string()
        .min(8, { message: 'Your password must be at least 8 characters long' })
        .max(64, { message: 'Your password cannot be longer than 64 characters long' })
        .refine((value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''), 'Password should contain only alphabets and numbers'),
    passwordAgain: z
        .string()
        .min(8, { message: 'Your password must be at least 8 characters long' })
        .max(64, { message: 'Your password cannot be longer than 64 characters long' })
        .refine((value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''), 'Password should contain only alphabets and numbers'),
        Products: z.array(ProductSchema).default([]), // Products is optional
    });

// Update the RegisterSchema to include the new fields
export const ExtendedRegisterSchema = z.object({
    email: z.string().email({ message: 'Invalid email' }),
    password: z.string().min(8, { message: 'Password too short' }),
    passwordAgain: z.string().min(8, { message: 'Password too short' }),
    profileImage: z.string().nullable().optional(),
    Products: z.array(ProductSchema).default([]), // Assuming ProductSchema is defined correctly
  }).refine(data => data.password === data.passwordAgain, {
    message: "Passwords don't match",
    path: ["passwordAgain"], // show error at passwordAgain field
  });

export const Register = async (values: z.infer<typeof ExtendedRegisterSchema>) => {
    const validatedFields = ExtendedRegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" , success: null };
    }

    const { email, password, name, profileImage, Products } = validatedFields.data;

    try {
        // Hash the password

        // Create a user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create a user document in Firestore
        await setDoc(doc(db, "retailers", user.uid), {
            id: user.uid,
            email: user.email,
            name: email.split('@')[0],
            password,  // Storing the plaintext password here for testing
            profileImage: profileImage || null, // Explicitly set null if not provided
            Products: Products, // Include the products in the Firestore document
        });
        return { error: null, success: "User registered successfully!" };

    } catch (error) {
        let errorMessage = "Something went wrong!";
        if (error === "auth/email-already-in-use") {
            errorMessage = "Email already in use!";
        } else if (error === "auth/weak-password") {
            errorMessage = "Password should be at least 6 characters!";
        }
        console.error(`Registration error: ${error}`);
        return { error: errorMessage };
    }
};
