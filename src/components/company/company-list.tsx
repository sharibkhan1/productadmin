// components/company-list.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';

export default function CompanyList({ adminId, updateFlag, setUpdateFlag }: { adminId: string; updateFlag: boolean; setUpdateFlag: (value: boolean) => void }) {
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchCompanies = async () => {
    setLoading(true);
    const q = query(collection(db, "companies"), where("adminId", "==", adminId));
    const querySnapshot = await getDocs(q);
    const companyList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().companyName
    }));
    setCompanies(companyList);
    setLoading(false);
    
    // Reset the update flag after fetching
    setUpdateFlag(false);
  };

  useEffect(() => {
    if (adminId) {
      fetchCompanies();
    }
  }, [adminId, updateFlag]); // Trigger fetching whenever adminId or updateFlag changes

  const handleRename = async (companyId: string, newName: string) => {
    const companyRef = doc(db, "companies", companyId);
    const adminRef = doc(db, "admins", adminId);

    await updateDoc(companyRef, { companyName: newName });

    // Update the corresponding entry in the admin's companies array
    await updateDoc(adminRef, {
      companies: arrayRemove({ id: companyId, name: companies.find(company => company.id === companyId)?.name }),
    });

    // Add the renamed company back to the admin's companies array
    await updateDoc(adminRef, {
      companies: arrayUnion({ id: companyId, name: newName }),
    });

    // Refresh the company list after renaming
    fetchCompanies();
  };

  const handleDelete = async (companyId: string) => {
    const companyRef = doc(db, "companies", companyId);
    const adminRef = doc(db, "admins", adminId);

    await deleteDoc(companyRef);

    // Remove the corresponding entry from the admin's companies array
    await updateDoc(adminRef, {
      companies: arrayRemove({ id: companyId, name: companies.find(company => company.id === companyId)?.name }),
    });

    // Refresh the company list after deletion
    fetchCompanies();
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-white">Your Companies</h2>
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {companies.map(company => (
            <li key={company.id} className="p-2 bg-gray-700 rounded flex justify-between items-center">
               <span 
                className="cursor-pointer text-blue-400"
                onClick={() => router.push(`/company/${company.id}`)} // Navigate to company details page
              >
                {company.name}</span>
              <div className="space-x-2">
                <button 
                  onClick={() => {
                    const newName = prompt('Enter new company name', company.name);
                    if (newName) handleRename(company.id, newName);
                  }} 
                  className="text-blue-400"
                >
                  Rename
                </button>
                <button 
                  onClick={() => handleDelete(company.id)} 
                  className="text-red-400"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
