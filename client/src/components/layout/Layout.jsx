import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export function Layout() {
  return (
    <div className="app-shell">
      {/* ── Persistent Sticky Navbar (Never remounts) ── */}
      <Navbar />

      {/* ── Main Dynamic Content Container (Preserved across page transitions) ── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
