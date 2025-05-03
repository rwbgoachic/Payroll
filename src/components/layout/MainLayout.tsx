import React from 'react';
import { Outlet } from 'react-router-dom';
import MainHeader from './MainHeader';
import MainFooter from './MainFooter';
import SEO from '../seo/SEO';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO />
      <MainHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <MainFooter />
    </div>
  );
};

export default MainLayout;