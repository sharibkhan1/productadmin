"use server";

import { auth } from "@/app/firebase/config"; // Make sure to import your Firebase auth instance
import { signOut } from "firebase/auth";

export const logout = async () => {
  try {
    await signOut(auth);
    // Optionally, you can add more logic here if needed after sign-out
  } catch (error) {
    console.error("Error signing out: ", error);
    // Handle errors here, e.g., show a notification to the user
  }
};