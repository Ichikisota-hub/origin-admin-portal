import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CreatorOrgSwitcher from '../components/CreatorOrgSwitcher';

const RootLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Sidebar fixed to the left */}
      <Sidebar />

      {/* Scrollable Main Area */}
      <main className="flex-1 ml-64 h-screen overflow-y-auto">
        {/* Utility Bar */}
        <div className="sticky top-0 z-40 flex justify-end px-8 py-4 bg-white/40 backdrop-blur-md">
          <CreatorOrgSwitcher />
        </div>
        
        <div className="mx-auto w-full max-w-5xl px-6 py-6 space-y-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RootLayout;
