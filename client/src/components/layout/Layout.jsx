import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export function Layout() {
  return (
    <div className="sb-app-layout">
      <Navbar />
      <main className="sb-main-viewport">
        <div className="sb-page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
