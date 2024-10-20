import React from 'react';
import Sidebar from '@/components/sidebar';
import AlertContainer from '@/components/stateMangement/alert-contaienr';

type Props = { children: React.ReactNode };

const Layout = (props: Props) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <AlertContainer /> {/* Include AlertContainer here */}
        {props.children}
      </div>
    </div>
  );
};

export default Layout;
