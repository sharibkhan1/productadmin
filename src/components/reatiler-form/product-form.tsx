'use client';

import React, { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { db } from "@/app/firebase/config";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { useRouter } from 'next/navigation'; // Use this to navigate between pages
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Fetch companies from Firebase (one-time fetch, no need for real-time here)
const fetchCompanies = async () => {
    const companiesCollection = collection(db, "companies");
    const companySnapshot = await getDocs(companiesCollection);
    const companies = companySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
    return companies;
};

// Set up real-time listener for products by company
const fetchProductsByCompany = (companyName: string, setProducts: (products: any[]) => void) => {
    const itemsCollection = collection(db, "items");
    const q = query(itemsCollection, where("companyName", "==", companyName));

    // Real-time listener using onSnapshot
    const unsubscribe = onSnapshot(q, (itemsSnapshot) => {
        const products = itemsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        setProducts(products); // Update state with real-time data
    });

    return unsubscribe; // Return unsubscribe function to clean up listener
};

// Set up real-time listener for categories by company
const fetchCategoriesByCompany = (companyName: string, setCategories: (categories: string[]) => void) => {
    const itemsCollection = collection(db, "items");
    const q = query(itemsCollection, where("companyName", "==", companyName));

    // Real-time listener for categories
    const unsubscribe = onSnapshot(q, (itemsSnapshot) => {
        const categories = Array.from(new Set(itemsSnapshot.docs.map(doc => doc.data().category))); // Unique categories
        setCategories(categories); // Update categories in real-time
    });

    return unsubscribe;
};

export default function ProductListPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const router = useRouter(); // Navigation hook

    // Manage real-time listener subscriptions
    useEffect(() => {
        const loadCompanies = async () => {
            const companiesData = await fetchCompanies();
            setCompanies(companiesData);

            // Check localStorage for selected company and category
            const storedCompany = localStorage.getItem("selectedCompany");
            const storedCategory = localStorage.getItem("selectedCategory");

            if (storedCompany) {
                setSelectedCompany(storedCompany);
                setSelectedCategory(storedCategory || "All");

                // Set up real-time listeners for products and categories
                const unsubscribeProducts = fetchProductsByCompany(storedCompany, setProducts);
                const unsubscribeCategories = fetchCategoriesByCompany(storedCompany, setCategories);

                // Clean up listeners when component unmounts or company changes
                return () => {
                    unsubscribeProducts();
                    unsubscribeCategories();
                };
            }
        };
        loadCompanies();
    }, []);

    // Handle company change with real-time updates
    const handleCompanyChange = async (companyName: string) => {
        setSelectedCompany(companyName);
        setSelectedCategory("All"); // Reset category when company changes

        // Store the selected company in localStorage
        localStorage.setItem("selectedCompany", companyName);
        localStorage.setItem("selectedCategory", "All"); // Reset category in localStorage as well

        // Set up real-time listeners for selected company
        const unsubscribeProducts = fetchProductsByCompany(companyName, setProducts);
        const unsubscribeCategories = fetchCategoriesByCompany(companyName, setCategories);

        // Clean up listeners when component unmounts or company changes
        return () => {
            unsubscribeProducts();
            unsubscribeCategories();
        };
    };

    // Handle category selection
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        localStorage.setItem("selectedCategory", category); // Store the selected category in localStorage
    };

    // Filter products by selected category, or show all if "All" is selected
    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter(product => product.category === selectedCategory);

    const viewProductDetails = (productId: string) => {
        router.push(`/products/${productId}`); // Navigate to product detail page
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Select a Company</h1>

            {/* Company Dropdown */}
            <Select onValueChange={handleCompanyChange} defaultValue={selectedCompany || ""}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                    {companies.map(company => (
                        <SelectItem key={company.id} value={company.name}>
                            {company.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Category Dropdown (active after company is selected) */}
            {selectedCompany && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold mb-4">Select a Category</h2>
                    <Select onValueChange={handleCategoryChange} defaultValue={selectedCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            {categories.map((category, index) => (
                                <SelectItem key={index} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-3 gap-4 mt-8">
                {filteredProducts.map(product => (
                    <Card key={product.id} onClick={() => viewProductDetails(product.id)} className="cursor-pointer">
                        <CardHeader>
                            <img src={product.image1} alt={product.productName} className="w-full h-32 object-cover" />
                        </CardHeader>
                        <CardContent>
                            <CardTitle>{product.productName}</CardTitle>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
