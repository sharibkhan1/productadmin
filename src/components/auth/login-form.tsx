// "use client"
// import * as z from "zod";

// import React, { useState, useTransition } from 'react';
// import { CardWrapper } from './card-wrapper';
// import { useForm } from "react-hook-form";
// import { LoginSchema } from "@/schemas";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
// import { Input } from "../ui/input";
// import { Button } from "../ui/button";
// import { FormError } from "../form-error";
// import { login } from "@/actions/login";
// import { FormSuccess } from "../form-success";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

// const LoginForm = () => {
//     const searchParams = useSearchParams();
//     const callbackUrl = searchParams.get("callbackUrl");
//     const urlError = searchParams.get("error") === "OAuthAccountNotLinked"
//         ? "Email already in use with different provider!" : "";
//     const [isPending, startTransition] = useTransition();
//     const [showTwoFactor, setShowTwoFactor] = useState(false);
//     const [error, setError] = useState<string | undefined>("");
//     const [success, setSuccess] = useState<string | undefined>("");

//     const form = useForm<z.infer<typeof LoginSchema>>({
//         resolver: zodResolver(LoginSchema),
//         defaultValues: {
//             email: "",
//             password: "",
//         },
//     });

//     const router = useRouter(); // Initialize the router

//     const onSubmit = (values: z.infer<typeof LoginSchema>) => {
//         setError("");
//         setSuccess("");
    
//         startTransition(() => {
//             login(values, callbackUrl)
//                 .then((data) => {
//                     console.log('Login response:', data); // Log the response
//                     if (data?.error) {
//                         form.reset();
//                         setError(data.error);
//                     }
//                     if (data?.success) {
//                         form.reset();
//                         setSuccess(data.success);
//                         // Redirect to callbackUrl or DEFAULT_LOGIN_REDIRECT
//                         const redirectTo = callbackUrl || DEFAULT_LOGIN_REDIRECT;
//                         console.log('Redirecting to:', redirectTo); // Log the redirect URL
//                         router.push(redirectTo);
//                     }
//                 })
//                 .catch(() => setError("Something went wrong"));
//         });
//     };
    

//     return (
//         <CardWrapper
//             headerLabel='Welcome back'
//             backButtonLabel='Dont have account ?'
//             backButtonHref='/auth/register'
//             showSocial
//         >
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                     <div className="space-y-4">
//                         {showTwoFactor && (
//                             <FormField
//                                 control={form.control}
//                                 name="code"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Two Factor Code</FormLabel>
//                                         <FormControl>
//                                             <Input
//                                                 {...field}
//                                                 disabled={isPending}
//                                                 placeholder="123456"
//                                             />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         )}
//                         {!showTwoFactor && (
//                             <>
//                                 <FormField
//                                     control={form.control}
//                                     name="email"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Email</FormLabel>
//                                             <FormControl>
//                                                 <Input
//                                                     {...field}
//                                                     disabled={isPending}
//                                                     placeholder="john@gmail.com"
//                                                     type="email"
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="password"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Password</FormLabel>
//                                             <FormControl>
//                                                 <Input
//                                                     {...field}
//                                                     disabled={isPending}
//                                                     placeholder="# # # # # # # #"
//                                                     type="password"
//                                                 />
//                                             </FormControl>
//                                             <Button
//                                                 size="sm"
//                                                 variant="link"
//                                                 asChild
//                                                 className="px-0 font-normal"
//                                             >
//                                                 <Link href="/auth/reset">
//                                                     Forget password?
//                                                 </Link>
//                                             </Button>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </>
//                         )}
//                     </div>
//                     <FormError message={error || urlError} />
//                     <FormSuccess message={success} />
//                     <Button
//                         className="w-full"
//                         disabled={isPending}
//                         type="submit"
//                     >
//                         {showTwoFactor ? "Confirm" : "Login"}
//                     </Button>
//                 </form>
//             </Form>
//         </CardWrapper>
//     );
// };

// export default LoginForm;
