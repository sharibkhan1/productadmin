// app/actions/create-company.ts
"use server";

import { db } from "@/app/firebase/config";
import { collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { z } from "zod";

const CompanySchema = z.object({
  adminId: z.string(),
  companyName: z.string().min(1, "Company name is required"),
});

export async function createCompany(adminId: string, companyName: string) {
  const parsedData = CompanySchema.safeParse({ adminId, companyName });

  if (!parsedData.success) {
    return { error: "Invalid data" };
  }

  // Check for existing company name
  const q = query(collection(db, "companies"), where("companyName", "==", parsedData.data.companyName));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return { error: "Company name must be unique" };
  }

  try {
    // Create the company document
    const companyDoc = await addDoc(collection(db, "companies"), {
      companyName: parsedData.data.companyName,
      adminId: parsedData.data.adminId,
      products: [] // Initialize with an empty product array
    });

    // Update the admin's document to include the new company
    const adminRef = doc(db, "admins", parsedData.data.adminId);
    await updateDoc(adminRef, {
      companies: arrayUnion({ id: companyDoc.id, name: parsedData.data.companyName }) // Append new company
    });

    return { success: true, companyId: companyDoc.id };

  } catch (error) {
    console.error("Error creating company:", error);
    return { error: "Failed to create company" };
  }
}
