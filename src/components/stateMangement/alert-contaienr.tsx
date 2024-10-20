"use client"; // This component is a Client Component

import React from 'react';
import { useSelector } from 'react-redux';
import CustomAlert from '@/components/Alert'; // Import the alert component
import { RootState } from './store';

const AlertContainer = () => {
  const alert = useSelector((state: RootState) => state.alert);

  return (
    <>
      {alert.message && (
        <CustomAlert 
          type={alert.type} 
          message={alert.message} 
          action={alert.action} 
        />
      )}
    </>
  );
};

export default AlertContainer;
