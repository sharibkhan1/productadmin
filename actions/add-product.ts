// app/actions/create-product.ts
"use server";

import { db } from "@/app/firebase/config";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import { z } from "zod";

const ProductSchema = z.object({
  companyId: z.string(),
  productName: z.string().min(1, "Product name is required"),
  image: z.string().url("Must be a valid URL"),
  description: z.string().min(1, "Description is required"),
  nutrientScore: z.number().min(0, "Nutrient score must be non-negative"),
  category: z.string().min(1, "Category is required"),
});

export async function createProduct(productData: {
  companyId: string;
  productName: string;
  image: string;
  description: string;
  nutrientScore: number;
  category: string;
}) {
  const parsedData = ProductSchema.safeParse(productData);

  if (!parsedData.success) {
    return { error: "Invalid data", details: parsedData.error.format() };
  }

  try {
    // Create the product document in Firestore
    const productRef = await addDoc(collection(db, "products"), {
      ...parsedData.data,
    });

    // Create a product object with ID and name
    const newProductData = {
      id: productRef.id,
      name: parsedData.data.productName,
    };

    // Update the company's products array to include the new product data
    const companyRef = doc(db, "companies", parsedData.data.companyId);
    const companyDoc = await getDoc(companyRef);

    // Check if company document exists and products array is initialized
    if (companyDoc.exists()) {
      const companyData = companyDoc.data();
      const existingProducts = companyData?.products || []; // Default to empty array if products not found

      await updateDoc(companyRef, {
        products: [...existingProducts, newProductData],
      });
    } else {
      return { error: "Company does not exist" };
    }

    return { success: true, productId: productRef.id };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Failed to create product" };
  }
}
