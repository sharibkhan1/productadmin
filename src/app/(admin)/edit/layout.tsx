import { Pacifico } from 'next/font/google';
import Image from 'next/image';
import React from 'react';
import appde from "@/public/prodcut4.png"
import appt from "@/public/prodcut3.png"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={`font-sans overflow-hidden w-full h-full z-0`}>
        <div className='absolute  h-[50rem] w-[50rem] ' >
        <Image
                      src={appde}            
                      height="1000"
                      width="1000"
                      objectFit="cover"
                      className="object-contain rounded-xl group-hover/card:shadow-xl"
                      alt="thumbnail"
                    />
        </div>
        <div className='absolute h-[40rem] right-6 w-[40rem] ' >
        <Image
                      src={appt}            
                      height="1000"
                      width="1000"
                      objectFit="cover"
                      className="object-contain rounded-xl group-hover/card:shadow-xl"
                      alt="thumbnail"
                    />
        </div>
        <div className='relative mt-9 z-20' >
      {children}
        </div>
    </div>
  );
};

export default Layout;
