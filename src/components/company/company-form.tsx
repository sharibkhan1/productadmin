// components/company-form.tsx
'use client';

import { useState } from 'react';

export default function CompanyForm({ onSubmit }: { onSubmit: (companyName: string) => void }) {
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim() === '') return;
    onSubmit(companyName);
    setCompanyName(''); // Clear input field after submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Enter company name"
          className="p-2 border rounded"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Create Company
        </button>
      </div>
    </form>
  );
}
