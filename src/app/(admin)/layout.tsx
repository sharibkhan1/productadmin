import { Pacifico } from 'next/font/google';
import React from 'react';

const pacifico = Pacifico({
  subsets: ['latin'], // Specify subsets you need
  weight: '400', // Pacifico only supports the 400 weight
  variable: '--font-pacifico' // Define a custom CSS variable to use this font
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={`${pacifico.variable} font-sans w-full h-full`}>
      {children}
    </div>
  );
};

export default Layout;
