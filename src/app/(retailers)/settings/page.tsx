'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { db } from "@/app/firebase/config";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FileUpload from '@/components/file-upload'; // Assuming this component handles image uploads
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Settings = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [editField, setEditField] = useState<string | null>(null); // Track which field is being edited
  const [tempValue, setTempValue] = useState<string>(''); // Temporary value during editing
  const [isDirty, setIsDirty] = useState<boolean>(false); // Track if changes were made

  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);

    try {
      const retailerDocRef = doc(db, "retailers", session.user.id);
      const retailerDoc = await getDoc(retailerDocRef);

      if (retailerDoc.exists()) {
        const data = retailerDoc.data();
        setUserData(data);
        setProfileImage(data.profileImage || '');
        setAddress(data.address || '');
      } else {
        console.error("No such retailer document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, fetchUserData]);

  const handleEditClick = (field: string, value: string) => {
    setEditField(field);
    setTempValue(value);
  };

  const handleDialogSave = () => {
    if (editField === 'name') {
      setUserData((prevData: any) => ({ ...prevData, name: tempValue }));
    } else if (editField === 'address') {
      setAddress(tempValue);
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

    const userDocRef = doc(db, "retailers", session.user.id);

    try {
      await updateDoc(userDocRef, {
        name: userData.name,
        profileImage: profileImage,
        address: address,
      });

      setSuccess("Profile updated successfully.");
      setIsDirty(false); // Reset dirty state after update
    } catch (err) {
      console.error("Error updating profile:", err);
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
    <div className="p-8 bg-slate-800 text-white flex flex-col items-center">
      {/* Profile Image at Top Center */}
      <div className="mb-8">
        <strong>Current Profile Image:</strong>
        <FileUpload
          endpoint="serverImage"
          value={profileImage}
          onChange={(url?: string) => { setProfileImage(url || ''); setIsDirty(true); }}
        />
      </div>

      {/* User Information */}
      <div className="space-y-4 w-full max-w-lg">
        {/* Name Section */}
        <div className="flex justify-between items-center">
          <div>
            <strong>Name:</strong>
            <p>{userData.name}</p>
          </div>
          <Button variant="outline" onClick={() => handleEditClick('name', userData.name)}>Edit</Button>
        </div>

        {/* Address Section */}
        <div className="flex justify-between items-center">
          <div>
            <strong>Address:</strong>
            <p>{address || 'No address provided'}</p>
          </div>
          <Button variant="outline" onClick={() => handleEditClick('address', address)}>Edit</Button>
        </div>

        {/* Email Display (No Edit Option) */}
        <div className="flex justify-between items-center">
          <div>
            <strong>Email:</strong>
            <p>{userData.email}</p>
          </div>
        </div>

        {/* Password Placeholder */}
        <div className="flex justify-between items-center">
          <div>
            <strong>Password:</strong>
            <p>******** (hashed)</p>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      {/* Update/Cancel Buttons */}
      {isDirty && (
        <div className="flex space-x-4 mt-6">
          <Button onClick={handleUpdate}>Update</Button>
          <Button variant="outline" onClick={() => fetchUserData()}>Cancel</Button>
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

export default Settings;
