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
import { signIn } from 'next-auth/react';

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

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    console.log("Submitting:", values);
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        const result = await Adminlogin(values); // Call the modified login function

        if (result?.error) {
          setError(result.error);
        } else {
          setSuccess("Successfully logged in!");
          console.log("Redirecting to admin company page...");

          // Redirect to the specific company page
          const companyName = result.companyName;
          if (companyName) {
            router.push(`/admin/${companyName}`);
          } else {
            setError("No associated company found.");
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
