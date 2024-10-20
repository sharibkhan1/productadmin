'use client';


import * as z from "zod";
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { AdminRegister } from '../../../../actions/adminregister';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardWrapper } from '@/components/auth/card-wrapper';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { Button } from '@/components/ui/button';
import FileUpload from "@/components/file-upload";

export default function AdminSignup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const ExtendedRegisterSchema = z.object({
    companyName: z.string().min(1, "Company name must be at least 1 character long."),
    email: z.string().email("Invalid email format"),
    profileImage: z.string().min(1,{
        message:"Server image is required"
    }),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    passwordAgain: z.string(),
}).refine((data) => data.password === data.passwordAgain, {
    message: "Passwords do not match",
    path: ["passwordAgain"], // Set the path where the error should be displayed
});

  const form = useForm<z.infer<typeof ExtendedRegisterSchema>>({
    resolver: zodResolver(ExtendedRegisterSchema),
    defaultValues: {
        companyName:"",
      email: "",
      password: "",
      passwordAgain: "",
      profileImage:"",
  },
});

const onSubmit = async (values: z.infer<typeof ExtendedRegisterSchema>) => {
  setError("");
  setSuccess("");

  // Check if passwords match before calling AdminRegister
  if (values.password !== values.passwordAgain) {
      setError("Passwords do not match!");
      return;
  }

  startTransition(async () => {
      const name = values.email.split('@')[0]; // Derive name from email
      const userData = {
          email: values.email,
          password: values.password,
          name,
          passwordAgain: values.passwordAgain,
          profileImage: values.profileImage, // Or use a placeholder image URL
          companyName: values.companyName, // Add company name here
        };

      const result = await AdminRegister(userData); // Call AdminRegister function

      setError(result.error);
      setSuccess(result.success ? "Registration successful!" : undefined);
  });
};


  return (
    <div className="flex-1 py-36 md:px-16 w-full">
        <div className="flex flex-col h-full gap-3">
    <CardWrapper
            headerLabel='Sign up as Admin'
            backButtonLabel='Already have an account?'
            backButtonHref='/AdminSignin' // Update with the actual path for signing in
            showSocial
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                    <FormField
                            control={form.control}
                            name="profileImage"
                            render={({field})=>(
                                <FormItem>
                                    <FormControl>
                                        <FileUpload 
                                            endpoint="serverImage"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                            />
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
                                            placeholder="********"
                                            type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
    control={form.control}
    name="companyName"
    render={({ field }) => (
        <FormItem>
            <FormLabel>Company Name</FormLabel>
            <FormControl>
                <Input
                    {...field}
                    disabled={isPending}
                    placeholder="Your Company Name"
                    type="text"
                />
            </FormControl>
            <FormMessage />
        </FormItem>
    )}
/>
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        variant="secondary" className="w-full py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200"
                        disabled={isPending}
                        type="submit"
                    >
                        Sign Up
                    </Button>
                </form>
            </Form>
        </CardWrapper>
        </div>
        </div>
  );
}
