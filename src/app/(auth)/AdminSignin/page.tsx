"use client"

import React, { useState, useTransition } from 'react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schemas";  // Assume this schema validates email and password
import { useRouter } from 'next/navigation';
import { Adminlogin } from '../../../../actions/adminlogin';
import { CardWrapper } from '@/components/auth/card-wrapper';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { Button } from '@/components/ui/button';
import { getSession, signIn } from 'next-auth/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';

const AdminSignin = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const router = useRouter();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    console.log("Submitting:", values);
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          redirect: false,
          email: values.email,
          password: values.password,
        });
  
        if (result?.error) {
          setError(result.error);
        } else {
          setSuccess("Successfully logged in!");

          console.log("Redirecting to admin company page...");
          const session = await getSession(); // You can use getSession if needed here

          // After successful login, fetch the user data
          // const userDocRef = doc(db, "admins", result?.user?.id); // Adjust according to your structure
          // const userDoc = await getDoc(userDocRef);
          // const userData = userDoc.data();
  
          if (session?.user) {
            const adminId = session.user.id;  // Ensure this ID is correct
            if (adminId) {
              // Fetch admin document from Firebase using the admin ID
              const adminDocRef = doc(db, 'admins', adminId);
              const adminDoc = await getDoc(adminDocRef);

              if (adminDoc.exists()) {
                const adminData = adminDoc.data();
                const companies = adminData?.companies || [];

                if (companies.length > 0) {
                  const companyName = companies[0].name;  // Get the first company name (or adjust this logic)
                  router.push(`/admin/${companyName}`); // Redirect to the company-specific page
                } else {
                  setError("No associated company found.");
                }
              } else {
                setError("Admin data not found.");
              }
            } else {
              setError("No admin ID found in session.");
            }
          } else {
            setError("User session not found.");
          }
        }
      } catch (err) {
        setError("Something went wrong! ");
      }
    });
  };
  

  return (
    <div className="flex-1 py-36 md:px-16 w-full">
        <div className="flex flex-col h-full gap-3">
    <CardWrapper
      headerLabel='Sign in to your ADMIN account'
      backButtonLabel="Don't have an account?"
      backButtonHref="/AdminSignup"
      AdminButtonHref="/signin"
      AdminLabel="Not a Admin"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="email@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="********"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Error and Success Messages */}
          <FormError message={error} />
          <FormSuccess message={success} />

          {/* Submit Button */}
          <Button variant="secondary" className="w-full py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200" disabled={isPending} type="submit">
            Sign in
          </Button>
        </form>
      </Form>
    </CardWrapper>
    </div>
    </div>
  );
};

export default AdminSignin;
