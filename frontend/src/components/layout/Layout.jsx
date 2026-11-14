import React from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] text-slate-100">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

