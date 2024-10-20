"use client";
import { useEffect, useState } from 'react';
import { db } from "@/app/firebase/config";
import { collection, doc, onSnapshot, updateDoc, arrayRemove } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaceholdersAndVanishInput } from '../ui/placeholders-and-vanish-input';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface StockItem {
  id: string;
  productName: string;
  companyName: string;
  productCategories: string;
  numberOfItems: number;
  productImage: string;
}

interface StockListProps {
  stocks: StockItem[];
  userId: string; // Pass the userId to identify which retailer to update
}

const StockList: React.FC<StockListProps> = ({ userId }) => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockItem[]>([]);
  const [companyNames, setCompanyNames] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Set up Firestore listener for real-time updates
    const retailerRef = doc(db, "retailers", userId);
    const unsubscribe = onSnapshot(retailerRef, (doc) => {
      const data = doc.data();
      if (data && data.stocks) {
        setStocks(data.stocks);
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    // Extract unique company names and categories from the stocks
    const uniqueCompanies = Array.from(new Set(stocks.map(stock => stock.companyName)));
    const uniqueCategories = Array.from(new Set(stocks.map(stock => stock.productCategories)));
    
    setCompanyNames(uniqueCompanies);
    setCategories(uniqueCategories);
  }, [stocks]);

  useEffect(() => {
    const filtered = stocks.filter(stock => {
      const matchesCompany = companyFilter === "all" || stock.companyName === companyFilter;
      const matchesCategory = categoryFilter === "all" || stock.productCategories === categoryFilter;
      const matchesSearch = stock.productName.toLowerCase().includes(searchInput.toLowerCase());
      
      return matchesCompany && matchesCategory && matchesSearch;
    });
    
    setFilteredStocks(filtered);
  }, [companyFilter, categoryFilter, searchInput, stocks]);

  // Function to handle removing stock
  const handleRemoveFromStock = async () => {
    if (!userId || !selectedStock) return;

    const retailerRef = doc(db, "retailers", userId);
    await updateDoc(retailerRef, {
      stocks: arrayRemove(selectedStock),
    });
    setSelectedStock(null); // Reset selected stock
    setOpenDeleteDialog(false); // Close dialog after action
  };

  // Function to handle updating stock quantity
  const handleUpdateStock = async () => {
    if (!userId || !selectedStock) return;

    const retailerRef = doc(db, "retailers", userId);

    // Update the stock in Firestore
    const updatedStocks = stocks.map(stock => 
      stock.id === selectedStock.id ? { ...stock, numberOfItems: stockQuantity } : stock
    );
    
    await updateDoc(retailerRef, { stocks: updatedStocks });
    
    setOpenUpdateDialog(false); // Close dialog after action
    setSelectedStock(null); // Reset selected stock
  };

  // Function to reset filters and search input
  const resetFilters = () => {
    setCompanyFilter("all");
    setCategoryFilter("all");
    setSearchInput("");
    setFilteredStocks(stocks); // Reset filtered stocks to original list
  };

  return (
    <div className="pt-14 pb-14 bg-[#76B2E4] border-black border-l-[0.3rem] border-r-[0.3rem] rounded-[3rem]">
      <div className="pl-14 pr-14 dark:bg-grid-white/[0.04] bg-grid-black/[0.04] w-full h-full flex flex-col justify-between">
        <h1 className="text-white text-[2.5rem] mr-11 font-semibold p-6">Stock List</h1>
        
        {/* Search Input and Refresh Button */}
        <div className="flex items-center">
          <PlaceholdersAndVanishInput
            placeholders={['Search by product name...']}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCompanyFilter("all");
              setCategoryFilter("all");
            }}
            onSubmit={(e) => {
              e.preventDefault();
              // No need for additional submission logic
            }} 
          />
          <Button onClick={resetFilters} className="ml-4">Refresh</Button>
        </div>

        {/* Dropdown for filtering by company */}
        <Select onValueChange={setCompanyFilter} defaultValue="all">
          <SelectTrigger className="hover:shadow-none w-[180px] border-2 border-black dark:border-white uppercase bg-[#76B2E4] text-black">
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {companyNames.map((companyName, index) => (
              <SelectItem key={index} value={companyName}>{companyName}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Dropdown for filtering by category */}
        <Select onValueChange={setCategoryFilter} defaultValue="all">
          <SelectTrigger className="ml-5 hover:shadow-none w-[180px] border-2 border-black dark:border-white uppercase bg-[#76B2E4] text-black">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((category, index) => (
              <SelectItem key={index} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Display filtered stocks */}
        <ul className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 gap-10">
          {filteredStocks.map(stock => (
            <li key={stock.id} className="bg-white p-4 rounded-lg shadow-lg relative">
              <button 
                onClick={() => {
                  setSelectedStock(stock);
                  setOpenDeleteDialog(true);
                }} 
                className="absolute top-2 right-2 text-red-600"
              >
                🗑️
              </button>
              <img src={stock.productImage} alt={stock.productName} className="w-full h-32 object-cover rounded-md" />
              <h2 className="font-semibold mt-2">{stock.productName}</h2>
              <p>{stock.companyName}</p>
              <p>Category: {stock.productCategories}</p>
              <p>
                Items Available: 
                <span className="font-semibold"> {stock.numberOfItems}</span>
                <Button 
                  onClick={() => {
                    setStockQuantity(stock.numberOfItems);
                    setSelectedStock(stock);
                    setOpenUpdateDialog(true);
                  }} 
                  className="ml-2"
                >
                  Edit
                </Button>
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove the product from stock. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFromStock}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Stock Dialog */}
      <AlertDialog open={openUpdateDialog} onOpenChange={setOpenUpdateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Stock</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the new number of items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(Number(e.target.value))}
            placeholder="Enter new quantity"
            className="mt-4"
          />
          <Button onClick={handleUpdateStock} className="mt-4">
            Update Stock
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StockList;
