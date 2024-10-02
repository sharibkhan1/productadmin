import Image from "next/image";

import appde from "@/public/prod11.png"
import logo from "@/public/logo2.png"
import appdea from "@/public/prodcut7.png"

const AuthLayout=({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
<div className='h-screen flex w-full justify-center' >
        <div className='w-[600px] ld:w-full flex flex-col items-center p-6 ' >
            <Image
            src={logo}
            alt="LOGO"
            sizes="100vw"
            style={{
                width:"30%",
                height:"auto",
            }}
            width={0}
            height={0}
            />
        {children}
        </div>
        <div className='hidden lg:flex flex-1 w-full max-h-full max-w-4000px overflow-hidden
        relative bg-cream flex-col pt-10 pl-24 gap-3 ' >
            <h2 className='text-gravel md:text-6xl font-bold' >
                Join Us
            </h2>
            <p className="text-iridium md:text-lg mb-10">
          Lets make the food safe for everyone ...{' '}
          <br />
          something never done before 😉
        </p>
        <div className="absolute right-32 top-20" >
        <Image
            src={appde}
            alt="iamge"
            loading='lazy'
            sizes="30"
            className=' shrink-0 !w-[800px] '
            width={0}
            height={0}
        /> 
        </div>
        <div className="absolute right-[60%] top-[30%]" >
        <Image
            src={appdea}
            alt="iamge"
            loading='lazy'
            sizes="30"
            className=' shrink-0 !w-[300px] '
            width={0}
            height={0}
        /> 
        </div>
        <div className="absolute right-[55%] top-[40%]" >
        <Image
            src={appdea}
            alt="iamge"
            loading='lazy'
            sizes="30"
            className=' shrink-0 !w-[300px] '
            width={0}
            height={0}
        /> 
        </div>
        </div>
    </div>
  );
}

export default AuthLayout;
