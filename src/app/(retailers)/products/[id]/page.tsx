"use client";
import { useEffect, useState } from 'react';
import { db } from '@/app/firebase/config';
import { doc, getDoc, deleteDoc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit, Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from "@/components/ui/dialog"; 
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { productCategories } from '@/lib/types';

interface Ingredient {
  title: string;
  description: string;
}

interface Item {
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
  image1: string; // Additional image field for first ingredient image
  image2: string; // Additional image field for second ingredient image
  image3: string; // Additional image field for third ingredient image
  companyName: string;
  ingredients: Ingredient[]; // Array of ingredients
}

export default function ItemDetailsPage() {
    const { data: session } = useSession();

  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Item | null>(null);
  const [open, setOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null); // State for zoomed image
  const [stockQuantity, setStockQuantity] = useState<number>(0); // State to store quantity to add
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);

  const getBarColor = (value: number) => {
    if (value > 70) return '#4CAF50'; // Green for values above 70
    if (value >= 30 && value <= 70) return '#FFC107'; // Yellow for values between 30 and 70
    return '#F44336'; // Red for values below 30
  };

  const graphData = [
    {
      name: 'Healthy Score',
      value: Number(item?.healthyScore || 0),
    },
    {
      name: 'Nutrient Score',
      value: Number(item?.nutrientScore || 0),
    },
    {
      name: 'Calories',
      value: Number(item?.calories || 0),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const itemRef = doc(db, "items", id as string);
        const docSnap = await getDoc(itemRef);
        if (docSnap.exists()) {
          setItem({ id: docSnap.id, ...docSnap.data() } as Item);
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchData();
  }, [id]);

  const handleAddToStock = async () => {
    if (!session?.user?.id || !item?.productName) return;
    const retailerRef = doc(db, "retailers", session.user.id);
    
    await updateDoc(retailerRef, {
        stocks: arrayUnion({
            companyName: item.companyName,
            productName: item.productName,
            productCategories:item.category,
            numberOfItems: stockQuantity,
            productImage:item.image1,
            id:item.id,
          }),
    });

    console.log(`${stockQuantity} added to stock for ${item?.productName}`);
    setStockQuantity(0); // Reset the stock quantity after adding
    setOpenRemoveDialog(false); // Close dialog after action

  };

  // Function to handle removing stock
  const handleRemoveFromStock = async () => {
    if (!session?.user?.id || !item?.productName) return;
    const retailerRef = doc(db, "retailers", session.user.id);

    const retailerSnap = await getDoc(retailerRef);
    if (retailerSnap.exists()) {
      const retailerData = retailerSnap.data();
      const updatedStocks = retailerData.stocks.filter((stock: { companyName: string; productName: string; }) => 
        stock.companyName !== item.companyName || 
        stock.productName !== item.productName
      );
  
      await updateDoc(retailerRef, { stocks: updatedStocks });
    console.log(`Stock for ${item?.productName} removed`);
    setOpenRemoveDialog(false); // Close dialog after action

  }
  };
  
  if (!item) return <p className="text-white">Loading...</p>;

  return (
    <main className="flex w-full h-auto flex-col items-center">
      <section
        className="h-full w-full flex flex-col justify-between"
        style={{
          backgroundImage: "radial-gradient(125% 125% at 80% 10%, white 60%, #FFC83A)",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="dark:bg-grid-white/[0.04] bg-grid-black/[0.04] w-full h-full flex flex-col justify-between">
          <div className="absolute top-4 right-4">
          </div>
          <div className="absolute top-4 right-40">
          </div>
          <div className='flex flex-col justify-center mt-[10rem] h-full p-14'>
            <div className='flex flex-row items-start justify-around'>
              <div className='flex flex-col items-start max-w-[40rem]'>
                <h1 className="text-5xl font-bold mb-5">{item.productName}</h1>
                <h1 className="text-2xl mb-11">{item.description}</h1>
              </div>
              <div className="flex flex-row relative mb-24">
                <div className="relative overflow-hidden cursor-pointer" onClick={() => { setIsZoomed(true); setZoomedImage(item.image1); }}>
                  <Image
                    src={item?.image1 || '/placeholder.jpg'}
                    alt={item?.productName || 'Item Image'}
                       height="300"
                      width="300"
                    objectFit="cover"
                    className=" object-contain rounded-2xl group-hover/card:shadow-xl"
                  />
                </div>
                <div className="relative overflow-hidden cursor-pointer ml-10" onClick={() => { setIsZoomed(true); setZoomedImage(item.image2); }}>
                  <Image
                    src={item?.image2 || '/placeholder.jpg'}
                    alt={item?.productName || 'Ingredient Image 3'}
                      height="300"
                      width="300"
                    objectFit="cover"
                    className="rounded-2xl"
                  />
                </div>

                <AnimatePresence>
                  {isZoomed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="fixed top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
                      onClick={() => { setIsZoomed(false); setZoomedImage(null); }} // Close zoom on click outside
                    >
                      <motion.div className="relative w-1/2 h-1/2 overflow-hidden">
                        <Image
                          src={zoomedImage || '/placeholder.jpg'}
                          alt={item?.productName || 'Zoomed Image'}
                          layout="fill"
                          objectFit="contain"
                          className="rounded-2xl shadow-lg"
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex space-x-4 mt-8">
              {/* Add to Stock Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Add to Stock</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to Stock</DialogTitle>
                    <DialogDescription>
                      Enter the number of items to add to the stock.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    placeholder="Enter quantity"
                    className="mt-4"
                  />
                  <Button onClick={handleAddToStock} className="mt-4">
                    Add to Stock
                  </Button>
                </DialogContent>
              </Dialog>

              {/* Remove from Stock Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Remove from Stock</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will remove the product from stock. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveFromStock}>Remove</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Ingredients Section */}
            <div className="bg-[#76B2E4] rounded-3xl border-b-[0.2rem] border-t-[0.2rem] border-black shadow-lg p-6 mb-6">
  <h2 className="text-3xl font-bold mb-4">Ingredients</h2>
  <div className="flex">
  <div className="flex-1">
  {item.ingredients.map((ingredient, index) => (
    <div key={index}>
      <div className="flex items-center justify-between max-w-[70%] flex-row mb-3">
        <h3 className="text-lg font-semibold">{ingredient.title}</h3>
        <p>{ingredient.description}</p>
      </div>
      {/* Divider line after each ingredient */}
      <div className='h-1 w-full border-black border-t-[0.1rem]' />
    </div>
  ))}
</div>

    {/* Image for the ingredient, placed outside the map function */}
    <div className="relative cursor-pointer overflow-hidden ml-4" onClick={() => { setIsZoomed(true); setZoomedImage(item.image3); }}>
      <Image
        src={item.image3 || '/placeholder.jpg'} // Use image2
        alt="Ingredient Image"
                              height="200"
                      width="200"
        objectFit="cover"
        className="rounded-md" // Optional styling
      />
    </div>
  </div>
</div>

            <div className="grid text-lg p-8 border-b-[0.2rem] border-t-[0.2rem] border-black bg-[#76B2E4] md:grid-cols-3 grid-cols-2 gap-4 rounded-tl-none rounded-3xl w-full mb-4">
              <p><strong>Category: </strong> {item.category}</p>
              <p><strong>Quantity: </strong> {item.quantity}</p>
              <p><strong>Calories: </strong> {item.calories}</p>
              <p><strong>Nutrient Score: </strong> {item.nutrientScore}</p>
              <p><strong>Healthy Score: </strong> {item.healthyScore}</p>
              <p><strong>Packaging: </strong> {item.packaging}</p>
            </div>

            <section className="w-full border-r-[0.2rem] border-l-[0.2rem] border-black bg-white rounded-xl mt-8">
            <div className="dark:bg-grid-white/[0.04] p-14 bg-dot-black/[0.2] w-full h-full flex flex-col justify-between">

        <h2 className="text-3xl font-bold mb-6 flex mt-8 text-center">Product Scores</h2>
        <ResponsiveContainer width="50%" height={600}>
          <BarChart data={graphData}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value">
              {graphData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
              ))}
            </Bar>          </BarChart>
        </ResponsiveContainer>
        </div>
</section>

          </div>
        </div>
      </section>
    </main>
  );
}
