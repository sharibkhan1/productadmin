'use client';

import * as z from "zod";
import { SetStateAction, useState, useTransition } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { ExtendedRegisterSchema, Register } from "../../../../actions/register";
import { CardWrapper } from "@/components/auth/card-wrapper";

export default function Signup() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const router = useRouter();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof ExtendedRegisterSchema>>({
    resolver: zodResolver(ExtendedRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordAgain: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof ExtendedRegisterSchema>) => {
    setError("");
    setSuccess("");

    // Add default values for fields not included in the form
    const submitData = {
      ...values,
      profileImage: null, // Default profile image
      Products: [], // Default empty product list
    };

    startTransition(() => {
        Register(submitData)
          .then((data) => {
            if (!data) {
              setError("Something went wrong! Please try again.");
              return;
            }
      
            if (data.error) {
              setError(data.error);
            }
      
            if (data.success) {
              setSuccess(data.success);
              router.push('/signin'); // Only do this after ensuring data is valid
            }
          })
          .catch((err) => {
            console.error(err); // Log any errors from Register
            setError("An unexpected error occurred");
          });
      });
    };

  return (
    <CardWrapper
      headerLabel='Create an account'
      backButtonLabel='Already have an account?'
      backButtonHref='/signin'
      showSocial
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="john@gmail.com"
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
                      placeholder="# # # # # # # #"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Again Field */}
            <FormField
              control={form.control}
              name="passwordAgain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Again</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Repeat your password"
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
            Create an account
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
