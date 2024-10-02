// app/page.tsx or wherever your Home component is
"use client";
import RetailerForm from "@/components/product-form";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Home() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  return (
    <div className="p-8 bg-slate-800">
      <p>Retailers</p>
      <div className='text-white'>{session?.data?.user?.email}</div>
      <button className='text-white' onClick={() => signOut()}>Logout</button>
      <RetailerForm/>
    </div>
  );
}

Home.requireAuth = true;
