import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <div className="content-frame"><Outlet /></div>
      </main>
    </div>
  );
}

export default Layout;
