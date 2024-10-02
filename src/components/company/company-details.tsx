import React from 'react';
import ItemList from '@/components/item-list/item-lists'; // Adjust path if needed

interface CompanyDetailsProps {
  company: { id: string; name: string } | null;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company }) => {
  return (
    <div className='min-h-[40rem]'>
      {company ? (
        <div className="text-white mt-4">
          <ItemList companyName={company.name} /> {/* Pass companyName as prop */}
        </div>
      ) : (
        <div className="text-white text-xl mt-4">
          To use this features add some Products 
        </div>
      )}
    </div>
  );
};

export default CompanyDetails;


