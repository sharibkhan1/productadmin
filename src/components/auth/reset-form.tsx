"use client"
import * as z from "zod";

import React, { useState, useTransition } from 'react'
import { CardWrapper } from './card-wrapper'
import { useForm } from "react-hook-form";
import { ResetSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form,FormControl, FormField, FormItem, FormLabel, FormMessage, } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { login } from "@/actions/login";
import { FormSuccess } from "../form-success";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import Link from "next/link";
import { reset } from "@/actions/reset";

const ResetForm = () => {
    const [isPending , startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues:{
            email: "",
        },
    })

    const onSubmit = (values: z.infer<typeof ResetSchema>) => {
        setError(""); // Reset error state
        setSuccess(""); // Reset success state

        startTransition(() => {
            reset(values)
                .then((data) => {
                    setError(data?.error); // Set error message if any
                    setSuccess(data?.success); // Set success message if any
                });
        });
    };

  return (
    <CardWrapper
    headerLabel='Forget your password'
    backButtonLabel='Back to login'
    backButtonHref='/auth/login'
    >
        <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)}
            className = "space-y-6"
            >
                <div className="space-y-4" >
                    <FormField
                    control={form.control}
                    name="email"
                    render={({field})=>(
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
                            <FormMessage/>
                        </FormItem>
                    )}
                    />
                </div>
                <FormError message={error } />
                <FormSuccess message={success} />
                <Button
                    className="w-full" 
                    disabled={isPending}
                    type="submit"
                >
                    Send reset email
                </Button>
            </form>
        </Form>
            
    </CardWrapper>
  )
}

export default ResetForm