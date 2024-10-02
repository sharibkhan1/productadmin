'use client';

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { db } from "@/app/firebase/config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { companyNames, productCategories } from '@/lib/types';
import { useSession } from 'next-auth/react';

// Product Schema
const ProductSchema = z.object({
    companyName: z.string().nonempty(),
    productName: z.string().nonempty(),
    category: z.string().nonempty(),
    description: z.string().nonempty(),
    ingredients: z.string().nonempty(),
    nutrientsScore: z.number().default(50),
    photo: z.string().nullable(),
});

// Define the ProductFormData type
type ProductFormData = z.infer<typeof ProductSchema>;

export default function ProductForm() {
    const { data: session } = useSession(); // Get session data
    console.log("Session Data:", session);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProductFormData>({
        resolver: zodResolver(ProductSchema),
    });

    const onSubmit = async (data: ProductFormData) => {
        console.log("Submitting form with data:", data);
    
        // Ensure the user is logged in
        if (!session || !session.user) {
            alert("You must be logged in to add a product.");
            return;
        }
    
        const userId = session.user.id;
        if (!userId) {
            alert("User ID not found in session. Please log in again.");
            return;
        }
    
        const productData = {
            CompanyName: data.companyName,
            ProductName: data.productName,
            Details: {
                Category: data.category,
                Description: data.description,
                NutrientsScore: data.nutrientsScore,
                Photo: data.photo || "",
            },
        };
    
        const userRef = doc(db, "retailers", userId);
    
        try {
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log("User Data:", userData);
    
                // Check if Products array exists and prepare for update
                const existingProducts = userData.Products || [];
                const updatedProducts = Array.isArray(existingProducts) ? [...existingProducts, productData] : [productData];
    
                await updateDoc(userRef, {
                    Products: updatedProducts,
                });
                
                alert("Product added successfully!");
            } else {
                alert("User document not found!");
            }
        } catch (error) {
            console.error("Error adding product: ", error);
            alert("Failed to add product.");
        }
    };
    

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 bg-slate-800">
            <Select 
                onValueChange={(value) => setValue("companyName", value)} 
                defaultValue=""
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                    {companyNames.map((company) => (
                        <SelectItem key={company.value} value={company.value}>
                            {company.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {errors.companyName && <p>{errors.companyName.message}</p>}

            <Input {...register("productName")} placeholder="Product Name" />
            {errors.productName && <p>{errors.productName.message}</p>}

            <Select 
                onValueChange={(value) => setValue("category", value)} 
                defaultValue=""
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                    {productCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                            {category.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {errors.category && <p>{errors.category.message}</p>}

            <Input {...register("description")} placeholder="Description" />
            {errors.description && <p>{errors.description.message}</p>}

            <Input {...register("ingredients")} placeholder="Ingredients" />
            {errors.ingredients && <p>{errors.ingredients.message}</p>}

            <Input {...register("photo")} placeholder="Photo URL (optional)" />
            {errors.photo && <p>{errors.photo.message}</p>}

            <Button type="submit">Add Product</Button>
        </form>
    );
}
