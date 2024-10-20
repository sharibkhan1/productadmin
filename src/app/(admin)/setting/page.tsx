'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft } from "lucide-react";
import { fetchUserData, updateUserData } from '../../../../actions/userService';
import FileUpload from '@/components/settings-upload';
import { Pencil1Icon,CheckCircledIcon,ExclamationTriangleIcon } from '@radix-ui/react-icons'; // Import the Plus icon

const Setting = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string>('');
  const [editField, setEditField] = useState<string | null>(null); // Track which field is being edited
  const [tempValue, setTempValue] = useState<string>(''); // Temporary value during editing
  const [isDirty, setIsDirty] = useState<boolean>(false); // Track if changes were made

  const router = useRouter();

  const loadUserData = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);

    try {
      const data = await fetchUserData(session.user.id);
      if (data) {
        setUserData(data);
        setProfileImage(data.profileImage || '');
      } else {
        console.error("No user data found.");
      }
    } catch (error) {
      setError("Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadUserData();
    }
  }, [status, loadUserData]);

  const handleEditClick = (field: string, value: string) => {
    setEditField(field);
    setTempValue(value);
  };

  const handleDialogSave = () => {
    if (editField === 'name') {
      setUserData((prevData: any) => ({ ...prevData, name: tempValue }));
    }
    setEditField(null);
    setIsDirty(true); // Mark as dirty since changes are made
  };

  const handleDialogCancel = () => {
    setEditField(null);
  };

  const handleUpdate = async () => {
    setError(null);
    setSuccess(null);

    if (!session?.user?.id || !userData) {
      setError("User data not available.");
      return;
    }

    try {
      await updateUserData(session.user.id, {
        name: userData.name,
        profileImage: profileImage,
      });

      setSuccess("Profile updated successfully.");
      setIsDirty(false); // Reset dirty state after update
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>No user data found.</div>;
  }

  return (
    <div className=" bg-white h-screen text-black flex flex-col items-center">
    <div className='p-8 bg-[#76B2E4] h-[20rem] w-screen flex flex-col justify-end'>
    <div className="flex justify-between items-center  ml-[25rem]">
          <div className='font-semibold text-2xl' >
            {userData.email}
          </div>
        </div>
    </div>
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="mr-2" /> Back
        </Button>
      </div>
      
      {/* Profile Image at Top Center */}
      <div className=" absolute left-20 top-40">
        <FileUpload
          endpoint="serverImage"
          value={profileImage}
          onChange={(url?: string) => { setProfileImage(url || ''); setIsDirty(true); }}
        />
      </div>

      {/* User Information */}
      <div className=" mt-12 space-y-9 w-full max-w-[50rem]">
        {/* Name Section */}
        <div className="flex justify-between items-center">
          <div>
            <strong className='text-xl' >Name</strong>
            <p className='text-lg'>{userData.name}</p>
          </div>
          <Button className="hover:shadow-none px-8 py-0.5 border-2 border-black dark:border-white uppercase bg-white text-black transition duration-200 text-sm shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)] dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]"
            variant="secondary" onClick={() => handleEditClick('name', userData.name)}>
             <Pencil1Icon className="w-4 h-4 mr-2" />
             Edit</Button>
        </div>

        {/* Email Display (No Edit Option) */}


        {/* Password Placeholder */}
        <div className="flex justify-between items-center">
          <div>
            <strong className='text-xl'>Password</strong>
            <p>******** </p>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {success && 
        <div className="bg-emerald-100 p-3 rounded-md flex
          items-center gap-x-2 text-sm text-emerald-500" >
          <CheckCircledIcon className="w-4 h-4" />
            <p className="text-red-500">{success}</p>
      </div>
      }
      {error &&
                <div className="bg-destructive/15 p-3 rounded-md flex
                items-center gap-x-2 text-sm text-destructive" >
                    <ExclamationTriangleIcon className="w-4 h-4" />
      <p className="text-green-500">{error}</p>
      </div>}

      {/* Update/Cancel Buttons */}
      {isDirty && (
        <div className="flex space-x-4 mt-6">
          <Button className=" bg-[#FFC83A] hover:shadow-none px-8 py-0.5 border-2 border-black dark:border-white uppercase text-black transition duration-200 text-sm shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)] dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)]"
           variant="secondary" onClick={handleUpdate}>Update</Button>
          <Button variant="outline" onClick={() => loadUserData()}>Cancel</Button>
        </div>
      )}

      {/* Dialog for Editing */}
      <Dialog open={!!editField} onOpenChange={handleDialogCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editField}</DialogTitle>
          </DialogHeader>
          <Input
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
          />
          <div className="flex space-x-4 mt-4">
            <Button onClick={handleDialogSave}>Save</Button>
            <Button variant="outline" onClick={handleDialogCancel}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Setting;
