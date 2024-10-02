"use client"
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardWrapper } from '@/components/auth/card-wrapper'; 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input'; 
import { Button } from '@/components/ui/button'; 
import { toast } from "sonner";
import { db, storage } from "@/app/firebase/config"; 
import { collection, doc, setDoc } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { FormError } from '@/components/form-error'; 
import { FormSuccess } from '@/components/form-success'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";

type Params = {
  companyName: string; 
};

// Zod schema for product details
const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  image: z.string().url("Image URL is required"), 
  description: z.string().min(1, "Description is required"),
  nutrientScore: z.string()
    .min(1, "Nutrient score is required")
    .refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Nutrient score must be a non-negative number",
    }),
  category: z.string().min(1, "Category is required"),
  quantity: z.string()
    .min(1, "Quantity is required")
    .refine(val => /^\d+\s*(ml|gm|L|kg|l|g)?$/.test(val), {
      message: "Quantity must be a non-negative integer with optional units (ml or gm)",
    }),
  packaging: z.enum(["plastic", "paper"], { errorMap: () => ({ message: "Packaging must be either plastic or paper" }) }),
});

export default function AddProductPage({ params }: { params: Params }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null); // State to hold the image file

  // Set up the form with react-hook-form
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      image: '',
      description: '',
      nutrientScore: '', // Default as empty string
      category: '',
      quantity: '', // Default quantity as a string
      packaging: 'plastic', 
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageRef = ref(storage, `images/${file.name}`); // Create a reference to the image location
      await uploadBytes(imageRef, file); // Upload the file
      const url = await getDownloadURL(imageRef); // Get the URL of the uploaded image
      form.setValue("image", url); // Set the image URL in form state

      // Clear the input value by setting the file state to null
      setImageFile(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    setError("");
    setSuccess("");

    if (!values.image) {
      setError("Please upload an image before submitting the product.");
      return;
    }

    startTransition(async () => {
      try {
        const companyName = params.companyName; // Use the passed company name
        const productDocRef = doc(collection(db, "items"), `${companyName}_${Date.now()}`); 
        
        await setDoc(productDocRef, {
          ...values,
          nutrientScore: Number(values.nutrientScore), // Ensure this is stored as a number
          companyName: companyName, 
        });

        setSuccess('Product added successfully!');
        form.reset(); 
      } catch (error) {
        console.error("Error adding product: ", error);
        setError('Failed to add product. Please try again.');
      }
    });
  };

  return (
    <div className="flex-1 py-36 md:px-16 w-full h-screen overflow-hidden ">
      <div className="flex flex-col justify-center items-center h-full w-full gap-3">
      <div className="absolute top-4 left-4">
            <Button
              variant="outline"
              className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="mr-2" /> Back
            </Button>
      </div>
        <CardWrapper
          headerLabel={`Add New Product for ${params.companyName}`}
          backButtonLabel=''
          backButtonHref='/products' 
          showSocial
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="Product Name"
                          type="text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Image</FormLabel>
                      <FormControl>
                        <Input
                          value={undefined}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload} 
                          disabled={isPending} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          disabled={isPending}
                          placeholder="Description"
                          className="w-full border p-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
      <FormField
        control={form.control}
        name="nutrientScore"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nutrient Score</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="text" // Change input type to text
                placeholder="Nutrient Score"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="Category"
                          type="text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="Quantity"
                          type="text" // Keep as text to allow string input
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="packaging"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Packaging</FormLabel>
                      <Select disabled={isPending} onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Packaging" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plastic">Plastic</SelectItem>
                          <SelectItem value="paper">Paper</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormError message={error} />
              <FormSuccess message={success} />
              <Button
                className="w-full"
                disabled={isPending}
                type="submit"
              >
                {isPending ? 'Submitting...' : 'Add Product'}
              </Button>
            </form>
          </Form>
        </CardWrapper>
      </div>
    </div>
  );
}
