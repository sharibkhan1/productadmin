// app/actions/fetch-companies.ts
"use server";

import { db } from "@/app/firebase/config";
import { collection, getDocs , query, where } from "firebase/firestore";

export async function fetchCompanies() {
  const companiesSnapshot = await getDocs(collection(db, "companies"));
  return companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function fetchProductsByCompany(companyId: string) {
    const productsQuery = query(collection(db, "products"), where("companyId", "==", companyId));
    const productsSnapshot = await getDocs(productsQuery);
    return productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }