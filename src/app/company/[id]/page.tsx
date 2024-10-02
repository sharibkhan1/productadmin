// app/company/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/app/firebase/config';

interface Company {
  companyId: string;
  companyName: string;
  products: { id: string; name: string }[]; // Updated to reflect products as objects with id and name
}

interface ProductDetails {
  productName: string;
  image: string;
  description: string;
  nutrientScore: number;
  category: string;
}

export default function CompanyDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params; // Get company ID from route parameters

  const [company, setCompany] = useState<Company | null>(null);
  const [newProduct, setNewProduct] = useState<ProductDetails>({
    productName: '',
    image: '',
    description: '',
    nutrientScore: 0,
    category: ''
  });

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      const companyDoc = doc(db, 'companies', id);
      const docSnap = await getDoc(companyDoc);

      if (docSnap.exists()) {
        const companyData = { ...docSnap.data(), companyId: id } as Company;
        setCompany(companyData);
      } else {
        console.log('No such company!');
      }
    };

    fetchCompanyDetails();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleNutrientScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setNewProduct((prev) => ({ ...prev, nutrientScore: isNaN(value) ? 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company) return;

    // Create a new product in Firestore using addDoc
    const productsRef = collection(db, 'products');
    const newProductRef = await addDoc(productsRef, {
      ...newProduct,
      companyId: company.companyId,
    });

    // Create a product object with ID and name
    const newProductData = {
      id: newProductRef.id,
      name: newProduct.productName, // Using the product name from the form
    };

    // Update the company's products array to include the new product data
    await updateDoc(doc(db, 'companies', company.companyId), {
      products: [...company.products, newProductData],
    });

    // Clear the form
    setNewProduct({
      productName: '',
      image: '',
      description: '',
      nutrientScore: 0,
      category: ''
    });

    // Optionally redirect or show a success message
    router.push(`/company/${company.companyId}`);
  };

  if (!company) return <p>Loading...</p>;

  return (
    <div>
      <h1>{company.companyName} - Add Product</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="productName">Product Name:</label>
          <input
            type="text"
            name="productName"
            value={newProduct.productName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="image">Image URL:</label>
          <input
            type="text"
            name="image"
            value={newProduct.image}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            name="description"
            value={newProduct.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="nutrientScore">Nutrient Score:</label>
          <input
            type="number"
            name="nutrientScore"
            value={newProduct.nutrientScore}
            onChange={handleNutrientScoreChange}
            required
          />
        </div>
        <div>
          <label htmlFor="category">Category:</label>
          <input
            type="text"
            name="category"
            value={newProduct.category}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Add Product</button>
      </form>

      <h2>Products in {company.companyName}</h2>
      <ul>
        {company.products.map((product) => (
          <li key={product.id}>
            {product.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
