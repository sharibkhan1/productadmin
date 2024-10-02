'use client';
import { CardWrapper } from '@/components/auth/card-wrapper';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from "next/link";
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { startTransition, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { LoginSchema } from "@/schemas";


export default function Signin() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [isPending , startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
        email: '',
        password: '',
    },
});

const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
  setError('');
  setSuccess('');

  startTransition(async () => {
      const response = await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false, // Prevent automatic redirect for manual handling
          callbackUrl:'/retialers',
      });

      if (response?.error) {
        // Set the error message from response
        setError(response.error === "Invalid credentials!" 
            ? "Invalid email or password!" 
            : "Invalid email or password!");  // Handle specific error messages if needed
        form.reset(); // Optionally reset form fields
    } else if (response?.url) {
        setSuccess('Login successful! Redirecting...');
        window.location.href = response.url; // Redirect to the success URL
    }
  });
};

  return (
    <>
        <div className="flex-1 py-36 md:px-16 w-full">
        <div className="flex flex-col h-full gap-3">
      <CardWrapper
            headerLabel="Welcome back"
            backButtonLabel="Don't have an account?"
            backButtonHref="/signup"
            AdminButtonHref="/AdminSignin"
            AdminLabel="Admin?"
            showSocial
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
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
                                            placeholder="Enter your password"
                                            type="password"
                                        />
                                    </FormControl>
                                    <Button 
                                        size="sm"
                                        variant="link"
                                        asChild
                                        className="px-0 font-normal"
                                    >
                                        <Link href="/auth/reset">
                                            Forgot password?
                                        </Link>
                                    </Button>
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
                        Login
                    </Button>
                </form>
            </Form>
        </CardWrapper>
      </div>
      </div>
    </>
  )
}