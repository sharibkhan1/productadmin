'use client';
import appde from "@/public/prodcut2.png"
import logo1 from "@/public/prodcut5.png"

import { redirect, useRouter } from 'next/navigation'; // Import navigation functions
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";

export default function Home() {
  const router = useRouter(); // Initialize router for navigation
  const handleRedirect = () => {
    router.push('/signin'); // Redirects the user to the sign-in page
  };
  return (
    <div className='h-screen overflow-hidden flex w-full justify-center'>
      <div className='w-[600px] ld:w-full flex flex-col items-center p-6'>
        <Image
          src={logo1}
          alt="LOGO"
          sizes="100vw"
          style={{
            width: "100%",
            height: "auto",
          }}
          width={0}
          height={0}
        />
      </div>

      {/* Image Container */}
      <div className='hidden lg:flex flex-1 w-full max-h-full max-w-4000px overflow-hidden relative bg-cream flex-col top-56 pt-40 gap-3'>
        <Image
          src={appde}
          alt="image"
          loading='lazy'
          sizes="30"
          className='absolute shrink-0 !w-[800px] right-0 bottom-0 z-10' // Moved towards bottom and adjusted z-index
          width={0}
          height={0}
        />
      </div>

      {/* Content Layer */}
      <div className="absolute flex max-h-full overflow-hidden flex-col z-0 left-[30%] top-[29%]">
        <h2 className='text-gravel md:text-[4rem] font-bold'>
          Welcome to <span className="text-[#77b3e4]">CONSUMERWISE!!</span>
        </h2>
        <p className="text-iridium md:text-lg mb-10">
          Enter your food details to quickly assess, nutrient safety and{' '}
          <br />
          make informed dietary choices. 😉
        </p>

        {/* Welcome Button with less width and moved lower */}
        <div className="mb-3 ml-10"> {/* Pushes button towards bottom */}
          <Button   variant="secondary" onClick={handleRedirect}   className="hover:shadow-none px-32 py-6 border-2 border-black dark:border-white uppercase bg-[#ddba61] text-black transition duration-200 text-sm shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)] dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]"
          > {/* Reduced button width */}
            Welcome
          </Button>
        </div>
      </div>
    </div>
  );
}
