"use client";
import { db } from "@/app/firebase/config";
import StockList from "@/components/reatiler-form/stock-list";
import { Button } from "@/components/ui/button";
import { doc, getDoc } from "firebase/firestore";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';


export default function Home() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const retailerId = session?.user?.id; // This assumes you have set up dynamic routes correctly

  const router = useRouter();


  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      if (session?.user?.id) {
        // Fetch only from the "retailers" collection
        const retailerDocRef = doc(db, "retailers", session.user.id);
        const retailerDoc = await getDoc(retailerDocRef);

        if (retailerDoc.exists()) {
          // Only store retailer data in state
          setUserData(retailerDoc.data()); // Cast to UserData
        } else {
          console.error("No such retailer document!");
        }
      }
      setLoading(false);

    };

    // Only fetch user data if the user is authenticated
    if (status === "authenticated") {
      fetchUserData();
    }
  }, [session, status]);

  const AddProduct=()=>{
     router.push("/retailer-item")
  }

  return (
    <div className="p-8 bg-slate-800">
      {userData ? (
          <p>{userData.name}</p>
      ) : (
        <div>No user data found.</div>
      )}
      <Button onClick={AddProduct}  >
       + Add Product
      </Button>
      {userData && userData.stocks && userData.stocks.length > 0 ? (
  <StockList stocks={userData.stocks} userId={session?.user.id} /> // Pass userId
) : (
        <div>No stocks available.</div>
      )}    </div>
  );
}

Home.requireAuth = true;
