import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle sidebar hover state changes
  const handleSidebarHoverChange = (hovered) => {
    setIsHovered(hovered);
  };

  // Handle mobile sidebar toggle
  const handleToggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Close mobile sidebar
  const handleCloseMobileSidebar = () => {
    setIsMobileOpen(false);
  };


  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  return (
    <div className={`min-h-screen bg-cream ${isMobileOpen ? 'overflow-hidden lg:overflow-auto' : ''}`}>
      <Sidebar
        onHoverChange={handleSidebarHoverChange}
        isMobileOpen={isMobileOpen}
        onCloseMobile={handleCloseMobileSidebar}
      />
      <Header
        isHovered={isHovered}
        onToggleMobileSidebar={handleToggleMobileSidebar}
      />

      {/* Main Content Area */}
      <div
        className={`main-content-responsive content-container-responsive transition-all duration-300 ease-in-out ${
          // Mobile/Tablet: full width with top padding for header only
          'pt-20 lg:pt-16'
        } ${
          // Desktop: adjust margin based on sidebar hover state
          isHovered ? 'lg:ml-96' : 'lg:ml-24'
        }`}
      >
        <main className="p-2 lg:p-3 w-full">
          <div className="min-w-0 max-w-full" data-sidebar-hovered={isHovered}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
