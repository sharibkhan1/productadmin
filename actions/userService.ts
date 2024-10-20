// userService.ts
import { db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const fetchUserData = async (userId: string) => {
  if (!userId) return null;

  try {
    const retailerDocRef = doc(db, "admins", userId);
    const retailerDoc = await getDoc(retailerDocRef);

    if (retailerDoc.exists()) {
      return retailerDoc.data();
    } else {
      console.error("No such retailer document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const updateUserData = async (userId: string, data: { name: string; profileImage: string }) => {
  if (!userId) throw new Error("User ID not provided");

  const userDocRef = doc(db, "admins", userId);

  try {
    await updateDoc(userDocRef, data);
  } catch (err) {
    console.error("Error updating profile:", err);
    throw err;
  }
};
