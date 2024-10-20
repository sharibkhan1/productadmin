"use client";
import React from 'react';
import RetailerForm from "@/components/reatiler-form/product-form";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useSession } from 'next-auth/react'; // Ensure you import useSession

const Page = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const retailerId = session?.user?.id; // Get the retailer ID from the session

  return (
    <div>
      <RetailerForm />
    </div>
  );
};

export default Page;
