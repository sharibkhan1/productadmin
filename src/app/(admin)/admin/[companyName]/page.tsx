'use client';

import { LogOut, PlusCircle, User,Settings2  } from 'lucide-react'; // Import the Plus icon
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'; // Import necessary Firestore functions
import { redirect } from 'next/navigation';
import CompanyForm from '@/components/company/company-form';
import CompanyList from '@/components/company/company-list';
import { db } from '@/app/firebase/config'; // Ensure you have your Firestore config
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import ItemList from '@/components/item-list/item-lists';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SparklesCore } from "@/components/ui/sparkles";
import { FlipWords } from "@/components/ui/flip-words";
import CompanyDetails from '@/components/company/company-details';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogoutButton } from '@/components/auth/logout-button';
import { ExitIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import logo from "@/public/logo2.png"
import appde from "@/public/prodcut1.png"
import apr from "@/public/prodcut6.png"


export default function Home() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);

  const router = useRouter(); // Initialize useRouter

  const [companiesUpdated, setCompaniesUpdated] = useState(false);
  const [company, setCompany] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to control dropdown visibility

  // Ensure that the user ID is defined before rendering the CompanyList
  const adminId = session?.user?.id;
// Define a type for the companies in the admin document
type Company = {
  id: string;
  name: string;
};

// Define a type for the admin document
type Admin = {
  id: string;
  name: string;
  email: string;
  companies: Company[];
  password: string;
  profileImage: string | null;
};
useEffect(() => {
  const fetchCompany = async () => {
      if (adminId) {
          const adminDocRef = doc(db, "admins", adminId);
          const adminDoc = await getDoc(adminDocRef);

          if (adminDoc.exists()) {
              const adminData = adminDoc.data();
              if (adminData.companies && adminData.companies.length > 0) {
                  const fetchedCompany = adminData.companies[0]; // This is where Eclare should be fetched
                  console.log(fetchedCompany); 
                  setCompany(fetchedCompany); // Make sure this sets Eclare
              }
          }
          setLoading(false);
      }
  };

  fetchCompany();
}, [session]);

useEffect(() => {
  const fetchUserData = async () => {
    if (session?.user?.id) {
      const userDocRef = doc(db, "admins", session.user.id);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        console.error("No such document!");
      }
    }
  };

  if (status === "authenticated") {
    fetchUserData();
  }
}, [session, status]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while fetching data
  }

  const handleLogout = () => {
    signOut({
      callbackUrl: '/signin', // Redirect to the sign-in page after logout
    });
  };
  if (status === "unauthenticated") {
    return <div>You are not authenticated. Please log in.</div>;
  }
  return (
    <main className="flex flex-col bg-white items-center justify-center">
      <section
        className="h-screen w-full overflow-hidden relative flex flex-col items-center antialiased"
        style={{
          backgroundImage:
            "radial-gradient(125% 125% at 30% 60%, white 50%, #FFC83A)",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >      
<div className="w-[100%] h-screen">
          <div className="relative w-full h-[15%]">
            <SparklesCore
              background="transparent"
              minSize={0.7}
              maxSize={3}
              particleDensity={500}
              className="w-full h-full"
              particleColor="#FFC83A"
            />
          </div>
        <div>
        <Image
            src={logo}
            alt="LOGO"
            sizes="10vw"
            style={{
                width:"10%",
                height:"auto",
                position:"absolute",
                top:5,
                left:5,
            }}
            width={0}
            height={0}
            />
        </div>

          <div className="flex flex-1 flex-col items-start p-5 md:p-20">
            <h1
              className="font-semibold text-[2rem] leading-[3.25rem] md:-mt-7 md:text-[7.75rem] md:leading-[3.75rem] flex items-center"
              style={{ fontFamily: 'var(--font-pacifico)' }} // Use the Pacifico font variable
            >
              CONSUMER
              <div
                className="text-black px-3 py-3 md:px-4 md:py-12 ml-2 rounded"
                style={{ display: 'inline-block' }}
              >
                <span className="text-[#76B2E4]">WISE</span>
              </div>
            </h1>
            <div className='mt-11 text-[1.5rem]'>
              <h1>
                Enter your food details to quickly assess<br/>
                <FlipWords words={["nutrient safety","and","make informed dietary choices."]}/>
                <br/>
                Start scanning now!
              </h1>
            </div>
            <div className='mt-16'>
            <Button
                variant="secondary"
                className="hover:shadow-none px-8 py-0.5 border-2 border-black dark:border-white uppercase bg-white text-black transition duration-200 text-sm shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)] dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]"
                onClick={() => {
                  if (company) {
                    router.push(`/add-product/${company.name}`); // Correct path with the dynamic company name
                  } else {
                    console.error('Company not found');
                  }
                }}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                <span>Add Product</span>
              </Button>
            </div>
          </div>
          <div className='absolute z-50 top-5 right-5'>
            {userData && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="w-14 h-14">
                    {userData.profileImage ? (
                      <Image src={userData.profileImage} alt={`${userData.name}'s Profile`} className="rounded-full" layout="fill" objectFit="cover" />
                    ) : (
                      <AvatarFallback>
                        <User className="w-8 h-8" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => router.push('/setting')}>
                    <Settings2 className="mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <div className='absolute top-[0rem] right-0 ' >
        <Image
            src={appde}
            alt="iamge"
            loading='lazy'
            sizes="20"
            className=' shrink-0 !w-[1100px] '
            width={0}
            height={0}
        /> 
        </div>
        <div className='absolute bottom-[-10rem] left-0 ' >
        <Image
            src={apr}
            alt="iamge"
            loading='lazy'
            sizes="20"
            className=' shrink-0 !w-[1100px] '
            width={0}
            height={0}
        /> 
        </div>
      </section>
      <section className="w-full p-5 md:p-10">
        <CompanyDetails company={company} />
      </section>
    </main>
  );
}