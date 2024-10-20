"use client";
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardWrapper } from '@/components/auth/card-wrapper';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { db, storage } from "@/app/firebase/config";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";

// Zod schema for product details
const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  image1: z.string().url("Image URL is required"),
  image2: z.string().url("Image URL is required").optional(),
  image3: z.string().url("Image URL is required").optional(),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.string()
    .min(1, "Quantity is required")
    .refine(val => /^\d+\s*(ml|gm)?$/.test(val), {
      message: "Quantity must be a non-negative integer with optional units (ml or gm)",
    }),
  packaging: z.enum(["plastic", "paper"], { errorMap: () => ({ message: "Packaging must be either plastic or paper" }) }),
  ingredients: z.array(z.object({
    title: z.string().min(1, "Ingredient title is required"),
    description: z.string().min(1, "Ingredient description is required"),
  })).min(1, "At least one ingredient is required"),
});

type Params = {
  companyName: string;
};

export default function EditProductPage({ params }: { params: { id: string; companyName: string } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [item, setItem] = useState<any>(null); // State to hold the item

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: '',
      image1: '',
      image2: '',
      image3: '',
      description: '',
      category: '',
      quantity: '',
      packaging: 'plastic',
      ingredients: [{ title: '', description: '' }], // Default one empty ingredient
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients", // Field array name
  });

  // Fetch the existing item details
  useEffect(() => {
    const fetchItem = async () => {
      const docRef = doc(db, "items", params.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setItem(docSnap.data());
        form.reset(docSnap.data()); // Populate form with existing data
      } else {
        console.log("No such document!");
      }
    };

    fetchItem();
  }, [params.id, form]);

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageRef = ref(storage, `images/${file.name}`); // Create a reference to the image location
      await uploadBytes(imageRef, file); // Upload the file
      const url = await getDownloadURL(imageRef); // Get the URL of the uploaded image

      // Set the image URL in form state based on index
      const imageField = `image${index + 1}` as "image1" | "image2" | "image3"; // Assert the type to ImageField
      form.setValue(imageField, url);
    }
  };

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    setError("");
    setSuccess("");

    // Check for uploaded images
    if (!values.image1) {
      setError("Please upload the first image before submitting the product.");
      return;
    }

    startTransition(async () => {
      try {
        const productDocRef = doc(db, "items", params.id); // Reference to the existing item
        await setDoc(productDocRef, {
          ...values,
          nutrientScore: Math.floor(Math.random() * 101).toString(), // Store as string
          calories: Math.floor(Math.random() * 101).toString(), // Store as string
          healthyScore: Math.floor(Math.random() * 101).toString(), // Store as string
          companyName: item?.companyName, // Keep the existing companyName
        });
        const messageRef = collection(db, "messages");
        await addDoc(messageRef, {
          image1: values.image1,
          companyName: item?.companyName,
          productName: values.productName,
          productId: productDocRef.id,  // Store product ID to make it clickable
          createdAt: new Date().toISOString(),
          message: `${item?.companyName} has edited product: ${values.productName}`, // Custom message
          isClickable: true, // Mark message as clickable
          read: false,  // New field for unread messages
        });
        setSuccess('Product updated successfully!');
        router.push(`/item/${params.id}`); // Redirect after success
      } catch (error) {
        console.error("Error updating product: ", error);
        setError('Failed to update product. Please try again.');
      }
    });
  };

  return (
    <div className="flex-1 md:px-16 w-full h-full ">
      <div className="flex flex-col items-center justify-center h-full w-full">
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
          headerLabel={`Edit Product`}
          backButtonLabel=''
          backButtonHref='/products' 
          showSocial
          className="w-[800px]"
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
                
                {/* Image Uploads */}
                <div className=" flex items-center gap-4 ">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`image${index + 1}` as "image1" | "image2" | "image3"} // Use 'as ImageField' for type inference
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Image {index + 1}</FormLabel>
                          <FormControl>
                            <Input
                              value={undefined} // Ensure value is undefined to avoid controlled/uncontrolled input issue
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(index, e)} 
                              disabled={isPending} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

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
<div className="flex items-center flex-row justify-between space-x-[2rem]"> {/* Add space between items */}

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex-1"> {/* Flex-grow for category */}
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
                    <FormItem className="flex-1"> {/* Flex-grow for category */}
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="Quantity"
                          type="text"
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                  />
                  </div>
                <FormField
                  control={form.control}
                  name="packaging"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Packaging</FormLabel>
                      <FormControl>
                        <Select {...field} disabled={isPending}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Packaging" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plastic">Plastic</SelectItem>
                            <SelectItem value="paper">Paper</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Ingredients</FormLabel>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center mb-3 space-x-4">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ingredient Title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ingredient Description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="destructive" onClick={() => remove(index)}>Remove</Button>
                    </div>
                  ))}
                  <Button type="button" onClick={() => append({ title: '', description: '' })}>Add Ingredient</Button>
                </div>
              </div>
              {error && <FormError message={error} />}
              {success && <FormSuccess message={success} />}
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Update Product"}
              </Button>
            </form>
          </Form>
        </CardWrapper>
      </div>
    </div>
  );
}
