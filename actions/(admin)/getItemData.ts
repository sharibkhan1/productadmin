// lib/getItemData.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';

export interface Ingredient {
  title: string;
  description: string;
}

export interface Item {
  id: string;
  productName: string;
  description: string;
  nutrientScore: string;
  calories: string;
  healthyScore: string;
  category: string;
  quantity: string;
  packaging: string;
  image: string;
  image1: string;
  image2: string;
  image3: string;
  companyName: string;
  ingredients: Ingredient[];
}

export const getItemData = async (id: string): Promise<Item | null> => {
  const itemRef = doc(db, "items", id);
  const docSnap = await getDoc(itemRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Item;
  } else {
    console.log("No such document!");
    return null;
  }
};
