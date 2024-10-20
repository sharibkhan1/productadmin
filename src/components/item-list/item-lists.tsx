"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input";
import { Button } from "../ui/button";

interface Item {
  id: string;
  productName: string;
  description: string;
  nutrientScore: number;
  category: string;
  quantity: number;
  packaging: string;
  image1: string;
  companyName: string;
}

export default function ItemList({ companyName }: { companyName: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [sortedItems, setSortedItems] = useState<Item[]>([]);
  const [sortCriteria, setSortCriteria] = useState<string>(""); // State for sorting criteria
  const [categories, setCategories] = useState<string[]>([]); // State for categories
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // State for selected category
  const [itemLimit, setItemLimit] = useState<number>(10); // Default to 10 items
  const [searchInput, setSearchInput] = useState<string>(""); // State for search input

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
      const itemList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];

      // Filter items by companyName
      const filteredItems = itemList.filter((item) => item.companyName === companyName);
      setItems(filteredItems);
      setSortedItems(filteredItems); // Initialize sorted items with filtered items

      // Fetch categories
      const categoriesSet = new Set(itemList.map((item) => item.category)); // Use Set to avoid duplicates
      setCategories(Array.from(categoriesSet)); // Convert Set back to Array
    });

    // Cleanup: unsubscribe from the snapshot listener when the component unmounts
    return () => unsubscribe();
  }, [companyName]);

  // Sort and filter items based on selected criteria
  useEffect(() => {
    let sorted = [...items];

    if (searchInput) {
      sorted = sorted.filter((item) =>
        item.productName.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    // Check if "No Filter" is selected for category
    if (selectedCategory && selectedCategory !== "No Filter") {
      sorted = sorted.filter((item) => item.category === selectedCategory);
    }

    // Apply sorting criteria
    if (sortCriteria === "high-nutrient") {
      sorted.sort((a, b) => b.nutrientScore - a.nutrientScore); // High to Low
    } else if (sortCriteria === "low-nutrient") {
      sorted.sort((a, b) => a.nutrientScore - b.nutrientScore); // Low to High
    } else if (sortCriteria === "package-plastic") {
      sorted = sorted.filter((item) => item.packaging.toLowerCase() === "plastic"); // Only plastic
    } else if (sortCriteria === "package-paper") {
      sorted = sorted.filter((item) => item.packaging.toLowerCase() === "paper"); // Only paper
    }

    setSortedItems(sorted);
  }, [sortCriteria, selectedCategory, items, searchInput]);

  const resetFilters = () => {
    setSelectedCategory("");
    setSortCriteria("");
    setSearchInput("");
  };
  return (
    <div className="pt-14 pb-14 bg-[#76B2E4] border-black border-l-[0.3rem] border-r-[0.3rem] rounded-[3rem] ">
      <div className="pl-14 pr-14 dark:bg-grid-white/[0.04] bg-grid-black/[0.04] w-full h-full flex flex-col justify-between">
        <div className="flex items-center">
          <h1 className="text-white text-[2.5rem] mr-11 font-semibold p-6">
            Products
          </h1>

          <PlaceholdersAndVanishInput
            placeholders={["Search products..."]}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSelectedCategory(""); // Reset category filter to default
              setSortCriteria(""); // Reset sort criteria to default
            }}
            onSubmit={(e) => e.preventDefault()} // Prevent default form submission
          />
          <Button onClick={resetFilters} className="ml-4">Refresh</Button>

          {/* Dropdown for sorting */}
          <Select onValueChange={setSortCriteria}>
            <SelectTrigger className="ml-5 w-[10rem] px-4 py-2 rounded-md border border-black bg-[#FFC83A] text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="No Filter">No Filter</SelectItem>{" "}
              {/* No Filter option */}
              <SelectItem value="high-nutrient">High Nutrient Score</SelectItem>
              <SelectItem value="low-nutrient">Low Nutrient Score</SelectItem>
              <SelectItem value="package-plastic">Package: Plastic</SelectItem>
              <SelectItem value="package-paper">Package: Paper</SelectItem>
            </SelectContent>
          </Select>

          {/* Dropdown for category */}
          <Select onValueChange={setSelectedCategory}>
            <SelectTrigger className="ml-5 w-[10rem] px-4 py-2 rounded-md border border-black bg-[#FFC83A] text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="No Filter">No Filter</SelectItem>{" "}
              {/* No Filter option */}
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setItemLimit(Number(value))}>
            <SelectTrigger className="ml-5 w-[10rem] px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value={sortedItems.length.toString()}>
                All
              </SelectItem>{" "}
              {/* "All" option */}
            </SelectContent>
          </Select>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-1 mt-32 md:grid-cols-4 gap-10">
          {sortedItems.slice(0, itemLimit).map((item) => (
            <li key={item.id} className="group -mt-32 ">
              <Link href={`/item/${item.id}`}>
                <CardContainer className="inter-var w-[30rem] max-h-[30rem] flex flex-col justify-between">
                  {/* Adjust max height */}
                  <CardBody className="bg-gray-50 min-h-[30rem] relative group/card dark:hover:shadow-2xl dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
                    <CardItem
                      translateZ="10"
                      className="text-2xl font-bold text-neutral-600 dark:text-white"
                    >
                      {item.productName}
                    </CardItem>
                    <CardItem
                      translateZ="50"
                      rotateX={5}
                      rotateZ={-5}
                      className="w-full mt-4"
                    >
                      <Image
                        src={item.image1}
                        height="1000"
                        width="1000"
                        objectFit="cover"
                        className="h-60 object-contain rounded-xl group-hover/card:shadow-xl"
                        alt="thumbnail"
                      />
                    </CardItem>
                    <div className="flex justify-between items-center mt-20">
                      <CardItem
                        translateZ={10}
                        translateX={20}
                        as="button"
                        className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                      >
                        Details
                      </CardItem>
                      <CardItem
                        as="p"
                        translateZ="10"
                        className="text-neutral-800 mb-6 items-center justify-center bg-gray-200 p-4 rounded-[10rem] text-lg max-w-sm  dark:text-neutral-300"
                      >
                        <p>
                          Nutrients: {"  "}
                          <span
                            className={`text-[2rem] font-bold ${
                              item.nutrientScore > 70
                                ? "text-green-500" // Green for scores higher than 70
                                : item.nutrientScore > 30
                                ? "text-yellow-500" // Yellow for scores between 31 and 70
                                : "text-red-500" // Red for scores 30 or lower
                            }`}
                          >
                            {item.nutrientScore}
                          </span>
                        </p>
                      </CardItem>
                    </div>
                  </CardBody>
                </CardContainer>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
