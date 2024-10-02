import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps{
    children?: React.ReactNode;
};

export const LogoutButton =({
    children
}:LogoutButtonProps)=>{
    const router = useRouter(); // Initialize useRouter

    const handleLogout = async () => {
        await signOut();
        router.push('/signin'); // Redirect to the sign-in page
      };

    return (
        <span onClick={handleLogout}  className="cursor-pointer" >
            {children}
        </span>
    )
}