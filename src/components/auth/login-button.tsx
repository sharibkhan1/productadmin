"use client"

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

interface LoginButtonProps {
    children : React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
};

export const LoginButton=({
    children,
    mode = "redirect",
    asChild,
}: LoginButtonProps)=>{
    const router = useRouter();

    const onClick=()=>{
        router.push('/signin')
    };

    return(
        <span className="cursor-pointer" onClick={onClick}>
            {children}
        </span>
    )
}