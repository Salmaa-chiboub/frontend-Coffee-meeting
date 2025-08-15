import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    console.log('🔍 Context toggle sidebar clicked, current state:', isMobileOpen);
    setIsMobileOpen(prev => !prev);
  };

  const closeMobileSidebar = () => {
    console.log('🔍 Context close sidebar called');
    setIsMobileOpen(false);
  };

  React.useEffect(() => {
    console.log('🔍 Context isMobileOpen state changed to:', isMobileOpen);
  }, [isMobileOpen]);

  return (
    <SidebarContext.Provider value={{
      isMobileOpen,
      toggleMobileSidebar,
      closeMobileSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
