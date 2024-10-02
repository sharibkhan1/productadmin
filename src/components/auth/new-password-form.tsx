"use client"
import * as z from "zod";

import React, { useState, useTransition } from 'react'
import { CardWrapper } from './card-wrapper'
import { useForm } from "react-hook-form";
import { NewPasswordSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form,FormControl, FormField, FormItem, FormLabel, FormMessage, } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { login } from "@/actions/login";
import { FormSuccess } from "../form-success";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { newPassword } from "@/actions/new-password";

const NewPasswordForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [isPending , startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");

    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues:{
            password: "",
        },
    })

    const onSubmit = (values: z.infer<typeof NewPasswordSchema>)=>{
        setError("");
        setSuccess("");
    
        startTransition(()=>{
            newPassword(values , token)
            .then((data)=>{
                setError(data?.error);
                setSuccess(data?.success);
1            })
        })
    }

  return (
    <CardWrapper
    headerLabel='Reset your password'
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
                    name="password"
                    render={({field})=>(
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={isPending}
                                    placeholder="********"
                                    type="password"
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
                     Reset password
                </Button>
            </form>
        </Form>
            
    </CardWrapper>
  )
}

export default NewPasswordForm