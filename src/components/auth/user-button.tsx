"use client"
import { FaUser } from "react-icons/fa"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useCurrentUser } from "@/hooks/use-current-user"
import { LogoutButton } from "./logout-button"
import { ExitIcon } from "@radix-ui/react-icons"

export const UserButton=()=>{
    const user = useCurrentUser();

    return(
       <DropdownMenu>
        <DropdownMenuTrigger>
            <Avatar>
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback>
                    <FaUser/>
                </AvatarFallback>
            </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <LogoutButton>
                <DropdownMenuItem>
                    <ExitIcon className="h-4 w-4 mr-2" />
                    Logout
                </DropdownMenuItem>
            </LogoutButton>
        </DropdownMenuContent>
       </DropdownMenu>
    )
}