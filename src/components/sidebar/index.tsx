'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMenuOptions } from '@/lib/constants';
import clsx from 'clsx';
import { Separator } from '@/components/ui/separator';
import { Database,LogOut, GitBranch, LucideMousePointerClick } from 'lucide-react';
import { collection , onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/app/firebase/config'; // Ensure this points to your Firebase config
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type Props = {};

const MenuOptions = (props: Props) => {
  const pathName = usePathname();
  const menuOptions = useMenuOptions(); // Use the hook to get menu options
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "messages"), (snapshot) => {
      const unreadMessages = snapshot.docs.filter(doc => !doc.data().read);
      setUnreadCount(unreadMessages.length); // Count unread messages
    });

    return () => unsubscribe();
  }, []);
  const handleLogout = () => {
    signOut({
      callbackUrl: '/signin',
    });
  };
  return (
    <nav className="dark:bg-black sticky h-screen overflow-hidden justify-between flex items-center flex-col gap-10 py-6 px-2">
      <div className="flex items-center justify-center flex-col mt-10 gap-8">
        <TooltipProvider>
          {menuOptions.map((menuItem) => (
            <ul key={menuItem.name}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <li>
                    <Link
                      href={menuItem.href}
                      className={clsx(
                        'group h-8 w-8 flex items-center justify-center scale-[1.5] rounded-lg p-[3px] cursor-pointer',
                        {
                          'dark:bg-[#2F006B] bg-[#EEE0FF]': pathName === menuItem.href,
                        }
                      )}
                    >
                      <menuItem.Component selected={pathName === menuItem.href} />
                      {menuItem.name === 'notification' && unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex items-center justify-center bg-red-600 text-white text-xs w-4 h-4 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black/10 backdrop-blur-xl">
                  <p>{menuItem.name}</p>
                </TooltipContent>
              </Tooltip>
            </ul>
          ))}
        </TooltipProvider>
        <Separator />
        <div className="flex items-center scrollbar-hide flex-col gap-9 dark:bg-[#353346]/30 py-4 px-2 rounded-full h-56 overflow-scroll border-[1px]">
        <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
            <LucideMousePointerClick className="dark:text-white" size={18} />
            <div className="border-l-2 border-muted-foreground/50 h-6 absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]" />
          </div>
          <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
            <GitBranch className="text-muted-foreground" size={18} />
            <div className="border-l-2 border-muted-foreground/50 h-6 absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]"></div>
          </div>
          <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
            <Database className="text-muted-foreground" size={18} />
            <div className="border-l-2 border-muted-foreground/50 h-6 absolute left-1/2 transform translate-x-[-50%] -bottom-[30px]"></div>
          </div>
          <div className="relative dark:bg-[#353346]/70 p-2 rounded-full dark:border-t-[2px] border-[1px] dark:border-t-[#353346]">
            <GitBranch className="text-muted-foreground" size={18} />
          </div>
        </div>
      </div>
      {/* Uncomment for mode toggle if needed */}
      <div className="flex items-center justify-center flex-col gap-8">
      <Button variant="outline" size="icon" onClick={handleLogout}><LogOut className='text-muted-foreground' /></Button>
      </div>
    </nav>
  );
};

export default MenuOptions;
